"use client";

import React, { useRef } from "react";
import { Copy, Download, ArrowLeft, CheckCircle2 } from "lucide-react";
import Link from "next/link";

const Q6_TEXT = `Neuroid is a marketing intelligence platform for e-commerce businesses. We build internal reporting tools that aggregate advertising data from Google Ads, Meta Ads, and Shopify into a unified dashboard. Our clients are e-commerce store owners who run Google Ads campaigns (Search, Shopping, Performance Max) and need consolidated cross-channel performance reporting.

We use the Google Ads API to pull campaign-level performance metrics (impressions, clicks, conversions, cost, conversion value) via GAQL queries against the searchStream endpoint. This data is displayed in our dashboard alongside Meta and Shopify data, allowing users to compare ROAS and spend allocation across channels.

The tool is used by our internal team and authorized client users to view reports and analyze campaign performance. All API calls happen server-side. We also use the Customer resource to verify account connectivity. We do not modify campaigns or budgets through the API — access is read-only for reporting purposes.`;

export default function ApiDocsPage() {
  const printRef = useRef<HTMLDivElement>(null);
  const [copied, setCopied] = React.useState(false);

  const copyQ6 = () => {
    navigator.clipboard.writeText(Q6_TEXT);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const downloadPDF = () => {
    const el = printRef.current;
    if (!el) return;
    const printWindow = window.open("", "_blank");
    if (!printWindow) return;
    printWindow.document.write(`
      <html><head><title>Neuroid - Google Ads API Design Documentation</title>
      <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; padding: 40px; color: #111; font-size: 13px; line-height: 1.6; }
        h1 { font-size: 22px; margin-bottom: 4px; }
        h2 { font-size: 16px; margin: 28px 0 8px; padding-bottom: 4px; border-bottom: 2px solid #e5e7eb; }
        h3 { font-size: 14px; margin: 16px 0 6px; }
        p { margin-bottom: 8px; }
        ul { padding-left: 20px; margin-bottom: 8px; }
        li { margin-bottom: 4px; }
        pre { background: #f3f4f6; padding: 12px; border-radius: 6px; font-size: 11px; overflow-x: auto; margin: 8px 0; white-space: pre-wrap; }
        table { width: 100%; border-collapse: collapse; margin: 8px 0; font-size: 12px; }
        th, td { border: 1px solid #d1d5db; padding: 8px 10px; text-align: left; }
        th { background: #f9fafb; font-weight: 600; }
        .subtitle { color: #6b7280; font-size: 13px; margin-bottom: 20px; }
        .mockup-container { margin: 16px 0; page-break-inside: avoid; }
        .mockup-frame { border: 2px solid #e5e7eb; border-radius: 8px; overflow: hidden; }
        .mockup-bar { background: #1e1e2d; color: white; padding: 10px 16px; font-size: 13px; font-weight: 600; display: flex; justify-content: space-between; }
        .mockup-bar .tabs { display: flex; gap: 8px; }
        .mockup-bar .tab { padding: 4px 12px; border-radius: 6px; font-size: 11px; background: rgba(255,255,255,0.1); }
        .mockup-bar .tab.active { background: #6366f1; }
        .kpi-row { display: grid; grid-template-columns: repeat(4, 1fr); gap: 12px; margin: 16px; }
        .kpi-card { border: 1px solid #e5e7eb; border-radius: 8px; padding: 14px; }
        .kpi-label { font-size: 10px; color: #6b7280; text-transform: uppercase; letter-spacing: 0.5px; }
        .kpi-value { font-size: 20px; font-weight: 700; color: #111; margin-top: 2px; }
        .kpi-sub { font-size: 10px; color: #10b981; }
        .campaign-table { margin: 0 16px 16px; }
        .campaign-table table { font-size: 11px; }
        .campaign-table th { font-size: 10px; text-transform: uppercase; letter-spacing: 0.3px; }
        .status { padding: 2px 6px; border-radius: 8px; font-size: 10px; }
        .status-active { background: #dcfce7; color: #166534; }
        .channel-g { background: #dbeafe; color: #1e40af; padding: 2px 6px; border-radius: 8px; font-size: 10px; }
        .setup-frame { border: 2px solid #e5e7eb; border-radius: 12px; padding: 24px; max-width: 500px; margin: 16px auto; }
        .setup-frame h3 { margin: 0 0 4px; }
        .setup-frame .sub { font-size: 11px; color: #6b7280; margin-bottom: 16px; }
        .form-section { border: 1px solid #e5e7eb; border-radius: 8px; padding: 12px; margin-bottom: 8px; }
        .form-section .icon { display: inline-block; width: 24px; height: 24px; border-radius: 6px; color: white; text-align: center; line-height: 24px; font-size: 12px; font-weight: 700; margin-right: 8px; vertical-align: middle; }
        .form-section .icon-g { background: #4285F4; }
        .form-section .icon-m { background: #1877F2; }
        .form-section .icon-s { background: #96BF48; }
        .form-section label { display: block; font-size: 10px; font-weight: 600; color: #6b7280; margin: 8px 0 2px; }
        .form-section input { width: 100%; padding: 6px 8px; border: 1px solid #d1d5db; border-radius: 6px; font-size: 11px; background: #f9fafb; }
        .form-row { display: grid; grid-template-columns: 1fr 1fr; gap: 8px; }
        .verify-btn { margin-top: 8px; padding: 4px 12px; font-size: 11px; background: #dbeafe; color: #1e40af; border: none; border-radius: 6px; }
        .verified-text { font-size: 11px; color: #059669; margin-top: 6px; }
        @media print { body { padding: 20px; } .mockup-container { page-break-inside: avoid; } }
      </style></head><body>
      <h1>Neuroid - Google Ads API Design Documentation</h1>
      <p class="subtitle">Marketing Intelligence Platform &middot; by Laksh Sehgal</p>

      <h2>Company Name</h2>
      <p>Neuroid</p>

      <h2>Business Model</h2>
      <p>Neuroid is a marketing intelligence platform for e-commerce businesses. We aggregate advertising performance data from Google Ads, Meta Ads, and Shopify into a single unified dashboard. Our clients are e-commerce store owners who advertise on Google and need consolidated reporting across all their marketing channels.</p>
      <p>We manage Google Ads accounts owned by our clients. The tool is used internally by our team and by our clients to view campaign performance, generate reports, and make data-driven decisions about ad spend allocation.</p>

      <h2>Tool Access/Use</h2>
      <p>Neuroid is a web-based internal tool used by our team and authorized client users to:</p>
      <ul>
        <li><strong>View campaign performance reports</strong> — Users log in and see a dashboard showing Google Ads metrics (impressions, clicks, conversions, cost, ROAS) alongside Meta and Shopify data.</li>
        <li><strong>Generate cross-channel reports</strong> — The tool pulls Google Ads data and combines it with other channel data so users can compare performance across platforms.</li>
        <li><strong>Campaign-level drill-down</strong> — Users can filter and sort individual campaigns by metrics, channel, and status.</li>
      </ul>
      <p>The tool is accessed via a web browser. Only authenticated users can access client data. All Google Ads API calls happen server-side via HTTPS.</p>

      <h2>Tool Design</h2>
      <h3>Architecture</h3>
      <pre>Browser (Next.js React App)
  → API Route Handler (Server-side)
    → Google Ads API v18 (searchStream endpoint)
      → Response aggregated with Meta + Shopify data
        → Dashboard UI renders KPIs, charts, campaign table</pre>

      <h3>Data Flow</h3>
      <p>1. User selects a date range. 2. Frontend POSTs to our server with date range and stored Google Ads credentials. 3. Server exchanges refresh token for access token via Google OAuth2. 4. Server sends GAQL query to Google Ads API v18 searchStream. 5. Response parsed: cost_micros converted to currency, metrics aggregated by date and campaign. 6. Aggregated data rendered in KPI cards, charts, and campaign table.</p>

      <h3>GAQL Query</h3>
      <pre>SELECT
  campaign.name, campaign.id, campaign.status,
  metrics.cost_micros, metrics.impressions, metrics.clicks,
  metrics.conversions, metrics.conversions_value,
  segments.date
FROM campaign
WHERE segments.date BETWEEN '{start}' AND '{end}'
  AND campaign.status != 'REMOVED'
ORDER BY segments.date ASC</pre>

      <h2>API Services Called</h2>
      <table>
        <tr><th>Service / Resource</th><th>Method</th><th>Purpose</th></tr>
        <tr><td>customers/{id}/googleAds:searchStream</td><td>POST</td><td>Pull campaign metrics via GAQL</td></tr>
        <tr><td>customers/{id}</td><td>GET</td><td>Verify credentials &amp; get account name</td></tr>
        <tr><td>oauth2.googleapis.com/token</td><td>POST</td><td>Exchange refresh token for access token</td></tr>
      </table>
      <p style="margin-top:8px;"><strong>Resources accessed:</strong> campaign (name, id, status), metrics (cost_micros, impressions, clicks, conversions, conversions_value), segments (date)</p>

      <h2>Tool Mockups</h2>

      <h3>Mockup 1: Google Ads Account-Level Performance Dashboard</h3>
      <div class="mockup-container">
        <div class="mockup-frame">
          <div class="mockup-bar">
            <span>Neuroid</span>
            <div class="tabs">
              <span class="tab active">Dashboard</span>
              <span class="tab">Performance</span>
              <span class="tab">Settings</span>
            </div>
          </div>
          <div style="padding:16px;">
            <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:12px;">
              <span style="font-size:16px;font-weight:700;">Google Ads Account-Level Performance</span>
              <span style="background:#f3f4f6;padding:4px 10px;border-radius:6px;font-size:11px;">Mar 1 – Mar 11, 2026</span>
            </div>
          </div>
          <div class="kpi-row">
            <div class="kpi-card"><div class="kpi-label">Impressions</div><div class="kpi-value">1,24,350</div><div class="kpi-sub">+12.4%</div></div>
            <div class="kpi-card"><div class="kpi-label">Clicks</div><div class="kpi-value">6,812</div><div class="kpi-sub">+8.7%</div></div>
            <div class="kpi-card"><div class="kpi-label">Conversions</div><div class="kpi-value">583</div><div class="kpi-sub">+15.2%</div></div>
            <div class="kpi-card"><div class="kpi-label">Cost</div><div class="kpi-value">₹2,18,400</div><div class="kpi-sub">CPC: ₹32.06</div></div>
          </div>
          <div class="campaign-table">
            <div style="font-size:13px;font-weight:600;margin-bottom:8px;">Campaign-Level Performance</div>
            <table>
              <tr><th>Campaign</th><th>Status</th><th>Impressions</th><th>Clicks</th><th>CPC</th><th>Conversions</th><th>Cost</th><th>Revenue</th><th>ROAS</th></tr>
              <tr><td>Search - Brand Terms</td><td><span class="status status-active">Active</span></td><td>42,100</td><td>2,840</td><td>₹18.50</td><td>245</td><td>₹52,540</td><td>₹2,18,400</td><td>4.16x</td></tr>
              <tr><td>Search - Generic Keywords</td><td><span class="status status-active">Active</span></td><td>38,200</td><td>1,920</td><td>₹38.20</td><td>156</td><td>₹73,344</td><td>₹1,95,000</td><td>2.66x</td></tr>
              <tr><td>Shopping - All Products</td><td><span class="status status-active">Active</span></td><td>28,450</td><td>1,380</td><td>₹42.10</td><td>118</td><td>₹58,098</td><td>₹1,62,800</td><td>2.80x</td></tr>
              <tr><td>Performance Max - Main</td><td><span class="status status-active">Active</span></td><td>15,600</td><td>672</td><td>₹51.40</td><td>64</td><td>₹34,541</td><td>₹1,18,000</td><td>3.42x</td></tr>
            </table>
            <p style="font-size:10px;color:#9ca3af;margin-top:8px;">Data pulled via Google Ads API v18 · searchStream endpoint · GAQL query</p>
          </div>
        </div>
      </div>

      <h3>Mockup 2: Google Ads API Credential Setup</h3>
      <div class="mockup-container">
        <div class="setup-frame">
          <h3>New Client Space</h3>
          <p class="sub">Connect ad accounts directly via their APIs</p>
          <div class="form-section">
            <span class="icon icon-g">G</span><strong>Google Ads ✅</strong>
            <p style="font-size:11px;color:#6b7280;">Search, Display, Shopping & Performance Max</p>
            <label>Developer Token</label><input value="AbCdEf-XXXXXXXXXXXX" readonly />
            <div class="form-row">
              <div><label>OAuth Client ID</label><input value="812345.apps.googleusercontent.com" readonly /></div>
              <div><label>OAuth Client Secret</label><input type="password" value="xxxxxxxx" readonly /></div>
            </div>
            <label>Refresh Token</label><input type="password" value="xxxxxxxxxxxxxxxx" readonly />
            <label>Customer ID</label><input value="123-456-7890" readonly />
            <br/><button class="verify-btn">Verify Connection</button>
            <p class="verified-text">✓ Connected: My Google Ads Account</p>
          </div>
          <div class="form-section">
            <span class="icon icon-m">M</span><strong>Meta Ads</strong>
            <p style="font-size:11px;color:#6b7280;">Facebook & Instagram advertising</p>
          </div>
          <div class="form-section">
            <span class="icon icon-s">S</span><strong>Shopify</strong>
            <p style="font-size:11px;color:#6b7280;">E-commerce store orders & revenue</p>
          </div>
        </div>
      </div>

      <h2>Security & Data Handling</h2>
      <ul>
        <li>OAuth credentials stored locally in user's browser — never on our server.</li>
        <li>All API calls happen server-side via HTTPS.</li>
        <li>Access tokens are short-lived, obtained via refresh token on each request.</li>
        <li>Only authenticated users can access the tool.</li>
      </ul>

      </body></html>
    `);
    printWindow.document.close();
    printWindow.onload = () => {
      printWindow.print();
    };
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-3xl mx-auto">
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-sm text-gray-500 hover:text-gray-700 mb-6"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Dashboard
        </Link>

        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-8">
          <h1 className="text-2xl font-bold text-gray-900 mb-1">
            Google Ads API Application
          </h1>
          <p className="text-sm text-gray-500 mb-8">
            Everything you need to submit your developer token application
          </p>

          {/* Q6 */}
          <div className="mb-8">
            <div className="flex items-center justify-between mb-2">
              <h2 className="text-lg font-semibold text-gray-900">
                Q6: Business Model Description
              </h2>
              <span className="text-xs text-gray-400">{Q6_TEXT.length}/1000 chars</span>
            </div>
            <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 text-sm text-gray-700 whitespace-pre-wrap leading-relaxed">
              {Q6_TEXT}
            </div>
            <button
              onClick={copyQ6}
              className="mt-2 inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium bg-primary-50 text-primary-700 rounded-lg hover:bg-primary-100 transition-colors"
            >
              {copied ? (
                <>
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  Copied!
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5" />
                  Copy to Clipboard
                </>
              )}
            </button>
          </div>

          {/* Q7 */}
          <div>
            <h2 className="text-lg font-semibold text-gray-900 mb-2">
              Q7: Design Documentation PDF
            </h2>
            <p className="text-sm text-gray-500 mb-3">
              Includes company info, tool design, API services, GAQL queries, and
              two embedded mockups (dashboard + credential setup).
            </p>
            <button
              onClick={downloadPDF}
              className="inline-flex items-center gap-2 px-4 py-2.5 bg-primary-600 text-white text-sm font-medium rounded-lg hover:bg-primary-700 transition-colors"
            >
              <Download className="w-4 h-4" />
              Open & Print as PDF
            </button>
            <p className="text-xs text-gray-400 mt-2">
              Opens a print-ready page. Use &quot;Save as PDF&quot; in the print dialog.
            </p>
          </div>
        </div>

        <div ref={printRef} />
      </div>
    </div>
  );
}
