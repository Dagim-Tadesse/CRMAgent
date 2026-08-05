using CRMAgent.Application.Interfaces;
using CRMAgent.Domain.Entities;
using CRMAgent.Infrastructure.Persistence;
using Microsoft.EntityFrameworkCore;

namespace CRMAgent.Infrastructure.Repositories;

public class LeadRepository : ILeadRepository
{
    private readonly AppDbContext _context;

    public LeadRepository(AppDbContext context)
    {
        _context = context;
    }

    public async Task<List<Lead>> GetAllAsync() =>
        await _context.Leads
            .Include(l => l.Interactions)
            .OrderByDescending(l => l.CreatedAt)
            .ToListAsync();

    public async Task<Lead?> GetByIdAsync(int id) =>
        await _context.Leads
            .Include(l => l.Interactions)
            .Include(l => l.EmailDrafts)
            .Include(l => l.ActivityLogs)
            .FirstOrDefaultAsync(l => l.Id == id);

    public async Task<Lead?> GetByEmailAsync(string email) =>
        await _context.Leads.FirstOrDefaultAsync(l => l.Email == email);

    public async Task<bool> EmailExistsAsync(string email) =>
        await _context.Leads.AnyAsync(l => l.Email == email);

    public async Task AddAsync(Lead lead)
    {
        await _context.Leads.AddAsync(lead);
        await _context.SaveChangesAsync();
    }

    public async Task UpdateAsync(Lead lead)
    {
        _context.Leads.Update(lead);
        await _context.SaveChangesAsync();
    }

    public async Task DeleteAsync(Lead lead)
    {
        _context.Leads.Remove(lead);
        await _context.SaveChangesAsync();
    }
}
