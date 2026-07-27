using MediatR;

namespace CRMAgent.Application.UseCases.DeleteLead;

public record DeleteLeadCommand(int Id) : IRequest;
