using CRMAgent.Application.Interfaces;
using CRMAgent.Domain.Entities;
using CRMAgent.Domain.Enums;
using MediatR;

namespace CRMAgent.Application.UseCases.RejectDraft;

public class RejectDraftHandler : IRequestHandler<RejectDraftCommand>
{
    private readonly IEmailDraftRepository _drafts;
    private readonly IActivityLogRepository _logs;

    public RejectDraftHandler(IEmailDraftRepository drafts, IActivityLogRepository logs)
    {
        _drafts = drafts;
        _logs = logs;
    }

    public async Task Handle(RejectDraftCommand cmd, CancellationToken ct)
    {
        var draft = await _drafts.GetByIdAsync(cmd.DraftId)
            ?? throw new InvalidOperationException($"Draft with ID {cmd.DraftId} was not found.");

        if (draft.Status != DraftStatus.PendingApproval)
        {
            throw new InvalidOperationException("Only drafts pending approval can be rejected.");
        }

        draft.Status = DraftStatus.Rejected;
        await _drafts.UpdateAsync(draft);

        await _logs.AddAsync(new ActivityLog
        {
            LeadId = draft.LeadId,
            Action = "Draft Rejected",
            Reason = $"Draft '{draft.Subject}' was rejected.",
            TriggeredBy = LogTrigger.User
        });
    }
}
