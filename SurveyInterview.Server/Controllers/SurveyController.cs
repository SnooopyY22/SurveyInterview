using System.Security.Claims;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using SurveyInterview.Server.DTOs;
using SurveyInterview.Server.Services;

namespace SurveyInterview.Server.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize(Policy = "AdminOnly")]
public class SurveyController : ControllerBase
{
    private readonly ISurveyService _surveyService;
    private readonly IResponseService _responseService;

    public SurveyController(
        ISurveyService surveyService,
        IResponseService responseService)
    {
        _surveyService = surveyService;
        _responseService = responseService;
    }

    // GET: api/survey
    // daftar survey dibutuhkan halaman Isi Survey tanpa login.
    [AllowAnonymous]
    [HttpGet]
    public async Task<IActionResult> GetSurveys()
    {
        var result = await _surveyService.GetAllAsync();
        return Ok(result);
    }

    // GET: api/survey/5
    // responden mengisi survey tanpa login.
    [AllowAnonymous]
    [HttpGet("{id:int}")]
    public async Task<IActionResult> GetSurvey(int id)
    {
        var result = await _surveyService.GetDetailAsync(id);
        return Ok(result);
    }

    // POST: api/survey
    [HttpPost]
    public async Task<IActionResult> CreateSurvey([FromBody] CreateSurveyDto dto)
    {
        var result = await _surveyService.CreateAsync(dto);
        return CreatedAtAction(nameof(GetSurvey), new { id = result.Id }, result);
    }

    // PUT: api/survey/5
    [HttpPut("{id:int}")]
    public async Task<IActionResult> UpdateSurvey(int id, [FromBody] UpdateSurveyDto dto)
    {
        var result = await _surveyService.UpdateAsync(id, dto);
        return Ok(result);
    }

    // PATCH: api/survey/5/status
    [HttpPatch("{id:int}/status")]
    public async Task<IActionResult> ToggleStatus(int id, [FromBody] bool isActive)
    {
        var result = await _surveyService.ToggleStatusAsync(id, isActive);
        return Ok(new { isActive = result });
    }

    // DELETE: api/survey/5
    [HttpDelete("{id:int}")]
    public async Task<IActionResult> DeleteSurvey(int id)
    {
        await _surveyService.DeleteAsync(id);
        return NoContent();
    }
    [HttpGet("responses")]
    public async Task<IActionResult> GetAllResponses()
    {
        var result = await _responseService.GetAllAsync();
        return Ok(result);
    }

    // GET: api/survey/responses/5
    [HttpGet("responses/{responseId:int}")]
    public async Task<IActionResult> GetResponseDetail(int responseId)
    {
        var result = await _responseService.GetDetailAsync(responseId);
        return Ok(result);
    }

    // POST: api/survey/5/responses
    // Publik: responden mengirim jawaban tanpa login.
    // Token admin tetap dibaca agar batas waktu tidak berlaku untuk admin.
    [AllowAnonymous]
    [HttpPost("{surveyId:int}/responses")]
    public async Task<IActionResult> SubmitResponse(
        int surveyId,
        [FromBody] CreateResponseDto dto)
    {
        var isAuthenticated = User.Identity?.IsAuthenticated == true;

        var isAdmin = isAuthenticated &&
            User.HasClaim(claim =>
                (claim.Type == "role" ||
                 claim.Type == System.Security.Claims.ClaimTypes.Role) &&
                claim.Value == "Admin");

        var authUsername = isAuthenticated ? User.Identity?.Name : null;
        var authEmail = isAuthenticated
            ? GetClaimValue("email", ClaimTypes.Email)
            : null;

        var responseId = await _responseService.SubmitAsync(
            surveyId, dto, isAdmin, authUsername, authEmail);

        return Ok(new
        {
            message = "Survey berhasil dikirim.",
            responseId
        });
    }

    // GET: api/survey/completed
    // Daftar ID survey yang sudah diisi oleh pengguna yang sedang login.
    // Tamu (tanpa token) menerima daftar kosong.
    [AllowAnonymous]
    [HttpGet("completed")]
    public async Task<IActionResult> GetCompletedSurveys()
    {
        var email = User.Identity?.IsAuthenticated == true
            ? GetClaimValue("email", ClaimTypes.Email)
            : null;

        if (string.IsNullOrWhiteSpace(email))
        {
            return Ok(Array.Empty<int>());
        }

        var result = await _responseService.GetCompletedSurveyIdsAsync(email);
        return Ok(result);
    }

    private string? GetClaimValue(params string[] claimTypes)
    {
        foreach (var claim in User.Claims)
        {
            if (claimTypes.Contains(claim.Type))
            {
                return claim.Value;
            }
        }

        return null;
    }

    // GET: api/survey/5/responses
    [HttpGet("{surveyId:int}/responses")]
    public async Task<IActionResult> GetSurveyResponses(int surveyId)
    {
        var result = await _responseService.GetBySurveyAsync(surveyId);
        return Ok(result);
    }

    // GET: api/survey/5/analytics
    [HttpGet("{surveyId:int}/analytics")]
    public async Task<IActionResult> GetAnalytics(
        int surveyId,
        [FromServices] IAnalyticsService analyticsService)
    {
        var result = await analyticsService.GetSurveyAnalyticsAsync(surveyId);
        return Ok(result);
    }

    // GET: api/survey/5/export?format=excel|csv
    [HttpGet("{surveyId:int}/export")]
    public async Task<IActionResult> ExportResponses(
        int surveyId,
        [FromQuery] string format = "excel",
        [FromServices] IExportService exportService = null!)
    {
        byte[] fileBytes;
        string contentType;
        string fileName;

        switch (format.ToLowerInvariant())
        {
            case "csv":
                fileBytes = await exportService.ExportToCsvAsync(surveyId);
                contentType = "text/csv";
                fileName = $"survey-{surveyId}-responses.csv";
                break;

            case "excel":
            default:
                fileBytes = await exportService.ExportToExcelAsync(surveyId);
                contentType = "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet";
                fileName = $"survey-{surveyId}-responses.xlsx";
                break;
        }

        return File(fileBytes, contentType, fileName);
    }
}