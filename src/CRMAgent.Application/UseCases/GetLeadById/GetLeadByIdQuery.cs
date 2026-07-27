using CRMAgent.Domain.Entities;
using MediatR;

namespace CRMAgent.Application.UseCases.GetLeadById;

public record GetLeadByIdQuery(int Id) : IRequest<Lead>;
