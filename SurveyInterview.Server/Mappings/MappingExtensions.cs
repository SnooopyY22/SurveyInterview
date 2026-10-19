using SurveyInterview.Server.DTOs;
using SurveyInterview.Server.Models;

namespace SurveyInterview.Server.Mappings;

public static class MappingExtensions
{
    // ---- Survey ----

    // DeadlineAt disimpan sebagai tick UTC di SQL Server, tetapi Kind-nya
    // hilang saat dibaca. Kembalikan Kind=Utc agar JSON ditulis dengan
    // sufiks "Z" dan browser mengonversinya ke zona waktu pengguna.
    private static DateTime? AsUtc(DateTime? deadlineAt)
    {
        if (!deadlineAt.HasValue) return null;
        return DateTime.SpecifyKind(deadlineAt.Value, DateTimeKind.Utc);
    }

    public static SurveyListDto ToListDto(this Survey survey)
    {
        return new SurveyListDto
        {
            Id = survey.Id,
            Title = survey.Title,
            Description = survey.Description,
            CreatedAt = survey.CreatedAt,
            IsActive = survey.IsActive,
            Category = survey.Category,
            DeadlineAt = AsUtc(survey.DeadlineAt),
            IsExpired = survey.IsExpired
        };
    }

    public static SurveyDetailDto ToDetailDto(this Survey survey)
    {
        return new SurveyDetailDto
        {
            Id = survey.Id,
            Title = survey.Title,
            Description = survey.Description,
            CreatedAt = survey.CreatedAt,
            IsActive = survey.IsActive,
            Category = survey.Category,
            DeadlineAt = AsUtc(survey.DeadlineAt),
            IsExpired = survey.IsExpired,
            Sections = survey.Sections
                .OrderBy(s => s.OrderIndex)
                .Select(s => s.ToDto())
                .ToList()
        };
    }

    // ---- Section ----
    public static SectionDto ToDto(this Section section)
    {
        return new SectionDto
        {
            Id = section.Id,
            SurveyId = section.SurveyId,
            Title = section.Title,
            OrderIndex = section.OrderIndex,
            IsMandatory = section.IsMandatory,
            Questions = section.Questions
                .OrderBy(q => q.OrderIndex)
                .Select(q => q.ToDto())
                .ToList()
        };
    }

    // ---- Question ----
    public static QuestionDto ToDto(this Question question)
    {
        return new QuestionDto
        {
            Id = question.Id,
            SectionId = question.SectionId,
            QuestionText = question.QuestionText,
            QuestionType = question.QuestionType,
            OptionsJson = question.OptionsJson,
            OrderIndex = question.OrderIndex,
            IsMandatory = question.IsMandatory
        };
    }

    // ---- Response ----
    public static ResponseListDto ToListDto(this SurveyResponse response)
    {
        return new ResponseListDto
        {
            Id = response.Id,
            SurveyId = response.SurveyId,
            SurveyTitle = response.Survey?.Title ?? "Survey tidak ditemukan",
            SurveyCategory = response.Survey?.Category,
            CandidateName = response.CandidateName,
            CandidateEmail = response.CandidateEmail,
            SubmittedAt = response.SubmittedAt,
            AnswerCount = response.Answers?.Count ?? 0
        };
    }

    public static ResponseDetailDto ToDetailDto(this SurveyResponse response)
    {
        return new ResponseDetailDto
        {
            Id = response.Id,
            SurveyId = response.SurveyId,
            SurveyTitle = response.Survey?.Title ?? "Survey tidak ditemukan",
            CandidateName = response.CandidateName,
            CandidateEmail = response.CandidateEmail,
            SubmittedAt = response.SubmittedAt,
            Answers = response.Answers
                .OrderBy(a => a.Question?.Section?.OrderIndex ?? int.MaxValue)
                .ThenBy(a => a.Question?.OrderIndex ?? int.MaxValue)
                .Select(a => new AnswerDetailDto
                {
                    QuestionId = a.QuestionId,
                    QuestionText = a.Question?.QuestionText ?? "Pertanyaan tidak ditemukan",
                    QuestionType = a.Question?.QuestionType ?? "Unknown",
                    AnswerText = a.AnswerText,
                    SectionTitle = a.Question?.Section?.Title ?? "Section Umum",
                    SectionOrder = a.Question?.Section?.OrderIndex ?? 1
                })
                .ToList()
        };
    }
}