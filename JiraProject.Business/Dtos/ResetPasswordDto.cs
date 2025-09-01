// JiraProject.Business/Dtos/ResetPasswordDto.cs
using System.ComponentModel.DataAnnotations;

namespace JiraProject.Business.Dtos
{
    public class ResetPasswordDto
    {
        [Required]
        public string Token { get; set; } = null!;

        [Required]
        [MinLength(8)]
        public string NewPassword { get; set; } = null!;

        [Required]
        [Compare("NewPassword", ErrorMessage = "Şifreler eşleşmiyor.")]
        public string ConfirmPassword { get; set; } = null!;
    }
}