// Yer: JiraProject.Business/Dtos/ProjectUpdateDto.cs
namespace JiraProject.Business.Dtos
{
    public class ProjectUpdateDto
    {
        public string Name { get; set; } = null!;
        public string? Description { get; set; }
    }
}