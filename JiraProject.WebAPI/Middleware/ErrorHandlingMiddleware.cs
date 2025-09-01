// JiraProject.WebAPI/Middleware/ErrorHandlingMiddleware.cs
using JiraProject.Business.Exceptions;
using Microsoft.AspNetCore.Http;
using Microsoft.Extensions.Logging;
using System;
using System.Net;
using System.Text.Json;
using System.Threading.Tasks;

// Namespace'i dosya konumuna göre düzenleyin
namespace JiraProject.WebAPI.Middleware
{
    public class ErrorHandlingMiddleware
    {
        private readonly RequestDelegate _next;
        private readonly ILogger<ErrorHandlingMiddleware> _logger;

        public ErrorHandlingMiddleware(RequestDelegate next, ILogger<ErrorHandlingMiddleware> logger)
        {
            _next = next;
            _logger = logger;
        }

        public async Task InvokeAsync(HttpContext context)
        {
            try
            {
                await _next(context);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Bir hata yakalandı: {Message}", ex.Message);
                await HandleExceptionAsync(context, ex);
            }
        }

        private static Task HandleExceptionAsync(HttpContext context, Exception exception)
        {
            var statusCode = HttpStatusCode.InternalServerError; // 500 - Varsayılan
            var message = "Sunucuda beklenmedik bir hata oluştu.";

            switch (exception)
            {
                case BadRequestException badRequestException:
                    statusCode = HttpStatusCode.BadRequest; // 400
                    message = badRequestException.Message;
                    break;
                case NotFoundException notFoundException:
                    statusCode = HttpStatusCode.NotFound; // 404
                    message = notFoundException.Message;
                    break;
                case ConflictException conflictException:
                    statusCode = HttpStatusCode.Conflict; // 409
                    message = conflictException.Message;
                    break;
                case ForbiddenException forbiddenException:
                    statusCode = HttpStatusCode.Forbidden; // 403
                    message = forbiddenException.Message;
                    break;
                case UnauthorizedAccessException:
                    statusCode = HttpStatusCode.Unauthorized; // 401
                    message = "Bu işlemi yapmak için giriş yapmalısınız.";
                    break;
            }

            context.Response.ContentType = "application/json";
            context.Response.StatusCode = (int)statusCode;

            var result = JsonSerializer.Serialize(new { error = message });
            return context.Response.WriteAsync(result);
        }
    }
}