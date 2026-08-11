using MediatR;

namespace CRMAgent.Application.UseCases.EditDraft;

public record EditDraftCommand(int DraftId, string Subject, string Body) : IRequest;
