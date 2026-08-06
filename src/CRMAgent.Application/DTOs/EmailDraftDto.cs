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

    public static EmailDraftDto FromEntity(EmailDraft d) => new()
    {
        Id = d.Id,
        LeadId = d.LeadId,
        LeadName = d.Lead?.FullName ?? string.Empty,
        LeadEmail = d.Lead?.Email ?? string.Empty,
        Subject = d.Subject,
        Body = d.Body,
        Status = d.Status.ToString(),
        AIReason = d.AIReason,
        CreatedAt = d.CreatedAt,
        SentAt = d.SentAt
    };
}
