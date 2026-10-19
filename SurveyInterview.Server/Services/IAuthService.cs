using SurveyInterview.Server.DTOs;

namespace SurveyInterview.Server.Services;

public interface IAuthService
{
    Task<LoginResultDto?> LoginAsync(LoginDto dto);

    Task<LoginResultDto> RegisterAsync(RegisterDto dto);
}
