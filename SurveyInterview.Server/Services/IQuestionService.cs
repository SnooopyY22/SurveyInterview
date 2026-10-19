using SurveyInterview.Server.DTOs;

namespace SurveyInterview.Server.Services;

public interface IQuestionService
{
    Task<QuestionDto> CreateAsync(int sectionId, CreateQuestionDto dto);
    Task<QuestionDto> UpdateAsync(int id, UpdateQuestionDto dto);
    Task DeleteAsync(int id);
}