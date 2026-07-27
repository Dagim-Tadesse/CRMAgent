using CRMAgent.Domain.Entities;
using MediatR;

namespace CRMAgent.Application.UseCases.GetActivityLogs;

public record GetLogsQuery : IRequest<List<ActivityLog>>;
