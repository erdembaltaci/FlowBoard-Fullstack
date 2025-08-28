using JiraProject.Entities.Enums;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;

namespace JiraProject.Entities
{
    public class Project : BaseEntity
    {
        [Required]
        [MaxLength(100)]
        public string Name { get; set; } = null!;

        [MaxLength(500)]
        public string? Description { get; set; }

        public ProjectStatus Status { get; set; } = ProjectStatus.Active;

        public int TeamId { get; set; }
        public Team Team { get; set; } = null!;

        public ICollection<Issue> Issues { get; set; } = new List<Issue>();
    }

}