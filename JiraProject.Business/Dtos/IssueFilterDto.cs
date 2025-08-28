using System;

namespace JiraProject.Business.Dtos
{
    public class IssueFilterDto
    {
        public int? ProjectId { get; set; }
        public Entities.Enums.TaskStatus? Status { get; set; }
        public int? AssigneeId { get; set; }
        public int? ReporterId { get; set; }
        public DateTime? Date { get; set; }
        public string? Title { get; set; }

    }
}