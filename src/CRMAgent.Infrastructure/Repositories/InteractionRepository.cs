using CRMAgent.Application.Interfaces;
using CRMAgent.Domain.Entities;
using CRMAgent.Infrastructure.Persistence;
using Microsoft.EntityFrameworkCore;

namespace CRMAgent.Infrastructure.Repositories;

public class InteractionRepository : IInteractionRepository
{
    private readonly AppDbContext _context;

    public InteractionRepository(AppDbContext context)
    {
        _context = context;
    }

    public async Task<List<Interaction>> GetByLeadIdAsync(int leadId)
    {
        return await _context.Interactions
            .Where(i => i.LeadId == leadId)
            .OrderByDescending(i => i.CreatedAt)
            .ToListAsync();
    }

    public async Task AddAsync(Interaction interaction)
    {
        await _context.Interactions.AddAsync(interaction);
        await _context.SaveChangesAsync();
    }
}
