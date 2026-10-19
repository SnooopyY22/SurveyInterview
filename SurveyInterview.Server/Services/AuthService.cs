using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Security.Cryptography;
using System.Text;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;
using SurveyInterview.Server.Data;
using SurveyInterview.Server.DTOs;
using SurveyInterview.Server.Models;

namespace SurveyInterview.Server.Services;

public class AuthService : IAuthService
{
    private const string AdminRole = "Admin";
    private const string RespondentRole = "Respondent";
    private const string HashPrefix = "PBKDF2";
    private const int HashIterations = 100_000;

    private readonly IConfiguration _configuration;
    private readonly SurveyDbContext _dbContext;

    public AuthService(IConfiguration configuration, SurveyDbContext dbContext)
    {
        _configuration = configuration;
        _dbContext = dbContext;
    }

    public async Task<LoginResultDto?> LoginAsync(LoginDto dto)
    {
        var username = dto.Username.Trim();

        var expectedUsername = _configuration["Admin:Username"];
        var expectedPassword = _configuration["Admin:Password"];

        var isAdminConfigured =
            !string.IsNullOrWhiteSpace(expectedUsername) &&
            !string.IsNullOrWhiteSpace(expectedPassword);

        if (isAdminConfigured &&
            string.Equals(username, expectedUsername, StringComparison.Ordinal) &&
            string.Equals(dto.Password, expectedPassword, StringComparison.Ordinal))
        {
            return CreateToken(expectedUsername!, AdminRole, string.Empty);
        }

        var user = await _dbContext.AppUsers
            .AsNoTracking()
            .FirstOrDefaultAsync(u => u.Username == username);

        if (user == null || !VerifyPassword(dto.Password, user.PasswordHash))
        {
            return null;
        }

        return CreateToken(user.Username, user.Role, user.Email);
    }

    public async Task<LoginResultDto> RegisterAsync(RegisterDto dto)
    {
        var username = dto.Username.Trim();
        var email = dto.Email.Trim();

        if (username.Length < 3)
        {
            throw new ArgumentException("Username minimal 3 karakter.");
        }

        if (string.IsNullOrWhiteSpace(email) || !email.Contains('@') || !email.Contains('.'))
        {
            throw new ArgumentException("Format email tidak valid.");
        }

        if (string.IsNullOrWhiteSpace(dto.Password) || dto.Password.Length < 6)
        {
            throw new ArgumentException("Password minimal 6 karakter.");
        }

        if (!string.Equals(dto.Password, dto.ConfirmPassword, StringComparison.Ordinal))
        {
            throw new ArgumentException("Konfirmasi password tidak sama.");
        }

        var usernameTaken = await _dbContext.AppUsers
            .AnyAsync(u => u.Username == username);
        if (usernameTaken)
        {
            throw new ArgumentException("Username sudah digunakan.");
        }

        var emailTaken = await _dbContext.AppUsers
            .AnyAsync(u => u.Email == email);
        if (emailTaken)
        {
            throw new ArgumentException("Email sudah terdaftar.");
        }

        var user = new AppUser
        {
            Username = username,
            Email = email,
            PasswordHash = HashPassword(dto.Password),
            Role = RespondentRole,
            CreatedAt = DateTime.Now
        };

        _dbContext.AppUsers.Add(user);
        await _dbContext.SaveChangesAsync();

        return CreateToken(user.Username, user.Role, user.Email);
    }

    private LoginResultDto CreateToken(string username, string role, string email)
    {
        var signingKey = _configuration["Authentication:SigningKey"]
            ?? throw new InvalidOperationException(
                "Konfigurasi Authentication:SigningKey belum diatur.");
        var lifetimeMinutes = int.TryParse(
            _configuration["Authentication:TokenLifetimeMinutes"], out var minutes)
            ? minutes
            : 480;

        var expiresAt = DateTime.UtcNow.AddMinutes(lifetimeMinutes);

        var claims = new List<Claim>
        {
            new Claim(JwtRegisteredClaimNames.Sub, username),
            new Claim(JwtRegisteredClaimNames.UniqueName, username),
            new Claim("role", role)
        };

        if (!string.IsNullOrWhiteSpace(email))
        {
            claims.Add(new Claim("email", email));
        }

        var token = new JwtSecurityToken(
            claims: claims,
            expires: expiresAt,
            signingCredentials: new SigningCredentials(
                new SymmetricSecurityKey(Encoding.UTF8.GetBytes(signingKey)),
                SecurityAlgorithms.HmacSha256));

        var tokenValue = new JwtSecurityTokenHandler().WriteToken(token);

        return new LoginResultDto
        {
            Token = tokenValue,
            Username = username,
            Email = email,
            Role = role,
            ExpiresAt = expiresAt
        };
    }

    private static string HashPassword(string password)
    {
        var salt = RandomNumberGenerator.GetBytes(16);
        var hash = Rfc2898DeriveBytes.Pbkdf2(
            Encoding.UTF8.GetBytes(password),
            salt,
            HashIterations,
            HashAlgorithmName.SHA256,
            32);

        return string.Join(
            '-',
            HashPrefix,
            HashIterations,
            Convert.ToBase64String(salt),
            Convert.ToBase64String(hash));
    }

    private static bool VerifyPassword(string password, string storedHash)
    {
        var parts = storedHash.Split('-');

        if (parts.Length != 4 || parts[0] != HashPrefix)
        {
            return false;
        }

        if (!int.TryParse(parts[1], out var iterations) || iterations <= 0)
        {
            return false;
        }

        byte[] salt;
        byte[] expected;

        try
        {
            salt = Convert.FromBase64String(parts[2]);
            expected = Convert.FromBase64String(parts[3]);
        }
        catch (FormatException)
        {
            return false;
        }

        var actual = Rfc2898DeriveBytes.Pbkdf2(
            Encoding.UTF8.GetBytes(password),
            salt,
            iterations,
            HashAlgorithmName.SHA256,
            expected.Length);

        return CryptographicOperations.FixedTimeEquals(actual, expected);
    }
}
