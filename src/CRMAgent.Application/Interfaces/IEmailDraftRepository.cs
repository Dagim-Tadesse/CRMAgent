using CRMAgent.Domain.Entities;

namespace CRMAgent.Application.Interfaces;

public interface IEmailDraftRepository
{
    Task<List<EmailDraft>> GetByLeadIdAsync(int leadId);
    Task<EmailDraft?> GetByIdAsync(int id);
    Task<List<EmailDraft>> GetAllPendingAsync();
    Task AddAsync(EmailDraft draft);
    Task UpdateAsync(EmailDraft draft);
}
