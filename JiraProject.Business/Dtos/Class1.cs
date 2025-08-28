// JiraProject.Business/Dtos/TeamUpdateDto.cs
using System.ComponentModel.DataAnnotations;

namespace JiraProject.Business.Dtos
{
    public class TeamUpdateDto
    {
        [Required]
        [MaxLength(100)]
        public string Name { get; set; } = null!;
    }
}