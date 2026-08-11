using CRMAgent.Application.Interfaces;
using CRMAgent.Domain.Entities;
using CRMAgent.Domain.Enums;
using CRMAgent.Domain.Exceptions;
using MediatR;

namespace CRMAgent.Application.UseCases.UpdateLeadStage;

public class UpdateLeadStageHandler : IRequestHandler<UpdateLeadStageCommand>
{
    private readonly ILeadRepository _leads;
    private readonly IActivityLogRepository _logs;

    public UpdateLeadStageHandler(ILeadRepository leads, IActivityLogRepository logs)
    {
        _leads = leads;
        _logs = logs;
    }

    public async Task Handle(UpdateLeadStageCommand cmd, CancellationToken ct)
    {
        var lead = await _leads.GetByIdAsync(cmd.LeadId);
        if (lead == null)
        {
            throw new LeadNotFoundException(cmd.LeadId);
        }

        if (!Enum.TryParse<PipelineStage>(cmd.Stage, true, out var parsedStage))
        {
            throw new ArgumentException($"Invalid pipeline stage: {cmd.Stage}");
        }

        var previousStage = lead.PipelineStage;
        lead.PipelineStage = parsedStage;

        // If the stage changed, log an activity
        if (previousStage != parsedStage)
        {
            await _leads.UpdateAsync(lead);

            await _logs.AddAsync(new ActivityLog
            {
                LeadId = lead.Id,
                Action = "Stage Updated",
                Reason = $"Pipeline stage manually changed from {previousStage} to {parsedStage}.",
                TriggeredBy = LogTrigger.User
            });
        }
    }
}
