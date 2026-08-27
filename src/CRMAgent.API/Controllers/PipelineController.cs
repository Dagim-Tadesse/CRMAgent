using System.Security.Claims;
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

    private string GetActorName()
    {
        var email = User.FindFirstValue(ClaimTypes.Email)
                    ?? User.FindFirstValue("email")
                    ?? User.FindFirstValue(ClaimTypes.Name)
                    ?? User.FindFirstValue("name")
                    ?? User.Identity?.Name;
        var role = User.FindFirstValue(ClaimTypes.Role) ?? User.FindFirstValue("role");
        
        if (!string.IsNullOrWhiteSpace(email) && !string.IsNullOrWhiteSpace(role))
            return $"{email} ({role})";
        if (!string.IsNullOrWhiteSpace(email))
            return email;
        if (!string.IsNullOrWhiteSpace(role))
            return role;
        return "Authenticated User";
    }

    [HttpPut("{id}/stage")]
    [Authorize(Roles = "SalesRep,Admin")]
    public async Task<IActionResult> UpdateStage(int id, [FromBody] UpdateStageRequest req)
    {
        try
        {
            var actor = GetActorName();
            await _mediator.Send(new UpdateLeadStageCommand(id, req.Stage, actor));
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
