namespace JiraProject.Business.Dtos
{
    public class DashboardTaskDto
    {
        public int Id { get; set; }
        public string Title { get; set; } = null!;
        public string ProjectName { get; set; } = null!;
        public int ProjectId { get; set; }
        public string Status { get; set; } = null!;
    }
}