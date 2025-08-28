using Microsoft.AspNetCore.Http;

namespace JiraProject.Business.Dtos
{
    public class UserUpdateDto
    {
        public string FirstName { get; set; } = null!;
        public string LastName { get; set; } = null!;
        public string Email { get; set; } = null!;
        public string Username { get; set; } = null!;
        public IFormFile? ProfilePicture { get; set; }
    }
}