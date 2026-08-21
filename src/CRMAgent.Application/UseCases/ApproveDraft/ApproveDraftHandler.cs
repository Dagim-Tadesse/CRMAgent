using CRMAgent.Application.Interfaces;
using CRMAgent.Domain.Entities;
using CRMAgent.Domain.Enums;
using MediatR;
using Microsoft.Extensions.Logging;

namespace CRMAgent.Application.UseCases.ApproveDraft;

public class ApproveDraftHandler : IRequestHandler<ApproveDraftCommand, ApproveDraftResult>
{
    private readonly IEmailDraftRepository _drafts;
    private readonly IEmailService _email;
    private readonly ITelegramService _telegram;
    private readonly IInteractionRepository _interactions;
    private readonly IActivityLogRepository _logs;
    private readonly ILeadRepository _leads;
    private readonly ILogger<ApproveDraftHandler> _logger;

    public ApproveDraftHandler(
        IEmailDraftRepository drafts,
        IEmailService email,
        ITelegramService telegram,
        IInteractionRepository interactions,
        IActivityLogRepository logs,
        ILeadRepository leads,
        ILogger<ApproveDraftHandler> logger)
    {
        _drafts = drafts;
        _email = email;
        _telegram = telegram;
        _interactions = interactions;
        _logs = logs;
        _leads = leads;
        _logger = logger;
    }

