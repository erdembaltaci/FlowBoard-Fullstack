// Yer: JiraProject.Business/Dtos/ProjectCreateDto.cs
namespace JiraProject.Business.Dtos
{
    public class ProjectCreateDto
    {
        public string Name { get; set; } = null!;
        public string? Description { get; set; }
        public int TeamId { get; set; } // Bir proje yaratılırken hangi takıma ait olduğu bilinmelidir.
    }
}