using MediatR;

namespace CRMAgent.Application.UseCases.ApproveDraft;

public record ApproveDraftCommand(int DraftId) : IRequest<ApproveDraftResult>;

public record ApproveDraftResult(bool Success, string Message);
