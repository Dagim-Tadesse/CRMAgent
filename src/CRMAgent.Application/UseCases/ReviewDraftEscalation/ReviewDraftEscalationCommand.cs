using CRMAgent.Domain.Enums;
using MediatR;

namespace CRMAgent.Application.UseCases.ReviewDraftEscalation;

public record ReviewDraftEscalationCommand(
    int DraftId,
    EscalationStatus Status,
    string? ManagerFeedback,
    string Body
) : IRequest;
