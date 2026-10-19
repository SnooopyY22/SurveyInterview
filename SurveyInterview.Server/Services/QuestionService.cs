using System.Text.Json;
using Microsoft.EntityFrameworkCore;
using SurveyInterview.Server.Data;
using SurveyInterview.Server.DTOs;
using SurveyInterview.Server.Exceptions;
using SurveyInterview.Server.Mappings;
using SurveyInterview.Server.Models;

namespace SurveyInterview.Server.Services;

public class QuestionService : IQuestionService
{
    private static readonly string[] AllowedTypes =
    {
        "ShortText",
        "Dropdown",
        "Checkbox",
        "RadioButton"
    };

    private readonly SurveyDbContext _context;

    public QuestionService(SurveyDbContext context)
    {
        _context = context;
    }

    public async Task<QuestionDto> CreateAsync(int sectionId, CreateQuestionDto dto)
    {
        Validate(dto.QuestionText, dto.QuestionType);

        var sectionExists = await _context.Sections
            .AnyAsync(s => s.Id == sectionId);

        if (!sectionExists)
        {
            throw new NotFoundException("Section tidak ditemukan.");
        }

        var lastOrderIndex = await _context.Questions
            .Where(q => q.SectionId == sectionId)
            .Select(q => (int?)q.OrderIndex)
            .MaxAsync() ?? 0;

        var entity = new Question
        {
            SectionId = sectionId,
            QuestionText = dto.QuestionText.Trim(),
            QuestionType = dto.QuestionType,
            OptionsJson = dto.Options != null
                ? JsonSerializer.Serialize(dto.Options)
                : null,
            OrderIndex = lastOrderIndex + 1,
            IsMandatory = dto.IsMandatory
        };

        _context.Questions.Add(entity);
        await _context.SaveChangesAsync();

        return entity.ToDto();
    }

    public async Task<QuestionDto> UpdateAsync(int id, UpdateQuestionDto dto)
    {
        var question = await _context.Questions.FindAsync(id);

        if (question == null)
        {
            throw new NotFoundException("Pertanyaan tidak ditemukan.");
        }

        Validate(dto.QuestionText, dto.QuestionType);

        question.QuestionText = dto.QuestionText.Trim();
        question.QuestionType = dto.QuestionType;
        question.OptionsJson = dto.Options != null
            ? JsonSerializer.Serialize(dto.Options)
            : null;
        question.OrderIndex = dto.OrderIndex ?? question.OrderIndex;
        question.IsMandatory = dto.IsMandatory;

        await _context.SaveChangesAsync();

        return question.ToDto();
    }

    public async Task DeleteAsync(int id)
    {
        var question = await _context.Questions.FindAsync(id);

        if (question == null)
        {
            throw new NotFoundException("Pertanyaan tidak ditemukan.");
        }

        _context.Questions.Remove(question);
        await _context.SaveChangesAsync();
    }

    private static void Validate(string questionText, string questionType)
    {
        if (string.IsNullOrWhiteSpace(questionText))
        {
            throw new ArgumentException("Pertanyaan wajib diisi.");
        }

        if (!AllowedTypes.Contains(questionType))
        {
            throw new ArgumentException("Tipe pertanyaan tidak valid.");
        }
    }
}