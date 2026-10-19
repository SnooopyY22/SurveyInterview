using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using SurveyInterview.Server.DTOs;
using SurveyInterview.Server.Services;

namespace SurveyInterview.Server.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize(Policy = "AdminOnly")]
public class SectionController : ControllerBase
{
    private readonly ISectionService _sectionService;

    public SectionController(ISectionService sectionService)
    {
        _sectionService = sectionService;
    }

    // POST: api/section
    [HttpPost]
    public async Task<IActionResult> CreateSection(
        [FromBody] SectionCreateRequest request)
    {
        var result = await _sectionService.CreateAsync(
            request.SurveyId,
            new CreateSectionDto { Title = request.Title });

        return Ok(result);
    }

    // PUT: api/section/5
    [HttpPut("{id:int}")]
    public async Task<IActionResult> UpdateSection(
        int id,
        [FromBody] UpdateSectionDto dto)
    {
        var result = await _sectionService.UpdateAsync(id, dto);
        return Ok(result);
    }

    // DELETE: api/section/5
    [HttpDelete("{id:int}")]
    public async Task<IActionResult> DeleteSection(int id)
    {
        await _sectionService.DeleteAsync(id);
        return NoContent();
    }
}

// Request khusus untuk endpoint POST di controller ini
public class SectionCreateRequest
{
    public int SurveyId { get; set; }
    public string Title { get; set; } = string.Empty;
}

