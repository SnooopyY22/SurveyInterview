using System.Text.Json.Serialization;

namespace SurveyInterview.Server.Models;

public class Survey
{
    public int Id { get; set; }

    public string Title { get; set; } = string.Empty;

    public string? Description { get; set; }

    public DateTime CreatedAt { get; set; } = DateTime.Now;

    // Tenggat waktu isi (UTC). Null = tanpa batas waktu.
    public DateTime? DeadlineAt { get; set; }

    public bool IsActive { get; set; } = true;

    public string? Category { get; set; }

    public List<Section> Sections { get; set; } = new();

    // Status efektif: tenggat yang sudah lewat dianggap berakhir
    // meskipun admin belum mematikan toggle.
    public bool IsExpired => DeadlineAt.HasValue && DeadlineAt.Value <= DateTime.UtcNow;
}

public class Section
{
    public int Id { get; set; }

    public int SurveyId { get; set; }

    public string Title { get; set; } = string.Empty;

    public int OrderIndex { get; set; }
    
    public bool IsMandatory { get; set; } = false;

    [JsonIgnore]
    public Survey? Survey { get; set; }

    public List<Question> Questions { get; set; } = new();
}

public class Question
{
    public int Id { get; set; }

    public int SectionId { get; set; }

    public string QuestionText { get; set; } = string.Empty;

    // ShortText, Dropdown, Checkbox, RadioButton
    public string QuestionType { get; set; } = "ShortText";

    public string? OptionsJson { get; set; }

    public int OrderIndex { get; set; }
    
    public bool IsMandatory { get; set; } = false;

    [JsonIgnore]
    public Section? Section { get; set; }
}

public class AppUser
{
    public int Id { get; set; }

    public string Username { get; set; } = string.Empty;

    public string Email { get; set; } = string.Empty;

    public string PasswordHash { get; set; } = string.Empty;

    // Admin atau Respondent
    public string Role { get; set; } = "Respondent";

    public DateTime CreatedAt { get; set; } = DateTime.Now;
}

public class SurveyResponse
{
    public int Id { get; set; }

    public int SurveyId { get; set; }

    public string CandidateName { get; set; } = string.Empty;

    public string CandidateEmail { get; set; } = string.Empty;

    public DateTime SubmittedAt { get; set; } = DateTime.Now;

    [JsonIgnore]
    public Survey? Survey { get; set; }

    public List<Answer> Answers { get; set; } = new();
}
public class Answer
{
    public int Id { get; set; }

    public int SurveyResponseId { get; set; }

    public int QuestionId { get; set; }

    public string? AnswerText { get; set; }

    [JsonIgnore]
    public SurveyResponse? SurveyResponse { get; set; }

    [JsonIgnore]
    public Question? Question { get; set; }
}