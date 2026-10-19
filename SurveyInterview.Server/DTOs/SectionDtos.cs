using static SurveyInterview.Server.Controllers.QuestionController;

namespace SurveyInterview.Server.DTOs;

public class CreateSectionDto
{
    public string Title { get; set; } = string.Empty;
}

public class UpdateSectionDto
{
    public string Title { get; set; } = string.Empty;
    public int? OrderIndex { get; set; }
    public bool IsMandatory { get; set; }
}

public class SectionDto
{
    public int Id { get; set; }
    public int SurveyId { get; set; }
    public string Title { get; set; } = string.Empty;
    public int OrderIndex { get; set; }
    public bool IsMandatory { get; set; }
    public List<QuestionDto> Questions { get; set; } = new();
}