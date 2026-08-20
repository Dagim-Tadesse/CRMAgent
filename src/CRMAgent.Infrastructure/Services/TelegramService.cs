using System.Text;
using System.Text.Json;
using CRMAgent.Application.Interfaces;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.Logging;

namespace CRMAgent.Infrastructure.Services;

public class TelegramService : ITelegramService
{
    private readonly HttpClient _http;
    private readonly string _botToken;
    private readonly ILogger<TelegramService> _logger;

    public TelegramService(HttpClient http, IConfiguration config, ILogger<TelegramService> logger)
    {
        _http = http;
        _logger = logger;
        _botToken = config["TelegramSettings:BotToken"]
                    ?? throw new ArgumentNullException(nameof(config), "TelegramSettings:BotToken is missing");
    }

    public async Task SendMessageAsync(long chatId, string text)
    {
        if (string.IsNullOrWhiteSpace(_botToken) || _botToken.StartsWith("REPLACE_", StringComparison.OrdinalIgnoreCase))
            throw new InvalidOperationException("Telegram bot token is not configured (TelegramSettings:BotToken).");

        // Never log the full token
        var tokenHint = _botToken.Length > 8 ? _botToken[..4] + "…" : "(short)";
        var url = $"https://api.telegram.org/bot{_botToken}/sendMessage";

        _logger.LogInformation(
            "Telegram SendMessage: chatId={ChatId}, textLen={Len}, token={TokenHint}, timeout={Timeout}",
            chatId, text?.Length ?? 0, tokenHint, _http.Timeout);

        var payload = new
        {
            chat_id = chatId,
            text = text ?? string.Empty
        };

        using var content = new StringContent(JsonSerializer.Serialize(payload), Encoding.UTF8, "application/json");

        try
        {
            using var response = await _http.PostAsync(url, content);
            var body = await response.Content.ReadAsStringAsync();

            if (!response.IsSuccessStatusCode)
            {
                _logger.LogWarning(
                    "Telegram API error {Status} for chatId={ChatId}: {Body}",
                    (int)response.StatusCode, chatId, body);
                throw new InvalidOperationException(
                    $"Telegram API rejected send ({(int)response.StatusCode}). Check chat id {chatId} and bot token. Detail: {Truncate(body, 300)}");
            }

            _logger.LogInformation("Telegram API OK for chatId={ChatId}", chatId);
        }
        catch (TaskCanceledException ex) when (!ex.CancellationToken.IsCancellationRequested)
        {
            _logger.LogError(ex, "Telegram API TIMEOUT for chatId={ChatId}", chatId);
            throw new InvalidOperationException(
                "Telegram send timed out reaching api.telegram.org. Check network/firewall access to Telegram.", ex);
        }
        catch (HttpRequestException ex)
        {
            _logger.LogError(ex, "Telegram API network error for chatId={ChatId}", chatId);
            throw new InvalidOperationException(
                "Could not reach api.telegram.org. Check internet/firewall connectivity.", ex);
        }
    }

    private static string Truncate(string value, int max) =>
        string.IsNullOrEmpty(value) || value.Length <= max ? value : value[..max] + "…";
}
