using System.Text;
using System.Text.Json;
using CRMAgent.Application.DTOs;
using CRMAgent.Application.Interfaces;
using CRMAgent.Domain.Exceptions;
using Microsoft.Extensions.Configuration;

namespace CRMAgent.Infrastructure.AI;

public class GeminiService : IAIService
{
    private readonly HttpClient _http;
    private readonly string _apiKey;
    private readonly string _endpoint;

    public GeminiService(IHttpClientFactory httpFactory, IConfiguration config)
    {
        _http = httpFactory.CreateClient();
        _apiKey = config["GeminiSettings:ApiKey"]!;
        _endpoint = config["GeminiSettings:ModelEndpoint"]!;
    }

    public async Task<LeadScoreResult> ScoreLeadAsync(string inquiryText)
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

        return await CallGeminiAsync<LeadScoreResult>(prompt);
    }

    public async Task<EmailDraftResult> GenerateEmailDraftAsync(
        string leadName,
        string company,
        string interactionHistory)
    {
        var prompt = $$"""
You are a professional sales coordinator at a software services company.
Write a personalized follow-up email. Reference the customer's emotions where relevant.
Tone: professional but warm. Length: 3-5 paragraphs.
Return ONLY valid JSON. No markdown. No backticks.

JSON format:
{
  "subject": <max 60 chars>,
  "body": <full email as plain text>,
  "reason": <one sentence why you wrote it this way, max 30 words>
}

Lead: {{leadName}} at {{company}}
Recent interactions (last 5, newest first):
{{interactionHistory}}
""";

        return await CallGeminiAsync<EmailDraftResult>(prompt);
    }

    private async Task<T> CallGeminiAsync<T>(string prompt)
{
    var requestBody = new
    {
        contents = new[] { new { parts = new[] { new { text = prompt } } } },
        generationConfig = new
    {
        thinkingConfig = new { thinkingLevel = "low" }
    }
    };
    var json = JsonSerializer.Serialize(requestBody);

    const int maxRetries = 3;
    for (int attempt = 1; attempt <= maxRetries; attempt++)
    {
        try
        {
            using var request = new HttpRequestMessage(HttpMethod.Post, _endpoint);
            request.Content = new StringContent(json, Encoding.UTF8, "application/json");
            request.Headers.Add("x-goog-api-key", _apiKey);

            var response = await _http.SendAsync(request);
            var responseJson = await response.Content.ReadAsStringAsync();

            if ((int)response.StatusCode is 503 or 429 && attempt < maxRetries)
            {
                await Task.Delay(TimeSpan.FromSeconds(2 * attempt)); // 2s, then 4s
                continue;
            }

            if (!response.IsSuccessStatusCode)
                throw new AIServiceException($"Gemini API error {(int)response.StatusCode}: {responseJson}");

            using var doc = JsonDocument.Parse(responseJson);
            var text = doc.RootElement.GetProperty("candidates")[0]
                .GetProperty("content").GetProperty("parts")[0].GetProperty("text").GetString()!;

            return JsonSerializer.Deserialize<T>(text,
                new JsonSerializerOptions { PropertyNameCaseInsensitive = true })!;
        }
        catch (Exception ex) when (ex is not AIServiceException && attempt < maxRetries)
        {
            await Task.Delay(TimeSpan.FromSeconds(2 * attempt));
        }
    }

    throw new AIServiceException("Gemini API call failed after retries.");
}
}
