using Microsoft.EntityFrameworkCore;
using SurveyInterview.Server.Data;
using SurveyInterview.Server.DTOs;
using SurveyInterview.Server.Exceptions;
using SurveyInterview.Server.Mappings;
using SurveyInterview.Server.Models;

namespace SurveyInterview.Server.Services;

public class ResponseService : IResponseService
{
    private readonly SurveyDbContext _context;

    public ResponseService(SurveyDbContext context)
    {
        _context = context;
    }

    public async Task<List<ResponseListDto>> GetAllAsync()
    {
        var responses = await _context.SurveyResponses
            .AsNoTracking()
            .Include(r => r.Survey)
            .Include(r => r.Answers)
            .OrderByDescending(r => r.SubmittedAt)
            .ToListAsync();

        return responses.Select(r => r.ToListDto()).ToList();
    }

    public async Task<ResponseDetailDto> GetDetailAsync(int id)
    {
        var response = await _context.SurveyResponses
            .AsNoTracking()
            .Include(r => r.Survey)
            .Include(r => r.Answers)
                .ThenInclude(a => a.Question)
                    .ThenInclude(q => q!.Section)
            .FirstOrDefaultAsync(r => r.Id == id);

        if (response == null)
        {
            throw new NotFoundException("Data responden tidak ditemukan.");
        }

        return response.ToDetailDto();
    }

    public async Task<List<ResponseListDto>> GetBySurveyAsync(int surveyId)
    {
        var surveyExists = await _context.Surveys
            .AnyAsync(s => s.Id == surveyId);

        if (!surveyExists)
        {
            throw new NotFoundException("Survey tidak ditemukan.");
        }

        var responses = await _context.SurveyResponses
            .AsNoTracking()
            .Where(r => r.SurveyId == surveyId)
            .Include(r => r.Survey)
            .Include(r => r.Answers)
            .OrderByDescending(r => r.SubmittedAt)
            .ToListAsync();

        return responses.Select(r => r.ToListDto()).ToList();
    }

    public async Task<List<int>> GetCompletedSurveyIdsAsync(string email)
    {
        if (string.IsNullOrWhiteSpace(email))
        {
            return new List<int>();
        }

        var normalized = email.Trim();

        return await _context.SurveyResponses
            .AsNoTracking()
            .Where(r => r.CandidateEmail == normalized)
            .Select(r => r.SurveyId)
            .Distinct()
            .ToListAsync();
    }

    public async Task<int> SubmitAsync(
        int surveyId,
        CreateResponseDto dto,
        bool isAdmin,
        string? authUsername,
        string? authEmail)
    {
        // Responden yang login memakai identitas akunnya (nama = username,
        // email = email terdaftar). Tamu memakai data yang dikirim klien.
        var candidateName = string.IsNullOrWhiteSpace(authUsername)
            ? dto.CandidateName?.Trim()
            : authUsername.Trim();

        var candidateEmail = string.IsNullOrWhiteSpace(authEmail)
            ? dto.CandidateEmail?.Trim()
            : authEmail.Trim();

        if (string.IsNullOrWhiteSpace(candidateName))
        {
            throw new ArgumentException("Nama wajib diisi.");
        }

        if (string.IsNullOrWhiteSpace(candidateEmail))
        {
            throw new ArgumentException("Email wajib diisi.");
        }

        var survey = await _context.Surveys
            .Include(s => s.Sections)
                .ThenInclude(section => section.Questions)
            .FirstOrDefaultAsync(s => s.Id == surveyId);

        if (survey == null)
        {
            throw new NotFoundException("Survey tidak ditemukan.");
        }

        // Admin boleh mengisi survey kapan saja, termasuk saat nonaktif
        // atau sudah melewati tenggat (untuk keperluan uji coba).
        if (!isAdmin)
        {
            if (!survey.IsActive)
            {
                throw new ArgumentException("Survey sedang tidak aktif.");
            }

            if (survey.IsExpired)
            {
                throw new ArgumentException(
                    "Tenggat waktu survey ini sudah berakhir.");
            }
        }

        var emailExists = await _context.SurveyResponses
            .AnyAsync(r => r.SurveyId == surveyId &&
                           r.CandidateEmail == candidateEmail);

        if (emailExists)
        {
            throw new ArgumentException(
                "Email ini sudah pernah mengisi survey ini. Silakan gunakan email lain.");
        }

        var validQuestionIds = survey.Sections
            .SelectMany(section => section.Questions)
            .Select(q => q.Id)
            .ToHashSet();

        var invalid = dto.Answers
            .FirstOrDefault(a => !validQuestionIds.Contains(a.QuestionId));

        if (invalid != null)
        {
            throw new ArgumentException(
                $"Question ID {invalid.QuestionId} tidak termasuk dalam survey ini.");
        }

        var unansweredRequired = survey.Sections
            .SelectMany(section => section.Questions)
            .Where(q => q.IsMandatory)
            .Where(q => !dto.Answers.Any(a =>
                a.QuestionId == q.Id &&
                !string.IsNullOrWhiteSpace(a.AnswerText)))
            .Select(q => q.QuestionText)
            .ToList();

        if (unansweredRequired.Count > 0)
        {
            var pesan = unansweredRequired.Count > 3
                ? $"Masih ada {unansweredRequired.Count} pertanyaan wajib yang belum dijawab."
                : $"Pertanyaan wajib belum dijawab: {string.Join(", ", unansweredRequired)}.";
            throw new ArgumentException(pesan);
        }

        var entity = new SurveyResponse
        {
            SurveyId = surveyId,
            CandidateName = candidateName,
            CandidateEmail = candidateEmail,
            SubmittedAt = DateTime.Now
        };

        foreach (var answer in dto.Answers)
        {
            entity.Answers.Add(new Answer
            {
                QuestionId = answer.QuestionId,
                AnswerText = answer.AnswerText
            });
        }

        _context.SurveyResponses.Add(entity);
        await _context.SaveChangesAsync();

        return entity.Id;
    }
}