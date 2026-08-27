namespace CRMAgent.Application.DTOs;

public class LeadSummaryDto
{
    public int Id { get; set; }
    public string FullName { get; set; } = string.Empty;
    public string Email { get; set; } = string.Empty;
    public string Company { get; set; } = string.Empty;
    public int AIScore { get; set; }
    public string Emotion { get; set; } = string.Empty;
    public string PipelineStage { get; set; } = string.Empty;
    public string Status { get; set; } = string.Empty;
    public bool IsStagnant { get; set; }
    public bool IsAtRisk { get; set; }
    public DateTime CreatedAt { get; set; }
    public DateTime? LastInteractionAt { get; set; }
    public string Source { get; set; } = string.Empty;
    public string? AssignedTo { get; set; }
}
