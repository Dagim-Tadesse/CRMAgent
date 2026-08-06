# Module: Frontend Documentation

## Overview
The CRMAgent frontend is a modern React application built with TailwindCSS, Lucide Icons, and Recharts. It communicates with the ASP.NET Core API via `axios` (`apiClient.js`) and uses standard JWT bearer token authentication.

---

## Authentication & Authorization
- **Route:** `/login`
- **Page Component:** `LoginPage.jsx`
- **Hook:** `useAuth.js`
- **Features:**
  - Standard email and password login form.
  - Stores JWT `token`, user `role`, and `email` in `localStorage` (`crm_token`, `crm_role`, `crm_email`).
  - Passes Authorization bearer headers automatically on API calls.

---

## Currently Implemented Navigation & Tabs

### 1. Dashboard Tab (`/dashboard`)
- **Component:** `DashboardPage.jsx`
- **Features:**
  - **KPI Stat Cards:** Total Leads, Stagnant Leads, At-Risk Leads, and High AI Score Leads.
  - **Recent Activity Feed:** Displays real-time activity logs.
  - **Pending AI Tasks:** List of tasks requiring sales rep review or approval.
  - **Leads Table Quick-View:** High-level summary of active leads with score badges and status indicators.
  - **Error Resiliency:** Individual promise fetching ensures partial data displays even if one API endpoint is unavailable.

### 2. Leads Tab (`/leads`)
- **Component:** `LeadsPage.jsx`
- **Features:**
  - **Table View:** Full tabular view displaying lead metadata:
    - Full Name, Company, Email, Telegram Username.
    - AI Score (colored badges), Emotion tag, Current Pipeline Stage, Lead Status.
    - **Source Badge:** Displays how the lead was acquired (`Website Form`, `Telegram`, or `Email`).
    - Flags for Stagnant and At-Risk leads.
    - Last Contact Date (properly formatted using the last interaction or creation timestamp).
  - **Search & Filtering:** Dynamic search bar and filter controls to filter by status or stage.
  - **Lead Details Modal:** Expandable view to inspect full inquiry text and raw interactions.

### 3. Activity Tab (`/activity`)
- **Component:** `ActivityPage.jsx`
- **Features:**
  - **Activity Timeline Table:** Chronological log of all system actions.
  - **Trigger Badges:** Visual color-coded tags for `Agent`, `User`, `BackgroundJob`, `TelegramWebhook`, `EmailWebhook`, and `SocialWebhook`.
  - **Social Event Details:** Clean formatting for n8n social media events (`Likes`, `Shares`, `Follows`, `Comments`, `Mentions`) including post reference and Gemini sentiment score.

### 4. Reports Tab (`/reports`)
- **Component:** `ReportsPage.jsx`
- **Features:**
  - **Stat Summary Cards:** Total leads across channels, hot leads (score 8+), won deals, and average AI score.
  - **Top Performing Channel Card:** Highlights the single best-performing acquisition channel.
  - **Channel Distribution Chart:** Interactive Donut/Pie chart powered by Recharts visualizing lead volume per source channel (`Telegram`, `Website Form`, `Email`).
  - **Hot Leads Distribution Chart:** Recharts Pie chart breaking down 8+ score leads by channel.
  - **Lead Classification Bar Chart:** Stacked Bar chart showing Hot / Medium / Low lead counts per channel.
  - **Social Media Analytics Widgets:**
    - **Platform Volume (Bar Chart):** Renders engagement count per platform (LinkedIn, Twitter, Facebook, Instagram, TikTok).
    - **Social Sentiment (Donut Chart):** Shows proportion of Positive, Neutral, and Negative sentiments from n8n webhook signals.
    - **Signal Interaction Types (Donut Chart):** Categorizes signals by action types (Comments, Mentions, Likes, Shares, Follows).
  - **Channel Performance Table:** Expandable table showing total leads, average score, won deals, and conversion rates.
  - **Automated Insights & Recommendations:** Highlight cards summarizing channel takeaways and strategic action items.

### 5. Schedule / Calendar Tab (`/calendar`)
- **Component:** `SchedulePage.jsx`
- **Features:**
  - **Interactive Calendar View:** Displays scheduled follow-ups, meetings, and automated reminder tasks.
  - **Task Timeline:** Day and week overview for sales representatives to manage daily interactions.

### 6. Pipeline Tab (`/pipeline`)
- **Component:** `PipelinePage.jsx`
- **Features:**
  - **Drag-and-Drop Kanban Board:** Visually track and manage leads across various stages (`New`, `Contacted`, `Qualified`, `ProposalSent`, `Negotiation`, `Won`, `Lost`).
  - **DndContext Integration:** Powered by `@dnd-kit/core` and `@dnd-kit/utilities` for smooth drag handle interactions.
  - **Optimistic Updates:** Moves lead stages instantly in the UI while making background API calls, reverting on failure.

### 7. AI Tasks Tab (`/ai-tasks`)
- **Component:** `AITasksPage.jsx`
- **Features:**
  - **AI Generated Email Drafts:** Shows list of email responses auto-drafted by Gemini.
  - **Interactive Action Controls:** Sales reps can **Approve & Send** (sends email immediately via Resend), **Edit First** (live inline editor), or **Reject** drafts.

---

## Technical Stack & API Integration
- **Framework:** React (Create React App)
- **Styling:** TailwindCSS
- **Icons:** `lucide-react`
- **Charts:** `recharts`
- **Base API URL:** Configured via `.env` (`REACT_APP_API_BASE_URL=http://localhost:5087`)
- **API Client:** `src/api/apiClient.js` with centralized `axios` instance and request interceptor for JWT auth.
