using Microsoft.EntityFrameworkCore;
using SurveyInterview.Server.Data;

namespace SurveyInterview.Server.Services;

/// <summary>
/// Mematikan survey yang sudah melewati tenggat waktu secara berkala,
/// sehingga kolom IsActive di database benar-benar berubah menjadi false.
/// Pembacaan di tiap endpoint tetap mengecek tenggat secara langsung,
/// jadi survey tetap tertutup walau server baru saja dinyalakan.
/// </summary>
public class DeadlineSweepService : BackgroundService
{
    private static readonly TimeSpan Interval = TimeSpan.FromSeconds(30);

    private readonly IServiceScopeFactory _scopeFactory;
    private readonly ILogger<DeadlineSweepService> _logger;

    public DeadlineSweepService(
        IServiceScopeFactory scopeFactory,
        ILogger<DeadlineSweepService> logger)
    {
        _scopeFactory = scopeFactory;
        _logger = logger;
    }

    protected override async Task ExecuteAsync(CancellationToken stoppingToken)
    {
        _logger.LogInformation("DeadlineSweepService dimulai.");

        while (!stoppingToken.IsCancellationRequested)
        {
            try
            {
                await SweepAsync(stoppingToken);
            }
            catch (OperationCanceledException) when (stoppingToken.IsCancellationRequested)
            {
                break;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Gagal mengecek tenggat waktu survey.");
            }

            try
            {
                await Task.Delay(Interval, stoppingToken);
            }
            catch (OperationCanceledException)
            {
                break;
            }
        }
    }

    private async Task SweepAsync(CancellationToken cancellationToken)
    {
        using var scope = _scopeFactory.CreateScope();
        var context = scope.ServiceProvider.GetRequiredService<SurveyDbContext>();

        var now = DateTime.UtcNow;

        var expiredSurveys = await context.Surveys
            .Where(s => s.IsActive &&
                        s.DeadlineAt != null &&
                        s.DeadlineAt <= now)
            .ToListAsync(cancellationToken);

        if (expiredSurveys.Count == 0)
        {
            return;
        }

        foreach (var survey in expiredSurveys)
        {
            survey.IsActive = false;
        }

        await context.SaveChangesAsync(cancellationToken);

        _logger.LogInformation(
            "{Count} survey dinonaktifkan otomatis karena melewati tenggat: {Ids}",
            expiredSurveys.Count,
            string.Join(", ", expiredSurveys.Select(s => s.Id)));
    }
}
