using CRMAgent.Application.Interfaces;
using CRMAgent.Domain.Entities;
using CRMAgent.Domain.Enums;
using CRMAgent.Infrastructure.Persistence;
using MediatR;
using Microsoft.AspNetCore.Mvc;
using CRMAgent.Application.UseCases.IngestLead;

namespace CRMAgent.API.Controllers.Webhooks;

[ApiController]
[Route("api/webhooks/email")]
public class EmailWebhookController : ControllerBase
{
    private readonly IMediator _mediator;
    private readonly AppDbContext _db;
    private readonly IConfiguration _config;

    public EmailWebhookController(IMediator mediator, AppDbContext db, IConfiguration config)
    {
        _mediator = mediator;
        _db = db;
        _config = config;
    }

    [HttpPost]
    public async Task<IActionResult> ReceiveEmailWebhook(
        [FromHeader(Name = "X-Resend-Webhook-Secret")] string? secret,
        [FromBody] ResendWebhookPayload payload)
    {
        // Verify webhook secret if configured
        var expectedSecret = _config["ResendSettings:InboundSecret"];
        if (!string.IsNullOrEmpty(expectedSecret) && expectedSecret != "placeholder" && secret != expectedSecret)
        {
            return Unauthorized(new { message = "Invalid webhook secret" });
        }

        if (payload?.Data == null || string.IsNullOrEmpty(payload.Data.From))
        {
            return BadRequest(new { message = "Invalid email payload" });
        }

        // 1. Ingest the lead
        var leadId = await _mediator.Send(new IngestLeadCommand(
            payload.Data.From.Split('@')[0], // Use email prefix as temporary full name
            payload.Data.From,
            "Unknown Company",
            payload.Data.Text ?? payload.Data.Subject ?? "No content"
        ));

        // 2. Add an inbound email Interaction so the system recognizes the source as Email
        var interaction = new Interaction
        {
            LeadId = leadId,
            Channel = InteractionChannel.Email,
            Type = InteractionType.Email,
            Content = payload.Data.Text ?? payload.Data.Subject ?? string.Empty,
            Direction = InteractionDirection.Inbound,
            Emotion = EmotionType.Neutral, // Will be updated or scored if needed
            CreatedAt = DateTime.UtcNow
        };
        _db.Interactions.Add(interaction);

        // Update ActivityLog to reflect Inbound Email trigger
        var log = new ActivityLog
        {
            LeadId = leadId,
            Action = "Inbound Email Received",
            Reason = $"Email from {payload.Data.From} - Subject: {payload.Data.Subject}",
            TriggeredBy = LogTrigger.EmailWebhook,
            CreatedAt = DateTime.UtcNow
        };
        _db.ActivityLogs.Add(log);

        await _db.SaveChangesAsync();

        return Ok(new { leadId, message = "Inbound email lead successfully processed!" });
    }
}

public class ResendWebhookPayload
{
    public string Type { get; set; } = string.Empty;
    public ResendEmailData? Data { get; set; }
}

public class ResendEmailData
{
    public string From { get; set; } = string.Empty;
    public List<string> To { get; set; } = new();
    public string Subject { get; set; } = string.Empty;
    public string? Text { get; set; }
    public string? Html { get; set; }
}
