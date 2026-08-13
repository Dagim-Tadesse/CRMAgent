using CRMAgent.Domain.Entities;
using CRMAgent.Domain.Enums;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace CRMAgent.Infrastructure.Persistence;

public static class DbSeeder
{
    public static async Task SeedAsync(AppDbContext db, bool force = false)
    {
        // Only seed if our mock data isn't already there (unless force is true)
        if (!force && db.Leads.Any()) return;

        if (force)
        {
            db.ActivityLogs.RemoveRange(db.ActivityLogs);
            db.EmailDrafts.RemoveRange(db.EmailDrafts);
            db.Interactions.RemoveRange(db.Interactions);
            db.SocialSignals.RemoveRange(db.SocialSignals);
            db.Leads.RemoveRange(db.Leads);
            await db.SaveChangesAsync();
        }

        var random = new Random(42); // Seed for deterministic generation

        var firstNames = new[] { "Sarah", "John", "Alice", "Robert", "Emily", "Michael", "Jessica", "David", "Ashley", "James", "Amanda", "Joseph", "Jennifer", "Charles", "Megan", "Thomas", "Nicole", "Daniel", "Rachel", "Matthew", "Brian", "Laura", "Kevin", "Susan", "Daniel", "Karen", "Jason", "Betty", "Jeffrey", "Lisa", "Mark", "Dorothy", "Paul", "Sandra", "Steven", "Donna", "Andrew", "Carol", "Kenneth", "Michelle", "Joshua", "Sharon", "George", "Abby", "Frank", "Debbie", "Edward", "Valerie", "Raymond", "Zoe" };
        var lastNames = new[] { "Smith", "Johnson", "Williams", "Brown", "Jones", "Miller", "Davis", "Garcia", "Rodriguez", "Wilson", "Martinez", "Anderson", "Taylor", "Thomas", "Hernandez", "Moore", "Martin", "Jackson", "Thompson", "White", "Lopez", "Lee", "Gonzalez", "Harris", "Clark", "Lewis", "Robinson", "Walker", "Perez", "Hall", "Young", "Allen", "Sanchez", "Wright", "King", "Scott", "Green", "Baker", "Adams", "Nelson", "Hill", "Ramirez", "Campbell", "Mitchell", "Roberts", "Carter", "Phillips", "Evans", "Turner", "Torres" };
        var companies = new[] { "Acme Corp", "Globex Corporation", "Initech", "Umbrella Corp", "Veerdy Inc", "Hooli", "Soylent Corp", "Wonka Industries", "Stark Industries", "Wayne Enterprises", "Cyberdyne Systems", "Tyrell Corp", "Oscorp", "Sledge Hammer Inc", "Aperture Science", "Sterling Cooper", "Dunder Mifflin", "Parks & Rec", "Prestige Worldwide", "Entertainment 720" };
        var domains = new[] { "gmail.com", "outlook.com", "yahoo.com", "techstartup.io", "corporation.com", "salesforce.com", "business.net", "innovate.org" };

        var emailInquiries = new[]
        {
            "Hello, we are interested in migrating our CRM data. Can you provide a demo and pricing details for 25 seats?",
            "Hi, is there an active API for CRM integration? We want to connect our web hooks to automatically score incoming leads.",
            "I saw your social media automation workflows. Do you support auto-draft replies for Twitter mentions or only LinkedIn?",
            "The system keeps giving me an authentication error on login. Can you check my account settings?",
            "Looking for enterprise-tier compliance reports. Do you support HIPAA or SOC2 auditing?",
            "Hi, I noticed some inconsistency in the report dashboards. The sentiment analysis totals don't match the list view. Is this a bug?",
            "We want to schedule a product walkthrough for our sales representatives next Wednesday.",
            "Hey, is it possible to connect multiple Telegram channels to the same scoring agent?",
            "Can we customize the scoring criteria for AI lead classification? Some high-value leads are showing up as low priority.",
            "Please send the cancellation form. We decided to go with another competitor."
        };

        var telegramInquiries = new[]
        {
            "Hey there, what are the pricing plans for startups?",
            "Can you help me connect the bot to my CRM group?",
            "Is anyone online to answer a quick setup question?",
            "I want to book a demo of the auto-responder feature.",
            "Does the system support custom webhooks?",
            "Hello! I am a SalesRep at my company and wanted to know about team roles.",
            "I'm testing the inbound email webhook, is there a latency?",
            "Are there any open source plugins for n8n in your repo?",
            "Hey, how does the AI sentiment scoring handle sarcasm?",
            "Can you add my email to the newsletter list?"
        };

        var webFormInquiries = new[]
        {
            "Inquiry from our homepage: Looking for custom development options.",
            "WebForm Submission: Requesting a quote for 10 users.",
            "Contact Form: Interested in your partner program.",
            "Homepage Request: Need assistance with setting up n8n workflows.",
            "Form Submission: How is my data secured? Do you run on PostgreSQL?"
        };

        var socialComments = new[]
        {
            "Just deployed CRMAgent on Render. It was super simple to link it to Supabase!",
            "Any updates on the Telegram webhook auto-replies? We really need this.",
            "Love the clean aesthetics of the dashboard page! Great job on the UI.",
            "Is the AI sentiment analysis running locally or via external APIs?",
            "Had some errors with SQLite locks, but migrating to PostgreSQL resolved it.",
            "Can we get a feature to export reports to CSV? That would be very useful.",
            "Highly impressed by the n8n automation workflow setup in the docker compose file.",
            "Wait, does the Telegram bot support rich text messages or markdown?",
            "Is the React frontend using Tailwind or plain CSS?",
            "Our marketing team is seeing great results since we started tracking social signals."
        };

        var emotions = new[] { EmotionType.Neutral, EmotionType.Excited, EmotionType.Frustrated, EmotionType.Confused, EmotionType.Satisfied };
        var stages = new[] { PipelineStage.New, PipelineStage.Contacted, PipelineStage.Qualified, PipelineStage.ProposalSent, PipelineStage.Negotiation, PipelineStage.Won, PipelineStage.Lost };

        var leads = new List<Lead>();
        var interactions = new List<Interaction>();
        var socialSignals = new List<SocialSignal>();
        var drafts = new List<EmailDraft>();
        var logs = new List<ActivityLog>();

        for (int i = 0; i < 50; i++)
        {
            var firstName = firstNames[random.Next(firstNames.Length)];
            var lastName = lastNames[random.Next(lastNames.Length)];
            var fullName = $"{firstName} {lastName}";
            var company = companies[random.Next(companies.Length)];
            var domain = domains[random.Next(domains.Length)];
            var email = $"{firstName.ToLower()}.{lastName.ToLower()}@{domain}";

            // Decide Channel / Source (Email, Telegram, WebForm)
            var channelIndex = random.Next(3); // 0 = Email, 1 = Telegram, 2 = WebForm
            var channel = (InteractionChannel)channelIndex;

            string inquiryText;
            string? telegramUsername = null;

            if (channel == InteractionChannel.Email)
            {
                inquiryText = emailInquiries[random.Next(emailInquiries.Length)];
            }
            else if (channel == InteractionChannel.Telegram)
            {
                inquiryText = telegramInquiries[random.Next(telegramInquiries.Length)];
                telegramUsername = $"@{firstName.ToLower()}_{lastName.ToLower()}{random.Next(10, 99)}";
            }
            else
            {
                inquiryText = webFormInquiries[random.Next(webFormInquiries.Length)];
            }

            var aiScore = random.Next(1, 11); // 1 to 10
            var emotion = emotions[random.Next(emotions.Length)];
            var stage = stages[random.Next(stages.Length)];

            // Make closed ones have higher scores generally, lost have lower
            if (stage == PipelineStage.Won) aiScore = random.Next(8, 11);
            if (stage == PipelineStage.Lost) aiScore = random.Next(1, 4);

            var createdDate = DateTime.UtcNow.AddDays(-random.Next(1, 30)).AddHours(-random.Next(1, 24));

            var lead = new Lead
            {
                FullName = fullName,
                Email = email,
                Company = company,
                TelegramUsername = telegramUsername,
                RawInquiryText = inquiryText,
                AIScore = aiScore,
                Emotion = emotion,
                PipelineStage = stage,
                Status = stage == PipelineStage.Lost ? LeadStatus.PendingManualTriage : LeadStatus.Active,
                IsStagnant = stage != PipelineStage.Won && stage != PipelineStage.Lost && random.Next(10) == 0,
                IsAtRisk = stage != PipelineStage.Won && stage != PipelineStage.Lost && emotion == EmotionType.Frustrated,
                CreatedAt = createdDate,
                LastInteractionAt = createdDate.AddHours(random.Next(1, 48))
            };

            leads.Add(lead);
        }

        // Add Leads first to generate IDs
        db.Leads.AddRange(leads);
        await db.SaveChangesAsync();

        // Now build related records
        foreach (var lead in leads)
        {
            // 1. Add Initial Inbound Interaction
            var interactionChannel = lead.TelegramUsername != null ? InteractionChannel.Telegram : (lead.Email.Contains("gmail") || lead.Email.Contains("outlook") ? InteractionChannel.Email : InteractionChannel.WebForm);
            var initialInteraction = new Interaction
            {
                LeadId = lead.Id,
                Channel = interactionChannel,
                Type = interactionChannel == InteractionChannel.Telegram ? InteractionType.TelegramMessage : (interactionChannel == InteractionChannel.Email ? InteractionType.Email : InteractionType.FormSubmission),
                Direction = InteractionDirection.Inbound,
                Content = lead.RawInquiryText,
                Emotion = lead.Emotion,
                CreatedAt = lead.CreatedAt
            };
            interactions.Add(initialInteraction);

            // 2. Add Activity Log for ingestion
            var trigger = LogTrigger.BackgroundJob;
            if (interactionChannel == InteractionChannel.Email) trigger = LogTrigger.EmailWebhook;
            else if (interactionChannel == InteractionChannel.Telegram) trigger = LogTrigger.TelegramWebhook;

            var log = new ActivityLog
            {
                LeadId = lead.Id,
                Action = "Lead Ingested",
                Reason = $"New lead captured from {interactionChannel} channel.",
                TriggeredBy = trigger,
                CreatedAt = lead.CreatedAt
            };
            logs.Add(log);

            // 3. Add scoring log
            var scoringLog = new ActivityLog
            {
                LeadId = lead.Id,
                Action = "AI Analysis Completed",
                Reason = $"Sentiment: {lead.Emotion}, AI Quality Score: {lead.AIScore}/10",
                TriggeredBy = LogTrigger.Agent,
                CreatedAt = lead.CreatedAt.AddMinutes(5)
            };
            logs.Add(scoringLog);

            // 4. Sometimes they have follow-ups / replies
            if (lead.PipelineStage != PipelineStage.New)
            {
                // Outbound Reply
                var outboundInteraction = new Interaction
                {
                    LeadId = lead.Id,
                    Channel = interactionChannel,
                    Type = interactionChannel == InteractionChannel.Telegram ? InteractionType.TelegramMessage : InteractionType.Email,
                    Direction = InteractionDirection.Outbound,
                    Content = $"Thank you for contacting us, {lead.FullName.Split(' ')[0]}. One of our representatives will reach out to you shortly regarding {lead.Company}.",
                    Emotion = EmotionType.Neutral,
                    CreatedAt = lead.CreatedAt.AddHours(1)
                };
                interactions.Add(outboundInteraction);

                var outboundLog = new ActivityLog
                {
                    LeadId = lead.Id,
                    Action = "Auto-Reply Sent",
                    Reason = $"Automatic confirmation sent to {lead.Email}.",
                    TriggeredBy = LogTrigger.Agent,
                    CreatedAt = lead.CreatedAt.AddHours(1)
                };
                logs.Add(outboundLog);

                // Add draft if email is the channel
                if (interactionChannel == InteractionChannel.Email && random.Next(2) == 0)
                {
                    var draft = new EmailDraft
                    {
                        LeadId = lead.Id,
                        Subject = $"Re: Inquiry about CRMAgent - {lead.Company}",
                        Body = $"Hi {lead.FullName.Split(' ')[0]},\n\nThanks for reaching out! Regarding your inquiry about:\n\"{lead.RawInquiryText}\"\n\nWe would love to schedule a demo. Let us know your availability.\n\nBest regards,\nCRMAgent Sales Team",
                        Status = lead.PipelineStage == PipelineStage.Contacted ? DraftStatus.PendingApproval : DraftStatus.Approved,
                        AIReason = "Initial follow-up based on inquiry sentiment and key topics.",
                        CreatedAt = lead.CreatedAt.AddHours(2),
                        SentAt = lead.PipelineStage == PipelineStage.Contacted ? null : lead.CreatedAt.AddHours(3)
                    };
                    drafts.Add(draft);
                }
            }

            // 5. Sometimes they have a Social Signal associated with them
            if (random.Next(3) == 0)
            {
                var platform = (SocialPlatform)random.Next(3); // LinkedIn, Twitter, Facebook
                var signal = new SocialSignal
                {
                    PlatformSource = platform,
                    SignalType = random.Next(2) == 0 ? SocialSignalType.Mention : SocialSignalType.Comment,
                    Content = socialComments[random.Next(socialComments.Length)],
                    AuthorName = lead.FullName,
                    PostReference = $"https://{platform.ToString().ToLower()}.com/post/{random.Next(10000, 99999)}",
                    Sentiment = lead.AIScore >= 7 ? SentimentType.Positive : (lead.AIScore <= 3 ? SentimentType.Negative : SentimentType.Neutral),
                    LeadId = lead.Id,
                    CreatedAt = lead.CreatedAt.AddDays(-1)
                };
                socialSignals.Add(signal);
            }
        }

        // Add 5 standalone Social Signals that aren't linked to leads yet
        for (int i = 0; i < 5; i++)
        {
            var firstName = firstNames[random.Next(firstNames.Length)];
            var lastName = lastNames[random.Next(lastNames.Length)];
            var platform = (SocialPlatform)random.Next(3); // LinkedIn, Twitter, Facebook
            var score = random.Next(1, 11);
            var signal = new SocialSignal
            {
                PlatformSource = platform,
                SignalType = SocialSignalType.Mention,
                Content = socialComments[random.Next(socialComments.Length)],
                AuthorName = $"{firstName} {lastName}",
                PostReference = $"https://{platform.ToString().ToLower()}.com/post/{random.Next(10000, 99999)}",
                Sentiment = score >= 7 ? SentimentType.Positive : (score <= 3 ? SentimentType.Negative : SentimentType.Neutral),
                LeadId = null,
                CreatedAt = DateTime.UtcNow.AddHours(-random.Next(1, 24))
            };
            socialSignals.Add(signal);
        }

        db.Interactions.AddRange(interactions);
        db.ActivityLogs.AddRange(logs);
        db.EmailDrafts.AddRange(drafts);
        db.SocialSignals.AddRange(socialSignals);

        await db.SaveChangesAsync();
    }
}
