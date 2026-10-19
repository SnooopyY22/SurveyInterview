using Microsoft.EntityFrameworkCore;
using SurveyInterview.Server.Data;
using SurveyInterview.Server.DTOs;
using SurveyInterview.Server.Exceptions;
using SurveyInterview.Server.Mappings;
using SurveyInterview.Server.Models;

namespace SurveyInterview.Server.Services;

public class SurveyService : ISurveyService
{
    private readonly SurveyDbContext _context;

    public SurveyService(SurveyDbContext context)
    {
        _context = context;
    }

    public async Task<List<SurveyListDto>> GetAllAsync()
    {
        var surveys = await _context.Surveys
            .AsNoTracking()
            .OrderByDescending(s => s.CreatedAt)
            .ToListAsync();

        return surveys.Select(s => s.ToListDto()).ToList();
    }

    public async Task<SurveyDetailDto> GetDetailAsync(int id)
    {
        var survey = await _context.Surveys
            .AsNoTracking()
            .Include(s => s.Sections)
                .ThenInclude(section => section.Questions)
            .FirstOrDefaultAsync(s => s.Id == id);

        if (survey == null)
        {
            throw new NotFoundException("Survey tidak ditemukan.");
        }

        return survey.ToDetailDto();
    }

    public async Task<SurveyListDto> CreateAsync(CreateSurveyDto dto)
    {
        if (string.IsNullOrWhiteSpace(dto.Title))
        {
            throw new ArgumentException("Judul survey tidak boleh kosong.");
        }

        ValidateDeadline(dto.DeadlineAt);

        var entity = new Survey
        {
            Title = dto.Title.Trim(),
            Description = string.IsNullOrWhiteSpace(dto.Description)
                ? null
                : dto.Description.Trim(),
            Category = string.IsNullOrWhiteSpace(dto.Category)
                ? "Umum"
                : dto.Category.Trim(),
            CreatedAt = DateTime.Now,
            DeadlineAt = dto.DeadlineAt,
            IsActive = true
        };

        _context.Surveys.Add(entity);
        await _context.SaveChangesAsync();

        return entity.ToListDto();
    }

    private static void ValidateDeadline(DateTime? deadlineAt)
    {
        if (deadlineAt.HasValue && deadlineAt.Value <= DateTime.UtcNow)
        {
            throw new ArgumentException(
                "Tenggat waktu harus berada di masa depan.");
        }
    }

    public async Task<SurveyDetailDto> UpdateAsync(int id, UpdateSurveyDto dto)
    {
        if (string.IsNullOrWhiteSpace(dto.Title))
        {
            throw new ArgumentException("Judul survey tidak boleh kosong.");
        }

        ValidateDeadline(dto.DeadlineAt);

        var survey = await _context.Surveys
            .Include(s => s.Sections)
                .ThenInclude(section => section.Questions)
            .FirstOrDefaultAsync(s => s.Id == id);

        if (survey == null)
        {
            throw new NotFoundException("Survey tidak ditemukan.");
        }

        survey.Title = dto.Title.Trim();
        survey.Description = string.IsNullOrWhiteSpace(dto.Description)
            ? null
            : dto.Description.Trim();
        survey.Category = string.IsNullOrWhiteSpace(dto.Category)
            ? "Umum"
            : dto.Category.Trim();
        survey.DeadlineAt = dto.DeadlineAt;
        survey.IsActive = dto.IsActive;

        await _context.SaveChangesAsync();

        return survey.ToDetailDto();
    }

    public async Task<bool> ToggleStatusAsync(int id, bool isActive)
    {
        var survey = await _context.Surveys.FindAsync(id);
        if (survey == null)
        {
            throw new NotFoundException("Survey tidak ditemukan.");
        }

        survey.IsActive = isActive;
        await _context.SaveChangesAsync();
        return survey.IsActive;
    }

    public async Task DeleteAsync(int id)
    {
        var survey = await _context.Surveys.FindAsync(id);
        if (survey == null)
        {
            throw new NotFoundException("Survey tidak ditemukan.");
        }

        var responseCount = await _context.SurveyResponses
            .CountAsync(r => r.SurveyId == id);

        if (responseCount > 0)
        {
            throw new ArgumentException(
                $"Survey tidak bisa dihapus karena sudah memiliki {responseCount} responden.");
        }

        _context.Surveys.Remove(survey);
        await _context.SaveChangesAsync();
    }
}
