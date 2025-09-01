// Yer: JiraProject.Business/Dtos/UserCreateDto.cs
using JiraProject.Entities.Enums;
using Microsoft.AspNetCore.Http;

namespace JiraProject.Business.Dtos
{
    public class UserCreateDto
    {
        public string FirstName { get; set; } = null!;
        public string LastName { get; set; } = null!;
        public string Username { get; set; } = null!;
        public string Password { get; set; } = null!; // Şifreyi düz metin alacağız, sonra hash'leyeceğiz.
        public string Email { get; set; } = null!;
        public UserRole Role { get; set; }
        public IFormFile? ProfilePicture { get; set; }
    }
}