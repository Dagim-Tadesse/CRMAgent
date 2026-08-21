using CRMAgent.Application.Interfaces;
using CRMAgent.Domain.Entities;
using CRMAgent.Infrastructure.Persistence;
using Microsoft.EntityFrameworkCore;

namespace CRMAgent.Infrastructure.Repositories;

public class ActivityLogRepository : IActivityLogRepository
{
    private readonly AppDbContext _context;

    public ActivityLogRepository(AppDbContext context)
    {
        _context = context;
    }

    public async Task<List<ActivityLog>> GetAllAsync() =>
        await _context.ActivityLogs
            .Include(l => l.Lead)
            .OrderByDescending(l => l.CreatedAt)
            .ToListAsync();

    public async Task<List<ActivityLog>> GetByLeadIdAsync(int leadId) =>
        await _context.ActivityLogs
            .Include(l => l.Lead)
            .Where(l => l.LeadId == leadId)
            .OrderByDescending(l => l.CreatedAt)
            .ToListAsync();

    public async Task AddAsync(ActivityLog log)
    {
        await _context.ActivityLogs.AddAsync(log);
        await _context.SaveChangesAsync();
    }
}
