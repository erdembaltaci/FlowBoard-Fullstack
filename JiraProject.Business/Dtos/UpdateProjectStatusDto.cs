// JiraProject.Business/Dtos/UpdateProjectStatusDto.cs
using JiraProject.Entities.Enums;
using System.ComponentModel.DataAnnotations;

namespace JiraProject.Business.Dtos
{
    public class UpdateProjectStatusDto
    {
        [Required]
        // Gelen string'in geçerli bir ProjectStatus enum değeri olduğundan emin olur
        [EnumDataType(typeof(ProjectStatus))]
        public string NewStatus { get; set; } = null!;
    }
}