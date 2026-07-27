using CRMAgent.Application.Interfaces;
using CRMAgent.Domain.Entities;
using CRMAgent.Domain.Exceptions;
using MediatR;

namespace CRMAgent.Application.UseCases.GetLeadById;

public class GetLeadByIdHandler : IRequestHandler<GetLeadByIdQuery, Lead>
{
    private readonly ILeadRepository _leads;

    public GetLeadByIdHandler(ILeadRepository leads)
    {
        _leads = leads;
    }

    public async Task<Lead> Handle(GetLeadByIdQuery request, CancellationToken ct)
    {
        var lead = await _leads.GetByIdAsync(request.Id);
        return lead ?? throw new LeadNotFoundException(request.Id);
    }
}
