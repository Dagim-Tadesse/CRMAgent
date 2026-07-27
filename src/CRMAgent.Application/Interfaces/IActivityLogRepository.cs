using CRMAgent.Domain.Entities;

namespace CRMAgent.Application.Interfaces;

public interface IActivityLogRepository
{
    Task<List<ActivityLog>> GetAllAsync();
    Task<List<ActivityLog>> GetByLeadIdAsync(int leadId);
    Task AddAsync(ActivityLog log);
}
