using CRMAgent.Application.UseCases.UpdateLeadStage;
using CRMAgent.Domain.Exceptions;
using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace CRMAgent.API.Controllers;

[ApiController]
[Route("api/leads")]
[Authorize]
public class PipelineController : ControllerBase
{
    private readonly IMediator _mediator;

    public PipelineController(IMediator mediator)
    {
        _mediator = mediator;
    }

    [HttpPut("{id}/stage")]
    [Authorize(Roles = "SalesRep,Admin,Manager,SocialMediaRep")]
    public async Task<IActionResult> UpdateStage(int id, [FromBody] UpdateStageRequest req)
    {
        try
        {
            await _mediator.Send(new UpdateLeadStageCommand(id, req.Stage));
            return Ok(new
            {
                message = "Stage updated successfully",
                leadId = id,
                newStage = req.Stage
            });
        }
        catch (LeadNotFoundException ex)
        {
            return NotFound(new { message = ex.Message });
        }
        catch (ArgumentException ex)
        {
            return BadRequest(new { message = ex.Message });
        }
    }
}

public record UpdateStageRequest(string Stage);
