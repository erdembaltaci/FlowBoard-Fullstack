// JiraProject.Business/Abstract/IUserService.cs

using JiraProject.Business.Dtos;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace JiraProject.Business.Abstract
{
    public interface IUserService
    {
        // AuthController tarafından kullanılır
        Task<UserDto> CreateUserAsync(UserCreateDto dto);
        Task<UserDto?> LoginAsync(string email, string password);

        // UsersController tarafından kullanılır
        Task<IEnumerable<UserSummaryDto>> GetAllUsersAsync();
        Task<UserProfileDto> GetUserByIdAsync(int id);
        Task<UserDto> UpdateUserAsync(int id, UserUpdateDto dto); // Bu metot Admin yetkisi gerektirebilir
        Task DeleteUserAsync(int id);
        Task ChangeUserRoleAsync(UserRoleChangeDto dto, int currentUserId);
        Task<IEnumerable<UserSummaryDto>> SearchUsersAsync(string searchTerm);

        // "me" endpoint'leri için
        Task<UserProfileDto> GetMyProfileAsync(int userId);
        Task UpdateMyProfileAsync(int userId, UserUpdateDto dto);
        Task ChangePasswordAsync(int userId, ChangePasswordDto dto);

        // Dashboard için
        Task<DashboardStatsDto> GetDashboardStatsAsync(int userId);
        Task<IEnumerable<DashboardTaskDto>> GetMyOpenTasksAsync(int userId);
        Task RequestPasswordResetAsync(string email);
        Task ResetPasswordAsync(ResetPasswordDto dto);
        Task UpdateUserAvatarAsync(int userId, string avatarUrl);
    }
}
