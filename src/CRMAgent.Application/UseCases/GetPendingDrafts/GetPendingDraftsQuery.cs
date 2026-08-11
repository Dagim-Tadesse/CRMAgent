using CRMAgent.Application.DTOs;
using MediatR;

namespace CRMAgent.Application.UseCases.GetPendingDrafts;

public record GetPendingDraftsQuery : IRequest<List<EmailDraftDto>>;
