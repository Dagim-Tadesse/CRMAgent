using CRMAgent.Application.Interfaces;
using CRMAgent.Domain.Enums;
using CRMAgent.Domain.Exceptions;
using MediatR;

namespace CRMAgent.Application.UseCases.EscalateDraft;

public class EscalateDraftHandler : IRequestHandler<EscalateDraftCommand>
{
    private readonly IEmailDraftRepository _drafts;

    public EscalateDraftHandler(IEmailDraftRepository drafts)
    {
        _drafts = drafts;
    }

    public async Task Handle(EscalateDraftCommand request, CancellationToken cancellationToken)
    {
        var draft = await _drafts.GetByIdAsync(request.DraftId);
        if (draft == null)
            throw new KeyNotFoundException($"Draft {request.DraftId} not found");

        draft.EscalationStatus = EscalationStatus.Requested;
        draft.EscalationNote = request.EscalationNote;
        draft.Body = request.Body; // the sales rep can edit it before escalating

        await _drafts.UpdateAsync(draft);
    }
}
