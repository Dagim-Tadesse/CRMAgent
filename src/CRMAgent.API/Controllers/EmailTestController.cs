using CRMAgent.Application.Interfaces;
using Microsoft.AspNetCore.Mvc;

namespace CRMAgent.API.Controllers;

[ApiController]
[Route("api/email-test")]
public class EmailTestController : ControllerBase
{
    private readonly IEmailService _emailService;

    public EmailTestController(IEmailService emailService)
    {
        _emailService = emailService;
    }

    [HttpPost("send")]
    public async Task<IActionResult> TestSend([FromBody] TestEmailRequest request)
    {
        try
        {
            await _emailService.SendAsync(request.To, request.Subject, request.Body);
            return Ok(new { message = $"Test email sent successfully to {request.To}!" });
        }
        catch (Exception ex)
        {
            return BadRequest(new { error = ex.Message });
        }
    }
}

public class TestEmailRequest
{
    public string To { get; set; } = string.Empty;
    public string Subject { get; set; } = string.Empty;
    public string Body { get; set; } = string.Empty;
}
