using System.Linq;
using CRMAgent.Application.Interfaces;
using CRMAgent.Domain.Entities;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace CRMAgent.API.Controllers;

public class ActivityLogDto
{
    public int Id { get; set; }
    public int? LeadId { get; set; }
    public string? LeadName { get; set; }
    public string Action { get; set; } = string.Empty;
    public string Reason { get; set; } = string.Empty;
    public string TriggeredBy { get; set; } = string.Empty;
    public DateTime CreatedAt { get; set; }
}

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
    public async Task<IActionResult> GetAll()
    {
        var logs = await _logs.GetAllAsync();
        return Ok(logs.Select(MapToDto));
    }

    [HttpGet("lead/{id}")]
    public async Task<IActionResult> GetByLead(int id)
    {
        var logs = await _logs.GetByLeadIdAsync(id);
        return Ok(logs.Select(MapToDto));
    }

    private static ActivityLogDto MapToDto(ActivityLog l) => new()
    {
        Id = l.Id,
        LeadId = l.LeadId,
        LeadName = l.Lead?.FullName ?? (l.LeadId.HasValue ? $"Lead #{l.LeadId}" : null),
        Action = l.Action,
        Reason = l.Reason,
        TriggeredBy = l.TriggeredBy.ToString(),
        CreatedAt = l.CreatedAt
    };
}
