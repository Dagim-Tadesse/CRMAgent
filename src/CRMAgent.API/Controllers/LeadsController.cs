using CRMAgent.Application.Interfaces;
using CRMAgent.Application.UseCases.DeleteLead;
using CRMAgent.Application.UseCases.GetAllLeads;
using CRMAgent.Application.UseCases.GetLeadById;
using CRMAgent.Application.UseCases.IngestLead;
using CRMAgent.Application.UseCases.UpdateLeadStage;
using CRMAgent.Domain.Entities;
using CRMAgent.Domain.Enums;
using CRMAgent.Domain.Exceptions;
using CRMAgent.Infrastructure.Persistence;
using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace CRMAgent.API.Controllers;

[ApiController]
[Route("api/leads")]
[Authorize]
public class LeadsController : ControllerBase
{
    private readonly IMediator _mediator;
    private readonly AppDbContext _db;

    public LeadsController(IMediator mediator, AppDbContext db)
    {
        _mediator = mediator;
        _db = db;
    }

    [HttpPost("seed-mock-data")]
    [AllowAnonymous]
    public async Task<IActionResult> SeedMockData()
    {
        try
        {
            await DbSeeder.SeedAsync(_db, force: true);
            return Ok(new { message = "Successfully seeded 50 mock leads with related interactions, drafts, signals, and activity logs." });
        }
        catch (Exception ex)
        {
            return StatusCode(500, new { message = "Error seeding database", error = ex.Message });
        }
    }

    [HttpGet]
    public async Task<IActionResult> GetAll() =>
        Ok(await _mediator.Send(new GetAllLeadsQuery()));

    [HttpGet("{id}")]
    public async Task<IActionResult> GetById(int id)
    {
        try
        {
            return Ok(await _mediator.Send(new GetLeadByIdQuery(id)));
        }
        catch (LeadNotFoundException ex)
        {
            return NotFound(new { message = ex.Message });
        }
    }

    [HttpPost]
    [AllowAnonymous]
    public async Task<IActionResult> Ingest([FromBody] IngestLeadRequest req)
    {
        try
        {
            var id = await _mediator.Send(new IngestLeadCommand(
                req.FullName,
                req.Email,
                req.Company,
                req.RawInquiryText));

            return CreatedAtAction(nameof(GetById), new { id },
                new { id, message = "Lead created successfully" });
        }
        catch (InvalidOperationException ex)
        {
            return BadRequest(new { message = ex.Message });
        }
    }

    [HttpDelete("{id}")]
    [Authorize(Roles = "Admin")]
    public async Task<IActionResult> Delete(int id)
    {
        try
        {
            await _mediator.Send(new DeleteLeadCommand(id));
            return NoContent();
        }
        catch (LeadNotFoundException ex)
        {
            return NotFound(new { message = ex.Message });
        }
    }

    [HttpPost("re-score-pending")]
    [AllowAnonymous]
    public async Task<IActionResult> ReScorePending(
        [FromServices] AppDbContext db,
        [FromServices] IAIService ai,
        [FromServices] IActivityLogRepository logs)
    {
        var pendingLeads = db.Leads.Where(l => l.Status == LeadStatus.PendingManualTriage).ToList();
        int count = 0;
        foreach (var lead in pendingLeads)
        {
            try
            {
                var result = await ai.ScoreLeadAsync(lead.RawInquiryText);
                lead.AIScore = result.Score;
                lead.Emotion = Enum.Parse<EmotionType>(result.Emotion, true);
                lead.Status = LeadStatus.Active;
                if (result.Score >= 7)
                {
                    lead.PipelineStage = PipelineStage.Contacted;
                }
                db.Leads.Update(lead);

                await logs.AddAsync(new ActivityLog
                {
                    LeadId = lead.Id,
                    Action = "Lead Re-Scored",
                    Reason = $"AI Re-Score: {result.Score}/10. Emotion: {result.Emotion}. {result.Summary}",
                    TriggeredBy = LogTrigger.Agent
                });
                count++;
            }
            catch (Exception ex)
            {
                Console.WriteLine($"Error re-scoring lead {lead.Id}: {ex.Message}");
            }
        }
        await db.SaveChangesAsync();
        return Ok(new { message = $"{count} leads successfully re-scored by Gemini AI." });
    }
}

public record IngestLeadRequest(string FullName, string Email, string Company, string RawInquiryText);