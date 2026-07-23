using Microsoft.Extensions.Logging;

namespace CRMAgent.Infrastructure.Jobs;

public class DailyPipelineCheckJob
{
    private readonly ILogger<DailyPipelineCheckJob> _logger;

    public DailyPipelineCheckJob(ILogger<DailyPipelineCheckJob> logger)
    {
        _logger = logger;
    }

    public Task ExecuteAsync()
    {
        _logger.LogInformation("Daily pipeline check executed at {Timestamp}", DateTime.UtcNow);
        return Task.CompletedTask;
    }
}
