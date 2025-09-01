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

    /// <summary>
    /// Yeni bir kullanıcı kaydı oluşturur.
    /// </summary>
    [HttpPost("user-register")]
    public async Task<IActionResult> Register([FromForm] UserCreateDto userCreateDto)
    {
        if (!ModelState.IsValid) return BadRequest(ModelState);

        var createdUser = await _userService.CreateUserAsync(userCreateDto);
        // Başarılı kayıt sonrası istersen token da verebilirsin veya sadece başarılı mesajı dönebilirsin.
        return Ok(createdUser);
    }

    /// <summary>
    /// Kullanıcı girişi yapar ve başarılı olursa JWT döner.
    /// </summary>
    [HttpPost("user-login")]
    public async Task<IActionResult> Login([FromBody] UserLoginDto userLoginDto)
    {
        // 1. Business katmanını kullanarak kullanıcıyı doğrula. Dönen sonuç BİR DTO'DUR.
        var userDto = await _userService.LoginAsync(userLoginDto.Email, userLoginDto.Password);

        if (userDto == null)
        {
            return Unauthorized("Geçersiz e-posta veya şifre.");
        }

        // 2. Kullanıcı doğruysa, DTO'yu kullanarak bir JWT Token oluştur.
        var token = GenerateJwtToken(userDto);

        // 3. Oluşturulan token'ı kullanıcıya geri döndür.
        return Ok(new { token = token });
    }

    [HttpPost("forgot-password")]
    [AllowAnonymous]
    public async Task<IActionResult> ForgotPassword([FromBody] ForgotPasswordDto dto)
    {
        await _userService.RequestPasswordResetAsync(dto.Email);

        // Güvenlik nedeniyle, e-posta bulunsa da bulunmasa da her zaman aynı mesajı dönüyoruz.
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

    // === Token Üreten Yardımcı Metot (Artık UserDto alıyor) ===
    private string GenerateJwtToken(UserDto userDto)
    {
        var claims = new List<Claim>
    {
        new Claim(ClaimTypes.NameIdentifier, userDto.Id.ToString()),
        new Claim(ClaimTypes.Name, userDto.Username ?? string.Empty),
        new Claim(ClaimTypes.Role, userDto.Role ?? string.Empty)
    };

        var key = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(_configuration["Jwt:Key"]!));
        var creds = new SigningCredentials(key, SecurityAlgorithms.HmacSha256);
        var expires = DateTime.Now.AddDays(Convert.ToDouble(_configuration["Jwt:ExpireDays"]));

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