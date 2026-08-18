using CRMAgent.Application.Interfaces;
using CRMAgent.Application.UseCases.GenerateDraft;
using CRMAgent.Application.UseCases.IngestLead;
using CRMAgent.Domain.Entities;
using CRMAgent.Domain.Enums;
using CRMAgent.Infrastructure.Persistence;
using MediatR;
using Microsoft.AspNetCore.Mvc;

namespace CRMAgent.API.Controllers.Webhooks;

[ApiController]
[Route("api/webhooks/telegram")]
public class TelegramWebhookController : ControllerBase
{
    private readonly IMediator _mediator;
    private readonly AppDbContext _db;
    private readonly ILogger<TelegramWebhookController> _logger;

    public TelegramWebhookController(IMediator mediator, AppDbContext db, ILogger<TelegramWebhookController> logger)
    {
        _mediator = mediator;
        _db = db;
        _logger = logger;
    }

    [HttpPost]
    public async Task<IActionResult> ReceiveUpdate([FromBody] TelegramUpdate update)
    {
        if (update?.Message == null || string.IsNullOrEmpty(update.Message.Text))
        {
            return Ok(); // Return 200 to Telegram so it doesn't retry
        }

        var from = update.Message.From;
        if (from == null) return Ok();

        var fullName = $"{from.FirstName} {from.LastName}".Trim();
        if (string.IsNullOrEmpty(fullName)) fullName = from.Username ?? "Telegram User";

        // Generate a deterministic fake email for unique constraint in DB
        var email = $"tg-{from.Id}@telegram.com";

        // Check if lead already exists
        var existingLead = _db.Leads.FirstOrDefault(l => l.Email == email || (!string.IsNullOrEmpty(from.Username) && l.TelegramUsername == from.Username));

        int leadId;
        if (existingLead == null)
        {
            // Ingest new lead
            leadId = await _mediator.Send(new IngestLeadCommand(
                fullName,
                email,
                "Telegram Prospect",
                update.Message.Text
            ));

            var lead = _db.Leads.Find(leadId);
            if (lead != null)
            {
                lead.TelegramUsername = from.Username;
                lead.TelegramChatId = update.Message.Chat?.Id ?? from.Id;
                lead.LastInteractionAt = DateTime.UtcNow;
                _db.Leads.Update(lead);
            }
        }
        else
        {
            leadId = existingLead.Id;
            existingLead.TelegramChatId = update.Message.Chat?.Id ?? from.Id;
            existingLead.LastInteractionAt = DateTime.UtcNow;
            existingLead.IsStagnant = false;
            _db.Leads.Update(existingLead);
        }

        // Add the Telegram interaction
        var interaction = new Interaction
        {
            LeadId = leadId,
            Channel = InteractionChannel.Telegram,
            Type = InteractionType.TelegramMessage,
            Content = update.Message.Text,
            Direction = InteractionDirection.Inbound,
            Emotion = EmotionType.Neutral,
            CreatedAt = DateTime.UtcNow
        };
        _db.Interactions.Add(interaction);

        // Add Activity Log
        var log = new ActivityLog
        {
            LeadId = leadId,
            Action = "Telegram Message Inbound",
            Reason = $"Message from @{from.Username ?? "unknown"}: {update.Message.Text}",
            TriggeredBy = LogTrigger.TelegramWebhook,
            CreatedAt = DateTime.UtcNow
        };
        _db.ActivityLogs.Add(log);

        await _db.SaveChangesAsync();

        // Auto-generate AI draft reply; never fail the webhook if generation fails
        try
        {
            var draftId = await _mediator.Send(new GenerateDraftCommand(leadId));
            _logger.LogInformation(
                "Auto-generated draft {DraftId} for lead {LeadId} after inbound Telegram message",
                draftId, leadId);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex,
                "Failed to auto-generate draft for lead {LeadId} after inbound Telegram message",
                leadId);
        }

        return Ok();
    }
}

public class TelegramUpdate
{
    public int UpdateId { get; set; }
    public TelegramMessage? Message { get; set; }
}

public class TelegramMessage
{
    public int MessageId { get; set; }
    public TelegramUser? From { get; set; }
    public TelegramChat? Chat { get; set; }
    public string? Text { get; set; }
}

public class TelegramChat
{
    public long Id { get; set; }
}

public class TelegramUser
{
    public long Id { get; set; }
    public string FirstName { get; set; } = string.Empty;
    public string? LastName { get; set; }
    public string? Username { get; set; }
}
