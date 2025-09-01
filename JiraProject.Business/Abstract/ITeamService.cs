// JiraProject.Business/Abstract/ITeamService.cs
using JiraProject.Business.Dtos;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace JiraProject.Business.Abstract
{
    public interface ITeamService
    {
        Task<IEnumerable<TeamDto>> GetTeamsForUserAsync(int currentUserId);
        Task<TeamDto> GetTeamByIdAsync(int id);
        Task<TeamDto> CreateTeamAsync(TeamCreateDto dto, int creatorUserId);
        Task AddUserToTeamAsync(int teamId, AddUserToTeamDto dto, int currentUserId);
        Task RemoveUserFromTeamAsync(int teamId, int userId, int currentUserId);
        Task DeleteTeamAsync(int id, int currentUserId); // Silme işlemi de dahil
        Task<TeamDto> UpdateTeamAsync(int teamId, TeamUpdateDto dto, int currentUserId);
    }
}