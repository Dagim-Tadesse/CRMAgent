using CRMAgent.Application.DTOs;

namespace CRMAgent.Application.Interfaces;

public interface IAIService
{
    Task<LeadScoreResult> ScoreLeadAsync(string inquiryText);
    Task<EmailDraftResult> GenerateDraftAsync(string leadName, string company, string interactionHistory, string channel);
    Task<SentimentResult> AnalyzeSentimentAsync(string content);
}
