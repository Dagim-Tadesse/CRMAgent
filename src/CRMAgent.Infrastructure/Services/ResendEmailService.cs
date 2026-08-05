using System.Net.Http.Headers;
using System.Text;
using System.Text.Json;
using CRMAgent.Application.Interfaces;
using Microsoft.Extensions.Configuration;

namespace CRMAgent.Infrastructure.Services;

public class ResendEmailService : IEmailService
{
    private readonly HttpClient _http;
    private readonly string _apiKey;
    private readonly string _fromEmail;

    public ResendEmailService(HttpClient http, IConfiguration config)
    {
        _http = http;
        _apiKey = config["ResendSettings:ApiKey"] ?? throw new ArgumentNullException("Resend Settings ApiKey is missing");
        _fromEmail = config["ResendSettings:FromEmail"] ?? "onboarding@resend.dev";
    }

    public async Task SendAsync(string to, string subject, string body)
    {
        var request = new HttpRequestMessage(HttpMethod.Post, "https://api.resend.com/emails");
        request.Headers.Authorization = new AuthenticationHeaderValue("Bearer", _apiKey);

        var payload = new
        {
            from = _fromEmail,
            to = new[] { to },
            subject = subject,
            html = body
        };

        var json = JsonSerializer.Serialize(payload);
        request.Content = new StringContent(json, Encoding.UTF8, "application/json");

        var response = await _http.SendAsync(request);
        if (!response.IsSuccessStatusCode)
        {
            var errorContent = await response.Content.ReadAsStringAsync();
            throw new Exception($"Failed to send email via Resend: {response.StatusCode} - {errorContent}");
        }
    }
}
