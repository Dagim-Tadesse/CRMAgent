using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;
using Microsoft.IdentityModel.Tokens;

namespace CRMAgent.API.Controllers;

[ApiController]
[Route("api/auth")]
public class AuthController : ControllerBase
{
    public const string FullNameClaimType = "FullName";
    private const int MinPasswordLength = 6;

    private readonly UserManager<IdentityUser> _userManager;
    private readonly SignInManager<IdentityUser> _signInManager;
    private readonly IConfiguration _config;
    private readonly ILogger<AuthController> _logger;

    public AuthController(
        UserManager<IdentityUser> userManager,
        SignInManager<IdentityUser> signInManager,
        IConfiguration config,
        ILogger<AuthController> logger)
    {
        _userManager = userManager;
        _signInManager = signInManager;
        _config = config;
        _logger = logger;
    }

    [HttpPost("login")]
    [AllowAnonymous]
    public async Task<IActionResult> Login([FromBody] LoginRequest request)
    {
        var user = await _userManager.FindByEmailAsync(request.Email);
        if (user == null)
        {
            return Unauthorized(new { message = "Invalid credentials" });
        }

        var result = await _signInManager.CheckPasswordSignInAsync(user, request.Password, false);
        if (!result.Succeeded)
        {
            return Unauthorized(new { message = "Invalid credentials" });
        }

        var roles = await _userManager.GetRolesAsync(user);
        var token = GenerateJwtToken(user, roles.FirstOrDefault() ?? "SalesRep");

        return Ok(new { token, role = roles.FirstOrDefault(), email = user.Email });
    }

    /// <summary>
    /// Invite / create a team member. Password is hashed by ASP.NET Identity (PasswordHasher).
    /// </summary>
    [HttpPost("register")]
    [Authorize(Roles = "Admin")]
    public async Task<IActionResult> Register([FromBody] RegisterRequest request)
    {
        if (string.IsNullOrWhiteSpace(request.Email) || string.IsNullOrWhiteSpace(request.Password))
        {
            return BadRequest(new { message = "Email and password are required." });
        }

        if (request.Password.Length < MinPasswordLength)
        {
            return BadRequest(new { message = $"Password must be at least {MinPasswordLength} characters." });
        }

        if (!TryMapRole(request.Role, out var identityRole))
        {
            return BadRequest(new { message = "Invalid role. Use Admin, Manager, or Sales Rep." });
        }

        var existing = await _userManager.FindByEmailAsync(request.Email.Trim());
        if (existing != null)
        {
            return BadRequest(new { message = "A user with this email already exists." });
        }

        var email = request.Email.Trim();
        var user = new IdentityUser { UserName = email, Email = email };
        var result = await _userManager.CreateAsync(user, request.Password);

        if (!result.Succeeded)
        {
            var msg = string.Join(" ", result.Errors.Select(e => e.Description));
            _logger.LogWarning("Failed to register user {Email}: {Errors}", email, msg);
            return BadRequest(new { message = msg });
        }

        await _userManager.AddToRoleAsync(user, identityRole);

        var displayName = string.IsNullOrWhiteSpace(request.Name)
            ? email.Split('@')[0]
            : request.Name.Trim();
        await _userManager.AddClaimAsync(user, new Claim(FullNameClaimType, displayName));

        _logger.LogInformation("Registered team member {Email} with role {Role}", email, identityRole);

        return Ok(new
        {
            id = user.Id,
            name = displayName,
            email = user.Email,
            role = ToDisplayRole(identityRole),
            message = "User created"
        });
    }

    [HttpPut("change-password")]
    [Authorize]
    public async Task<IActionResult> ChangePassword([FromBody] ChangePasswordRequest request)
    {
        if (string.IsNullOrWhiteSpace(request.CurrentPassword) || string.IsNullOrWhiteSpace(request.NewPassword))
        {
            return BadRequest(new { message = "Current and new password are required." });
        }

        if (request.NewPassword.Length < MinPasswordLength)
        {
            return BadRequest(new { message = $"Password must be at least {MinPasswordLength} characters." });
        }

        if (request.NewPassword != request.ConfirmPassword)
        {
            return BadRequest(new { message = "New password and confirmation do not match." });
        }

        var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);
        if (string.IsNullOrEmpty(userId))
        {
            return Unauthorized(new { message = "Not authenticated." });
        }

        var user = await _userManager.FindByIdAsync(userId);
        if (user == null)
        {
            return Unauthorized(new { message = "User not found." });
        }

