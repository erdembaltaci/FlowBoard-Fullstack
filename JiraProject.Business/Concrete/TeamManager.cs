using AutoMapper;
using JiraProject.Business.Abstract;
using JiraProject.Business.Dtos;
using JiraProject.Business.Exceptions;
using JiraProject.Entities;
using JiraProject.Entities.Enums;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace JiraProject.Business.Concrete
{
    public class TeamManager : ITeamService
    {
        private readonly IGenericRepository<Team> _teamRepository;
        private readonly IGenericRepository<User> _userRepository;
        private readonly IGenericRepository<UserTeam> _userTeamRepository;
        private readonly IUnitOfWork _unitOfWork;
        private readonly IMapper _mapper;

        public TeamManager(
            IGenericRepository<Team> teamRepository,
            IGenericRepository<User> userRepository,
            IGenericRepository<UserTeam> userTeamRepository,
            IUnitOfWork unitOfWork,
            IMapper mapper)
        {
            _teamRepository = teamRepository;
            _userRepository = userRepository;
            _userTeamRepository = userTeamRepository;
            _unitOfWork = unitOfWork;
            _mapper = mapper;
        }

        public async Task<TeamDto> CreateTeamAsync(TeamCreateDto dto, int creatorUserId)
        {
            if (dto.TeamLeadId != creatorUserId)
            {
                throw new ForbiddenException("Bir takımı sadece kendinizi lider olarak atayarak oluşturabilirsiniz.");
            }

            var teamLead = await _userRepository.GetByIdAsync(dto.TeamLeadId);
            if (teamLead == null || teamLead.IsDeleted) throw new BadRequestException("Geçersiz takım lideri.");

            var teamEntity = _mapper.Map<Team>(dto);
            await _teamRepository.AddAsync(teamEntity);
            teamLead.Role = UserRole.TeamLead;
            var userTeam = new UserTeam { Team = teamEntity, UserId = dto.TeamLeadId };
            await _userTeamRepository.AddAsync(userTeam);

            await _unitOfWork.CompleteAsync();
            return await GetTeamByIdAsync(teamEntity.Id);
        }

        public async Task AddUserToTeamAsync(int teamId, AddUserToTeamDto dto, int currentUserId)
        {
            var team = await _teamRepository.GetByIdAsync(teamId);
            if (team == null || team.IsDeleted) throw new NotFoundException("Takım bulunamadı.");
            if (team.TeamLeadId != currentUserId) throw new ForbiddenException("Sadece takım lideri üye ekleyebilir.");

            var userToAdd = await _userRepository.GetByIdAsync(dto.UserId);
            if (userToAdd == null || userToAdd.IsDeleted) throw new NotFoundException("Takıma eklenecek kullanıcı bulunamadı.");

            var existing = (await _userTeamRepository.FindAsync(ut => ut.TeamId == teamId && ut.UserId == dto.UserId)).Any();
            if (existing) return;

            var userTeam = new UserTeam { TeamId = teamId, UserId = dto.UserId };
            await _userTeamRepository.AddAsync(userTeam);
            await _unitOfWork.CompleteAsync();
        }

        public async Task RemoveUserFromTeamAsync(int teamId, int userId, int currentUserId)
        {
            var team = await _teamRepository.GetByIdAsync(teamId);
            if (team == null || team.IsDeleted) throw new NotFoundException("Takım bulunamadı.");
            if (team.TeamLeadId == userId) throw new BadRequestException("Takım lideri takımdan çıkarılamaz.");
            if (team.TeamLeadId != currentUserId) throw new ForbiddenException("Sadece takım lideri üye çıkarabilir.");

            var userTeam = (await _userTeamRepository.FindAsync(ut => ut.TeamId == teamId && ut.UserId == userId)).FirstOrDefault();
            if (userTeam != null)
            {
                _userTeamRepository.Remove(userTeam);
                await _unitOfWork.CompleteAsync();
            }
        }

        // 👇 EKSİK OLAN VE DOLDURULAN METOTLAR 👇

        public async Task<IEnumerable<TeamDto>> GetTeamsForUserAsync(int currentUserId)
        {
            var teams = await _teamRepository.FindWithIncludesAsync(
                t => !t.IsDeleted && t.UserTeams.Any(ut => ut.UserId == currentUserId),
                "TeamLead", "UserTeams.User"
            );
            return _mapper.Map<IEnumerable<TeamDto>>(teams);
        }

        public async Task<TeamDto> GetTeamByIdAsync(int id)
        {
            var team = await _teamRepository.GetByIdWithIncludesAsync(id, "TeamLead", "UserTeams.User");
            if (team == null || team.IsDeleted) throw new NotFoundException("Takım bulunamadı.");
            return _mapper.Map<TeamDto>(team);
        }

        public async Task DeleteTeamAsync(int id, int currentUserId)
        {
            var team = await _teamRepository.GetByIdAsync(id);
            if (team == null || team.IsDeleted) throw new NotFoundException("Silinecek takım bulunamadı.");
            if (team.TeamLeadId != currentUserId) throw new ForbiddenException("Sadece takım lideri takımı silebilir.");

            team.IsDeleted = true; // SOFT DELETE
            await _unitOfWork.CompleteAsync();
        }

        public async Task<TeamDto> UpdateTeamAsync(int teamId, TeamUpdateDto dto, int currentUserId)
        {
            var teamFromDb = await _teamRepository.GetByIdAsync(teamId);
            if (teamFromDb == null || teamFromDb.IsDeleted) throw new NotFoundException("Güncellenecek takım bulunamadı.");

            if (teamFromDb.TeamLeadId != currentUserId)
            {
                throw new ForbiddenException("Sadece takım lideri takımı güncelleyebilir.");
            }

            // AutoMapper, DTO'daki "Name" bilgisini mevcut entity'ye uygular
            _mapper.Map(dto, teamFromDb);
            await _unitOfWork.CompleteAsync();

            return _mapper.Map<TeamDto>(teamFromDb);
        }
    }
}