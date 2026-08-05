using CRMAgent.Application.DTOs;
using MediatR;

namespace CRMAgent.Application.UseCases.GetAllLeads;

public record GetAllLeadsQuery : IRequest<List<LeadSummaryDto>>;
