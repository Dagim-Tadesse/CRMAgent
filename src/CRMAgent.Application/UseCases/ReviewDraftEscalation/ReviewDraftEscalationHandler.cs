using CRMAgent.Application.Interfaces;
using CRMAgent.Domain.Enums;
using MediatR;

namespace CRMAgent.Application.UseCases.ReviewDraftEscalation;

public class ReviewDraftEscalationHandler : IRequestHandler<ReviewDraftEscalationCommand>
{
    private readonly IEmailDraftRepository _drafts;

    public ReviewDraftEscalationHandler(IEmailDraftRepository drafts)
    {
        _drafts = drafts;
    }

    public async Task Handle(ReviewDraftEscalationCommand request, CancellationToken cancellationToken)
    {
        var draft = await _drafts.GetByIdAsync(request.DraftId);
        if (draft == null)
            throw new KeyNotFoundException($"Draft {request.DraftId} not found");

        if (request.Status == EscalationStatus.Rejected && string.IsNullOrWhiteSpace(request.ManagerFeedback))
        {
            throw new InvalidOperationException("ManagerFeedback is required when rejecting an escalation.");
        }

        draft.EscalationStatus = request.Status;
        draft.ManagerFeedback = request.ManagerFeedback;
        draft.Body = request.Body; // manager can optionally edit the body

        await _drafts.UpdateAsync(draft);
    }
}
