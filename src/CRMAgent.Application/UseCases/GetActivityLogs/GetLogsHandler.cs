using CRMAgent.Application.Interfaces;
using CRMAgent.Domain.Entities;
using MediatR;

namespace CRMAgent.Application.UseCases.GetActivityLogs;

public class GetLogsHandler : IRequestHandler<GetLogsQuery, List<ActivityLog>>
{
    private readonly IActivityLogRepository _logs;

    public GetLogsHandler(IActivityLogRepository logs)
    {
        _logs = logs;
    }

    public async Task<List<ActivityLog>> Handle(GetLogsQuery request, CancellationToken ct)
    {
        return await _logs.GetAllAsync();
    }
}
