using System;

namespace JiraProject.Business.Exceptions
{
    /// <summary>
    /// Kaynağın bulunamadığı durumlar için. (404 Not Found)
    /// </summary>
    public class NotFoundException : Exception
    {
        public NotFoundException(string message) : base(message) { }
    }

    /// <summary>
    /// İsteğin geçersiz veya eksik olduğu durumlar için. (400 Bad Request)
    /// </summary>
    public class BadRequestException : Exception
    {
        public BadRequestException(string message) : base(message) { }
    }

    /// <summary>
    /// Kullanıcının yetkisi olmadığı durumlar için. (403 Forbidden)
    /// </summary>
    public class ForbiddenException : Exception
    {
        public ForbiddenException(string message) : base(message) { }
    }

    /// <summary>
    /// Yapılmak istenen işlemin mevcut durumla çakıştığı haller için (örn: aynı e-posta ile tekrar kayıt olmak). (409 Conflict)
    /// </summary>
    public class ConflictException : Exception
    {
        public ConflictException(string message) : base(message) { }
    }
}