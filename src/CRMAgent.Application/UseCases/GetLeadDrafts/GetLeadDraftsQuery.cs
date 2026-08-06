using CRMAgent.Application.DTOs;
using MediatR;

namespace CRMAgent.Application.UseCases.GetLeadDrafts;

public record GetLeadDraftsQuery(int LeadId) : IRequest<List<EmailDraftDto>>;
