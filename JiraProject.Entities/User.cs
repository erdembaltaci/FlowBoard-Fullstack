using JiraProject.Entities.Enums;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;

namespace JiraProject.Entities
{
    public class User : BaseEntity
    {
        [Required]
        [MaxLength(50)]
        public string Username { get; set; } = null!;

        [Required]
        [MaxLength(100)]
        public string Email { get; set; } = null!;

        [Required]
        public string PasswordHash { get; set; } = null!;

        [MaxLength(50)]
        public string FirstName { get; set; } = string.Empty;

        [MaxLength(50)]
        public string LastName { get; set; } = string.Empty;

        public UserRole Role { get; set; }
        public string? AvatarUrl { get; set; }

        public ICollection<UserTeam> UserTeams { get; set; } = new List<UserTeam>();
        public ICollection<Issue> AssignedIssues { get; set; } = new List<Issue>();
        public ICollection<Issue> ReportedIssues { get; set; } = new List<Issue>();
        public string? PasswordResetToken { get; set; }
        public DateTime? PasswordResetTokenExpiry { get; set; }
    }

}