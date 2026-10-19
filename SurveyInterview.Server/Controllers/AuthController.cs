using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using SurveyInterview.Server.DTOs;
using SurveyInterview.Server.Services;

namespace SurveyInterview.Server.Controllers;

[ApiController]
[Route("api/[controller]")]
public class AuthController : ControllerBase
{
    private readonly IAuthService _authService;

    public AuthController(IAuthService authService)
    {
        _authService = authService;
    }

    // POST: api/auth/login
    [AllowAnonymous]
    [HttpPost("login")]
    public async Task<IActionResult> Login([FromBody] LoginDto dto)
    {
        if (string.IsNullOrWhiteSpace(dto.Username) ||
            string.IsNullOrWhiteSpace(dto.Password))
        {
            return Unauthorized(new { message = "Username dan password wajib diisi." });
        }

        var result = await _authService.LoginAsync(dto);

        if (result == null)
        {
            return Unauthorized(new { message = "Username atau password salah." });
        }

        return Ok(result);
    }

    // POST: api/auth/register
    [AllowAnonymous]
    [HttpPost("register")]
    public async Task<IActionResult> Register([FromBody] RegisterDto dto)
    {
        if (string.IsNullOrWhiteSpace(dto.Username) ||
            string.IsNullOrWhiteSpace(dto.Password))
        {
            return BadRequest(new { message = "Username dan password wajib diisi." });
        }

        var result = await _authService.RegisterAsync(dto);

        return Ok(result);
    }
}
