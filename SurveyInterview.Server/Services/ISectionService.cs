using SurveyInterview.Server.DTOs;

namespace SurveyInterview.Server.Services;

public interface ISectionService
{
    Task<SectionDto> CreateAsync(int surveyId, CreateSectionDto dto);
    Task<SectionDto> UpdateAsync(int id, UpdateSectionDto dto);
    Task DeleteAsync(int id);
}