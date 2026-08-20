using System.Net.Http.Headers;
using System.Text;
using System.Text.Json;
using CRMAgent.Application.Interfaces;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.Logging;

namespace CRMAgent.Infrastructure.Services;

public class ResendEmailService : IEmailService
{
    private readonly HttpClient _http;
    private readonly string _apiKey;
    private readonly string _fromEmail;
    private readonly ILogger<ResendEmailService> _logger;

    public ResendEmailService(HttpClient http, IConfiguration config, ILogger<ResendEmailService> logger)
    {
        _http = http;
        _logger = logger;
        _apiKey = config["ResendSettings:ApiKey"] ?? throw new ArgumentNullException("Resend Settings ApiKey is missing");
        _fromEmail = config["ResendSettings:FromEmail"] ?? "onboarding@resend.dev";
    }

    public async Task SendAsync(string to, string subject, string body)
    {
        if (string.IsNullOrWhiteSpace(to))
            throw new InvalidOperationException("Cannot send email: recipient address is missing.");

        if (string.IsNullOrWhiteSpace(_apiKey) || _apiKey.StartsWith("REPLACE_", StringComparison.OrdinalIgnoreCase))
            throw new InvalidOperationException("Email is not configured: set a valid ResendSettings:ApiKey.");

        var request = new HttpRequestMessage(HttpMethod.Post, "https://api.resend.com/emails");
        request.Headers.Authorization = new AuthenticationHeaderValue("Bearer", _apiKey);

        var payload = new
        {
            from = _fromEmail,
            to = new[] { to },
            subject = subject,
            html = body
        };

        request.Content = new StringContent(JsonSerializer.Serialize(payload), Encoding.UTF8, "application/json");

        try
        {
            var response = await _http.SendAsync(request);
            if (!response.IsSuccessStatusCode)
            {
                var errorContent = await response.Content.ReadAsStringAsync();
                _logger.LogWarning(
                    "Resend API returned {Status} for to={To} from={From}: {Body}",
                    (int)response.StatusCode, to, _fromEmail, errorContent);
                throw new InvalidOperationException(
                    $"Email provider rejected the send ({(int)response.StatusCode}). Check FromEmail domain verification and API key.");
            }
        }
        catch (TaskCanceledException ex) when (!ex.CancellationToken.IsCancellationRequested)
        {
            // HttpClient.Timeout elapsed (unreachable host / blocked network / hung TLS)
            _logger.LogError(ex, "Resend API timed out sending to {To} from {From}", to, _fromEmail);
            throw new InvalidOperationException(
                "Email send timed out reaching Resend (api.resend.com). Check network/firewall connectivity and ResendSettings.");
        }
        catch (HttpRequestException ex)
        {
            _logger.LogError(ex, "Resend API network error sending to {To}", to);
            throw new InvalidOperationException(
                "Could not reach the email provider. Check internet connectivity to api.resend.com.");
        }
    }
}
