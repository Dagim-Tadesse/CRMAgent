# MODULE_CHANNELS.md
## Inbound CRM Channels

This document details the configuration and architecture of the inbound channels integrated into the CRM system.

---

## 1. Telegram Bot Integration
Allows prospects to start conversations with a Telegram bot and get automatically ingested as leads.

### API Endpoint:
`POST /api/webhooks/telegram`

### Controller:
[TelegramWebhookController.cs](file:///c:/Users/HP/Documents/programming/.Net/CRMAgent/src/CRMAgent.API/Controllers/Webhooks/TelegramWebhookController.cs)

### Key Features:
- **Lead Matching:** Automatically matches users by their Telegram Username or unique ID so they don't get duplicated.
- **AI Scoring:** Passes inbound messages directly to the Gemini API service to analyze intent, calculate a score, and identify customer emotion.
- **Persistent Routing:** Configured to map directly to standard CRM pipelines.

---

## 2. Inbound Email Integration (Resend)
Allows emails sent to your Resend domain address to route directly into the CRM.

### API Endpoint:
`POST /api/webhooks/email`

### Controller:
[EmailWebhookController.cs](file:///c:/Users/HP/Documents/programming/.Net/CRMAgent/src/CRMAgent.API/Controllers/Webhooks/EmailWebhookController.cs)

### Key Features:
- **Sender Parsing:** Robust parser extracts display names and emails from headers format (e.g. `John Doe <john@example.com>`).
- **Activity Logging:** Adds detailed timeline events under the lead's history log for email updates.
