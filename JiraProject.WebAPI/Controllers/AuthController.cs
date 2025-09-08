using JiraProject.Business.Abstract;
using JiraProject.Business.Dtos;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Configuration;
using Microsoft.IdentityModel.Tokens;
using System;
using System.Collections.Generic;
using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;
using System.Threading.Tasks;

[Route("api/[controller]")]
[ApiController]
public class AuthController : ControllerBase
{
    private readonly IUserService _userService;
    private readonly IConfiguration _configuration;

    public AuthController(IUserService userService, IConfiguration configuration)
    {
        _userService = userService;
        _configuration = configuration;
    }
    
    [HttpPost("user-register")]
    public async Task<IActionResult> Register([FromForm] UserCreateDto userCreateDto)
    {
        if (!ModelState.IsValid) return BadRequest(ModelState);
        var createdUser = await _userService.CreateUserAsync(userCreateDto);
        return Ok(createdUser);
    }

    [HttpPost("user-login")]
    public async Task<IActionResult> Login([FromBody] UserLoginDto userLoginDto)
    {
        var userDto = await _userService.LoginAsync(userLoginDto.Email, userLoginDto.Password);
        if (userDto == null)
        {
            return Unauthorized("Geçersiz e-posta veya şifre.");
        }
        var token = GenerateJwtToken(userDto);
        return Ok(new { token, user = userDto });
    }

    /// <summary>
    /// Kullanıcının en güncel bilgileriyle (örn: rol değişikliği sonrası) yeni bir token üretir.
    /// </summary>
    [HttpPost("refresh-token")]
    [Authorize] // Sadece giriş yapmış kullanıcılar bu isteği atabilir
    public async Task<IActionResult> RefreshToken()
    {
        var userIdString = User.FindFirstValue(ClaimTypes.NameIdentifier);
        if (string.IsNullOrEmpty(userIdString))
        {
            return Unauthorized("Geçersiz token.");
        }

        // IUserService'teki GetUserByIdAsync'nin UserProfileDto döndürdüğünü varsayıyoruz.
        // Bu DTO'dan token için gerekli olan UserDto'yu oluşturuyoruz.
        var userProfile = await _userService.GetUserByIdAsync(int.Parse(userIdString));
        if (userProfile == null)
        {
            return Unauthorized("Kullanıcı bulunamadı.");
        }
        
        var userDtoForToken = new UserDto
        {
            Id = userProfile.Id,
            Username = userProfile.Username,
            Role = userProfile.Role,
            Email = userProfile.Email
            // CreatedAt gibi diğer alanlar token için gerekli değil
        };

        // En güncel bilgilerle yeni bir token üretiyoruz.
        var newToken = GenerateJwtToken(userDtoForToken);
        return Ok(new { token = newToken });
    }

    [HttpPost("forgot-password")]
    [AllowAnonymous]
    public async Task<IActionResult> ForgotPassword([FromBody] ForgotPasswordDto dto)
    {
        await _userService.RequestPasswordResetAsync(dto.Email);
        return Ok(new { message = "Eğer bu e-posta adresi sistemimizde kayıtlıysa, şifre sıfırlama linki gönderilmiştir." });
    }

    [HttpPost("reset-password")]
    [AllowAnonymous]
    public async Task<IActionResult> ResetPassword([FromBody] ResetPasswordDto dto)
    {
        if (!ModelState.IsValid) return BadRequest(ModelState);
        await _userService.ResetPasswordAsync(dto);
        return Ok(new { message = "Şifreniz başarıyla güncellendi. Şimdi giriş yapabilirsiniz." });
    }

    private string GenerateJwtToken(UserDto userDto)
    {
        var claims = new List<Claim>
        {
            new Claim(JwtRegisteredClaimNames.Sub, userDto.Id.ToString()),
            new Claim(JwtRegisteredClaimNames.UniqueName, userDto.Username ?? string.Empty),
            new Claim(ClaimTypes.Role, userDto.Role ?? string.Empty)
        };

        var key = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(_configuration["Jwt:Key"]!));
        var creds = new SigningCredentials(key, SecurityAlgorithms.HmacSha256);
        var expires = DateTime.UtcNow.AddDays(Convert.ToDouble(_configuration["Jwt:ExpireDays"]));

        var tokenDescriptor = new SecurityTokenDescriptor
        {
            Subject = new ClaimsIdentity(claims),
            Expires = expires,
            SigningCredentials = creds,
            Issuer = _configuration["Jwt:Issuer"],
            Audience = _configuration["Jwt:Audience"]
        };

        var tokenHandler = new JwtSecurityTokenHandler();
        var token = tokenHandler.CreateToken(tokenDescriptor);
        return tokenHandler.WriteToken(token);
    }
}
