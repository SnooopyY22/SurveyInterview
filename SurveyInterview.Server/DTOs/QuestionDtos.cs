namespace SurveyInterview.Server.DTOs;

public class CreateQuestionDto
{
    public string QuestionText { get; set; } = string.Empty;
    public string QuestionType { get; set; } = "ShortText";
    public List<string>? Options { get; set; }
    public bool IsMandatory { get; set; }
}

public class UpdateQuestionDto
{
    public string QuestionText { get; set; } = string.Empty;
    public string QuestionType { get; set; } = "ShortText";
    public List<string>? Options { get; set; }
    public int? OrderIndex { get; set; }
    public bool IsMandatory { get; set; }
}

public class QuestionDto
{
    public int Id { get; set; }
    public int SectionId { get; set; }
    public string QuestionText { get; set; } = string.Empty;
    public string QuestionType { get; set; } = "ShortText";
    public string? OptionsJson { get; set; }
    public int OrderIndex { get; set; }
    public bool IsMandatory { get; set; }
}