// Yer: JiraProject.Business/Dtos/ProjectDto.cs
namespace JiraProject.Business.Dtos
{
    public class ProjectDto
    {
        public int Id { get; set; }
        public string Name { get; set; } = null!;
        public string? Description { get; set; }
        public TeamDto Team { get; set; }
        public string Status { get; set; } = null!;
        public DateTime CreatedAt { get; set; }
        
    }
}