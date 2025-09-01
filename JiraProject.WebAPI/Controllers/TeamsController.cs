using JiraProject.Business.Abstract;
using JiraProject.Business.Dtos;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.Security.Claims;
using System.Threading.Tasks;

namespace JiraProject.WebAPI.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    [Authorize]
    public class TeamsController : ControllerBase
    {
        private readonly ITeamService _teamService;
        protected int CurrentUserId => int.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier));

        public TeamsController(ITeamService teamService)
        {
            _teamService = teamService;
        }

        [HttpGet("my-teams")]
        public async Task<IActionResult> GetMyTeams()
        {
            var teams = await _teamService.GetTeamsForUserAsync(CurrentUserId);
            return Ok(teams);
        }

        // DEĞİŞİKLİK: Rota frontend'e uygun hale getirildi.
        [HttpGet("get-by-id/{id}")]
        public async Task<IActionResult> GetTeamById(int id)
        {
            var team = await _teamService.GetTeamByIdAsync(id);
            return Ok(team);
        }

        // DEĞİŞİKLİK: Rota frontend'e uygun hale getirildi.
        [HttpPost("create-team")]
        [Authorize]
        public async Task<IActionResult> CreateTeam([FromBody] TeamCreateDto dto)
        {
            if (!ModelState.IsValid) return BadRequest(ModelState);
            var createdTeam = await _teamService.CreateTeamAsync(dto, CurrentUserId);
            return CreatedAtAction(nameof(GetTeamById), new { id = createdTeam.Id }, createdTeam);
        }

        // DEĞİŞİKLİK: Rota frontend'e uygun hale getirildi.
        [HttpPost("{teamId}/add-member")]
        [Authorize(Roles = "TeamLead")]
        public async Task<IActionResult> AddUserToTeam(int teamId, [FromBody] AddUserToTeamDto dto)
        {
            if (!ModelState.IsValid) return BadRequest(ModelState);
            await _teamService.AddUserToTeamAsync(teamId, dto, CurrentUserId);
            return Ok(new { message = "Üye başarıyla eklendi." });
        }

        [HttpDelete("{teamId}/remove-member/{userId}")]
        [Authorize(Roles = "TeamLead")]
        public async Task<IActionResult> RemoveUserFromTeam(int teamId, int userId)
        {
            await _teamService.RemoveUserFromTeamAsync(teamId, userId, CurrentUserId);
            return NoContent();
        }

        [HttpPut("{id}")]
        [Authorize(Roles = "TeamLead")]
        public async Task<IActionResult> UpdateTeam(int id, [FromBody] TeamUpdateDto dto)
        {
            if (!ModelState.IsValid) return BadRequest(ModelState);
            var updatedTeam = await _teamService.UpdateTeamAsync(id, dto, CurrentUserId);
            return Ok(updatedTeam);
        }

        [HttpDelete("{id}")]
        [Authorize(Roles = "TeamLead")]
        public async Task<IActionResult> DeleteTeam(int id)
        {
            await _teamService.DeleteTeamAsync(id, CurrentUserId);
            return NoContent();
        }
    }
}