using JiraProject.Business.Dtos;
using System.Collections.Generic;
using System.Threading.Tasks;

public interface IProjectService
{
    
    Task<IEnumerable<ProjectDto>> GetProjectsForUserAsync(int userId);

    Task<ProjectDto> GetProjectByIdAsync(int id, int currentUserId);

    // Projeyi kimin oluşturduğunu bilmek için 'creatorUserId' eklendi.
    Task<ProjectDto> CreateProjectAsync(ProjectCreateDto dto, int creatorUserId);

    // Projeyi kimin güncellediğini bilmek için 'currentUserId' eklendi.
    Task<ProjectDto> UpdateProjectAsync(int id, ProjectUpdateDto dto, int currentUserId);

    // Projeyi kimin sildiğini bilmek için 'currentUserId' eklendi.
    Task DeleteProjectAsync(int id, int currentUserId);
    Task<IEnumerable<ProjectDto>> SearchProjectsByNameAsync(string name, int userId);
    Task CancelProjectAsync(int projectId, int currentUserId);
    

}