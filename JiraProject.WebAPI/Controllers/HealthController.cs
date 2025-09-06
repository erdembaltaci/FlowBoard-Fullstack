using Microsoft.AspNetCore.Mvc;
using System;

namespace JiraProject.WebAPI.Controllers
{
    /// <summary>
    /// Uygulamanın çalışır durumda olup olmadığını kontrol etmek için
    /// basit bir endpoint sağlar. Bu, Render'daki "Keep Alive"
    /// servisinin 404 hatası almasını engeller.
    /// </summary>
    [ApiController]
    [Route("[controller]")] // Bu, adresin otomatik olarak /health olmasını sağlar
    public class HealthController : ControllerBase
    {
        /// <summary>
        /// Bu adrese bir GET isteği geldiğinde 200 OK durum kodu döner.
        /// </summary>
        /// <returns>Uygulamanın sağlıklı olduğunu belirten bir mesaj.</returns>
        [HttpGet]
        public IActionResult CheckHealth()
        {
            return Ok(new { Status = "Healthy", Timestamp = DateTime.UtcNow });
        }
    }
}
