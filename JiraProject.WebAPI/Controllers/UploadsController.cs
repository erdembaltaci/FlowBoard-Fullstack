using Microsoft.AspNetCore.Mvc;
using CloudinaryDotNet;
using CloudinaryDotNet.Actions;
using Microsoft.AspNetCore.Authorization;
using System.Security.Claims;
using JiraProject.Business.Abstract;

namespace JiraProject.Api.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class UploadsController : ControllerBase
    {
        private readonly Cloudinary _cloudinary;
        private readonly IUserService _userService; // Veritabanını güncellemek için bu servisi enjekte edeceksiniz.

        // Constructor'ı IUserService'i alacak şekilde güncelleyin.
        public UploadsController(Cloudinary cloudinary, IUserService userService)
        {
            _cloudinary = cloudinary;
            _userService = userService;
        }
        
        // Bu endpoint'e sadece giriş yapmış, geçerli bir token'a sahip kullanıcılar erişebilir.
        [Authorize] 
        [HttpPost("avatar")]
        public async Task<IActionResult> UploadAvatar([FromForm] IFormFile avatar)
        {
            try
            {
                if (avatar == null || avatar.Length == 0)
                {
                    return BadRequest(new { message = "Lütfen yüklenecek bir dosya seçin." });
                }

                // [Authorize] sayesinde, gelen isteğin token'ından kullanıcı ID'sini güvenli bir şekilde alabiliyoruz.
                var userId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
                if (userId == null)
                {
                    // Bu durum, token'da bir sorun olduğunu gösterir.
                    return Unauthorized("Kullanıcı kimliği token içerisinde bulunamadı.");
                }

                ImageUploadResult uploadResult;

                // using bloğu, dosya stream'inin işi bittiğinde otomatik olarak kapatılmasını sağlar.
                await using (var stream = avatar.OpenReadStream())
                {
                    var uploadParams = new ImageUploadParams()
                    {
                        File = new FileDescription(avatar.FileName, stream),
                        Folder = "user-avatars", // Cloudinary'de resimleri bu klasörde topla.
                        // Yüklenen resimleri standart bir boyuta getirip, yüzü ortalayarak kırp.
                        Transformation = new Transformation().Height(400).Width(400).Crop("fill").Gravity("face")
                    };
                    uploadResult = await _cloudinary.UploadAsync(uploadParams);
                }

                if (uploadResult.Error != null)
                {
                    return BadRequest(new { message = $"Cloudinary Hata: {uploadResult.Error.Message}" });
                }

                // Cloudinary'den dönen güvenli (https) URL'yi al.
                var imageUrl = uploadResult.SecureUrl.ToString();
                await _userService.UpdateUserAvatarAsync(int.Parse(userId), imageUrl);
                // Başarılı olursa, frontend'e yeni resmin URL'sini ve bir mesaj dön.
                return Ok(new { message = "Avatar başarıyla yüklendi!", avatarUrl = imageUrl });
            }
            catch (Exception ex)
            {
                // Beklenmedik bir hata olursa logla ve 500 koduyla bir hata mesajı dön.
                return StatusCode(500, new { message = $"Sunucu Hatası: {ex.Message}" });
            }
        }
    }
}

