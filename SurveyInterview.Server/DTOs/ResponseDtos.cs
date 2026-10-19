namespace SurveyInterview.Server.DTOs;

public class CreateAnswerDto
{
    public int QuestionId { get; set; }
    public string? AnswerText { get; set; }
}

public class CreateResponseDto
{
    public string CandidateName { get; set; } = string.Empty;
    public string CandidateEmail { get; set; } = string.Empty;
    public List<CreateAnswerDto> Answers { get; set; } = new();
}

public class ResponseListDto
{
    public int Id { get; set; }
    public int SurveyId { get; set; }
    public string SurveyTitle { get; set; } = string.Empty;
    public string? SurveyCategory { get; set; }
    public string CandidateName { get; set; } = string.Empty;
    public string CandidateEmail { get; set; } = string.Empty;
    public DateTime SubmittedAt { get; set; }
    public int AnswerCount { get; set; }
}

public class AnswerDetailDto
{
    public int QuestionId { get; set; }
    public string QuestionText { get; set; } = string.Empty;
    public string QuestionType { get; set; } = string.Empty;
    public string? AnswerText { get; set; }
    public string SectionTitle { get; set; } = string.Empty;
    public int SectionOrder { get; set; }
}

public class ResponseDetailDto
{
    public int Id { get; set; }
    public int SurveyId { get; set; }
    public string SurveyTitle { get; set; } = string.Empty;
    public string CandidateName { get; set; } = string.Empty;
    public string CandidateEmail { get; set; } = string.Empty;
    public DateTime SubmittedAt { get; set; }
    public List<AnswerDetailDto> Answers { get; set; } = new();
}