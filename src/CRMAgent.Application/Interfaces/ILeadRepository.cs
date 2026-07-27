using CRMAgent.Domain.Entities;

namespace CRMAgent.Application.Interfaces;

public interface ILeadRepository
{
    Task<List<Lead>> GetAllAsync();
    Task<Lead?> GetByIdAsync(int id);
    Task<Lead?> GetByEmailAsync(string email);
    Task<bool> EmailExistsAsync(string email);
    Task AddAsync(Lead lead);
    Task UpdateAsync(Lead lead);
    Task DeleteAsync(Lead lead);
}
