using JiraProject.Business.Abstract;
using JiraProject.Business.Dtos;
using JiraProject.Business.Exceptions; // Hata yönetimi için eklendi
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.Security.Claims; // Kullanıcı ID'sini okumak için eklendi
using System.Threading.Tasks;

namespace JiraProject.WebAPI.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    [Authorize] // Bütün controller için genel yetkilendirme (sadece giriş yapmışlar)
    public class ProjectsController : ControllerBase
    {
        private readonly IProjectService _projectService;

        public ProjectsController(IProjectService projectService)
        {
            _projectService = projectService;
        }

        [HttpGet("my-projects")]
        public async Task<IActionResult> GetMyProjects()
        {
            var userId = int.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier));
            var projectsDto = await _projectService.GetProjectsForUserAsync(userId);
            return Ok(projectsDto);
        }

        [HttpGet("get-by-id/{id}")]
        public async Task<IActionResult> GetProjectById(int id)
        {
            try
            {
                var currentUserIdClaim = User.FindFirst(ClaimTypes.NameIdentifier)?.Value
                                         ?? User.FindFirst("id")?.Value
                                         ?? User.FindFirst("userId")?.Value;

                if (string.IsNullOrEmpty(currentUserIdClaim))
                {
                    return Unauthorized(new { Message = "Kullanıcı kimliği bulunamadı." });
                }

                var currentUserId = int.Parse(currentUserIdClaim);

                var projectDto = await _projectService.GetProjectByIdAsync(id, currentUserId);
                return Ok(projectDto);
            }
            catch (NotFoundException ex)
            {
                return NotFound(new { Message = ex.Message });
            }
        }

        [HttpPost("create-project")]
        [Authorize(Roles = "TeamLead")] // Sadece takım liderleri proje oluşturabilir
        public async Task<IActionResult> CreateProject([FromBody] ProjectCreateDto projectCreateDto)
        {
            if (!ModelState.IsValid) return BadRequest(ModelState);

            // 1. Token'dan istek yapan kullanıcının ID'sini al
            var creatorUserId = int.Parse(User.FindFirst(ClaimTypes.NameIdentifier).Value);

            try
            {
                // 2. Servisi çağırırken kullanıcı ID'sini de gönder
                var createdProjectDto = await _projectService.CreateProjectAsync(projectCreateDto, creatorUserId);
                return CreatedAtAction(nameof(GetProjectById), new { id = createdProjectDto.Id }, createdProjectDto);
            }
            catch (ForbiddenException ex)
            {
                return StatusCode(403, new { Message = ex.Message }); // 403 Forbidden
            }
            catch (NotFoundException ex)
            {
                return NotFound(new { Message = ex.Message }); // 404 Not Found
            }
        }

        [HttpPut("update-project/{id}")]
        [Authorize(Roles = "TeamLead")] // Sadece takım liderleri proje güncelleyebilir
        public async Task<IActionResult> UpdateProject(int id, [FromBody] ProjectUpdateDto projectUpdateDto)
        {
            if (!ModelState.IsValid) return BadRequest(ModelState);

            var currentUserId = int.Parse(User.FindFirst(ClaimTypes.NameIdentifier).Value);

            try
            {
                var updatedProjectDto = await _projectService.UpdateProjectAsync(id, projectUpdateDto, currentUserId);
                return Ok(updatedProjectDto);
            }
            catch (ForbiddenException ex)
            {
                return StatusCode(403, new { Message = ex.Message }); // 403 Forbidden
            }
            catch (NotFoundException ex)
            {
                return NotFound(new { Message = ex.Message }); // 404 Not Found
            }
        }

        [HttpDelete("delete-project/{id}")]
        [Authorize(Roles = "TeamLead")] // Sadece takım liderleri proje silebilir
        public async Task<IActionResult> DeleteProject(int id)
        {
            var currentUserId = int.Parse(User.FindFirst(ClaimTypes.NameIdentifier).Value);

            try
            {
                await _projectService.DeleteProjectAsync(id, currentUserId);
                return NoContent(); // 204 No Content -> Başarıyla silindi, içerik dönmüyor
            }
            catch (ForbiddenException ex)
            {
                return StatusCode(403, new { Message = ex.Message }); // 403 Forbidden
            }
            catch (NotFoundException ex)
            {
                return NotFound(new { Message = ex.Message }); // 404 Not Found
            }
        }

        /// <summary>
        /// İsmi belirtilen metni içeren projeleri arar.
        /// </summary>
        /// <remarks>Örnek istek: GET /api/projects/search?name=Kanban</remarks>
        [HttpGet("search")]
        public async Task<IActionResult> SearchProjects([FromQuery] string name)
        {
            var userId = int.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier));
            var projects = await _projectService.SearchProjectsByNameAsync(name, userId);
            return Ok(projects);
        }

       
        
        [HttpPut("{projectId}/cancel")] // Rota: PUT /api/projects/5/cancel
        [Authorize(Roles = "TeamLead")] // Sadece takım liderleri erişebilir
        public async Task<IActionResult> CancelProject(int projectId)
        {
            var currentUserId = int.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier));
            await _projectService.CancelProjectAsync(projectId, currentUserId);
            return NoContent();
        }
    }
}