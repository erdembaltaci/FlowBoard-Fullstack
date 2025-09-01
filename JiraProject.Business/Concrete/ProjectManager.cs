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
    public class ProjectManager : IProjectService
    {
        private readonly IGenericRepository<Project> _projectRepository;
        private readonly IGenericRepository<Team> _teamRepository;
        private readonly IUnitOfWork _unitOfWork;
        private readonly IMapper _mapper;

        public ProjectManager(IGenericRepository<Project> projectRepository, IGenericRepository<Team> teamRepository, IUnitOfWork unitOfWork, IMapper mapper)
        {
            _projectRepository = projectRepository;
            _teamRepository = teamRepository;
            _unitOfWork = unitOfWork;
            _mapper = mapper;
        }

        public async Task<ProjectDto> CreateProjectAsync(ProjectCreateDto dto, int creatorUserId)
        {
            var team = await _teamRepository.GetByIdAsync(dto.TeamId);
            if (team == null || team.IsDeleted) throw new NotFoundException("Projenin ekleneceği takım bulunamadı.");

            if (team.TeamLeadId != creatorUserId)
            {
                throw new ForbiddenException("Sadece takım lideri kendi takımına proje ekleyebilir.");
            }

            var projectEntity = _mapper.Map<Project>(dto);
            await _projectRepository.AddAsync(projectEntity);
            await _unitOfWork.CompleteAsync();

            return await GetProjectByIdAsync(projectEntity.Id, creatorUserId);
        }

        public async Task<ProjectDto> UpdateProjectAsync(int id, ProjectUpdateDto dto, int currentUserId)
        {
            var projectFromDb = await _projectRepository.GetByIdWithIncludesAsync(id, "Team");
            if (projectFromDb == null || projectFromDb.IsDeleted) throw new NotFoundException("Güncellenecek proje bulunamadı.");

            if (projectFromDb.Team.TeamLeadId != currentUserId)
            {
                throw new ForbiddenException("Projeyi sadece takım lideri güncelleyebilir.");
            }

            _mapper.Map(dto, projectFromDb);
            await _unitOfWork.CompleteAsync();
            return _mapper.Map<ProjectDto>(projectFromDb);
        }

        public async Task DeleteProjectAsync(int id, int currentUserId)
        {
            var project = await _projectRepository.GetByIdWithIncludesAsync(id, "Team");
            if (project == null || project.IsDeleted) throw new NotFoundException("Silinecek proje bulunamadı.");

            if (project.Team.TeamLeadId != currentUserId)
            {
                throw new ForbiddenException("Projeyi sadece takım lideri silebilir.");
            }

            project.IsDeleted = true; // SOFT DELETE
            await _unitOfWork.CompleteAsync();
        }

        public async Task<ProjectDto> GetProjectByIdAsync(int id, int currentUserId)
        {
            // KURAL: Kullanıcı, sadece üyesi olduğu bir projenin detayını görebilir.

            // String tabanlı "magic string" yerine Include/ThenInclude zinciri daha güvenilirdir.
            // Ancak sizin GenericRepository yapınız string aldığı için bu şekilde bırakıyoruz.
            // Bu string'in entity'lerinizdeki property isimleriyle tam eşleştiğinden emin olun.
            var project = await _projectRepository.GetByIdWithIncludesAsync(id, "Team.UserTeams.User");

            // Yetki Kontrolü
            if (project == null || project.IsDeleted)
            {
                throw new NotFoundException("Proje bulunamadı.");
            }

            // Kullanıcının takımda olup olmadığını kontrol et
            // LINQ'daki Any() metodu, koleksiyonda en az bir eşleşen eleman olup olmadığını kontrol eder.
            if (!project.Team.UserTeams.Any(ut => ut.UserId == currentUserId))
            {
                throw new ForbiddenException("Bu projeyi görme yetkiniz yok.");
            }

            // AutoMapper artık üyeleri de doğru şekilde haritalayacak.
            return _mapper.Map<ProjectDto>(project);
        }

        public async Task<IEnumerable<ProjectDto>> GetProjectsForUserAsync(int userId)
        {
            // Projeleri, takımları VE GÖREVLERİYLE birlikte çekiyoruz.
            var projects = await _projectRepository.FindWithIncludesAsync(
                p => !p.IsDeleted && p.Team.UserTeams.Any(ut => ut.UserId == userId),
                "Team", "Issues"
            );

            // Her bir projenin durumunu DTO'ya çevirmeden önce anlık olarak hesaplayalım.
            foreach (var project in projects)
            {
                // Eğer proje manuel olarak 'İptal' edilmemişse durumunu hesapla
                if (project.Status != ProjectStatus.Cancelled)
                {
                    // Projede en az bir görev varsa VE tüm görevlerin durumu 'Done' ise, projeyi 'Completed' yap.
                    if (project.Issues.Any() && project.Issues.All(i => i.Status == Entities.Enums.TaskStatus.Done))
                    {
                        project.Status = ProjectStatus.Completed;
                    }
                    else
                    {
                        // Aksi takdirde proje 'Active' durumundadır.
                        project.Status = ProjectStatus.Active;
                    }
                }
            }

            return _mapper.Map<IEnumerable<ProjectDto>>(projects);
        }

        public async Task<IEnumerable<ProjectDto>> SearchProjectsByNameAsync(string name, int currentUserId)
        {
            var projects = await _projectRepository.FindWithIncludesAsync(
                p => !p.IsDeleted &&
                     p.Team.UserTeams.Any(ut => ut.UserId == currentUserId) &&
                     p.Name.ToLower().Contains(name.ToLower()),
                "Team");
            return _mapper.Map<IEnumerable<ProjectDto>>(projects);
        }

        public async Task CancelProjectAsync(int projectId, int currentUserId)
        {
            var project = await _projectRepository.GetByIdWithIncludesAsync(projectId, "Team");
            if (project == null || project.IsDeleted) throw new NotFoundException("Proje bulunamadı.");

            if (project.Team.TeamLeadId != currentUserId)
            {
                throw new ForbiddenException("Sadece takım lideri projeyi iptal edebilir.");
            }

            project.Status = ProjectStatus.Cancelled; // Durumu sadece 'Cancelled' yap
            await _unitOfWork.CompleteAsync();
        }
    }
}