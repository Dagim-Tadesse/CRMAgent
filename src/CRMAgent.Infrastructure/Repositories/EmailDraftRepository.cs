using CRMAgent.Application.Interfaces;
using CRMAgent.Domain.Entities;
using CRMAgent.Domain.Enums;
using CRMAgent.Infrastructure.Persistence;
using Microsoft.EntityFrameworkCore;

namespace CRMAgent.Infrastructure.Repositories;

public class EmailDraftRepository : IEmailDraftRepository
{
    private readonly AppDbContext _context;

    public EmailDraftRepository(AppDbContext context)
    {
        _context = context;
    }

    public async Task<List<EmailDraft>> GetByLeadIdAsync(int leadId) =>
        await _context.EmailDrafts
            .Include(d => d.Lead)
            .Where(d => d.LeadId == leadId)
            .OrderByDescending(d => d.CreatedAt)
            .ToListAsync();

    public async Task<EmailDraft?> GetByIdAsync(int id) =>
        await _context.EmailDrafts
            .Include(d => d.Lead)
            .FirstOrDefaultAsync(d => d.Id == id);

    public async Task<List<EmailDraft>> GetAllPendingAsync() =>
        await _context.EmailDrafts
            .Include(d => d.Lead)
            .Where(d => d.Status == DraftStatus.PendingApproval)
            .OrderByDescending(d => d.CreatedAt)
            .ToListAsync();

    public async Task AddAsync(EmailDraft draft)
    {
        await _context.EmailDrafts.AddAsync(draft);
        await _context.SaveChangesAsync();
    }

    public async Task UpdateAsync(EmailDraft draft)
    {
        _context.EmailDrafts.Update(draft);
        await _context.SaveChangesAsync();
    }
}
