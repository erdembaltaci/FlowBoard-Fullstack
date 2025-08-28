// JiraProject.Business/Concrete/IssueManager.cs

using AutoMapper;
using JiraProject.Business.Abstract;
using JiraProject.Business.Dtos;
using JiraProject.Business.Exceptions;
using JiraProject.Entities;
using JiraProject.Entities.Enums;
using Microsoft.EntityFrameworkCore;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace JiraProject.Business.Concrete
{
    public class IssueManager : IIssueService
    {
        private readonly IGenericRepository<Issue> _issueRepository;
        private readonly IGenericRepository<Project> _projectRepository;
        private readonly IUnitOfWork _unitOfWork;
        private readonly IMapper _mapper;

        public IssueManager(
            IGenericRepository<Issue> issueRepository,
            IGenericRepository<Project> projectRepository,
            IUnitOfWork unitOfWork,
            IMapper mapper)
        {
            _issueRepository = issueRepository;
            _projectRepository = projectRepository;
            _unitOfWork = unitOfWork;
            _mapper = mapper;
        }

        // --- TEMEL CRUD VE İŞ MANTIKLARI ---

        public async Task<IssueDto> CreateIssueAsync(IssueCreateDto createDto, int reporterId)
        {
            var project = await _projectRepository.GetByIdAsync(createDto.ProjectId);
            if (project == null || project.IsDeleted) throw new BadRequestException("Görev oluşturulacak proje bulunamadı.");

            var issueEntity = _mapper.Map<Issue>(createDto);
            issueEntity.ReporterId = reporterId;
            var lastOrder = await _issueRepository.CountAsync(i => i.ProjectId == createDto.ProjectId && i.Status == Entities.Enums.TaskStatus.ToDo && !i.IsDeleted);
            issueEntity.Order = lastOrder;

            await _issueRepository.AddAsync(issueEntity);
            await _unitOfWork.CompleteAsync();
            return await GetIssueByIdAsync(issueEntity.Id);
        }

        public async Task<IssueDto> UpdateIssueAsync(int issueId, IssueUpdateDto updateDto, int currentUserId)
        {
            var issueFromDb = await _issueRepository.GetByIdWithIncludesAsync(issueId, "Project.Team");
            if (issueFromDb == null || issueFromDb.IsDeleted) throw new NotFoundException("Güncellenecek görev bulunamadı.");
            if (issueFromDb.Project?.Team == null) throw new UnprocessableEntityException("Görevin bağlı olduğu proje veya takım bilgisi eksik.");

            var teamLeadId = issueFromDb.Project.Team.TeamLeadId;
            if (issueFromDb.ReporterId != currentUserId && issueFromDb.AssigneeId != currentUserId && teamLeadId != currentUserId)
            {
                throw new ForbiddenException("Bu görevi sadece oluşturan kişi, atanan kişi veya takım lideri güncelleyebilir.");
            }

            _mapper.Map(updateDto, issueFromDb);
            await _unitOfWork.CompleteAsync();
            return await GetIssueByIdAsync(issueId);
        }

        public async Task MoveIssueAsync(int issueId, IssueMoveDto moveDto, int currentUserId)
        {
            var issueFromDb = await _issueRepository.GetByIdWithIncludesAsync(issueId, "Project.Team");
            if (issueFromDb == null || issueFromDb.IsDeleted) throw new NotFoundException("Taşınacak görev bulunamadı.");
            if (issueFromDb.Project?.Team == null) throw new UnprocessableEntityException("Görevin bağlı olduğu proje veya takım bilgisi eksik.");

            var teamLeadId = issueFromDb.Project.Team.TeamLeadId;
            if (issueFromDb.AssigneeId != currentUserId && teamLeadId != currentUserId)
            {
                throw new ForbiddenException("Bu görevi sadece atanan kişi veya takım lideri taşıyabilir.");
            }

            issueFromDb.Status = moveDto.NewStatus;
            issueFromDb.Order = moveDto.NewOrder;
            await _unitOfWork.CompleteAsync();
        }

        public async Task DeleteIssueAsync(int issueId, int currentUserId)
        {
            var issueToDelete = await _issueRepository.GetByIdWithIncludesAsync(issueId, "Project.Team");
            if (issueToDelete == null || issueToDelete.IsDeleted) throw new NotFoundException("Silinecek görev bulunamadı.");
            if (issueToDelete.Project?.Team == null) throw new UnprocessableEntityException("Görevin bağlı olduğu proje veya takım bilgisi eksik.");

            if (issueToDelete.Project.Team.TeamLeadId != currentUserId)
            {
                throw new ForbiddenException("Görevi sadece takım lideri silebilir.");
            }

            issueToDelete.IsDeleted = true;
            await _unitOfWork.CompleteAsync();
        }

        // --- VERİ ÇEKME METOTLARI ---

        public async Task<IssueDto> GetIssueByIdAsync(int issueId)
        {
            var issue = await _issueRepository.GetByIdWithIncludesAsync(issueId, "Project", "Assignee", "Reporter");
            if (issue == null || issue.IsDeleted) throw new NotFoundException($"'{issueId}' ID'li görev bulunamadı.");
            return _mapper.Map<IssueDto>(issue);
        }

        public async Task<IEnumerable<IssueDto>> GetIssuesByProjectIdAsync(int projectId)
        {
            // FilterIssuesAsync'i, sadece projectId ile çağırıyoruz.
            return await FilterIssuesAsync(new IssueFilterDto { ProjectId = projectId });
        }

        public async Task<IEnumerable<IssueDto>> GetIssuesByTeamIdAsync(int teamId)
        {
            // FilterIssuesAsync, TeamId'ye göre filtreleme yapmadığı için bu metot şimdilik
            // doğru çalışmayacaktır. FilterIssuesAsync'e TeamId filtresi eklenmesi gerekir.
            // Şimdilik NotImplemented olarak bırakmak en doğrusu.
            throw new System.NotImplementedException("Takıma göre görev getirme henüz implemente edilmedi.");
        }

        public async Task<IEnumerable<IssueDto>> FilterIssuesAsync(IssueFilterDto filterDto)
        {
            var query = _issueRepository.GetQueryableWithIncludes("Project", "Assignee", "Reporter");
            query = query.Where(i => !i.IsDeleted);

            if (filterDto.ProjectId.HasValue)
            {
                query = query.Where(i => i.ProjectId == filterDto.ProjectId.Value);
            }
            if (filterDto.AssigneeId.HasValue)
            {
                query = query.Where(i => i.AssigneeId == filterDto.AssigneeId.Value);
            }
            if (!string.IsNullOrEmpty(filterDto.Title))
            {
                query = query.Where(i => i.Title.ToLower().Contains(filterDto.Title.ToLower()));
            }

            var issues = await query.ToListAsync();
            return _mapper.Map<IEnumerable<IssueDto>>(issues);
        }
    }
}