using MediatR;

namespace CRMAgent.Application.UseCases.GenerateDraft;

public record GenerateDraftCommand(int LeadId, string? PerformedBy = null) : IRequest<int>;
