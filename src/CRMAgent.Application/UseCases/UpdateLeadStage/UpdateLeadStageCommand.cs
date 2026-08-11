using MediatR;

namespace CRMAgent.Application.UseCases.UpdateLeadStage;

public record UpdateLeadStageCommand(int LeadId, string Stage) : IRequest;
