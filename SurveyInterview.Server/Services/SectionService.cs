using Microsoft.EntityFrameworkCore;
using SurveyInterview.Server.Data;
using SurveyInterview.Server.DTOs;
using SurveyInterview.Server.Exceptions;
using SurveyInterview.Server.Mappings;
using SurveyInterview.Server.Models;

namespace SurveyInterview.Server.Services;

public class SectionService : ISectionService
{
    private readonly SurveyDbContext _context;

    public SectionService(SurveyDbContext context)
    {
        _context = context;
    }

    public async Task<SectionDto> CreateAsync(int surveyId, CreateSectionDto dto)
    {
        if (string.IsNullOrWhiteSpace(dto.Title))
        {
            throw new ArgumentException("Judul section tidak boleh kosong.");
        }

        var surveyExists = await _context.Surveys
            .AnyAsync(s => s.Id == surveyId);

        if (!surveyExists)
        {
            throw new NotFoundException("Survey tidak ditemukan.");
        }

        var lastOrderIndex = await _context.Sections
            .Where(s => s.SurveyId == surveyId)
            .Select(s => (int?)s.OrderIndex)
            .MaxAsync() ?? 0;

        var entity = new Section
        {
            SurveyId = surveyId,
            Title = dto.Title.Trim(),
            OrderIndex = lastOrderIndex + 1
        };

        _context.Sections.Add(entity);
        await _context.SaveChangesAsync();

        return entity.ToDto();
    }

    public async Task<SectionDto> UpdateAsync(int id, UpdateSectionDto dto)
    {
        var section = await _context.Sections
            .Include(s => s.Questions)
            .FirstOrDefaultAsync(s => s.Id == id);

        if (section == null)
        {
            throw new NotFoundException("Section tidak ditemukan.");
        }

        if (string.IsNullOrWhiteSpace(dto.Title))
        {
            throw new ArgumentException("Judul section tidak boleh kosong.");
        }

        section.Title = dto.Title.Trim();
        if (dto.OrderIndex.HasValue)
        {
            section.OrderIndex = dto.OrderIndex.Value;
        }
        section.IsMandatory = dto.IsMandatory;

        await _context.SaveChangesAsync();

        return section.ToDto();
    }

    public async Task DeleteAsync(int id)
    {
        var section = await _context.Sections.FindAsync(id);

        if (section == null)
        {
            throw new NotFoundException("Section tidak ditemukan.");
        }

        _context.Sections.Remove(section);
        await _context.SaveChangesAsync();
    }
}