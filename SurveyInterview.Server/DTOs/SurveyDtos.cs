using static SurveyInterview.Server.Controllers.SectionController;

namespace SurveyInterview.Server.DTOs;

public class CreateSurveyDto
{
    public string Title { get; set; } = string.Empty;
    public string? Description { get; set; }
    public string? Category { get; set; }
    public DateTime? DeadlineAt { get; set; }
}

public class UpdateSurveyDto
{
    public string Title { get; set; } = string.Empty;
    public string? Description { get; set; }
    public string? Category { get; set; }
    public bool IsActive { get; set; }
    public DateTime? DeadlineAt { get; set; }
}

public class SurveyListDto
{
    public int Id { get; set; }
    public string Title { get; set; } = string.Empty;
    public string? Description { get; set; }
    public DateTime CreatedAt { get; set; }
    public bool IsActive { get; set; }
    public string? Category { get; set; }
    public DateTime? DeadlineAt { get; set; }
    public bool IsExpired { get; set; }
    // Status yang dipakai UI: aktif dan belum lewat tenggat.
    public bool IsOpen => IsActive && !IsExpired;
}

public class SurveyDetailDto
{
    public int Id { get; set; }
    public string Title { get; set; } = string.Empty;
    public string? Description { get; set; }
    public DateTime CreatedAt { get; set; }
    public bool IsActive { get; set; }
    public string? Category { get; set; }
    public DateTime? DeadlineAt { get; set; }
    public bool IsExpired { get; set; }
    public bool IsOpen => IsActive && !IsExpired;
    public List<SectionDto> Sections { get; set; } = new();
}