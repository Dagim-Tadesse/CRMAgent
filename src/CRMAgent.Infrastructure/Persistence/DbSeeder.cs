using CRMAgent.Domain.Entities;
using CRMAgent.Domain.Enums;

namespace CRMAgent.Infrastructure.Persistence;

public static class DbSeeder
{
    public static async Task SeedAsync(AppDbContext db)
    {
        // Only seed if the database has no leads
        if (db.Leads.Any()) return;

        var lead1 = new Lead
        {
            FullName = "Jane Doe",
            Email = "jane.doe@example.com",
            Company = "Acme Corp",
            RawInquiryText = "We are looking for a CRM solution that can automate our email responses. What features do you have?",
            PipelineStage = PipelineStage.New,
            Emotion = EmotionType.Neutral,
            Status = LeadStatus.Active,
            AIScore = 8,
            CreatedAt = DateTime.UtcNow.AddDays(-2)
        };

        var lead2 = new Lead
        {
            FullName = "John Smith",
            Email = "john.smith@techstartup.io",
            Company = "Tech Startup IO",
            RawInquiryText = "Your pricing is way too high and the system is confusing! I want a refund.",
            PipelineStage = PipelineStage.Triage,
            Emotion = EmotionType.Frustrated,
            Status = LeadStatus.Active,
            AIScore = 2,
            CreatedAt = DateTime.UtcNow.AddDays(-1)
        };

        var lead3 = new Lead
        {
            FullName = "Alice Johnson",
            Email = "alice@designstudio.com",
            Company = "Design Studio",
            RawInquiryText = "I saw your demo and I'm very excited to try it out. Can we schedule a call?",
            PipelineStage = PipelineStage.Qualified,
            Emotion = EmotionType.Excited,
            Status = LeadStatus.Active,
            AIScore = 9,
            CreatedAt = DateTime.UtcNow.AddHours(-5)
        };

        db.Leads.AddRange(lead1, lead2, lead3);
        await db.SaveChangesAsync();

        // Add some Interactions
        var interaction1 = new Interaction
        {
            LeadId = lead1.Id,
            Channel = InteractionChannel.WebsiteForm,
            Type = InteractionType.Inbound,
            Content = lead1.RawInquiryText,
            Emotion = EmotionType.Neutral,
            Timestamp = lead1.CreatedAt
        };

        var interaction2 = new Interaction
        {
            LeadId = lead2.Id,
            Channel = InteractionChannel.Email,
            Type = InteractionType.Inbound,
            Content = lead2.RawInquiryText,
            Emotion = EmotionType.Frustrated,
            Timestamp = lead2.CreatedAt
        };
        
        db.Interactions.AddRange(interaction1, interaction2);

        // Add some Social Signals
        var signal1 = new SocialSignal
        {
            PlatformSource = SocialPlatform.LinkedIn,
            SignalType = SocialSignalType.Mention,
            Content = "Just tried out the new CRM tools from CRMAgent. Absolute game changer for our team!",
            AuthorName = "Sarah Connor",
            PostReference = "https://linkedin.com/post/12345",
            Sentiment = SentimentType.Positive,
            CreatedAt = DateTime.UtcNow.AddHours(-2)
        };

        var signal2 = new SocialSignal
        {
            PlatformSource = SocialPlatform.LinkedIn,
            SignalType = SocialSignalType.Comment,
            Content = "Does anyone know if they support custom integrations?",
            AuthorName = "Bob Builder",
            PostReference = "https://linkedin.com/post/67890",
            Sentiment = SentimentType.Neutral,
            CreatedAt = DateTime.UtcNow.AddMinutes(-30)
        };

        db.SocialSignals.AddRange(signal1, signal2);
        
        await db.SaveChangesAsync();
    }
}
