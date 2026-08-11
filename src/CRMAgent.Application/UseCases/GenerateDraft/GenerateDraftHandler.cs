using CRMAgent.Application.Interfaces;
using CRMAgent.Domain.Entities;
using CRMAgent.Domain.Enums;
using CRMAgent.Domain.Exceptions;
using MediatR;

namespace CRMAgent.Application.UseCases.GenerateDraft;

public class GenerateDraftHandler : IRequestHandler<GenerateDraftCommand, int>
{
    private readonly ILeadRepository _leads;
    private readonly IInteractionRepository _interactions;
    private readonly IEmailDraftRepository _drafts;
    private readonly IActivityLogRepository _logs;
    private readonly IAIService _ai;

    public GenerateDraftHandler(
        ILeadRepository leads,
        IInteractionRepository interactions,
        IEmailDraftRepository drafts,
        IActivityLogRepository logs,
        IAIService ai)
    {
        _leads = leads;
        _interactions = interactions;
        _drafts = drafts;
        _logs = logs;
        _ai = ai;
    }

    public async Task<int> Handle(GenerateDraftCommand cmd, CancellationToken ct)
    {
        var lead = await _leads.GetByIdAsync(cmd.LeadId)
            ?? throw new LeadNotFoundException(cmd.LeadId);

        var interactions = await _interactions.GetByLeadIdAsync(lead.Id);
        var history = interactions.Count > 0
            ? string.Join("\n", interactions.Take(5).Select(i =>
                $"[{i.CreatedAt:u}] {i.Direction}/{i.Channel}: {i.Content}"))
            : lead.RawInquiryText;

        var result = await _ai.GenerateEmailDraftAsync(lead.FullName, lead.Company, history);

        var draft = new EmailDraft
        {
            LeadId = lead.Id,
            Subject = result.Subject,
            Body = result.Body,
            AIReason = result.Reason,
            Status = DraftStatus.PendingApproval
        };

        await _drafts.AddAsync(draft);

        await _logs.AddAsync(new ActivityLog
        {
            LeadId = lead.Id,
            Action = "Draft Generated",
            Reason = result.Reason,
            TriggeredBy = LogTrigger.Agent
        });

        return draft.Id;
    }
}
