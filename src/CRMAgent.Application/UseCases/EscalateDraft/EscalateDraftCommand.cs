using MediatR;

namespace CRMAgent.Application.UseCases.EscalateDraft;

public record EscalateDraftCommand(
    int DraftId,
    string EscalationNote,
    string Body
) : IRequest;
