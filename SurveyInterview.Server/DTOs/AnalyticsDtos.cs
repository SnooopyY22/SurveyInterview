namespace SurveyInterview.Server.DTOs;

public class OptionCountDto
{
    public string Option { get; set; } = string.Empty;
    public int Count { get; set; }
    public double Percentage { get; set; }
}

public class QuestionAnalyticsDto
{
    public int QuestionId { get; set; }
    public string QuestionText { get; set; } = string.Empty;
    public string QuestionType { get; set; } = string.Empty;
    public string SectionTitle { get; set; } = string.Empty;
    public int TotalResponses { get; set; }
    public List<OptionCountDto> OptionCounts { get; set; } = new();
    public List<string> TextAnswers { get; set; } = new();
}

public class SurveyAnalyticsDto
{
    public int SurveyId { get; set; }
    public string SurveyTitle { get; set; } = string.Empty;
    public string? Description { get; set; }
    public string? Category { get; set; }
    public int TotalResponses { get; set; }
    public List<QuestionAnalyticsDto> Questions { get; set; } = new();
}
