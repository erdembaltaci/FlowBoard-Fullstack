// Yer: JiraProject.Business/Dtos/IssueCreateDto.cs
using JiraProject.Entities.Enums;

namespace JiraProject.Business.Dtos
{
    // <summary>
    // IssueCreateDto, yeni bir görev (issue) oluşturmak için kullanılan veri transfer nesnesidir.
    // Bu DTO, görev başlığı, açıklaması, durumu ve ait olduğu proje kimliğini içerir.
    // </summary>
    // YENİ BİR GÖREV YARATMAK İÇİN GEREKENLER
    public class IssueCreateDto
    {
        // Zorunlu alanlar
        public string Title { get; set; } = null!;
        public int ProjectId { get; set; } // Hangi projeye ait olduğu MUTLAKA GEREKLİ

        // İsteğe bağlı alanlar
        public string? Description { get; set; }
        public int? AssigneeId { get; set; }
        public Entities.Enums.TaskStatus Status { get; set; }
        public DateTime? DueDate { get; set; }
        public int? EstimatedHours { get; set; }
    }
}