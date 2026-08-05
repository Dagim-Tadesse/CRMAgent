using CRMAgent.Application.DTOs;
using CRMAgent.Application.Interfaces;
using MediatR;

namespace CRMAgent.Application.UseCases.GetAllLeads;

public class GetAllLeadsHandler : IRequestHandler<GetAllLeadsQuery, List<LeadSummaryDto>>
{
    private readonly ILeadRepository _leads;

    public GetAllLeadsHandler(ILeadRepository leads)
    {
        _leads = leads;
    }

    public async Task<List<LeadSummaryDto>> Handle(GetAllLeadsQuery request, CancellationToken ct)
    {
        var leads = await _leads.GetAllAsync();

        return leads.Select(l => new LeadSummaryDto
        {
            Id = l.Id,
            FullName = l.FullName,
            Email = l.Email,
            Company = l.Company,
            AIScore = l.AIScore,
            Emotion = l.Emotion.ToString(),
            PipelineStage = l.PipelineStage.ToString(),
            Status = l.Status.ToString(),
            IsStagnant = l.IsStagnant,
            IsAtRisk = l.IsAtRisk,
            CreatedAt = l.CreatedAt,
            LastInteractionAt = l.LastInteractionAt,
            Source = l.Interactions.OrderBy(i => i.CreatedAt).FirstOrDefault()?.Channel.ToString() ?? 
                     (!string.IsNullOrEmpty(l.TelegramUsername) ? "Telegram" : "WebForm")
        }).ToList();
    }
}
