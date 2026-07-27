using CRMAgent.Application.DTOs;

namespace CRMAgent.Application.Interfaces;

public interface IAIService
{
    Task<LeadScoreResult> ScoreLeadAsync(string inquiryText);
    Task<EmailDraftResult> GenerateEmailDraftAsync(string leadName, string company, string interactionHistory);
}
