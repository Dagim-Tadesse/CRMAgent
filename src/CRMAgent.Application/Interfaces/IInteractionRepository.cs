using CRMAgent.Domain.Entities;

namespace CRMAgent.Application.Interfaces;

public interface IInteractionRepository
{
    Task<List<Interaction>> GetByLeadIdAsync(int leadId);
    Task AddAsync(Interaction interaction);
}
