using System.Text;
using ClosedXML.Excel;
using Microsoft.EntityFrameworkCore;
using SurveyInterview.Server.Data;
using SurveyInterview.Server.Exceptions;

namespace SurveyInterview.Server.Services;

public class ExportService : IExportService
{
    private readonly SurveyDbContext _context;

    public ExportService(SurveyDbContext context)
    {
        _context = context;
    }

    public async Task<byte[]> ExportToExcelAsync(int surveyId)
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
                .ThenInclude(a => a.Question)
            .OrderBy(r => r.SubmittedAt)
            .ToListAsync();

        using var workbook = new XLWorkbook();
        var worksheet = workbook.Worksheets.Add("Survey Responses");

        worksheet.Cell(1, 1).Value = "ID";
        worksheet.Cell(1, 2).Value = "Candidate Name";
        worksheet.Cell(1, 3).Value = "Candidate Email";
        worksheet.Cell(1, 4).Value = "Submitted At";

        var questions = survey.Sections
            .OrderBy(s => s.OrderIndex)
            .SelectMany(s => s.Questions.OrderBy(q => q.OrderIndex))
            .ToList();

        int col = 5;
        foreach (var question in questions)
        {
            worksheet.Cell(1, col).Value = question.QuestionText;
            col++;
        }

        var headerRange = worksheet.Range(1, 1, 1, col - 1);
        headerRange.Style.Font.Bold = true;
        headerRange.Style.Fill.BackgroundColor = XLColor.LightGray;

        int row = 2;
        foreach (var response in responses)
        {
            worksheet.Cell(row, 1).Value = response.Id;
            worksheet.Cell(row, 2).Value = response.CandidateName;
            worksheet.Cell(row, 3).Value = response.CandidateEmail;
            worksheet.Cell(row, 4).Value = response.SubmittedAt.ToString("yyyy-MM-dd HH:mm:ss");

            col = 5;
            foreach (var question in questions)
            {
                var answer = response.Answers.FirstOrDefault(a => a.QuestionId == question.Id);
                worksheet.Cell(row, col).Value = answer?.AnswerText ?? "";
                col++;
            }

            row++;
        }

        worksheet.Columns().AdjustToContents();

        using var stream = new MemoryStream();
        workbook.SaveAs(stream);
        return stream.ToArray();
    }

    public async Task<byte[]> ExportToCsvAsync(int surveyId)
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
                .ThenInclude(a => a.Question)
            .OrderBy(r => r.SubmittedAt)
            .ToListAsync();

        var csv = new StringBuilder();

        var headers = new List<string> { "ID", "Candidate Name", "Candidate Email", "Submitted At" };
        var questions = survey.Sections
            .OrderBy(s => s.OrderIndex)
            .SelectMany(s => s.Questions.OrderBy(q => q.OrderIndex))
            .ToList();

        headers.AddRange(questions.Select(q => EscapeCsv(q.QuestionText)));
        csv.AppendLine(string.Join(",", headers));

        foreach (var response in responses)
        {
            var values = new List<string>
            {
                response.Id.ToString(),
                EscapeCsv(response.CandidateName),
                EscapeCsv(response.CandidateEmail),
                response.SubmittedAt.ToString("yyyy-MM-dd HH:mm:ss")
            };

            foreach (var question in questions)
            {
                var answer = response.Answers.FirstOrDefault(a => a.QuestionId == question.Id);
                values.Add(EscapeCsv(answer?.AnswerText ?? ""));
            }

            csv.AppendLine(string.Join(",", values));
        }

        return Encoding.UTF8.GetBytes(csv.ToString());
    }

    private string EscapeCsv(string value)
    {
        if (string.IsNullOrEmpty(value))
            return "\"\"";

        if (value.Contains(',') || value.Contains('"') || value.Contains('\n'))
        {
            return $"\"{value.Replace("\"", "\"\"")}\"";
        }

        return $"\"{value}\"";
    }
}
