using CRMAgent.Application.Interfaces;
using CRMAgent.Domain.Enums;
using MediatR;

namespace CRMAgent.Application.UseCases.EditDraft;

public class EditDraftHandler : IRequestHandler<EditDraftCommand>
{
    private readonly IEmailDraftRepository _drafts;

    public EditDraftHandler(IEmailDraftRepository drafts)
    {
        _drafts = drafts;
    }

    public async Task Handle(EditDraftCommand cmd, CancellationToken ct)
    {
        var draft = await _drafts.GetByIdAsync(cmd.DraftId)
            ?? throw new InvalidOperationException($"Draft with ID {cmd.DraftId} was not found.");

        if (draft.Status != DraftStatus.PendingApproval)
        {
            throw new InvalidOperationException("Only drafts pending approval can be edited.");
        }

        draft.Subject = cmd.Subject;
        draft.Body = cmd.Body;

        await _drafts.UpdateAsync(draft);
    }
}
