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
        var role = roles.FirstOrDefault() ?? "SalesRep";
        var token = GenerateJwtToken(user, role);
        var profile = await BuildProfileDto(user, role);

        return Ok(new
        {
            token,
            role,
            email = user.Email,
            name = profile.Name,
            phone = profile.Phone
        });
    }

    /// <summary>
    /// Invite / create a team member. Password is hashed by ASP.NET Identity (PasswordHasher).
    /// Name → FullName claim; Phone → IdentityUser.PhoneNumber (AspNetUsers).
    /// </summary>
    [HttpPost("register")]
    [Authorize(Roles = "Admin,Manager")]
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
            return BadRequest(new { message = "Invalid role. Use Admin, Manager, Sales Rep, or Social Media Rep." });
        }

        // Managers may invite peers, but only Admins can create new Admins
        if (identityRole == "Admin" && !User.IsInRole("Admin"))
        {
            return StatusCode(StatusCodes.Status403Forbidden,
                new { message = "Only Admins can invite users with the Admin role." });
        }

        var existing = await _userManager.FindByEmailAsync(request.Email.Trim());
        if (existing != null)
        {
            return BadRequest(new { message = "A user with this email already exists." });
        }

        var email = request.Email.Trim();
        var user = new IdentityUser
        {
            UserName = email,
            Email = email,
            PhoneNumber = string.IsNullOrWhiteSpace(request.Phone) ? null : request.Phone.Trim()
        };
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

        _logger.LogInformation(
            "Registered team member {Email} with role {Role} (Phone set: {HasPhone})",
            email, identityRole, !string.IsNullOrEmpty(user.PhoneNumber));

        return Ok(new
        {
            id = user.Id,
            name = displayName,
            email = user.Email,
            phone = user.PhoneNumber,
            role = ToDisplayRole(identityRole),
            message = "User created"
        });
    }

    [HttpGet("me")]
    [Authorize]
    public async Task<IActionResult> GetMe()
    {
        var user = await GetCurrentUserAsync();
        if (user == null) return Unauthorized(new { message = "Not authenticated." });

        var roles = await _userManager.GetRolesAsync(user);
        var role = roles.FirstOrDefault() ?? "SalesRep";
        return Ok(await BuildProfileDto(user, role));
    }

    [HttpPut("me")]
    [Authorize]
    public async Task<IActionResult> UpdateMe([FromBody] UpdateProfileRequest request)
    {
        var user = await GetCurrentUserAsync();
        if (user == null) return Unauthorized(new { message = "Not authenticated." });

        if (string.IsNullOrWhiteSpace(request.Name))
        {
            return BadRequest(new { message = "Name is required." });
        }

        var displayName = request.Name.Trim();
        var existingClaims = await _userManager.GetClaimsAsync(user);
        var nameClaim = existingClaims.FirstOrDefault(c => c.Type == FullNameClaimType);
        if (nameClaim != null)
        {
            await _userManager.ReplaceClaimAsync(user, nameClaim, new Claim(FullNameClaimType, displayName));
        }
        else
        {
            await _userManager.AddClaimAsync(user, new Claim(FullNameClaimType, displayName));
        }

        user.PhoneNumber = string.IsNullOrWhiteSpace(request.Phone) ? null : request.Phone.Trim();
        var updateResult = await _userManager.UpdateAsync(user);
        if (!updateResult.Succeeded)
        {
            var msg = string.Join(" ", updateResult.Errors.Select(e => e.Description));
            return BadRequest(new { message = msg });
        }

        var roles = await _userManager.GetRolesAsync(user);
        var role = roles.FirstOrDefault() ?? "SalesRep";
        _logger.LogInformation("Updated profile for user {UserId}", user.Id);
        return Ok(await BuildProfileDto(user, role));
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

        var user = await GetCurrentUserAsync();
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
            _logger.LogWarning("Change password failed for user {UserId}: {Errors}", user.Id, msg);
            return BadRequest(new { message = msg });
        }

        _logger.LogInformation("Password changed for user {UserId}", user.Id);
        return Ok(new { message = "Password updated successfully." });
    }

    /// <summary>
    /// Shared team directory — any authenticated member can list all AspNetUsers (not Admin-only).
    /// </summary>
    [HttpGet("users")]
    [Authorize]
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
                phone = user.PhoneNumber,
                role = ToDisplayRole(role),
                avatar = Initials(name)
            });
        }

        return Ok(list);
    }

    [HttpDelete("users/{id}")]
    [Authorize(Roles = "Admin,Manager")]
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
            if (!User.IsInRole("Admin"))
            {
                return StatusCode(StatusCodes.Status403Forbidden,
                    new { message = "Only Admins can remove Admin users." });
            }

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

    private async Task<IdentityUser?> GetCurrentUserAsync()
    {
        var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);
        if (string.IsNullOrEmpty(userId)) return null;
        return await _userManager.FindByIdAsync(userId);
    }

    private async Task<UserProfileDto> BuildProfileDto(IdentityUser user, string role)
    {
        var claims = await _userManager.GetClaimsAsync(user);
        var name = claims.FirstOrDefault(c => c.Type == FullNameClaimType)?.Value
                   ?? user.Email?.Split('@')[0]
                   ?? "User";

        return new UserProfileDto(
            user.Id,
            name,
            user.Email,
            user.PhoneNumber ?? string.Empty,
            role,
            ToDisplayRole(role),
            Initials(name));
    }

    private string GenerateJwtToken(IdentityUser user, string role)
    {
        var jwtSettings = _config.GetSection("JwtSettings");
        var key = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(jwtSettings["SecretKey"]!));

        // Emit both Role claim forms so [Authorize(Roles=...)] works across JWT claim-mapping modes
        var claims = new List<Claim>
        {
            new(ClaimTypes.NameIdentifier, user.Id),
            new(ClaimTypes.Email, user.Email!),
            new(ClaimTypes.Role, role),
            new("role", role)
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
public record RegisterRequest(string Email, string Password, string Role, string? Name = null, string? Phone = null);
public record ChangePasswordRequest(string CurrentPassword, string NewPassword, string ConfirmPassword);
public record UpdateProfileRequest(string Name, string? Phone = null);
public record UserProfileDto(
    string Id,
    string Name,
    string? Email,
    string Phone,
    string Role,
    string DisplayRole,
    string Avatar);
