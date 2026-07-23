namespace CRMAgent.Domain.Exceptions;

public class LeadNotFoundException : Exception
{
    public LeadNotFoundException(int id)
        : base($"Lead with ID {id} was not found.") { }
}