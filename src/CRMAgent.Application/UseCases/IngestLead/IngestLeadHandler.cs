using CRMAgent.Application.Interfaces;
using CRMAgent.Domain.Entities;
using CRMAgent.Domain.Enums;
using CRMAgent.Domain.Exceptions;
using MediatR;

namespace CRMAgent.Application.UseCases.IngestLead;

public class IngestLeadHandler : IRequestHandler<IngestLeadCommand, int>
{
    private readonly ILeadRepository _leads;
    private readonly IActivityLogRepository _logs;
    private readonly IAIService _ai;

    public IngestLeadHandler(ILeadRepository leads, IActivityLogRepository logs, IAIService ai)
    {
        _leads = leads;
        _logs = logs;
        _ai = ai;
    }

    public async Task<int> Handle(IngestLeadCommand cmd, CancellationToken ct)
    {
        if (await _leads.EmailExistsAsync(cmd.Email))
        {
            throw new InvalidOperationException($"Lead with email {cmd.Email} already exists.");
        }

        var lead = new Lead
        {
            FullName = cmd.FullName,
            Email = cmd.Email,
            Company = cmd.Company,
            RawInquiryText = cmd.RawInquiryText,
            AssignedTo = cmd.AssignedTo
        };

        try
        {
            var result = await _ai.ScoreLeadAsync(cmd.RawInquiryText);

            lead.AIScore = result.Score;
            lead.Emotion = Enum.Parse<EmotionType>(result.Emotion, true);

            if (result.Score >= 7)
            {
                lead.PipelineStage = PipelineStage.Contacted;
            }

            await _leads.AddAsync(lead);

            await _logs.AddAsync(new ActivityLog
            {
                LeadId = lead.Id,
                Action = lead.PipelineStage == PipelineStage.Contacted
                    ? "Lead Created + Auto-Promoted"
                    : "Lead Created",
                Reason = $"AI Score: {result.Score}/10. Emotion: {result.Emotion}. {result.Summary}",
                TriggeredBy = LogTrigger.Agent
            });
        }
        catch (AIServiceException)
        {
            lead.Status = LeadStatus.PendingManualTriage;
            await _leads.AddAsync(lead);

            await _logs.AddAsync(new ActivityLog
            {
                LeadId = lead.Id,
                Action = "AI Scoring Failed",
                Reason = "Gemini API unavailable. Lead saved as PendingManualTriage for manual review.",
                TriggeredBy = LogTrigger.Agent
            });
        }

        return lead.Id;
    }
}
