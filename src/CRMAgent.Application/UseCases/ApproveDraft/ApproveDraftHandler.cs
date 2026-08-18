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

        try
        {
            if (draft.Lead == null)
            {
                _logger.LogError("Draft {DraftId} has no associated lead loaded; cannot send", draft.Id);
                return new ApproveDraftResult(false, "Draft is missing lead information and cannot be sent.");
            }

            bool isTelegram = draft.Lead.TelegramChatId.HasValue
                || (draft.Lead.Email?.EndsWith("@telegram.com", StringComparison.OrdinalIgnoreCase) ?? false);

            if (isTelegram)
            {
                if (!draft.Lead.TelegramChatId.HasValue)
                {
                    return new ApproveDraftResult(false, "Cannot send via Telegram: The Chat ID is missing. This usually happens if the lead was created manually or before the bot was fully configured.");
                }
                
                await _telegram.SendMessageAsync(draft.Lead.TelegramChatId.Value, draft.Body);
            }
            else
            {
                var htmlBody = draft.Body.Replace("\n", "<br />");
                await _email.SendAsync(draft.Lead.Email ?? string.Empty, draft.Subject, htmlBody);
            }

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

            // Promote New → Contacted so the pipeline/kanban reflects the outbound touch
            var lead = await _leads.GetByIdAsync(draft.LeadId);
            if (lead != null)
            {
                lead.LastInteractionAt = DateTime.UtcNow;
                lead.IsStagnant = false;

                if (lead.PipelineStage == PipelineStage.New)
                {
                    var previous = lead.PipelineStage;
                    lead.PipelineStage = PipelineStage.Contacted;
                    await _leads.UpdateAsync(lead);

                    await _logs.AddAsync(new ActivityLog
                    {
                        LeadId = lead.Id,
                        Action = "Stage Updated",
                        Reason = $"Pipeline stage auto-advanced from {previous} to {PipelineStage.Contacted} after draft was sent.",
                        TriggeredBy = LogTrigger.Agent
                    });

                    _logger.LogInformation(
                        "Lead {LeadId} advanced from {Previous} to Contacted after draft {DraftId} was sent",
                        lead.Id, previous, draft.Id);
                }
                else
                {
                    await _leads.UpdateAsync(lead);
                }
            }
            else
            {
                _logger.LogWarning("Draft {DraftId} sent but lead {LeadId} was not found for stage update", draft.Id, draft.LeadId);
            }

            await _logs.AddAsync(new ActivityLog
            {
                LeadId = draft.LeadId,
                Action = isTelegram ? "Telegram Sent" : "Email Sent",
                Reason = $"Approved and sent draft to {(isTelegram ? "Telegram" : draft.Lead.Email)}.",
                TriggeredBy = LogTrigger.User
            });

            return new ApproveDraftResult(true, "Message sent successfully");
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Failed to send draft {DraftId} for lead {LeadId}", cmd.DraftId, draft.LeadId);

            await _logs.AddAsync(new ActivityLog
            {
                LeadId = draft.LeadId,
                Action = "Email Send Failed",
                Reason = ex.Message,
                TriggeredBy = LogTrigger.Agent
            });

            return new ApproveDraftResult(false, $"Failed to send email: {ex.Message}");
        }
    }
}
