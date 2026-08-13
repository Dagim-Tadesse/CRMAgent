using CRMAgent.Infrastructure.Jobs;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace CRMAgent.API.Controllers;

[ApiController]
[Route("api/jobs")]
[Authorize(Roles = "Admin")]
public class JobsController : ControllerBase
{
    private readonly DailyPipelineCheckJob _job;

    public JobsController(DailyPipelineCheckJob job)
    {
        _job = job;
    }

    [HttpPost("run-daily-check")]
    public async Task<IActionResult> RunDailyCheck()
    {
        await _job.ExecuteAsync();
        return Ok(new { message = "Daily pipeline check executed successfully" });
    }
}
