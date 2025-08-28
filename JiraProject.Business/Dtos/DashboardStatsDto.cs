namespace JiraProject.Business.Dtos
{
    public class DashboardStatsDto
    {
        public int AssignedTasksCount { get; set; }
        public int DueSoonTasksCount { get; set; }
        public int CompletedTasksCount { get; set; }
        public int ProjectsCount { get; set; }
    }
}