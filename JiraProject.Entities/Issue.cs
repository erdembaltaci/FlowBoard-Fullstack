
using JiraProject.Entities.Enums;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace JiraProject.Entities
{
    public class Issue : BaseEntity
    {
        [Required]
        [MaxLength(200)]
        public string Title { get; set; } = null!;

        [MaxLength(2000)]
        public string? Description { get; set; }

        public Enums.TaskStatus Status { get; set; }
        public int Order { get; set; }
        public DateTime? DueDate { get; set; }
        public int? EstimatedHours { get; set; }

        // --- İlişkiler ---
        public int ProjectId { get; set; }
        public Project Project { get; set; } = null!;

        public int? AssigneeId { get; set; }
        public User? Assignee { get; set; }

        public int ReporterId { get; set; }
        public User Reporter { get; set; } = null!;
        
        public DateTime? issueCompletedDateTime {get; set;}
    }

}