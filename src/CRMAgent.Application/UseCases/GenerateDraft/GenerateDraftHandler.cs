using CRMAgent.Application.Interfaces;
using CRMAgent.Domain.Entities;
using CRMAgent.Domain.Enums;
using CRMAgent.Domain.Exceptions;
using MediatR;
using Microsoft.Extensions.Logging;

namespace CRMAgent.Application.UseCases.GenerateDraft;

public class GenerateDraftHandler : IRequestHandler<GenerateDraftCommand, int>
{
    private readonly ILeadRepository _leads;
    private readonly IInteractionRepository _interactions;
    private readonly IEmailDraftRepository _drafts;
    private readonly IActivityLogRepository _logs;
    private readonly IAIService _ai;
    private readonly ILogger<GenerateDraftHandler> _logger;

    public GenerateDraftHandler(
        ILeadRepository leads,
        IInteractionRepository interactions,
        IEmailDraftRepository drafts,
        IActivityLogRepository logs,
        IAIService ai,
        ILogger<GenerateDraftHandler> logger)
    {
        _leads = leads;
        _interactions = interactions;
        _drafts = drafts;
        _logs = logs;
        _ai = ai;
        _logger = logger;
    }

    public async Task<int> Handle(GenerateDraftCommand cmd, CancellationToken ct)
    {
        var lead = await _leads.GetByIdAsync(cmd.LeadId)
            ?? throw new LeadNotFoundException(cmd.LeadId);

        try
        {
            // Reject existing pending drafts for this lead to ensure only one active
            var existingDrafts = await _drafts.GetByLeadIdAsync(lead.Id) ?? new();
            var pendingDrafts = existingDrafts.Where(d => d.Status == DraftStatus.PendingApproval).ToList();

            foreach (var oldDraft in pendingDrafts)
            {
                oldDraft.Status = DraftStatus.Rejected;
                await _drafts.UpdateAsync(oldDraft);
            }

            var interactions = await _interactions.GetByLeadIdAsync(lead.Id) ?? new();
            var history = interactions.Count > 0
                ? string.Join("\n", interactions.Take(5).Select(i =>
                    $"[{i.CreatedAt:u}] {i.Direction}/{i.Channel}: {i.Content}"))
                : lead.RawInquiryText;

            string channel = interactions.FirstOrDefault()?.Channel.ToString()
                ?? (!string.IsNullOrEmpty(lead.TelegramUsername) ? "Telegram" : "Email");

            var result = await _ai.GenerateDraftAsync(lead.FullName, lead.Company, history, channel);

            var draft = new EmailDraft
            {
                LeadId = lead.Id,
                Subject = result.Subject ?? string.Empty,
                Body = result.Body ?? string.Empty,
                AIReason = result.Reason ?? string.Empty,
                Status = DraftStatus.PendingApproval
            };

            await _drafts.AddAsync(draft);

            await _logs.AddAsync(new ActivityLog
            {
                LeadId = lead.Id,
                Action = "Draft Generated",
                Reason = result.Reason ?? "AI draft generated",
                TriggeredBy = LogTrigger.Agent
            });

            _logger.LogInformation(
                "Generated pending draft {DraftId} for lead {LeadId} via {Channel}",
                draft.Id, lead.Id, channel);

            return draft.Id;
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "AI draft generation failed for lead {LeadId}", cmd.LeadId);
            throw;
        }
    }
}
