// JiraProject.Business/Dtos/UserRoleChangeDto.cs

using System.ComponentModel.DataAnnotations;

public class UserRoleChangeDto
{
    [Required]
    public int UserId { get; set; }

    [Required(ErrorMessage = "Yeni rol boş olamaz.")]
    public string NewRole { get; set; }
}