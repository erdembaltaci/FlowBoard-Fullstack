using Microsoft.AspNetCore.Mvc;
using CloudinaryDotNet;
using CloudinaryDotNet.Actions;
using Microsoft.AspNetCore.Authorization;
using System.Security.Claims;
using JiraProject.Business.Abstract;
using Microsoft.AspNetCore.Http;
using System;
using System.Threading.Tasks;

namespace JiraProject.WebAPI.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class UploadsController : ControllerBase
    {
        private readonly Cloudinary _cloudinary;
        private readonly IUserService _userService; 

        public UploadsController(Cloudinary cloudinary, IUserService userService)
        {
            _cloudinary = cloudinary;
            _userService = userService;
        }
        
        [HttpPost("avatar")]
        [Authorize] 
        public async Task<IActionResult> UploadAvatar([FromForm] IFormFile avatar)
        {
            try
            {
                if (avatar == null || avatar.Length == 0)
                {
                    return BadRequest(new { message = "Lütfen yüklenecek bir dosya seçin." });
                }

                var userIdString = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
                if (string.IsNullOrEmpty(userIdString))
                {
                    return Unauthorized("Kullanıcı kimliği token içerisinde bulunamadı.");
                }

                ImageUploadResult uploadResult;
                await using (var stream = avatar.OpenReadStream())
                {
                    var uploadParams = new ImageUploadParams()
                    {
                        File = new FileDescription(avatar.FileName, stream),
                        Folder = "user-avatars",
                        Transformation = new Transformation().Height(400).Width(400).Crop("fill").Gravity("face")
                    };
                    uploadResult = await _cloudinary.UploadAsync(uploadParams);
                }

                if (uploadResult.Error != null)
                {
                    return BadRequest(new { message = $"Cloudinary Hata: {uploadResult.Error.Message}" });
                }

                var imageUrl = uploadResult.SecureUrl.ToString();
                await _userService.UpdateUserAvatarAsync(int.Parse(userIdString), imageUrl);
                
                return Ok(new { message = "Avatar başarıyla yüklendi!", avatarUrl = imageUrl });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = $"Sunucu Hatası: {ex.Message}" });
            }
        }
    }
}

