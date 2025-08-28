using JiraProject.Entities;
using Microsoft.EntityFrameworkCore;

namespace JiraProject.DataAccess.Contexts
{
    public class JiraProjectDbContext : DbContext
    {
        public JiraProjectDbContext(DbContextOptions<JiraProjectDbContext> options) : base(options) { }

        public DbSet<Project> Projects { get; set; }
        public DbSet<Issue> Issues { get; set; }
        public DbSet<User> Users { get; set; }
        public DbSet<Team> Teams { get; set; }
        public DbSet<UserTeam> UserTeams { get; set; }

        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            base.OnModelCreating(modelBuilder);

            // Ara tabloya composite key KALDIRILDI (çünkü BaseEntity.Id var)
            modelBuilder.Entity<UserTeam>()
                .HasOne(ut => ut.User)
                .WithMany(u => u.UserTeams)
                .HasForeignKey(ut => ut.UserId);

            modelBuilder.Entity<UserTeam>()
                .HasOne(ut => ut.Team)
                .WithMany(t => t.UserTeams)
                .HasForeignKey(ut => ut.TeamId);

            modelBuilder.Entity<Team>()
                .HasOne(t => t.TeamLead)
                .WithMany()
                .HasForeignKey(t => t.TeamLeadId)
                .OnDelete(DeleteBehavior.Cascade);
                

            modelBuilder.Entity<Issue>()
                .HasOne(i => i.Reporter)
                .WithMany(u => u.ReportedIssues)
                .HasForeignKey(i => i.ReporterId)
                .OnDelete(DeleteBehavior.Restrict);


            modelBuilder.Entity<Issue>()
                .HasOne(i => i.Assignee)
                .WithMany(u => u.AssignedIssues)
                .HasForeignKey(i => i.AssigneeId)
                .OnDelete(DeleteBehavior.SetNull);
        }
    }
}