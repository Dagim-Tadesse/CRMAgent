using System.Text;
using System.Text.Json;
using CRMAgent.Application.Interfaces;
using Microsoft.Extensions.Configuration;

namespace CRMAgent.Infrastructure.Services;

public class TelegramService : ITelegramService
{
    private readonly HttpClient _http;
    private readonly string _botToken;

    public TelegramService(HttpClient http, IConfiguration config)
    {
        _http = http;
        _botToken = config["TelegramSettings:BotToken"] ?? throw new ArgumentNullException("TelegramSettings:BotToken is missing");
    }

    public async Task SendMessageAsync(long chatId, string text)
    {
        var url = $"https://api.telegram.org/bot{_botToken}/sendMessage";
        var payload = new
        {
            chat_id = chatId,
            text = text
        };

        var json = JsonSerializer.Serialize(payload);
        var content = new StringContent(json, Encoding.UTF8, "application/json");

        var response = await _http.PostAsync(url, content);
        if (!response.IsSuccessStatusCode)
        {
            var error = await response.Content.ReadAsStringAsync();
            throw new Exception($"Failed to send message via Telegram API: {response.StatusCode} - {error}");
        }
    }
}
