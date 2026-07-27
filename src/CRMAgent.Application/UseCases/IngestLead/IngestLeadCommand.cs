using MediatR;

namespace CRMAgent.Application.UseCases.IngestLead;

public record IngestLeadCommand(
    string FullName,
    string Email,
    string Company,
    string RawInquiryText) : IRequest<int>;
