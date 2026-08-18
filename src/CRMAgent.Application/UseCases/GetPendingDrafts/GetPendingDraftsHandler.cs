using CRMAgent.Application.DTOs;
using CRMAgent.Application.Interfaces;
using CRMAgent.Domain.Enums;
using MediatR;

namespace CRMAgent.Application.UseCases.GetPendingDrafts;

public class GetPendingDraftsHandler : IRequestHandler<GetPendingDraftsQuery, List<EmailDraftDto>>
{
    private readonly IEmailDraftRepository _drafts;
    private readonly IInteractionRepository _interactions;

    public GetPendingDraftsHandler(IEmailDraftRepository drafts, IInteractionRepository interactions)
    {
        _drafts = drafts;
        _interactions = interactions;
    }

    public async Task<List<EmailDraftDto>> Handle(GetPendingDraftsQuery request, CancellationToken ct)
    {
        var drafts = await _drafts.GetAllPendingAsync() ?? new List<Domain.Entities.EmailDraft>();
        var result = new List<EmailDraftDto>(drafts.Count);

        foreach (var draft in drafts)
        {
            var dto = EmailDraftDto.FromEntity(draft);
            try
            {
                var interactions = await _interactions.GetByLeadIdAsync(draft.LeadId) ?? new();
                var inbound = interactions.FirstOrDefault(i => i.Direction == InteractionDirection.Inbound);
                dto.TriggerMessage = string.IsNullOrWhiteSpace(inbound?.Content) ? null : inbound!.Content;
            }
            catch
            {
                dto.TriggerMessage = null;
            }

            result.Add(dto);
        }

        return result;
    }
}
