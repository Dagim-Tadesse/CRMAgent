using CRMAgent.Application.Interfaces;
using CRMAgent.Application.UseCases.GenerateDraft;
using CRMAgent.Domain.Entities;
using CRMAgent.Domain.Enums;
using CRMAgent.Domain.Exceptions;
using MediatR;

namespace CRMAgent.Application.UseCases.UpdateLeadStage;

public class UpdateLeadStageHandler : IRequestHandler<UpdateLeadStageCommand>
{
    private readonly ILeadRepository _leads;
    private readonly IActivityLogRepository _logs;
    private readonly IEmailDraftRepository _drafts;
    private readonly IMediator _mediator;

    public UpdateLeadStageHandler(ILeadRepository leads, IActivityLogRepository logs, IEmailDraftRepository drafts, IMediator mediator)
    {
        _leads = leads;
        _logs = logs;
        _drafts = drafts;
        _mediator = mediator;
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

            var actorText = !string.IsNullOrWhiteSpace(cmd.PerformedBy) ? $" by {cmd.PerformedBy}" : "";
            await _logs.AddAsync(new ActivityLog
            {
                LeadId = lead.Id,
                Action = "Stage Updated",
                Reason = $"Pipeline stage manually changed from {previousStage} to {parsedStage}{actorText}.",
                TriggeredBy = LogTrigger.User
            });

            // If stage is Contacted or Qualified, check if we need to auto-generate a draft
            if (parsedStage == PipelineStage.Contacted || parsedStage == PipelineStage.Qualified)
            {
                var drafts = await _drafts.GetByLeadIdAsync(lead.Id);
                var hasPendingDraft = drafts.Any(d => d.Status == DraftStatus.PendingApproval);
                
                if (!hasPendingDraft)
                {
                    // Trigger the draft generation
                    await _mediator.Send(new GenerateDraftCommand(lead.Id), ct);
                }
            }
        }
    }
}