        var result = await _userManager.ChangePasswordAsync(
            user,
            request.CurrentPassword,
            request.NewPassword);

        if (!result.Succeeded)
        {
            var msg = string.Join(" ", result.Errors.Select(e => e.Description));
            if (string.IsNullOrWhiteSpace(msg))
                msg = "Could not change password. Check your current password and try again.";
            _logger.LogWarning("Change password failed for user {UserId}: {Errors}", userId, msg);
            return BadRequest(new { message = msg });
        }

        _logger.LogInformation("Password changed for user {UserId}", userId);
        return Ok(new { message = "Password updated successfully." });
    }

    [HttpGet("users")]
    [Authorize(Roles = "Admin")]
    public async Task<IActionResult> GetUsers()
    {
        var users = _userManager.Users.ToList();
        var list = new List<object>();

        foreach (var user in users)
        {
            var roles = await _userManager.GetRolesAsync(user);
            var claims = await _userManager.GetClaimsAsync(user);
            var name = claims.FirstOrDefault(c => c.Type == FullNameClaimType)?.Value
                       ?? user.Email?.Split('@')[0]
                       ?? "User";
            var role = roles.FirstOrDefault() ?? "SalesRep";

            list.Add(new
            {
                id = user.Id,
                name,
                email = user.Email,
                role = ToDisplayRole(role),
                avatar = Initials(name)
            });
        }

        return Ok(list);
    }

    [HttpDelete("users/{id}")]
    [Authorize(Roles = "Admin")]
    public async Task<IActionResult> DeleteUser(string id)
    {
        var user = await _userManager.FindByIdAsync(id);
        if (user == null)
        {
            return NotFound(new { message = "User not found." });
        }

        var roles = await _userManager.GetRolesAsync(user);
        if (roles.Contains("Admin"))
        {
            var adminCount = 0;
            foreach (var u in _userManager.Users.ToList())
            {
                if (await _userManager.IsInRoleAsync(u, "Admin")) adminCount++;
            }

            if (adminCount <= 1)
            {
                return BadRequest(new { message = "Cannot remove the last Admin user." });
            }
        }

        var result = await _userManager.DeleteAsync(user);
        if (!result.Succeeded)
        {
            var msg = string.Join(" ", result.Errors.Select(e => e.Description));
            return BadRequest(new { message = msg });
        }

        return Ok(new { message = "User removed." });
    }

    private string GenerateJwtToken(IdentityUser user, string role)
    {
        var jwtSettings = _config.GetSection("JwtSettings");
        var key = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(jwtSettings["SecretKey"]!));

        var claims = new[]
        {
            new Claim(ClaimTypes.NameIdentifier, user.Id),
            new Claim(ClaimTypes.Email, user.Email!),
            new Claim(ClaimTypes.Role, role)
        };

        var token = new JwtSecurityToken(
            issuer: jwtSettings["Issuer"],
            audience: jwtSettings["Audience"],
            claims: claims,
            expires: DateTime.UtcNow.AddHours(double.Parse(jwtSettings["ExpiryHours"]!)),
            signingCredentials: new SigningCredentials(key, SecurityAlgorithms.HmacSha256));

        return new JwtSecurityTokenHandler().WriteToken(token);
    }

    private static bool TryMapRole(string? role, out string identityRole)
    {
        identityRole = role?.Trim() switch
        {
            "Admin" => "Admin",
            "Manager" => "Manager",
            "Sales Rep" or "SalesRep" => "SalesRep",
            "Social Media Rep" or "SocialMediaRep" => "SocialMediaRep",
            _ => string.Empty
        };
        return !string.IsNullOrEmpty(identityRole);
    }

    private static string ToDisplayRole(string identityRole) => identityRole switch
    {
        "SalesRep" => "Sales Rep",
        "SocialMediaRep" => "Social Media Rep",
        _ => identityRole
    };

    private static string Initials(string name)
    {
        var parts = name.Split(' ', StringSplitOptions.RemoveEmptyEntries);
        if (parts.Length == 0) return "??";
        if (parts.Length == 1) return parts[0][..Math.Min(2, parts[0].Length)].ToUpperInvariant();
        return $"{char.ToUpperInvariant(parts[0][0])}{char.ToUpperInvariant(parts[^1][0])}";
    }
}

public record LoginRequest(string Email, string Password);
public record RegisterRequest(string Email, string Password, string Role, string? Name = null);
public record ChangePasswordRequest(string CurrentPassword, string NewPassword, string ConfirmPassword);
