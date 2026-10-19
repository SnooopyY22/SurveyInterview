using SurveyInterview.Server.Exceptions;

namespace SurveyInterview.Server.Middleware;

public class ExceptionMiddleware
{
    private readonly RequestDelegate _next;
    private readonly ILogger<ExceptionMiddleware> _logger;
    private readonly IWebHostEnvironment _environment;

    public ExceptionMiddleware(
        RequestDelegate next,
        ILogger<ExceptionMiddleware> logger,
        IWebHostEnvironment environment)
    {
        _next = next;
        _logger = logger;
        _environment = environment;
    }

    public async Task InvokeAsync(HttpContext context)
    {
        try
        {
            await _next(context);
        }
        catch (NotFoundException ex)
        {
            _logger.LogWarning(
                "404 untuk {Path}: {Message}",
                context.Request.Path,
                ex.Message);

            context.Response.StatusCode = StatusCodes.Status404NotFound;
            context.Response.ContentType = "application/json";
            await context.Response.WriteAsJsonAsync(new
            {
                message = ex.Message
            });
        }
        catch (ArgumentException ex)
        {
            _logger.LogWarning(
                "400 untuk {Path}: {Message}",
                context.Request.Path,
                ex.Message);

            context.Response.StatusCode = StatusCodes.Status400BadRequest;
            context.Response.ContentType = "application/json";
            await context.Response.WriteAsJsonAsync(new
            {
                message = ex.Message
            });
        }
        catch (Exception ex)
        {
            _logger.LogError(
                ex,
                "500 tak terduga untuk {Method} {Path}",
                context.Request.Method,
                context.Request.Path);

            context.Response.StatusCode = StatusCodes.Status500InternalServerError;
            context.Response.ContentType = "application/json";

            // Detail error hanya di Development; produksi cukup pesan umum.
            if (_environment.IsDevelopment())
            {
                await context.Response.WriteAsJsonAsync(new
                {
                    message = "Terjadi kesalahan pada server.",
                    detail = ex.Message
                });
            }
            else
            {
                await context.Response.WriteAsJsonAsync(new
                {
                    message = "Terjadi kesalahan pada server."
                });
            }
        }
    }
}
