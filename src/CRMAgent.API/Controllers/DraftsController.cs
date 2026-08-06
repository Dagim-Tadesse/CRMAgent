using CRMAgent.Application.UseCases.ApproveDraft;
using CRMAgent.Application.UseCases.EditDraft;
using CRMAgent.Application.UseCases.GenerateDraft;
using CRMAgent.Application.UseCases.GetLeadDrafts;
using CRMAgent.Application.UseCases.GetPendingDrafts;
using CRMAgent.Application.UseCases.RejectDraft;
using CRMAgent.Domain.Exceptions;
using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace CRMAgent.API.Controllers;

[ApiController]
[Authorize]
public class DraftsController : ControllerBase
{
    private readonly IMediator _mediator;

    public DraftsController(IMediator mediator)
    {
        _mediator = mediator;
    }

    [HttpGet("api/leads/{id}/drafts")]
    public async Task<IActionResult> GetByLead(int id) =>
        Ok(await _mediator.Send(new GetLeadDraftsQuery(id)));

    [HttpPost("api/leads/{id}/drafts/generate")]
    [Authorize(Roles = "SalesRep,Admin")]
    public async Task<IActionResult> Generate(int id)
    {
        try
        {
            var draftId = await _mediator.Send(new GenerateDraftCommand(id));
            return Ok(new { draftId, message = "Draft generated successfully" });
        }
        catch (LeadNotFoundException ex)
        {
            return NotFound(new { message = ex.Message });
        }
        catch (InvalidOperationException ex)
        {
            return BadRequest(new { message = ex.Message });
        }
    }

    [HttpPut("api/drafts/{id}")]
    [Authorize(Roles = "SalesRep,Admin")]
    public async Task<IActionResult> Edit(int id, [FromBody] EditDraftRequest req)
    {
        try
        {
            await _mediator.Send(new EditDraftCommand(id, req.Subject, req.Body));
            return Ok(new { message = "Draft updated successfully" });
        }
        catch (InvalidOperationException ex)
        {
            return BadRequest(new { message = ex.Message });
        }
    }

    [HttpPut("api/drafts/{id}/approve")]
    [Authorize(Roles = "SalesRep,Admin")]
    public async Task<IActionResult> Approve(int id)
    {
        try
        {
            var result = await _mediator.Send(new ApproveDraftCommand(id));
            if (!result.Success)
            {
                return BadRequest(new { message = result.Message });
            }

            return Ok(new { message = result.Message });
        }
        catch (InvalidOperationException ex)
        {
            return BadRequest(new { message = ex.Message });
        }
    }

    [HttpPut("api/drafts/{id}/reject")]
    [Authorize(Roles = "SalesRep,Admin")]
    public async Task<IActionResult> Reject(int id)
    {
        try
        {
            await _mediator.Send(new RejectDraftCommand(id));
            return Ok(new { message = "Draft rejected successfully" });
        }
        catch (InvalidOperationException ex)
        {
            return BadRequest(new { message = ex.Message });
        }
    }

    [HttpGet("api/tasks/pending")]
    public async Task<IActionResult> GetPending() =>
        Ok(await _mediator.Send(new GetPendingDraftsQuery()));
}

public record EditDraftRequest(string Subject, string Body);
