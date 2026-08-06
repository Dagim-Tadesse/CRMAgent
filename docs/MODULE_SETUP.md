# MODULE_SETUP.md
## Owner: Person A (Dagim)
## Last Updated: [today's date]

## Status
- [x] Solution skeleton — CRMAgent.sln with 4 projects and correct references
- [x] All NuGet packages installed (EF Core, Identity, JWT, MediatR, Hangfire)
- [x] ASP.NET Core Identity configured with 4 roles: Admin, SalesRep, SocialMediaRep, Manager
- [x] JWT authentication middleware configured
- [x] Swagger with Bearer token support configured
- [x] CORS configured for React dev server (http://localhost:3000)
- [x] Admin user seeded: admin@crm.com / Admin123!

## How To Run

To run the complete system, you will need three separate terminal windows.

### 1. Backend API (Terminal 1)
```bash
cd src/CRMAgent.API
dotnet run
```
- Swagger: `http://localhost:5087/swagger`
- Test Login: `POST /api/auth/login` (email: `admin@crm.com`, password: `Admin123!`)

### 2. Frontend React Dashboard (Terminal 2)
Make sure you have a `.env` file in the `ClientApp` folder containing: `REACT_APP_API_BASE_URL=http://localhost:5087`
```bash
cd src/CRMAgent.API/ClientApp
npm install
npm start
```
- The dashboard will open at `http://localhost:3000`. 
- If you see a blank screen, **navigate to `http://localhost:3000/login`** and sign in using the admin credentials above.

### 3. n8n Social Automation (Terminal 3 - Docker)
Ensure Docker Desktop is running, then start n8n:
```bash
# For Windows CMD:
docker run -it --rm --name n8n -p 5678:5678 -v %USERPROFILE%\.n8n:/home/node/.n8n n8nio/n8n

# For Windows PowerShell:
docker run -it --rm --name n8n -p 5678:5678 -v ${env:USERPROFILE}\.n8n:/home/node/.n8n n8nio/n8n

# For Mac/Linux Bash:
docker run -it --rm --name n8n -p 5678:5678 -v ~/.n8n:/home/node/.n8n n8nio/n8n
```
- Access n8n at: `http://localhost:5678`
- When configuring the HTTP Request node to send data to the CRM, make sure to set **Specify Body** to "Using JSON" (or define the fields explicitly) and send it as a `POST` request to `http://host.docker.internal:5087/api/webhooks/social` with the header `X-Webhook-Secret: dev-n8n-secret-12345`.

## Switching Gemini AI Models

### Switch to Gemini 3.5 Flash Lite:
```bash
dotnet user-secrets set "GeminiSettings:ModelEndpoint" "https://generativelanguage.googleapis.com/v1beta/models/gemini-3.5-flash-lite:generateContent" --project src/CRMAgent.API
```

### Switch back to Gemini 3.6 Flash (Standard Model - 20 RPD):
```bash
dotnet user-secrets set "GeminiSettings:ModelEndpoint" "https://generativelanguage.googleapis.com/v1beta/models/gemini-3.6-flash:generateContent" --project src/CRMAgent.API
```

## Exposing Webhooks Locally (Tunneling)

Since the backend runs on `localhost:5087`, public services (like Resend and Telegram) cannot send webhooks to your local machine directly. You must expose your port using one of the tunneling options below:

### Option A: Ngrok (Recommended - Permanent URL)
**When to use:** Use this for standard development so that your webhook endpoints never change and your bot/email registrations never break when you restart your terminal.

**How to use:**
1. Claim a **Free Static Domain** on [ngrok.com](https://ngrok.com) (e.g. `your-domain.ngrok-free.dev`).
2. Authenticate ngrok in your terminal:
   ```bash
   .\ngrok config add-authtoken <YOUR_AUTHTOKEN>
   ```
3. Expose port `5087` using your static domain:
   ```bash
   .\ngrok http 5087 --domain=your-domain.ngrok-free.dev
   ```

### Option B: Serveo (Quick Run - No Installation)
**When to use:** Use this if you want a fast tunnel without installing ngrok, though the URL will change if the connection drops.

**How to use:**
1. Expose port `5087` to the public internet using SSH:
   ```bash
   ssh -o ServerAliveInterval=60 -R 80:localhost:5087 serveo.net
   ```
2. Copy the public forwarding URL provided (e.g., `https://xxxx.serveo.net`).

---

## Webhook Registration

### 1. Inbound Emails (Resend Webhooks)
- Go to your Resend.com dashboard under Webhooks.
- Set the webhook endpoint URL pointing to:
  `https://<YOUR_TUNNEL_URL>/api/webhooks/email`
- Send an email to your inbound Resend address to test!

### 2. Inbound Messages (Telegram Bot Webhooks)
- Send a GET request to Telegram's API via your browser (replacing bot token and tunnel URL):
  ```text
  https://api.telegram.org/bot<YOUR_BOT_TOKEN>/setWebhook?url=https://<YOUR_TUNNEL_URL>/api/webhooks/telegram
  ```
- Send a message to your Telegram bot to test!
