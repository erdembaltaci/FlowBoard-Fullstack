using AutoMapper;
using JiraProject.Business.Abstract;
using JiraProject.Business.Dtos;
using JiraProject.Business.Exceptions;
using JiraProject.Entities;
using JiraProject.Entities.Enums;
using Microsoft.Extensions.Configuration;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace JiraProject.Business.Concrete
{
    public class UserManager : IUserService
    {
        private readonly IGenericRepository<User> _userRepository;
        private readonly IGenericRepository<Issue> _issueRepository;
        private readonly IGenericRepository<Project> _projectRepository;
        private readonly IUnitOfWork _unitOfWork;
        private readonly IMapper _mapper;
        private readonly IEmailService _emailService;
        private readonly IConfiguration _configuration;

        public UserManager(
            IGenericRepository<User> userRepository,
            IGenericRepository<Issue> issueRepository,
            IGenericRepository<Project> projectRepository,
            IUnitOfWork unitOfWork,
            IMapper mapper,
            IEmailService emailService,
            IConfiguration configuration)
        {
            _userRepository = userRepository;
            _issueRepository = issueRepository;
            _projectRepository = projectRepository;
            _unitOfWork = unitOfWork;
            _mapper = mapper;
            _emailService = emailService;
            _configuration = configuration;
        }

        public async Task<UserDto> CreateUserAsync(UserCreateDto dto)
        {
            var existingUser = (await _userRepository.FindAsync(u => u.Email.ToLower() == dto.Email.ToLower() && !u.IsDeleted))
                                     .FirstOrDefault();
            if (existingUser != null) throw new ConflictException("Bu e-posta adresi zaten kullanılıyor.");

            var userEntity = _mapper.Map<User>(dto);
            
            // Bu kısım temizlenmişti, artık avatar kaydetmiyor.
            userEntity.PasswordHash = BCrypt.Net.BCrypt.HashPassword(dto.Password);
            userEntity.Role = UserRole.BusinessUser;
            
            await _userRepository.AddAsync(userEntity);
            await _unitOfWork.CompleteAsync();
            
            return _mapper.Map<UserDto>(userEntity);
        }

        public async Task<UserDto?> LoginAsync(string email, string password)
        {
            var user = (await _userRepository.FindAsync(u => u.Email.ToLower() == email.ToLower() && !u.IsDeleted))
                             .FirstOrDefault();
            if (user == null || !BCrypt.Net.BCrypt.Verify(password, user.PasswordHash)) return null;
            return _mapper.Map<UserDto>(user);
        }

        public async Task<UserProfileDto> GetMyProfileAsync(int userId)
        {
            var user = await _userRepository.GetByIdAsync(userId);
            if (user == null || user.IsDeleted) throw new NotFoundException("Kullanıcı profili bulunamadı.");
            return _mapper.Map<UserProfileDto>(user);
        }

        public async Task UpdateMyProfileAsync(int userId, UserUpdateDto dto)
        {
            var userFromDb = await _userRepository.GetByIdAsync(userId);
            if (userFromDb == null || userFromDb.IsDeleted) throw new NotFoundException("Güncellenecek kullanıcı bulunamadı.");
           
            
            _mapper.Map(dto, userFromDb); // Sadece metin tabanlı bilgileri güncelle
            _userRepository.Update(userFromDb);
            await _unitOfWork.CompleteAsync();
        }

        public async Task ChangePasswordAsync(int userId, ChangePasswordDto dto)
        {
            var user = await _userRepository.GetByIdAsync(userId);
            if (user == null || user.IsDeleted) throw new NotFoundException("Kullanıcı bulunamadı.");
            if (!BCrypt.Net.BCrypt.Verify(dto.CurrentPassword, user.PasswordHash)) throw new BadRequestException("Mevcut şifre yanlış.");
            
            user.PasswordHash = BCrypt.Net.BCrypt.HashPassword(dto.NewPassword);
            _userRepository.Update(user);
            await _unitOfWork.CompleteAsync();
        }
        
        // Bu metot, sadece UploadsController tarafından kullanılır ve doğrudur.
        public async Task UpdateUserAvatarAsync(int userId, string avatarUrl)
        {
            var user = await _userRepository.GetByIdAsync(userId);
            if (user != null)
            {
                user.AvatarUrl = avatarUrl;
                _userRepository.Update(user); 
                await _unitOfWork.CompleteAsync();
            }
        }
        
        // --- DİĞER TÜM METOTLAR DEĞİŞİKLİK OLMADAN AYNI KALABİLİR ---

        public async Task<IEnumerable<UserSummaryDto>> GetAllUsersAsync()
        {
            var users = await _userRepository.FindAsync(u => !u.IsDeleted);
            return _mapper.Map<IEnumerable<UserSummaryDto>>(users);
        }

        public async Task<UserProfileDto> GetUserByIdAsync(int id)
        {
            var user = await _userRepository.GetByIdAsync(id);
            if (user == null || user.IsDeleted) throw new NotFoundException($"'{id}' ID'li kullanıcı bulunamadı.");
            return _mapper.Map<UserProfileDto>(user);
        }

        public async Task<UserDto> UpdateUserAsync(int id, UserUpdateDto dto)
        {
            var userFromDb = await _userRepository.GetByIdAsync(id);
            if (userFromDb == null || userFromDb.IsDeleted) throw new NotFoundException("Güncellenecek kullanıcı bulunamadı.");

            _mapper.Map(dto, userFromDb);
            _userRepository.Update(userFromDb);
            await _unitOfWork.CompleteAsync();
            return _mapper.Map<UserDto>(userFromDb);
        }

        public async Task DeleteUserAsync(int id)
        {
            var user = await _userRepository.GetByIdAsync(id);
            if (user != null && !user.IsDeleted)
            {
                user.IsDeleted = true;
                _userRepository.Update(user);
                await _unitOfWork.CompleteAsync();
            }
        }

        public async Task ChangeUserRoleAsync(UserRoleChangeDto dto, int currentUserId)
        {
            var currentUser = await _userRepository.GetByIdAsync(currentUserId);
            if (currentUser == null || currentUser.IsDeleted || currentUser.Role != UserRole.TeamLead) throw new ForbiddenException("Rol değiştirme yetkiniz yok.");

            var userToUpdate = await _userRepository.GetByIdAsync(dto.UserId);
            if (userToUpdate == null || userToUpdate.IsDeleted) throw new NotFoundException("Rolü değiştirilecek kullanıcı bulunamadı.");

            if (!Enum.TryParse<UserRole>(dto.NewRole, true, out var newRole)) throw new BadRequestException("Geçersiz rol adı.");

            userToUpdate.Role = newRole;
            _userRepository.Update(userToUpdate);
            await _unitOfWork.CompleteAsync();
        }

        public async Task<IEnumerable<UserSummaryDto>> SearchUsersAsync(string searchTerm)
        {
            if (string.IsNullOrWhiteSpace(searchTerm) || searchTerm.Length < 2) return Enumerable.Empty<UserSummaryDto>();
            var searchTermLower = searchTerm.ToLower();
            var users = await _userRepository.FindAsync(u => !u.IsDeleted &&
                ((u.FirstName + " " + u.LastName).ToLower().Contains(searchTermLower) ||
                 u.Username.ToLower().Contains(searchTermLower) ||
                 u.Email.ToLower().Contains(searchTermLower)));
            return _mapper.Map<IEnumerable<UserSummaryDto>>(users);
        }

        public async Task<DashboardStatsDto> GetDashboardStatsAsync(int userId)
        {
            var allMyIssues = await _issueRepository.FindAsync(i => !i.IsDeleted && i.AssigneeId == userId);
            var allMyProjectsQuery = _projectRepository.GetQueryableWithIncludes("Team.UserTeams");
            var allMyProjects = await allMyProjectsQuery.Where(p => !p.IsDeleted && p.Team.UserTeams.Any(ut => ut.UserId == userId)).ToListAsync();
            
            return new DashboardStatsDto
            {
                AssignedTasksCount = allMyIssues.Count(i => i.Status != JiraProject.Entities.Enums.TaskStatus.Done),
                DueSoonTasksCount = allMyIssues.Count(i => i.Status != JiraProject.Entities.Enums.TaskStatus.Done && i.DueDate.HasValue && i.DueDate.Value <= DateTime.UtcNow.AddDays(7)),
                CompletedTasksCount = allMyIssues.Count(i => i.Status == JiraProject.Entities.Enums.TaskStatus.Done),
                ProjectsCount = allMyProjects.Count()
            };
        }

        public async Task<IEnumerable<DashboardTaskDto>> GetMyOpenTasksAsync(int userId)
        {
            var issues = await _issueRepository.FindWithIncludesAsync(
                predicate: i => !i.IsDeleted && i.AssigneeId == userId && i.Status != JiraProject.Entities.Enums.TaskStatus.Done,
                includeStrings: new[] { "Project" }
            );
            var recentIssues = issues.OrderByDescending(i => i.CreatedAt).Take(5);
            return _mapper.Map<IEnumerable<DashboardTaskDto>>(recentIssues);
        }

        public async Task RequestPasswordResetAsync(string email)
        {
            var user = (await _userRepository.FindAsync(u => u.Email.ToLower() == email.ToLower() && !u.IsDeleted))
                           .FirstOrDefault();
            if (user == null) return;

            user.PasswordResetToken = Guid.NewGuid().ToString();
            user.PasswordResetTokenExpiry = DateTime.UtcNow.AddHours(1);
            _userRepository.Update(user);
            await _unitOfWork.CompleteAsync();

            var frontendUrl = _configuration["FrontendUrl"] ?? "http://localhost:5173";
            var resetLink = $"{frontendUrl}/reset-password?token={user.PasswordResetToken}";

            await _emailService.SendPasswordResetEmailAsync(user.Email, resetLink);
        }

        public async Task ResetPasswordAsync(ResetPasswordDto dto)
        {
            var user = (await _userRepository.FindAsync(u =>
                u.PasswordResetToken == dto.Token &&
                u.PasswordResetTokenExpiry > DateTime.UtcNow))
                .FirstOrDefault();

            if (user == null)
            {
                throw new BadRequestException("Geçersiz veya süresi dolmuş şifre sıfırlama linki.");
            }

            user.PasswordHash = BCrypt.Net.BCrypt.HashPassword(dto.NewPassword);
            user.PasswordResetToken = null;
            user.PasswordResetTokenExpiry = null;
            _userRepository.Update(user);
            await _unitOfWork.CompleteAsync();
        }
    }
}
