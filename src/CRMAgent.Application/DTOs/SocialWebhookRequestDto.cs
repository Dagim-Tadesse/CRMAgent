using CRMAgent.Domain.Enums;

namespace CRMAgent.Application.DTOs;

public class SocialWebhookRequestDto
{
    public SocialPlatform PlatformSource { get; set; }
    public SocialSignalType SignalType { get; set; }
    public string? Content { get; set; }
    public string AuthorName { get; set; } = string.Empty;
    public string PostReference { get; set; } = string.Empty;
}
