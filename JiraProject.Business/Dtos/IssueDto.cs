
using JiraProject.Business.Dtos;

public class IssueDto
{
    public int Id { get; set; }
    public string Title { get; set; } = null!;
    public string? Description { get; set; }
    public string Status { get; set; } = null!;
    public string Priority { get; set; } = null!;
    public DateTime CreatedAt { get; set; }
    public DateTime? DueDate { get; set; }

    // İlişkili verilerin özetleri
    public string ProjectName { get; set; } = null!;
    public UserSummaryDto? Assignee { get; set; } // Atanan kişi bilgileri
    public UserSummaryDto Reporter { get; set; } = null!; // Oluşturan kişi bilgileri
    public int? EstimatedHours { get; set; }
}