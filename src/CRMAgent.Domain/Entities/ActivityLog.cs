using CRMAgent.Domain.Enums;

namespace CRMAgent.Domain.Entities;

public class ActivityLog
{
    public int Id { get; set; }
    public int? LeadId { get; set; }  // nullable — some logs are system-level
    public string Action { get; set; } = string.Empty;
    public string Reason { get; set; } = string.Empty;
    public LogTrigger TriggeredBy { get; set; }
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    // Nullable navigation — not all logs link to a specific lead
    public Lead? Lead { get; set; }
}