using MediatR;

namespace CRMAgent.Application.UseCases.ApproveDraft;

public record ApproveDraftCommand(int DraftId, string? PerformedBy = null) : IRequest<ApproveDraftResult>;

public record ApproveDraftResult(bool Success, string Message);
