using CRMAgent.Application.Interfaces;
using CRMAgent.Domain.Entities;
using CRMAgent.Domain.Enums;
using CRMAgent.Infrastructure.Persistence;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;

namespace CRMAgent.Infrastructure.Jobs;

public class DailyPipelineCheckJob
{
    private readonly AppDbContext _db;
    private readonly IActivityLogRepository _logs;
    private readonly ILogger<DailyPipelineCheckJob> _logger;

    public DailyPipelineCheckJob(
        AppDbContext db,
        IActivityLogRepository logs,
        ILogger<DailyPipelineCheckJob> logger)
    {
        _db = db;
        _logs = logs;
        _logger = logger;
    }

    public async Task ExecuteAsync()
    {
        var cutoffStagnant = DateTime.UtcNow.AddDays(-7);
        var cutoffAtRisk = DateTime.UtcNow.AddDays(-3);

        var leads = await _db.Leads
            .Where(l => l.Status == LeadStatus.Active
                     && l.PipelineStage != PipelineStage.Won
                     && l.PipelineStage != PipelineStage.Lost)
            .ToListAsync();

        foreach (var lead in leads)
        {
            var lastActivity = lead.LastInteractionAt ?? lead.CreatedAt;
            lead.IsStagnant = lastActivity < cutoffStagnant;
            lead.IsAtRisk = lastActivity < cutoffAtRisk;
        }

        await _db.SaveChangesAsync();

        var stagnantCount = leads.Count(l => l.IsStagnant);
        var atRiskCount = leads.Count(l => l.IsAtRisk);

        await _logs.AddAsync(new ActivityLog
        {
            Action = "Daily Pipeline Check",
            Reason = $"Flagged {stagnantCount} stagnant and {atRiskCount} at-risk leads.",
            TriggeredBy = LogTrigger.BackgroundJob
        });

        _logger.LogInformation(
            "Daily pipeline check executed at {Timestamp}. Stagnant: {Stagnant}, AtRisk: {AtRisk}",
            DateTime.UtcNow, stagnantCount, atRiskCount);
    }
}
