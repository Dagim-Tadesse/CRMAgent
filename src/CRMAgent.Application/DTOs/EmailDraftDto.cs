using CRMAgent.Domain.Entities;

namespace CRMAgent.Application.DTOs;

public class EmailDraftDto
{
    public int Id { get; set; }
    public int LeadId { get; set; }
    public string LeadName { get; set; } = string.Empty;
    public string LeadEmail { get; set; } = string.Empty;
    public string Subject { get; set; } = string.Empty;
    public string Body { get; set; } = string.Empty;
    public string Status { get; set; } = string.Empty;
    public string AIReason { get; set; } = string.Empty;
    public DateTime CreatedAt { get; set; }
    public DateTime? SentAt { get; set; }
    /// <summary>Most recent inbound message that prompted this draft (optional).</summary>
    public string? TriggerMessage { get; set; }
    public string? PipelineStage { get; set; }
    public string EscalationStatus { get; set; } = string.Empty;
    public string? EscalationNote { get; set; }
    public string? ManagerFeedback { get; set; }

    public static EmailDraftDto FromEntity(EmailDraft d) => new()
    {
        Id = d.Id,
        LeadId = d.LeadId,
        LeadName = d.Lead?.FullName ?? string.Empty,
        LeadEmail = d.Lead?.Email ?? string.Empty,
        Subject = d.Subject ?? string.Empty,
        Body = d.Body ?? string.Empty,
        Status = d.Status.ToString(),
        AIReason = d.AIReason ?? string.Empty,
        CreatedAt = d.CreatedAt,
        SentAt = d.SentAt,
        PipelineStage = d.Lead?.PipelineStage.ToString(),
        EscalationStatus = d.EscalationStatus.ToString(),
        EscalationNote = d.EscalationNote,
        ManagerFeedback = d.ManagerFeedback
    };
}
