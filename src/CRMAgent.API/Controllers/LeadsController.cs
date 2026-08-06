using CRMAgent.Application.UseCases.DeleteLead;
using CRMAgent.Application.UseCases.GetAllLeads;
using CRMAgent.Application.UseCases.GetLeadById;
using CRMAgent.Application.UseCases.IngestLead;
using CRMAgent.Application.UseCases.UpdateLeadStage;
using CRMAgent.Domain.Exceptions;
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

    public LeadsController(IMediator mediator)
    {
        _mediator = mediator;
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

    [HttpPut("{id}/stage")]
    [Authorize(Roles = "SalesRep,Admin")]
    public async Task<IActionResult> UpdateStage(int id, [FromBody] UpdateStageRequest req)
    {
        try
        {
            await _mediator.Send(new UpdateLeadStageCommand(id, req.Stage));
            return Ok(new { message = "Stage updated successfully" });
        }
        catch (LeadNotFoundException ex)
        {
            return NotFound(new { message = ex.Message });
        }
        catch (Exception ex)
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
}

public record IngestLeadRequest(string FullName, string Email, string Company, string RawInquiryText);
public record UpdateStageRequest(string Stage);
