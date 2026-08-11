using CRMAgent.Application.DTOs;
using CRMAgent.Application.Interfaces;
using MediatR;

namespace CRMAgent.Application.UseCases.GetPendingDrafts;

public class GetPendingDraftsHandler : IRequestHandler<GetPendingDraftsQuery, List<EmailDraftDto>>
{
    private readonly IEmailDraftRepository _drafts;

    public GetPendingDraftsHandler(IEmailDraftRepository drafts)
    {
        _drafts = drafts;
    }

    public async Task<List<EmailDraftDto>> Handle(GetPendingDraftsQuery request, CancellationToken ct)
    {
        var drafts = await _drafts.GetAllPendingAsync();
        return drafts.Select(EmailDraftDto.FromEntity).ToList();
    }
}
