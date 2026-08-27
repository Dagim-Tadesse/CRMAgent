using CRMAgent.Domain.Enums;

namespace CRMAgent.Domain.Entities;

public class Lead
{
    public int Id { get; set; }
    public string FullName { get; set; } = string.Empty;
    public string Email { get; set; } = string.Empty;
    public string Company { get; set; } = string.Empty;
    public string? TelegramUsername { get; set; }
    public long? TelegramChatId { get; set; }
    public string? AssignedTo { get; set; }
    public string RawInquiryText { get; set; } = string.Empty;
    public int AIScore { get; set; } = 0;
    public EmotionType Emotion { get; set; } = EmotionType.Neutral;
    public PipelineStage PipelineStage { get; set; } = PipelineStage.New;
    public LeadStatus Status { get; set; } = LeadStatus.Active;
    public bool IsStagnant { get; set; } = false;
    public bool IsAtRisk { get; set; } = false;
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    public DateTime? LastInteractionAt { get; set; }

    // Navigation properties — EF Core uses these to understand relationships
    public ICollection<Interaction> Interactions { get; set; } = new List<Interaction>();
    public ICollection<EmailDraft> EmailDrafts { get; set; } = new List<EmailDraft>();
    public ICollection<ActivityLog> ActivityLogs { get; set; } = new List<ActivityLog>();
}