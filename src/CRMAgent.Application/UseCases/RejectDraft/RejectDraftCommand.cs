using MediatR;

namespace CRMAgent.Application.UseCases.RejectDraft;

public record RejectDraftCommand(int DraftId) : IRequest;
