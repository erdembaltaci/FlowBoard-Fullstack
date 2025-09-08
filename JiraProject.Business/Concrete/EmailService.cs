using JiraProject.Business.Abstract;
using MailKit.Net.Smtp;
using Microsoft.Extensions.Options;
using MimeKit;
using System.Net.Mail;
using System.Threading.Tasks;

public class SmtpSettings 
{
    public string Server { get; set; } = null!;
    public int Port { get; set; }
    public string SenderName { get; set; } = null!;
    public string SenderEmail { get; set; } = null!;
    public string Username { get; set; } = null!;
    public string Password { get; set; } = null!;
}

public class EmailService : IEmailService
{
    private readonly SmtpSettings _smtpSettings;
    public EmailService(IOptions<SmtpSettings> smtpSettings) { _smtpSettings = smtpSettings.Value; }

    public async Task SendPasswordResetEmailAsync(string toEmail, string resetLink)
    {
        var message = new MimeMessage();
        message.From.Add(new MailboxAddress(_smtpSettings.SenderName, _smtpSettings.SenderEmail));
        message.To.Add(new MailboxAddress(toEmail, toEmail));
        message.Subject = "FlowBoard Şifre Sıfırlama Talebi";
        var bodyBuilder = new BodyBuilder { HtmlBody = $"<p>Merhaba,</p><p>FlowBoard hesabınız için şifre sıfırlama talebinde bulundunuz. Yeni bir şifre belirlemek için aşağıdaki linke tıklayabilirsiniz:</p><p><a href='{resetLink}'>Şifremi Sıfırla</a></p><p>İyi çalışmalar,<br>FlowBoard Ekibi</p>" };
        message.Body = bodyBuilder.ToMessageBody();

        using (var client = new MailKit.Net.Smtp.SmtpClient())
        {
            await client.ConnectAsync(_smtpSettings.Server, _smtpSettings.Port, MailKit.Security.SecureSocketOptions.StartTls);
            await client.AuthenticateAsync(_smtpSettings.Username, _smtpSettings.Password);
            await client.SendAsync(message);
            await client.DisconnectAsync(true);
        }
    }
}
