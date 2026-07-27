namespace CRMAgent.Application.DTOs;

public class LeadScoreResult
{
    public int Score { get; set; }
    public string Sentiment { get; set; } = string.Empty;
    public string Emotion { get; set; } = string.Empty;
    public string Intent { get; set; } = string.Empty;
    public string Urgency { get; set; } = string.Empty;
    public string Summary { get; set; } = string.Empty;
}
