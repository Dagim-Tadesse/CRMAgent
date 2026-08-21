using System.Text;
using System.Text.Json;
using CRMAgent.Application.DTOs;
using CRMAgent.Application.Interfaces;
using CRMAgent.Domain.Exceptions;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.Logging;

namespace CRMAgent.Infrastructure.AI;

public class GeminiService : IAIService
{
    public const string HttpClientName = "Gemini";

    private readonly HttpClient _http;
    private readonly string _apiKey;
    private readonly string _endpoint;
    private readonly ILogger<GeminiService> _logger;

    public GeminiService(IHttpClientFactory httpFactory, IConfiguration config, ILogger<GeminiService> logger)
    {
        _http = httpFactory.CreateClient(HttpClientName);
        _logger = logger;
        _apiKey = config["GeminiSettings:ApiKey"] ?? string.Empty;
        _endpoint = config["GeminiSettings:ModelEndpoint"] ?? string.Empty;

        if (string.IsNullOrWhiteSpace(_apiKey) || _apiKey.StartsWith("REPLACE_", StringComparison.OrdinalIgnoreCase))
            _logger.LogError("GeminiSettings:ApiKey is missing or still a placeholder");
        if (string.IsNullOrWhiteSpace(_endpoint) || _endpoint.StartsWith("REPLACE_", StringComparison.OrdinalIgnoreCase))
            _logger.LogError("GeminiSettings:ModelEndpoint is missing or still a placeholder");
    }

    public Task<LeadScoreResult> ScoreLeadAsync(string inquiryText)
    {
        var prompt = $$"""
You are a sales analyst AI for a software services company.
Analyze this inquiry and return ONLY valid JSON. No markdown. No backticks.

JSON format:
{
  "score": <integer 1-10>,
  "sentiment": <"positive"|"neutral"|"negative">,
  "emotion": <"excited"|"frustrated"|"confused"|"satisfied"|"neutral">,
  "intent": <"buying"|"researching"|"complaint"|"support"|"other">,
  "urgency": <"high"|"medium"|"low">,
  "summary": <one sentence max 30 words>
}

Inquiry: {{inquiryText}}
""";

        return CallGeminiAsync<LeadScoreResult>(prompt);
    }

    public Task<EmailDraftResult> GenerateDraftAsync(
        string leadName,
        string company,
        string interactionHistory,
        string channel)
    {
        string promptInstructions = channel == "Telegram"
            ? "Write a very short, direct, and conversational chat message for Telegram (max 1-2 sentences). Do NOT write an email format (no subject line needed in body, no formal sign-offs)."
            : "Write a personalized follow-up email. Reference the customer's emotions where relevant. Tone: professional but warm. Length: 3-5 paragraphs.";

        var prompt = $$"""
You are a professional sales coordinator at a software services company.
{{promptInstructions}}
Return ONLY valid JSON. No markdown. No backticks.

JSON format:
{
  "subject": <max 60 chars, if telegram just use "Telegram Chat">,
  "body": <the full response as plain text>,
  "reason": <one sentence why you wrote it this way, max 30 words>
}

Lead: {{leadName}} at {{company}}
Channel: {{channel}}
Recent interactions (last 5, newest first):
{{interactionHistory}}
""";

        return CallGeminiAsync<EmailDraftResult>(prompt);
    }

    public Task<SentimentResult> AnalyzeSentimentAsync(string content)
    {
        var prompt = $$"""
You are a sentiment classifier for social media comments and mentions about a company.
Analyze this text and return ONLY valid JSON. No markdown. No backticks.

JSON format:
{
  "sentiment": <"positive"|"negative"|"neutral">
}

Text: {{content}}
""";

        return CallGeminiAsync<SentimentResult>(prompt);
    }

