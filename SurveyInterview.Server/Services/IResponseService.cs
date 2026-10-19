using SurveyInterview.Server.DTOs;

namespace SurveyInterview.Server.Services;

public interface IResponseService
{
    Task<List<ResponseListDto>> GetAllAsync();
    Task<ResponseDetailDto> GetDetailAsync(int id);
    Task<List<ResponseListDto>> GetBySurveyAsync(int surveyId);
    Task<List<int>> GetCompletedSurveyIdsAsync(string email);
    Task<int> SubmitAsync(
        int surveyId,
        CreateResponseDto dto,
        bool isAdmin,
        string? authUsername,
        string? authEmail);
}