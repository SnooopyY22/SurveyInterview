namespace SurveyInterview.Server.Services;

public interface IExportService
{
    Task<byte[]> ExportToExcelAsync(int surveyId);
    Task<byte[]> ExportToCsvAsync(int surveyId);
}
