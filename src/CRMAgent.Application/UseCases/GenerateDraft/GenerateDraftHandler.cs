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

        // Reject existing pending drafts for this lead to ensure only one active
        var existingDrafts = await _drafts.GetByLeadIdAsync(lead.Id) ?? new();
        var pendingDrafts = existingDrafts.Where(d => d.Status == DraftStatus.PendingApproval).ToList();

        foreach (var oldDraft in pendingDrafts)
        {
            oldDraft.Status = DraftStatus.Rejected;
            await _drafts.UpdateAsync(oldDraft);
        }

        var interactions = await _interactions.GetByLeadIdAsync(lead.Id) ?? new();
        var history = interactions.Count > 0
            ? string.Join("\n", interactions.Take(5).Select(i =>
                $"[{i.CreatedAt:u}] {i.Direction}/{i.Channel}: {i.Content}"))
            : lead.RawInquiryText ?? string.Empty;

        string channel = interactions.FirstOrDefault()?.Channel.ToString()
            ?? (!string.IsNullOrEmpty(lead.TelegramUsername) ? "Telegram" : "Email");

        EmailDraftResult result;
        try
        {
            result = await _ai.GenerateDraftAsync(
                lead.FullName ?? string.Empty,
                lead.Company ?? string.Empty,
                history,
                channel);
        }
        catch (Exception ex)
        {
            // Always persist a pending draft so inbound → AI Tasks never goes silent
            _logger.LogError(ex, "AI draft generation failed for lead {LeadId}; saving fallback draft", cmd.LeadId);

            var inboundSnippet = interactions
                .FirstOrDefault(i => i.Direction == InteractionDirection.Inbound)?.Content;
            if (string.IsNullOrWhiteSpace(inboundSnippet))
                inboundSnippet = lead.RawInquiryText;

            result = BuildFallbackDraft(lead.FullName, channel, inboundSnippet, ex.Message);
        }

        if (result == null || (string.IsNullOrWhiteSpace(result.Body) && string.IsNullOrWhiteSpace(result.Subject)))
        {
            _logger.LogWarning("AI returned empty draft for lead {LeadId}; using fallback", cmd.LeadId);
            result = BuildFallbackDraft(lead.FullName, channel, lead.RawInquiryText, "Empty AI response");
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

    private static EmailDraftResult BuildFallbackDraft(
        string? leadName,
        string channel,
        string? inboundSnippet,
        string errorHint)
    {
        var name = string.IsNullOrWhiteSpace(leadName) ? "there" : leadName.Trim();
        var isTelegram = string.Equals(channel, "Telegram", StringComparison.OrdinalIgnoreCase);
        var quoted = string.IsNullOrWhiteSpace(inboundSnippet)
            ? string.Empty
            : Truncate(inboundSnippet.Trim(), 280);

        return new EmailDraftResult
        {
            Subject = isTelegram ? "Telegram Chat" : Truncate($"Re: {quoted}", MaxSubjectLength),
            Body = isTelegram
                ? $"Hi {name}, thanks for your message — we'll follow up shortly."
                : $"Hi {name},\n\nThanks for reaching out. We've received your message and will get back to you shortly.\n\nBest regards",
            Reason = $"Fallback pending draft saved after AI failure: {Truncate(errorHint, 120)}"
        };
    }

    private static string Truncate(string value, int max)
    {
        if (string.IsNullOrEmpty(value) || value.Length <= max) return value ?? string.Empty;
        return value[..max];
    }
}
