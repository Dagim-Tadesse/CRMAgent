using CRMAgent.Application.Interfaces;
using CRMAgent.Domain.Exceptions;
using MediatR;

namespace CRMAgent.Application.UseCases.DeleteLead;

public class DeleteLeadHandler : IRequestHandler<DeleteLeadCommand>
{
    private readonly ILeadRepository _leads;

    public DeleteLeadHandler(ILeadRepository leads)
    {
        _leads = leads;
    }

    public async Task Handle(DeleteLeadCommand request, CancellationToken ct)
    {
        var lead = await _leads.GetByIdAsync(request.Id);
        if (lead is null)
        {
            throw new LeadNotFoundException(request.Id);
        }

        await _leads.DeleteAsync(lead);
    }
}
