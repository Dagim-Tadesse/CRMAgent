using CRMAgent.Domain.Enums;

namespace CRMAgent.Domain.Entities;

public class Interaction
{
    public int Id { get; set; }
    public int LeadId { get; set; }
    public InteractionChannel Channel { get; set; }
    public InteractionType Type { get; set; }
    public string Content { get; set; } = string.Empty;
    public InteractionDirection Direction { get; set; }
    public EmotionType Emotion { get; set; } = EmotionType.Neutral;
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    // Navigation property — points back to the Lead this interaction belongs to
    public Lead Lead { get; set; } = null!;
}