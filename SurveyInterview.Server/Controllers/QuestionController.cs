using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using SurveyInterview.Server.DTOs;
using SurveyInterview.Server.Services;

namespace SurveyInterview.Server.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize(Policy = "AdminOnly")]
public class QuestionController : ControllerBase
{
    private readonly IQuestionService _questionService;

    public QuestionController(IQuestionService questionService)
    {
        _questionService = questionService;
    }

    // POST: api/question
    [HttpPost]
    public async Task<IActionResult> CreateQuestion(
        [FromBody] QuestionCreateRequest request)
    {
        var result = await _questionService.CreateAsync(
            request.SectionId,
            new CreateQuestionDto
            {
                QuestionText = request.QuestionText,
                QuestionType = request.QuestionType,
                Options = request.Options,
                IsMandatory = request.IsMandatory
            });

        return Ok(result);
    }

    // PUT: api/question/5
    [HttpPut("{id:int}")]
    public async Task<IActionResult> UpdateQuestion(
        int id,
        [FromBody] UpdateQuestionDto dto)
    {
        var result = await _questionService.UpdateAsync(id, dto);
        return Ok(result);
    }

    // DELETE: api/question/5
    [HttpDelete("{id:int}")]
    public async Task<IActionResult> DeleteQuestion(int id)
    {
        await _questionService.DeleteAsync(id);
        return NoContent();
    }
}

// Request khusus untuk endpoint POST di controller ini
public class QuestionCreateRequest
{
    public int SectionId { get; set; }
    public string QuestionText { get; set; } = string.Empty;
    public string QuestionType { get; set; } = "ShortText";
    public List<string>? Options { get; set; }
    public bool IsMandatory { get; set; }
}