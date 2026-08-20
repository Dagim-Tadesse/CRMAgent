using System.Net;
using System.Net.Mail;
using CRMAgent.Application.Interfaces;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.Logging;

namespace CRMAgent.Infrastructure.Services;

/// <summary>
/// Optional SMTP sender. Used when SmtpSettings:Enabled is true (often more reliable
/// on locked-down networks than calling Resend's HTTPS API).
/// </summary>
public class SmtpEmailService : IEmailService
{
    private readonly IConfiguration _config;
    private readonly ILogger<SmtpEmailService> _logger;

    public SmtpEmailService(IConfiguration config, ILogger<SmtpEmailService> logger)
    {
        _config = config;
        _logger = logger;
    }

    public async Task SendAsync(string to, string subject, string body)
    {
        var host = _config["SmtpSettings:Host"];
        if (string.IsNullOrWhiteSpace(host))
            throw new InvalidOperationException("SmtpSettings:Host is not configured.");

        var port = int.TryParse(_config["SmtpSettings:Port"], out var p) ? p : 587;
        var from = _config["SmtpSettings:FromEmail"]
                   ?? _config["ResendSettings:FromEmail"]
                   ?? "noreply@localhost";
        var username = _config["SmtpSettings:Username"];
        var password = _config["SmtpSettings:Password"];
        var enableSsl = !string.Equals(_config["SmtpSettings:EnableSsl"], "false", StringComparison.OrdinalIgnoreCase);

        using var message = new MailMessage(from, to, subject ?? string.Empty, body ?? string.Empty)
        {
            IsBodyHtml = true
        };

        using var client = new SmtpClient(host, port)
        {
            EnableSsl = enableSsl,
            DeliveryMethod = SmtpDeliveryMethod.Network,
            Timeout = 20000
        };

        if (!string.IsNullOrWhiteSpace(username))
        {
            client.Credentials = new NetworkCredential(username, password ?? string.Empty);
        }

        try
        {
            await client.SendMailAsync(message);
            _logger.LogInformation("SMTP email sent to {To} via {Host}:{Port}", to, host, port);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "SMTP send failed to {To} via {Host}", to, host);
            throw new InvalidOperationException($"SMTP send failed: {ex.Message}", ex);
        }
    }
}
