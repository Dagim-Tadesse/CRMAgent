using CRMAgent.Application.DTOs;
using CRMAgent.Application.Interfaces;
using CRMAgent.Domain.Entities;
using CRMAgent.Domain.Enums;
using CRMAgent.Infrastructure.Persistence;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

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

    [HttpGet]
    [Route("/api/social-signals")]
    public async Task<IActionResult> GetSignals()
    {
        var signals = await _db.SocialSignals.OrderByDescending(s => s.CreatedAt).ToListAsync();
        return Ok(signals);
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
            try
            {
                var result = await _aiService.AnalyzeSentimentAsync(dto.Content);
                if (Enum.TryParse<SentimentType>(result.Sentiment, true, out var parsed))
                    sentiment = parsed;
            }
            catch (Exception)
            {
                // Fallback to Neutral if Gemini API quota is exceeded or offline
                sentiment = SentimentType.Neutral;
            }
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

        var postInfo = string.IsNullOrWhiteSpace(dto.PostReference) ? "" : $" (post: {dto.PostReference})";
        var reasonText = !string.IsNullOrWhiteSpace(dto.Content)
            ? $"{dto.SignalType} from {dto.AuthorName} on {dto.PlatformSource}{postInfo} — sentiment: {sentiment}"
            : $"{dto.SignalType} from {dto.AuthorName} on {dto.PlatformSource}{postInfo}";

        _db.ActivityLogs.Add(new ActivityLog
        {
            Action = "Social Signal Received",
            Reason = reasonText,
            TriggeredBy = LogTrigger.SocialWebhook,
            CreatedAt = DateTime.UtcNow
        });

        await _db.SaveChangesAsync();

        return Created($"/api/webhooks/social/{signal.Id}",
            new { id = signal.Id, message = "Social signal recorded" });
    }
}
