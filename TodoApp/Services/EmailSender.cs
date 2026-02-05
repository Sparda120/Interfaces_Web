

using MailKit.Net.Smtp;
using MailKit.Security;
using Microsoft.AspNetCore.Builder.Extensions;
using Microsoft.AspNetCore.Identity.UI.Services;
using Microsoft.Extensions.Options;
using MimeKit;
using System.Net;

using TodoApp.Models.Config;

namespace TodoApp.Services
{
    public class EmailSender : IEmailSender
    {
        private readonly SmtpOptions _smtpOptions;

        public EmailSender(IOptions<SmtpOptions> smtpOptionAccessor)
        {
            _smtpOptions = smtpOptionAccessor.Value;
        }

        public async Task SendEmailAsync(string email, string subject, string htmlMessage)
        {
            if (string.IsNullOrEmpty(email))
            {
                throw new ArgumentNullException(nameof(email));
            }
            if (string.IsNullOrEmpty(subject))
            {
                throw new ArgumentNullException(nameof(subject));
            }
            if (string.IsNullOrEmpty(htmlMessage))
            {
                throw new ArgumentNullException(nameof(htmlMessage));
            }

            await Execute(email, subject, htmlMessage);
        }

        private async Task Execute(string emailTo, string subject, string htmlMessage)
        {
            var email = new MimeMessage();
            email.Sender = MailboxAddress.Parse(_smtpOptions.Mail);
            email.From.Add(MailboxAddress.Parse(_smtpOptions.Mail));
            email.To.Add(MailboxAddress.Parse(emailTo));
            email.Subject = subject;

            var builder = new BodyBuilder();
            builder.HtmlBody = string.Format(htmlMessage);
            email.Body = builder.ToMessageBody();

            using var smtp = new SmtpClient();
            await smtp.ConnectAsync(_smtpOptions.Host, _smtpOptions.Port, SecureSocketOptions.SslOnConnect);
            await smtp.AuthenticateAsync(_smtpOptions.Mail, _smtpOptions.Password);
            await smtp.SendAsync(email);
            await smtp.DisconnectAsync(true);
        }
    }
}
