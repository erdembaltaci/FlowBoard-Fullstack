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
    [Authorize] // Bütün metotlar varsayılan olarak yetkilendirme gerektirir
    public class UsersController : ControllerBase
    {
        private readonly IUserService _userService;

        // Controller'ın en tepesine bir helper property ekleyerek kod tekrarını azaltıyoruz.
        protected int CurrentUserId => int.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier));

        public UsersController(IUserService userService)
        {
            _userService = userService;
        }

        /// <summary>
        /// O an giriş yapmış kullanıcının profil bilgilerini getirir.
        /// </summary>
        [HttpGet("me")] // Rota: GET /api/users/me
        public async Task<IActionResult> GetMyProfile()
        {
            var userProfile = await _userService.GetMyProfileAsync(CurrentUserId);
            return Ok(userProfile);
        }

        /// <summary>
        /// O an giriş yapmış kullanıcının profil bilgilerini günceller.
        /// </summary>
        [HttpPut("me")] // Rota: PUT /api/users/me
        public async Task<IActionResult> UpdateMyProfile([FromBody] UserUpdateDto dto)
        {
            if (!ModelState.IsValid) return BadRequest(ModelState);

            // Servisteki doğru metodu çağırıyoruz.
            await _userService.UpdateMyProfileAsync(CurrentUserId, dto);

            return NoContent(); // Başarılı güncellemede 204 No Content dönmek standarttır.
        }

        /// <summary>
        /// O an giriş yapmış kullanıcının şifresini değiştirir.
        /// </summary>
        [HttpPost("me/change-password")] // Rota: POST /api/users/me/change-password
        public async Task<IActionResult> ChangeMyPassword([FromBody] ChangePasswordDto dto)
        {
            if (!ModelState.IsValid) return BadRequest(ModelState);

            await _userService.ChangePasswordAsync(CurrentUserId, dto);
            return Ok(new { message = "Şifre başarıyla güncellendi." });
        }

        /// <summary>
        /// Kullanıcıları aramak için kullanılır (örn: takıma üye ekleme).
        /// </summary>
        [HttpGet("search")] // Rota: GET /api/users/search?query=...
        public async Task<IActionResult> SearchUsers([FromQuery] string query)
        {
            var users = await _userService.SearchUsersAsync(query);
            return Ok(users);
        }

        /// <summary>
        /// Bir kullanıcının rolünü değiştirir. Sadece Takım Liderleri erişebilir.
        /// </summary>
        [HttpPut("change-role")] // Rota: PUT /api/users/change-role
        [Authorize(Roles = "TeamLead")]
        public async Task<IActionResult> ChangeUserRole([FromBody] UserRoleChangeDto roleChangeDto)
        {
            if (!ModelState.IsValid) return BadRequest(ModelState);

            // Servisteki metot artık bir şey döndürmediği için sadece çağırıyoruz.
            await _userService.ChangeUserRoleAsync(roleChangeDto, CurrentUserId);

            return Ok(new { message = "Kullanıcı rolü başarıyla değiştirildi." });
        }

        // ---------------------------------------------------------------------
        // DİĞER METOTLAR (Eğer bir admin paneli yapmayacaksanız gereksiz olabilir)
        // ---------------------------------------------------------------------

        /// <summary>
        /// Tüm kullanıcıları listeler.
        /// </summary>
        [HttpGet("all")] // Rota: GET /api/users/all
        [Authorize(Roles = "Admin")] // Örnek: Bu endpoint'e sadece Admin rolü erişebilir
        public async Task<IActionResult> GetAllUsers()
        {
            var usersDto = await _userService.GetAllUsersAsync();
            return Ok(usersDto);
        }

        /// <summary>
        /// ID'si verilen tek bir kullanıcıyı getirir.
        /// </summary>
        [HttpGet("{id}")] // Rota: GET /api/users/5
        [Authorize(Roles = "Admin")] // Örnek: Sadece Admin'ler başka kullanıcıları ID ile getirebilir
        public async Task<IActionResult> GetUserById(int id)
        {
            var userDto = await _userService.GetUserByIdAsync(id);
            return Ok(userDto);
        }

        [HttpGet("me/stats")] // Rota: GET /api/users/me/stats
        public async Task<IActionResult> GetMyDashboardStats()
        {
            var stats = await _userService.GetDashboardStatsAsync(CurrentUserId);
            return Ok(stats);
        }

        /// <summary>
        /// Giriş yapmış kullanıcıya atanmış açık görevleri listeler.
        /// </summary>
        [HttpGet("me/tasks")] // Rota: GET /api/users/me/tasks
        public async Task<IActionResult> GetMyOpenTasks()
        {
            var tasks = await _userService.GetMyOpenTasksAsync(CurrentUserId);
            return Ok(tasks);
        }
    }
}
