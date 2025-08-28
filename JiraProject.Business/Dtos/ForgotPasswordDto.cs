// JiraProject.Business/Dtos/ForgotPasswordDto.cs
using System.ComponentModel.DataAnnotations;

namespace JiraProject.Business.Dtos
{
    public class ForgotPasswordDto
    {
        [Required]
        [EmailAddress]
        public string Email { get; set; } = null!;
    }
}