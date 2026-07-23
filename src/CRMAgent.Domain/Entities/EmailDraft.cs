using CRMAgent.Domain.Enums;

namespace CRMAgent.Domain.Entities;

public class EmailDraft
{
    public int Id { get; set; }
    public int LeadId { get; set; }
    public string Subject { get; set; } = string.Empty;
    public string Body { get; set; } = string.Empty;
    public DraftStatus Status { get; set; } = DraftStatus.PendingApproval;
    public string AIReason { get; set; } = string.Empty;
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    public DateTime? SentAt { get; set; }

    public Lead Lead { get; set; } = null!;
}