    public async Task<ApproveDraftResult> Handle(ApproveDraftCommand cmd, CancellationToken ct)
    {
        var draft = await _drafts.GetByIdAsync(cmd.DraftId)
            ?? throw new InvalidOperationException($"Draft with ID {cmd.DraftId} was not found.");

        if (draft.Status != DraftStatus.PendingApproval)
        {
            throw new InvalidOperationException("Only drafts pending approval can be sent.");
        }

        string? sendChannel = null; // for accurate error messages

        try
        {
            if (draft.Lead == null)
            {
                _logger.LogError("Draft {DraftId} has no associated lead loaded; cannot send", draft.Id);
                return new ApproveDraftResult(false, "Draft is missing lead information and cannot be sent.");
            }

            var lead = draft.Lead;
            var chatId = ResolveTelegramChatId(lead);

            _logger.LogInformation(
                "ApproveDraft {DraftId}: LeadId={LeadId}, Name={Name}, Email={Email}, TelegramUsername={Username}, TelegramChatId={ChatId}, ResolvedChatId={Resolved}",
                draft.Id, lead.Id, lead.FullName, lead.Email, lead.TelegramUsername, lead.TelegramChatId, chatId);

            // TRUE short-circuit: only Telegram when we have a usable chat id — never touch email/Resend/SMTP
            if (chatId.HasValue)
            {
                sendChannel = "Telegram";
                _logger.LogInformation(
                    "ApproveDraft {DraftId}: ROUTING → Telegram only (chatId={ChatId}). Skipping email/SMTP/Resend.",
                    draft.Id, chatId.Value);

                // Persist recovered chat id if it was only encoded in the email
                if (!lead.TelegramChatId.HasValue)
                {
                    lead.TelegramChatId = chatId;
                    await _leads.UpdateAsync(lead);
                    _logger.LogInformation(
                        "ApproveDraft {DraftId}: Backfilled TelegramChatId={ChatId} on lead {LeadId} from email",
                        draft.Id, chatId.Value, lead.Id);
                }

                await _telegram.SendMessageAsync(chatId.Value, draft.Body);
                _logger.LogInformation("ApproveDraft {DraftId}: Telegram send succeeded to chat {ChatId}", draft.Id, chatId.Value);

                return await FinalizeSuccessAsync(draft, lead, isTelegram: true, performedBy: cmd.PerformedBy);
            }

            // Identified as Telegram lead but no chat id → do NOT fall through to email (that causes Resend timeouts)
            if (IsTelegramIdentifiedLead(lead))
            {
                _logger.LogWarning(
                    "ApproveDraft {DraftId}: Telegram lead {LeadId} has username/email marker but NO chat id — refusing email fallback",
                    draft.Id, lead.Id);
                return new ApproveDraftResult(false,
                    "This is a Telegram lead but TelegramChatId is missing, so the message cannot be sent. " +
                    "Ask the lead to message the bot again (webhook will store the chat id), then retry.");
            }

            // Email-only leads
            sendChannel = "Email";
            _logger.LogInformation(
                "ApproveDraft {DraftId}: ROUTING → Email (SMTP/Resend). No Telegram chat id on lead {LeadId}.",
                draft.Id, lead.Id);

            var htmlBody = (draft.Body ?? string.Empty).Replace("\n", "<br />");
            await _email.SendAsync(lead.Email ?? string.Empty, draft.Subject, htmlBody);
            _logger.LogInformation("ApproveDraft {DraftId}: Email send succeeded to {Email}", draft.Id, lead.Email);

            return await FinalizeSuccessAsync(draft, lead, isTelegram: false, performedBy: cmd.PerformedBy);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex,
                "ApproveDraft {DraftId} FAILED on channel={Channel} for lead {LeadId}",
                cmd.DraftId, sendChannel ?? "unknown", draft.LeadId);

            await _logs.AddAsync(new ActivityLog
            {
                LeadId = draft.LeadId,
                Action = sendChannel == "Telegram" ? "Telegram Send Failed" : "Email Send Failed",
                Reason = ex.Message,
                TriggeredBy = LogTrigger.Agent
            });

            var message = FormatSendError(ex, sendChannel);
            return new ApproveDraftResult(false, message);
        }
    }

    private async Task<ApproveDraftResult> FinalizeSuccessAsync(EmailDraft draft, Lead lead, bool isTelegram, string? performedBy = null)
    {
        draft.Status = DraftStatus.Sent;
        draft.SentAt = DateTime.UtcNow;
        await _drafts.UpdateAsync(draft);

        await _interactions.AddAsync(new Interaction
        {
            LeadId = draft.LeadId,
            Channel = isTelegram ? InteractionChannel.Telegram : InteractionChannel.Email,
            Type = isTelegram ? InteractionType.TelegramMessage : InteractionType.Email,
            Content = draft.Body,
            Direction = InteractionDirection.Outbound
        });

        var tracked = await _leads.GetByIdAsync(draft.LeadId);
        if (tracked != null)
        {
            tracked.LastInteractionAt = DateTime.UtcNow;
            tracked.IsStagnant = false;

            if (tracked.PipelineStage == PipelineStage.New)
            {
                var previous = tracked.PipelineStage;
                tracked.PipelineStage = PipelineStage.Contacted;
                await _leads.UpdateAsync(tracked);

                await _logs.AddAsync(new ActivityLog
                {
                    LeadId = tracked.Id,
                    Action = "Stage Updated",
                    Reason = $"Pipeline stage auto-advanced from {previous} to {PipelineStage.Contacted} after draft was sent.",
                    TriggeredBy = LogTrigger.Agent
                });
            }
            else
            {
                await _leads.UpdateAsync(tracked);
            }
        }

        var actorText = !string.IsNullOrWhiteSpace(performedBy) ? $" by {performedBy}" : "";
        await _logs.AddAsync(new ActivityLog
        {
            LeadId = draft.LeadId,
            Action = isTelegram ? "Telegram Sent" : "Email Sent",
            Reason = isTelegram
                ? $"Approved and sent draft via Telegram (chat {lead.TelegramChatId}){actorText}."
                : $"Approved and sent draft to {lead.Email}{actorText}.",
            TriggeredBy = LogTrigger.User
        });

        return new ApproveDraftResult(true,
            isTelegram ? "Message sent successfully via Telegram" : "Message sent successfully via email");
    }

    /// <summary>
    /// Chat id from TelegramChatId column, or recovered from tg-&#123;id&#125;@telegram.com email used by the webhook.
    /// </summary>
    private static long? ResolveTelegramChatId(Lead lead)
    {
        if (lead.TelegramChatId.HasValue)
            return lead.TelegramChatId;

        var email = lead.Email?.Trim();
        if (string.IsNullOrEmpty(email))
            return null;

        // Webhook stores deterministic emails: tg-{telegramUserId}@telegram.com
        if (email.EndsWith("@telegram.com", StringComparison.OrdinalIgnoreCase)
            && email.StartsWith("tg-", StringComparison.OrdinalIgnoreCase))
        {
            var local = email.Split('@')[0];
            var idPart = local["tg-".Length..];
            if (long.TryParse(idPart, out var parsed) && parsed != 0)
                return parsed;
        }

        return null;
    }

    private static bool IsTelegramIdentifiedLead(Lead lead) =>
        !string.IsNullOrWhiteSpace(lead.TelegramUsername)
        || (lead.Email?.EndsWith("@telegram.com", StringComparison.OrdinalIgnoreCase) ?? false);

    private static string FormatSendError(Exception ex, string? channel)
    {
        var raw = ex.Message ?? string.Empty;
        var timedOut = ex is TaskCanceledException
                       || raw.Contains("HttpClient.Timeout", StringComparison.OrdinalIgnoreCase)
                       || raw.Contains("timed out", StringComparison.OrdinalIgnoreCase);

        if (timedOut && channel == "Telegram")
        {
            return "Telegram send timed out reaching api.telegram.org. Check bot token and network/firewall access to Telegram.";
        }

        if (timedOut)
        {
            return "Email send timed out. The email provider did not respond in time — check Resend/SMTP connectivity.";
        }

        if (ex is InvalidOperationException)
            return ex.Message;

        return $"Failed to send via {channel ?? "unknown"}: {ex.Message}";
    }
}
