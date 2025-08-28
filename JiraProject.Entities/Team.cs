using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;

namespace JiraProject.Entities
{
    public class Team : BaseEntity
    {
        [Required]
        [MaxLength(100)]
        public string Name { get; set; } = null!;

        public int TeamLeadId { get; set; }
        public User TeamLead { get; set; } = null!;

        public ICollection<Project> Projects { get; set; } = new List<Project>();
        public ICollection<UserTeam> UserTeams { get; set; } = new List<UserTeam>();
    }

}