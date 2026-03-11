# Google Ads API - Design Documentation

**Company Name:** Neuroid (by Laksh Sehgal)

---

## Business Model

Neuroid is a marketing intelligence platform built for e-commerce businesses. We aggregate advertising performance data from Google Ads, Meta Ads, and Shopify into a single unified dashboard. Our clients are e-commerce store owners who advertise on Google and need consolidated reporting across all their marketing channels.

We manage Google Ads accounts owned by our clients. The tool is used internally by our team and by our clients to view campaign performance, generate reports, and make data-driven decisions about ad spend allocation.

---

## Tool Access/Use

Neuroid is a web-based internal tool used by our team and authorized client users to:

1. **View campaign performance reports** — Users log in and see a dashboard showing Google Ads metrics (impressions, clicks, conversions, cost, ROAS) alongside Meta and Shopify data.
2. **Generate cross-channel reports** — The tool pulls Google Ads data and combines it with other channel data so users can compare performance across platforms.
3. **Campaign-level drill-down** — Users can filter and sort individual campaigns by metrics, channel, and status.

The tool is accessed via a web browser. Only authenticated users with valid credentials can access client data. There is no public-facing API; all Google Ads API calls happen server-side.

---

## Tool Design

### Architecture

```
Browser (Next.js React App)
    ↓
API Route Handler (Server-side)
    ↓
Google Ads API v18 (searchStream endpoint)
    ↓
Response aggregated with Meta + Shopify data
    ↓
Dashboard UI renders KPIs, charts, campaign table
```

### How Google Ads data flows:

1. User selects a date range on the dashboard.
2. The frontend sends a POST request to our server with the date range and stored Google Ads credentials (developer token, OAuth client ID/secret, refresh token, customer ID).
3. Our server exchanges the refresh token for an access token via Google's OAuth2 endpoint.
4. Our server sends a GAQL query to the Google Ads API v18 `searchStream` endpoint.
5. The response is parsed: `cost_micros` is converted to currency, metrics are aggregated by date and by campaign.
6. The aggregated data is returned to the frontend and rendered in KPI cards, performance charts, and a sortable campaign table.

### GAQL Query Used

```sql
SELECT
  campaign.name,
  campaign.id,
  campaign.status,
  metrics.cost_micros,
  metrics.impressions,
  metrics.clicks,
  metrics.conversions,
  metrics.conversions_value,
  segments.date
FROM campaign
WHERE segments.date BETWEEN '{start}' AND '{end}'
  AND campaign.status != 'REMOVED'
ORDER BY segments.date ASC
```

---

## API Services Called

| Service / Resource | Method | Purpose |
|---|---|---|
| `customers/{id}/googleAds:searchStream` | POST | Pull campaign performance metrics using GAQL |
| `customers/{id}` | GET | Verify credentials and retrieve account name |
| Google OAuth2 (`oauth2.googleapis.com/token`) | POST | Exchange refresh token for access token |

**Google Ads API version:** v18

**Resources accessed:**
- `campaign` resource — name, id, status
- `metrics` resource — cost_micros, impressions, clicks, conversions, conversions_value
- `segments` resource — date (for daily breakdown)

---

## Tool Mockups

*(See attached screenshots from the mockup page)*

### Mockup 1: Google Ads Account-Level Performance Dashboard
Shows: KPI cards (Impressions, Clicks, Conversions, Cost), daily spend/revenue chart, channel breakdown comparing Google vs Meta vs Shopify, and a campaign-level performance table.

### Mockup 2: Google Ads API Credential Setup
Shows: The connection setup form where users enter their Developer Token, OAuth Client ID, Client Secret, Refresh Token, and Customer ID with a "Verify Connection" button.

---

## Security & Data Handling

- OAuth credentials are stored locally in the user's browser (localStorage). They are never stored on our server.
- All API calls to Google Ads happen server-side via HTTPS.
- Access tokens are short-lived and obtained via refresh token exchange on each request.
- Only authenticated users can access the tool.
