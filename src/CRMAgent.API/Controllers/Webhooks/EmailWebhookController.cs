using CRMAgent.Application.UseCases.GenerateDraft;
using CRMAgent.Application.UseCases.IngestLead;
using CRMAgent.Domain.Entities;
using CRMAgent.Domain.Enums;
using CRMAgent.Infrastructure.Persistence;
using MediatR;
using Microsoft.AspNetCore.Mvc;

namespace CRMAgent.API.Controllers.Webhooks;

[ApiController]
[Route("api/webhooks/email")]
public class EmailWebhookController : ControllerBase
{
    private readonly IMediator _mediator;
    private readonly AppDbContext _db;
    private readonly IConfiguration _config;
    private readonly ILogger<EmailWebhookController> _logger;

    public EmailWebhookController(
        IMediator mediator,
        AppDbContext db,
        IConfiguration config,
        ILogger<EmailWebhookController> logger)
    {
        _mediator = mediator;
        _db = db;
        _config = config;
        _logger = logger;
    }

    [HttpPost]
    public async Task<IActionResult> ReceiveEmailWebhook(
        [FromHeader(Name = "X-Resend-Webhook-Secret")] string? secret,
        [FromBody] ResendWebhookPayload payload)
    {
        try
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

            var (senderEmail, senderName) = ParseFromAddress(payload.Data.From);

            // 1. Check if lead already exists to avoid 500 error from IngestLeadCommand
            var existingLead = _db.Leads.FirstOrDefault(l => l.Email == senderEmail);
            int leadId;

            if (existingLead == null)
            {
                // Ingest the lead
                leadId = await _mediator.Send(new IngestLeadCommand(
                    senderName,
                    senderEmail,
                    "Unknown Company",
                    payload.Data.Text ?? payload.Data.Subject ?? "No content"
                ));

                var newLead = _db.Leads.Find(leadId);
                if (newLead != null)
                {
                    newLead.LastInteractionAt = DateTime.UtcNow;
                    _db.Leads.Update(newLead);
                }
            }
            else
            {
                leadId = existingLead.Id;
                existingLead.LastInteractionAt = DateTime.UtcNow;
                existingLead.IsStagnant = false;
                _db.Leads.Update(existingLead);
            }

            // 2. Add an inbound email Interaction so the system recognizes the source as Email
            var interaction = new Interaction
            {
                LeadId = leadId,
                Channel = InteractionChannel.Email,
                Type = InteractionType.Email,
                Content = payload.Data.Text ?? payload.Data.Subject ?? string.Empty,
                Direction = InteractionDirection.Inbound,
                Emotion = EmotionType.Neutral,
                CreatedAt = DateTime.UtcNow
            };
            _db.Interactions.Add(interaction);

            // Update ActivityLog to reflect Inbound Email trigger
            var log = new ActivityLog
            {
                LeadId = leadId,
                Action = "Inbound Email Received",
                Reason = $"Email from {senderEmail} - Subject: {payload.Data.Subject}",
                TriggeredBy = LogTrigger.EmailWebhook,
                CreatedAt = DateTime.UtcNow
            };
            _db.ActivityLogs.Add(log);

            await _db.SaveChangesAsync();

            // Auto-generate AI draft reply; never fail the webhook if generation fails
            try
            {
                var draftId = await _mediator.Send(new GenerateDraftCommand(leadId));
                _logger.LogInformation(
                    "Auto-generated draft {DraftId} for lead {LeadId} after inbound email",
                    draftId, leadId);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex,
                    "Failed to auto-generate draft for lead {LeadId} after inbound email",
                    leadId);
            }

            return Ok(new { leadId, message = "Inbound email lead successfully processed!" });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Email webhook processing failed");
            // Return 200/Ok to Resend so it stops retrying the webhook, but return the error in JSON
            return Ok(new { error = ex.Message, details = ex.ToString() });
        }
    }

    private (string Email, string Name) ParseFromAddress(string from)
    {
        // Matches "Name <email@domain.com>"
        var match = System.Text.RegularExpressions.Regex.Match(from, @"(.*?)<(.*?)>");
        if (match.Success)
        {
            var name = match.Groups[1].Value.Trim();
            var email = match.Groups[2].Value.Trim();
            return (email, string.IsNullOrEmpty(name) ? email.Split('@')[0] : name);
        }
        return (from.Trim(), from.Split('@')[0]);
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
