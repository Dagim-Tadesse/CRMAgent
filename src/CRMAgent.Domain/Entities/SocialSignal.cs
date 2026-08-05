using System;
using CRMAgent.Domain.Enums;

namespace CRMAgent.Domain.Entities;

public class SocialSignal
{
    public int Id { get; set; }
    public SocialPlatform PlatformSource { get; set; }
    public SocialSignalType SignalType { get; set; }
    public string? Content { get; set; }
    public string AuthorName { get; set; } = string.Empty;
    public string PostReference { get; set; } = string.Empty;
    public SentimentType Sentiment { get; set; }
    public int? LeadId { get; set; }
    public DateTime CreatedAt { get; set; }
}
