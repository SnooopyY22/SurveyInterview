using System.Text.Json;
using Microsoft.EntityFrameworkCore;
using SurveyInterview.Server.Data;
using SurveyInterview.Server.DTOs;
using SurveyInterview.Server.Exceptions;

namespace SurveyInterview.Server.Services;

public class AnalyticsService : IAnalyticsService
{
    private readonly SurveyDbContext _context;

    public AnalyticsService(SurveyDbContext context)
    {
        _context = context;
    }

    public async Task<SurveyAnalyticsDto> GetSurveyAnalyticsAsync(int surveyId)
    {
        var survey = await _context.Surveys
            .AsNoTracking()
            .Include(s => s.Sections)
                .ThenInclude(sec => sec.Questions)
            .FirstOrDefaultAsync(s => s.Id == surveyId);

        if (survey == null)
        {
            throw new NotFoundException("Survey tidak ditemukan.");
        }

        var responses = await _context.SurveyResponses
            .AsNoTracking()
            .Where(r => r.SurveyId == surveyId)
            .Include(r => r.Answers)
            .ToListAsync();

        var totalResponses = responses.Count;

        var questionAnalytics = new List<QuestionAnalyticsDto>();

        foreach (var section in survey.Sections)
        {
            foreach (var question in section.Questions)
            {
                var questionAnswers = responses
                    .SelectMany(r => r.Answers)
                    .Where(a => a.QuestionId == question.Id)
                    .ToList();

                var analytics = new QuestionAnalyticsDto
                {
                    QuestionId = question.Id,
                    QuestionText = question.QuestionText,
                    QuestionType = question.QuestionType,
                    SectionTitle = section.Title,
                    TotalResponses = totalResponses
                };

                if (question.QuestionType is "Dropdown" or "RadioButton" or "Checkbox")
                {
                    var options = ParseOptions(question.OptionsJson);
                    var optionCounts = new Dictionary<string, int>();

                    foreach (var option in options)
                    {
                        optionCounts[option] = 0;
                    }

                    foreach (var answer in questionAnswers)
                    {
                        if (string.IsNullOrWhiteSpace(answer.AnswerText))
                        {
                            continue;
                        }

                        if (optionCounts.ContainsKey(answer.AnswerText))
                        {
                            optionCounts[answer.AnswerText]++;
                            continue;
                        }

                        if (question.QuestionType == "Checkbox")
                        {
                            var parts = answer.AnswerText.Split(
                                ',',
                                StringSplitOptions.RemoveEmptyEntries |
                                StringSplitOptions.TrimEntries);

                            foreach (var part in parts)
                            {
                                if (optionCounts.ContainsKey(part))
                                {
                                    optionCounts[part]++;
                                }
                            }
                        }
                    }

                    analytics.OptionCounts = optionCounts
                        .Select(kv => new OptionCountDto
                        {
                            Option = kv.Key,
                            Count = kv.Value,
                            Percentage = totalResponses > 0 ? (kv.Value * 100.0) / totalResponses : 0
                        })
                        .ToList();
                }
                else if (question.QuestionType == "ShortText")
                {
                    analytics.TextAnswers = questionAnswers
                        .Where(a => !string.IsNullOrEmpty(a.AnswerText))
                        .Select(a => a.AnswerText!)
                        .ToList();
                }

                questionAnalytics.Add(analytics);
            }
        }

        return new SurveyAnalyticsDto
        {
            SurveyId = survey.Id,
            SurveyTitle = survey.Title,
            Description = survey.Description,
            Category = survey.Category,
            TotalResponses = totalResponses,
            Questions = questionAnalytics
        };
    }

    private List<string> ParseOptions(string? optionsJson)
    {
        if (string.IsNullOrEmpty(optionsJson))
            return new();

        try
        {
            var options = JsonSerializer.Deserialize<List<string>>(optionsJson);
            return options ?? new();
        }
        catch
        {
            return new();
        }
    }
}
