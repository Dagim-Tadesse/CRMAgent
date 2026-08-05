namespace CRMAgent.Application.Interfaces;

public interface IEmailService
{
    Task SendAsync(string to, string subject, string body);
}
