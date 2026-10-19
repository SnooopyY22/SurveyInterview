using SurveyInterview.Server.DTOs;

namespace SurveyInterview.Server.Services;

public interface IAnalyticsService
{
    Task<SurveyAnalyticsDto> GetSurveyAnalyticsAsync(int surveyId);
}
