namespace CRMAgent.Application.DTOs;

public class EmailDraftResult
{
    public string Subject { get; set; } = string.Empty;
    public string Body { get; set; } = string.Empty;
    public string Reason { get; set; } = string.Empty;
}
