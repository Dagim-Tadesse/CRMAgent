using CRMAgent.Application.Interfaces;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.Logging;

namespace CRMAgent.Infrastructure.Services;

/// <summary>
/// Picks the best available outbound email transport:
/// 1) SMTP when SmtpSettings:Enabled=true (often works when Resend HTTPS is blocked)
/// 2) Otherwise Resend HTTPS API
/// </summary>
public class CompositeEmailService : IEmailService
{
    private readonly IConfiguration _config;
    private readonly ResendEmailService _resend;
    private readonly SmtpEmailService _smtp;
    private readonly ILogger<CompositeEmailService> _logger;

    public CompositeEmailService(
        IConfiguration config,
        ResendEmailService resend,
        SmtpEmailService smtp,
        ILogger<CompositeEmailService> logger)
    {
        _config = config;
        _resend = resend;
        _smtp = smtp;
        _logger = logger;
    }

    public async Task SendAsync(string to, string subject, string body)
    {
        var useSmtp = string.Equals(_config["SmtpSettings:Enabled"], "true", StringComparison.OrdinalIgnoreCase)
                      && !string.IsNullOrWhiteSpace(_config["SmtpSettings:Host"]);

        if (useSmtp)
        {
            _logger.LogInformation("Sending email via SMTP to {To}", to);
            await _smtp.SendAsync(to, subject, body);
            return;
        }

        _logger.LogInformation("Sending email via Resend to {To}", to);
        await _resend.SendAsync(to, subject, body);
    }
}
