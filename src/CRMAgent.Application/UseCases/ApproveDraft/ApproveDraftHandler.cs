using CRMAgent.Application.Interfaces;
using CRMAgent.Domain.Entities;
using CRMAgent.Domain.Enums;
using MediatR;

namespace CRMAgent.Application.UseCases.ApproveDraft;

public class ApproveDraftHandler : IRequestHandler<ApproveDraftCommand, ApproveDraftResult>
{
    private readonly IEmailDraftRepository _drafts;
    private readonly IEmailService _email;
    private readonly ITelegramService _telegram;
    private readonly IInteractionRepository _interactions;
    private readonly IActivityLogRepository _logs;

    public ApproveDraftHandler(
        IEmailDraftRepository drafts,
        IEmailService email,
        ITelegramService telegram,
        IInteractionRepository interactions,
        IActivityLogRepository logs)
    {
        _drafts = drafts;
        _email = email;
        _telegram = telegram;
        _interactions = interactions;
        _logs = logs;
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
            bool isTelegram = draft.Lead.TelegramChatId.HasValue;

            if (isTelegram)
            {
                await _telegram.SendMessageAsync(draft.Lead.TelegramChatId.Value, draft.Body);
            }
            else
            {
                var htmlBody = draft.Body.Replace("\n", "<br />");
                await _email.SendAsync(draft.Lead.Email, draft.Subject, htmlBody);
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
