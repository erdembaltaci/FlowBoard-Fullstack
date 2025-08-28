using JiraProject.Business.Abstract;
using JiraProject.Business.Dtos;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.Security.Claims;
using System.Threading.Tasks;

[Route("api/[controller]")]
[ApiController]
[Authorize]
public class IssuesController : ControllerBase
{
    private readonly IIssueService _issueService;

    public IssuesController(IIssueService issueService)
    {
        _issueService = issueService;
    }

    /// <summary>
    /// Belirtilen projeye ait tüm görevleri listeler.
    /// </summary>
    [HttpGet("get-by-project-id/{projectId}")] 
    public async Task<IActionResult> GetIssuesByProject(int projectId)
    {
        var issues = await _issueService.GetIssuesByProjectIdAsync(projectId);
        return Ok(issues);
    }

    /// <summary>
    /// ID'si verilen tek bir görevi getirir.
    /// </summary>
    [HttpGet("get-by-id/{id}")] 
    public async Task<IActionResult> GetIssueById(int id)
    {
        var issueDto = await _issueService.GetIssueByIdAsync(id);
        return Ok(issueDto);
    }

    /// <summary>
    /// Yeni bir görev oluşturur.
    /// </summary>
    [HttpPost("create-issue")] 
    public async Task<IActionResult> CreateIssue([FromBody] IssueCreateDto createDto)
    {
        if (!ModelState.IsValid) return BadRequest(ModelState);

        var reporterId = int.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier));
        var createdIssueDto = await _issueService.CreateIssueAsync(createDto, reporterId);

        return CreatedAtAction(nameof(GetIssueById), new { id = createdIssueDto.Id }, createdIssueDto);
    }

    /// <summary>
    /// Mevcut bir görevin bilgilerini günceller.
    /// </summary>
    [HttpPut("update-issue/{id}")] 
    public async Task<IActionResult> UpdateIssue(int id, [FromBody] IssueUpdateDto updateDto)
    {
        if (!ModelState.IsValid) return BadRequest(ModelState);

        var currentUserId = int.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier));
        var updatedIssueDto = await _issueService.UpdateIssueAsync(id, updateDto, currentUserId);

        return Ok(updatedIssueDto);
    }

    /// <summary>
    /// Bir görevin Kanban panosundaki yerini değiştirir.
    /// </summary>
    [HttpPut("move-issue/{id}")] 
    public async Task<IActionResult> MoveIssue(int id, [FromBody] IssueMoveDto moveDto)
    {
        if (!ModelState.IsValid) return BadRequest(ModelState);

        var currentUserId = int.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier));
        await _issueService.MoveIssueAsync(id, moveDto, currentUserId);

        return Ok(new { message = "Görev başarıyla taşındı." });
    }

    /// <summary>
    /// ID'si verilen bir görevi siler.
    /// </summary>
    [HttpDelete("delete-issue/{id}")] // İSİMLENDİRİLDİ
    public async Task<IActionResult> DeleteIssue(int id)
    {
        var currentUserId = int.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier));
        await _issueService.DeleteIssueAsync(id, currentUserId);

        return NoContent();
    }

    /// <summary>
    /// Belirtilen kriterlere göre görevleri filtreler.
    /// </summary>
    /// <remarks>
    /// Örnek istek: GET /api/issues/filter?status=ToDo&assigneeId=5
    /// </remarks>
    [HttpGet("filter-issues")]
    public async Task<IActionResult> FilterIssues([FromQuery] IssueFilterDto filterDto)
    {
        var issues = await _issueService.FilterIssuesAsync(filterDto);
        return Ok(issues);
    }

    
    [HttpGet("get-by-team-id/{teamId}")] 
    public async Task<IActionResult> GetIssuesByTeam(int teamId)
    {
        var issues = await _issueService.GetIssuesByTeamIdAsync(teamId);
        return Ok(issues);
    }
}
