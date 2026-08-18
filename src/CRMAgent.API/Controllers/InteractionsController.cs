using CRMAgent.Application.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace CRMAgent.API.Controllers;

[ApiController]
[Authorize]
public class InteractionsController : ControllerBase
{
    private readonly IInteractionRepository _interactions;

    public InteractionsController(IInteractionRepository interactions)
    {
        _interactions = interactions;
    }

    [HttpGet("api/leads/{id}/interactions")]
    public async Task<IActionResult> GetByLead(int id)
    {
        var interactions = await _interactions.GetByLeadIdAsync(id);
        return Ok(interactions);
    }
}