    private async Task<T> CallGeminiAsync<T>(string prompt)
    {
        if (string.IsNullOrWhiteSpace(_apiKey) || _apiKey.StartsWith("REPLACE_", StringComparison.OrdinalIgnoreCase))
            throw new AIServiceException("Gemini API key is missing or invalid. Set GeminiSettings:ApiKey.");

        if (string.IsNullOrWhiteSpace(_endpoint))
            throw new AIServiceException("Gemini model endpoint is not configured (GeminiSettings:ModelEndpoint).");

        // Match the proven request shape used by successful initial generation:
        // contents + parts only. Do NOT send thinkingBudget/thinkingLevel — gemini-3.5-flash-lite
        // returns HTTP 400 INVALID_ARGUMENT for those fields.
        var requestBody = new
        {
            contents = new[] { new { parts = new[] { new { text = prompt } } } }
        };
        var json = JsonSerializer.Serialize(requestBody);
        var url = $"{_endpoint}?key={_apiKey}";
        var keyHint = _apiKey.Length > 8 ? _apiKey[..4] + "…" : "(short)";

        const int maxRetries = 2; // one retry only for transient 429/503
        for (int attempt = 1; attempt <= maxRetries; attempt++)
        {
            try
            {
                _logger.LogInformation(
                    "Gemini request attempt {Attempt}/{Max} endpoint={Endpoint} key={KeyHint} timeout={Timeout}",
                    attempt, maxRetries, _endpoint, keyHint, _http.Timeout);

                using var request = new HttpRequestMessage(HttpMethod.Post, url);
                request.Content = new StringContent(json, Encoding.UTF8, "application/json");

                using var response = await _http.SendAsync(request);
                var responseJson = await response.Content.ReadAsStringAsync();
                var code = (int)response.StatusCode;

                _logger.LogInformation(
                    "Gemini response attempt {Attempt}: HTTP {Status} bodyLen={Len}",
                    attempt, code, responseJson?.Length ?? 0);

                if (code is 429 or 503)
                {
                    var friendly = MapGeminiHttpError(code, responseJson);
                    _logger.LogWarning("Gemini transient error: {Message}", friendly);
                    if (attempt < maxRetries)
                    {
                        await Task.Delay(TimeSpan.FromSeconds(2 * attempt));
                        continue;
                    }

                    throw new AIServiceException(friendly);
                }

                if (!response.IsSuccessStatusCode)
                {
                    var friendly = MapGeminiHttpError(code, responseJson);
                    _logger.LogError("Gemini API error: {Message} raw={Raw}", friendly, Truncate(responseJson, 500));
                    throw new AIServiceException(friendly);
                }

                using var doc = JsonDocument.Parse(responseJson);
                if (!doc.RootElement.TryGetProperty("candidates", out var candidates)
                    || candidates.GetArrayLength() == 0)
                {
                    // Blocked / empty — often safety or quota quirks
                    var block = doc.RootElement.TryGetProperty("promptFeedback", out var fb)
                        ? fb.ToString()
                        : Truncate(responseJson, 300);
                    throw new AIServiceException($"Gemini returned no candidates. Feedback: {block}");
                }

                var text = candidates[0]
                    .GetProperty("content").GetProperty("parts")[0].GetProperty("text").GetString()
                    ?? string.Empty;

                var cleaned = StripMarkdownFences(text);
                var parsed = JsonSerializer.Deserialize<T>(cleaned,
                    new JsonSerializerOptions { PropertyNameCaseInsensitive = true });

                if (parsed is null)
                    throw new AIServiceException("Gemini returned empty or unparsable JSON for the draft.");

                return parsed;
            }
            catch (AIServiceException)
            {
                throw;
            }
            catch (TaskCanceledException ex) when (!ex.CancellationToken.IsCancellationRequested)
            {
                _logger.LogError(ex, "Gemini HTTP timeout after {Timeout}", _http.Timeout);
                throw new AIServiceException(
                    $"Gemini API timed out after {_http.Timeout.TotalSeconds:0}s. The model may be overloaded — try again shortly.");
            }
            catch (HttpRequestException ex)
            {
                _logger.LogError(ex, "Gemini network error");
                throw new AIServiceException("Could not reach Gemini API (network error).");
            }
            catch (Exception ex) when (attempt < maxRetries)
            {
                _logger.LogWarning(ex, "Gemini attempt {Attempt} failed; retrying", attempt);
                await Task.Delay(TimeSpan.FromSeconds(2 * attempt));
            }
        }

        throw new AIServiceException("Gemini API call failed after retries.");
    }

    private static string MapGeminiHttpError(int statusCode, string? body)
    {
        var snippet = Truncate(body, 400);
        return statusCode switch
        {
            401 or 403 =>
                $"Gemini API key rejected (HTTP {statusCode}). Check GeminiSettings:ApiKey in appsettings. Detail: {snippet}",
            429 =>
                $"Gemini API rate limit / quota exceeded (HTTP 429). Wait and retry, or check Google AI Studio quotas. Detail: {snippet}",
            400 =>
                $"Gemini bad request (HTTP 400) — model/endpoint or request shape may be wrong. Detail: {snippet}",
            404 =>
                $"Gemini model not found (HTTP 404). Check GeminiSettings:ModelEndpoint. Detail: {snippet}",
            _ =>
                $"Gemini API error HTTP {statusCode}: {snippet}"
        };
    }

    private static string Truncate(string? value, int max)
    {
        if (string.IsNullOrEmpty(value)) return string.Empty;
        return value.Length <= max ? value : value[..max] + "…";
    }

    private static string StripMarkdownFences(string text)
    {
        if (string.IsNullOrWhiteSpace(text)) return text ?? string.Empty;
        var trimmed = text.Trim();
        if (!trimmed.StartsWith("```", StringComparison.Ordinal)) return trimmed;

        var firstNewline = trimmed.IndexOf('\n');
        if (firstNewline < 0) return trimmed.Trim('`');

        trimmed = trimmed[(firstNewline + 1)..];
        var fence = trimmed.LastIndexOf("```", StringComparison.Ordinal);
        if (fence >= 0) trimmed = trimmed[..fence];
        return trimmed.Trim();
    }
}
