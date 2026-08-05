using CRMAgent.Application.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace CRMAgent.API.Controllers;

[ApiController]
[Route("api/logs")]
[Authorize]
public class LogsController : ControllerBase
{
    private readonly IActivityLogRepository _logs;

    public LogsController(IActivityLogRepository logs)
    {
        _logs = logs;
    }

    [HttpGet]
    public async Task<IActionResult> GetAll() => Ok(await _logs.GetAllAsync());

    [HttpGet("lead/{id}")]
    public async Task<IActionResult> GetByLead(int id) =>
        Ok(await _logs.GetByLeadIdAsync(id));
}
