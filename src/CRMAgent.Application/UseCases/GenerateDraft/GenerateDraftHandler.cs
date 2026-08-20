using CRMAgent.Application.DTOs;
using CRMAgent.Application.Interfaces;
using CRMAgent.Domain.Entities;
using CRMAgent.Domain.Enums;
using CRMAgent.Domain.Exceptions;
using MediatR;
using Microsoft.Extensions.Logging;

namespace CRMAgent.Application.UseCases.GenerateDraft;

public class GenerateDraftHandler : IRequestHandler<GenerateDraftCommand, int>
{
    private const int MaxSubjectLength = 100;

    private readonly ILeadRepository _leads;
    private readonly IInteractionRepository _interactions;
    private readonly IEmailDraftRepository _drafts;
    private readonly IActivityLogRepository _logs;
    private readonly IAIService _ai;
    private readonly ILogger<GenerateDraftHandler> _logger;

    public GenerateDraftHandler(
        ILeadRepository leads,
        IInteractionRepository interactions,
        IEmailDraftRepository drafts,
        IActivityLogRepository logs,
        IAIService ai,
        ILogger<GenerateDraftHandler> logger)
    {
        _leads = leads;
        _interactions = interactions;
        _drafts = drafts;
        _logs = logs;
        _ai = ai;
        _logger = logger;
    }

    public async Task<int> Handle(GenerateDraftCommand cmd, CancellationToken ct)
    {
        var lead = await _leads.GetByIdAsync(cmd.LeadId)
            ?? throw new LeadNotFoundException(cmd.LeadId);

        var interactions = await _interactions.GetByLeadIdAsync(lead.Id) ?? new();
        var history = interactions.Count > 0
            ? string.Join("\n", interactions.Take(5).Select(i =>
                $"[{i.CreatedAt:u}] {i.Direction}/{i.Channel}: {i.Content}"))
            : lead.RawInquiryText ?? string.Empty;

        string channel = interactions.FirstOrDefault()?.Channel.ToString()
            ?? (!string.IsNullOrEmpty(lead.TelegramUsername) ? "Telegram" : "Email");

        // Call Gemini FIRST — never reject the existing pending draft until we have a replacement.
        // (Rejecting first caused AI Tasks cards to vanish when Regenerate failed with HTTP 400.)
        EmailDraftResult result;
        try
        {
            result = await _ai.GenerateDraftAsync(
                lead.FullName ?? string.Empty,
                lead.Company ?? string.Empty,
                history,
                channel);
        }
        catch (AIServiceException ex)
        {
            _logger.LogError(ex, "AI draft generation failed for lead {LeadId}: {Message}", cmd.LeadId, ex.Message);
            throw;
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Unexpected error during AI draft generation for lead {LeadId}", cmd.LeadId);
            throw new AIServiceException($"Draft generation failed: {ex.Message}", ex);
        }

        if (result == null || (string.IsNullOrWhiteSpace(result.Body) && string.IsNullOrWhiteSpace(result.Subject)))
        {
            _logger.LogWarning("AI returned empty draft for lead {LeadId}", cmd.LeadId);
            throw new AIServiceException("Gemini returned an empty draft. Please try Regenerate again.");
        }

        // Only now retire older pending drafts and save the new one
        var existingDrafts = await _drafts.GetByLeadIdAsync(lead.Id) ?? new();
        var pendingDrafts = existingDrafts.Where(d => d.Status == DraftStatus.PendingApproval).ToList();
        foreach (var oldDraft in pendingDrafts)
        {
            oldDraft.Status = DraftStatus.Rejected;
            await _drafts.UpdateAsync(oldDraft);
        }

        var draft = new EmailDraft
        {
            LeadId = lead.Id,
            Subject = Truncate(result.Subject ?? string.Empty, MaxSubjectLength),
            Body = result.Body ?? string.Empty,
            AIReason = result.Reason ?? string.Empty,
            Status = DraftStatus.PendingApproval,
            CreatedAt = DateTime.UtcNow
        };

        await _drafts.AddAsync(draft);

        await _logs.AddAsync(new ActivityLog
        {
            LeadId = lead.Id,
            Action = "Draft Generated",
            Reason = result.Reason ?? "AI draft generated",
            TriggeredBy = LogTrigger.Agent,
            CreatedAt = DateTime.UtcNow
        });

        _logger.LogInformation(
            "Generated pending draft {DraftId} for lead {LeadId} via {Channel} (status={Status})",
            draft.Id, lead.Id, channel, draft.Status);

        return draft.Id;
    }

    private static string Truncate(string value, int max)
    {
        if (string.IsNullOrEmpty(value) || value.Length <= max) return value ?? string.Empty;
        return value[..max];
    }
}
