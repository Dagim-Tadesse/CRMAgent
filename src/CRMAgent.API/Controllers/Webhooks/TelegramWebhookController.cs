using System.Text.Json.Serialization;
using CRMAgent.Application.UseCases.GenerateDraft;
using CRMAgent.Application.UseCases.IngestLead;
using CRMAgent.Domain.Entities;
using CRMAgent.Domain.Enums;
using CRMAgent.Infrastructure.Persistence;
using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace CRMAgent.API.Controllers.Webhooks;

[ApiController]
[AllowAnonymous]
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
        // Prefer new messages; also accept edits so inbound replies still trigger drafts
        var message = update?.Message ?? update?.EditedMessage;
        if (message == null || string.IsNullOrWhiteSpace(message.Text))
        {
            return Ok(); // Return 200 to Telegram so it doesn't retry
        }

        var from = message.From;
        if (from == null) return Ok();

        var fullName = $"{from.FirstName} {from.LastName}".Trim();
        if (string.IsNullOrEmpty(fullName)) fullName = from.Username ?? "Telegram User";

        // Generate a deterministic fake email for unique constraint in DB
        var email = $"tg-{from.Id}@telegram.com";

        // Check if lead already exists
        var existingLead = _db.Leads.FirstOrDefault(l =>
            l.Email == email ||
            (!string.IsNullOrEmpty(from.Username) && l.TelegramUsername == from.Username));

        int leadId;
        if (existingLead == null)
        {
            leadId = await _mediator.Send(new IngestLeadCommand(
                fullName,
                email,
                "Telegram Prospect",
                message.Text
            ));

            var lead = _db.Leads.Find(leadId);
            if (lead != null)
            {
                lead.TelegramUsername = from.Username;
                lead.TelegramChatId = message.Chat?.Id ?? from.Id;
                lead.LastInteractionAt = DateTime.UtcNow;
                _db.Leads.Update(lead);
            }
        }
        else
        {
            leadId = existingLead.Id;
            existingLead.TelegramChatId = message.Chat?.Id ?? from.Id;
            existingLead.LastInteractionAt = DateTime.UtcNow;
            existingLead.IsStagnant = false;
            _db.Leads.Update(existingLead);
        }

        // Inbound only — never treat bot/outbound echoes as lead replies here
        var interaction = new Interaction
        {
            LeadId = leadId,
            Channel = InteractionChannel.Telegram,
            Type = InteractionType.TelegramMessage,
            Content = message.Text,
            Direction = InteractionDirection.Inbound,
            Emotion = EmotionType.Neutral,
            CreatedAt = DateTime.UtcNow
        };
        _db.Interactions.Add(interaction);

        var log = new ActivityLog
        {
            LeadId = leadId,
            Action = "Telegram Message Inbound",
            Reason = $"Message from @{from.Username ?? "unknown"}: {message.Text}",
            TriggeredBy = LogTrigger.TelegramWebhook,
            CreatedAt = DateTime.UtcNow
        };
        _db.ActivityLogs.Add(log);

        await _db.SaveChangesAsync();

        try
        {
            var draftId = await _mediator.Send(new GenerateDraftCommand(leadId));
            _logger.LogInformation(
                "Auto-generated draft {DraftId} (PendingApproval) for lead {LeadId} after inbound Telegram",
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
    [JsonPropertyName("update_id")]
    public int UpdateId { get; set; }

    [JsonPropertyName("message")]
    public TelegramMessage? Message { get; set; }

    [JsonPropertyName("edited_message")]
    public TelegramMessage? EditedMessage { get; set; }
}

public class TelegramMessage
{
    [JsonPropertyName("message_id")]
    public int MessageId { get; set; }

    [JsonPropertyName("from")]
    public TelegramUser? From { get; set; }

    [JsonPropertyName("chat")]
    public TelegramChat? Chat { get; set; }

    [JsonPropertyName("text")]
    public string? Text { get; set; }
}

public class TelegramChat
{
    [JsonPropertyName("id")]
    public long Id { get; set; }
}

public class TelegramUser
{
    [JsonPropertyName("id")]
    public long Id { get; set; }

    [JsonPropertyName("first_name")]
    public string FirstName { get; set; } = string.Empty;

    [JsonPropertyName("last_name")]
    public string? LastName { get; set; }

    [JsonPropertyName("username")]
    public string? Username { get; set; }
}
