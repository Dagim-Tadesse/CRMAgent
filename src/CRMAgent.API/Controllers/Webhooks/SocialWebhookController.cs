using CRMAgent.Application.DTOs;
using CRMAgent.Application.Interfaces;
using CRMAgent.Domain.Entities;
using CRMAgent.Domain.Enums;
using CRMAgent.Infrastructure.Persistence;
using Microsoft.AspNetCore.Mvc;

namespace CRMAgent.API.Controllers.Webhooks;

[ApiController]
[Route("api/webhooks/social")]
public class SocialWebhookController : ControllerBase
{
    private readonly AppDbContext _db;
    private readonly IAIService _aiService;
    private readonly IConfiguration _config;

    public SocialWebhookController(AppDbContext db, IAIService aiService, IConfiguration config)
    {
        _db = db;
        _aiService = aiService;
        _config = config;
    }

    [HttpPost]
    public async Task<IActionResult> ReceiveSocialEvent(
        [FromHeader(Name = "X-Webhook-Secret")] string? secret,
        [FromBody] SocialWebhookRequestDto dto)
    {
        var expectedSecret = _config["N8nSettings:WebhookSecret"];
        if (string.IsNullOrEmpty(expectedSecret) || secret != expectedSecret)
            return Unauthorized(new { message = "Invalid or missing webhook secret" });

        var sentiment = SentimentType.Neutral;
        if (!string.IsNullOrWhiteSpace(dto.Content))
        {
            var result = await _aiService.AnalyzeSentimentAsync(dto.Content);
            if (Enum.TryParse<SentimentType>(result.Sentiment, true, out var parsed))
                sentiment = parsed;
        }

        var signal = new SocialSignal
        {
            PlatformSource = dto.PlatformSource,
            SignalType = dto.SignalType,
            Content = dto.Content,
            AuthorName = dto.AuthorName,
            PostReference = dto.PostReference,
            Sentiment = sentiment,
            CreatedAt = DateTime.UtcNow
        };
        _db.SocialSignals.Add(signal);

        _db.ActivityLogs.Add(new ActivityLog
        {
            Action = "Social Signal Received",
            Reason = $"{dto.SignalType} from {dto.AuthorName} on {dto.PlatformSource} — sentiment: {sentiment}",
            TriggeredBy = LogTrigger.SocialWebhook,
            CreatedAt = DateTime.UtcNow
        });

        await _db.SaveChangesAsync();

        return Created($"/api/webhooks/social/{signal.Id}",
            new { id = signal.Id, message = "Social signal recorded" });
    }
}
