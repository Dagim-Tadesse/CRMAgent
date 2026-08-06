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

## Testing Inbound Email Webhooks Locally

Since the backend runs on `localhost:5087`, public services (like Resend) cannot send webhooks to your local machine directly. Use **Serveo** (built into Windows via SSH) to expose your port:

1. Expose port `5087` to the public internet:
   ```bash
   ssh -R 80:localhost:5087 serveo.net
   ```
2. Copy the public forwarding URL provided (e.g., `https://xxxx.serveo.net`).
3. Set your webhook URL in your Resend Dashboard pointing to:
   `https://xxxx.serveo.net/api/webhooks/email`
4. Send an email from your phone to trigger the webhook!
