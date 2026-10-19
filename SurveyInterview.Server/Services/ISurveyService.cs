using SurveyInterview.Server.DTOs;

namespace SurveyInterview.Server.Services;

public interface ISurveyService
{
    Task<List<SurveyListDto>> GetAllAsync();
    Task<SurveyDetailDto> GetDetailAsync(int id);
    Task<SurveyListDto> CreateAsync(CreateSurveyDto dto);
    Task<SurveyDetailDto> UpdateAsync(int id, UpdateSurveyDto dto);
    Task<bool> ToggleStatusAsync(int id, bool isActive);
    Task DeleteAsync(int id);
}
