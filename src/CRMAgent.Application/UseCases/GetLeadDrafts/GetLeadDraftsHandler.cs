using CRMAgent.Application.DTOs;
using CRMAgent.Application.Interfaces;
using MediatR;

namespace CRMAgent.Application.UseCases.GetLeadDrafts;

public class GetLeadDraftsHandler : IRequestHandler<GetLeadDraftsQuery, List<EmailDraftDto>>
{
    private readonly IEmailDraftRepository _drafts;

    public GetLeadDraftsHandler(IEmailDraftRepository drafts)
    {
        _drafts = drafts;
    }

    public async Task<List<EmailDraftDto>> Handle(GetLeadDraftsQuery request, CancellationToken ct)
    {
        var drafts = await _drafts.GetByLeadIdAsync(request.LeadId);
        return drafts.Select(EmailDraftDto.FromEntity).ToList();
    }
}
