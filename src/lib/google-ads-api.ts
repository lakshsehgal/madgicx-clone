import { GoogleAdsCredentials, CampaignRow } from "@/types";
import { format } from "date-fns";

const GOOGLE_ADS_API_URL = "https://googleads.googleapis.com/v18";
const GOOGLE_OAUTH_URL = "https://oauth2.googleapis.com/token";

interface GoogleAdsCampaignRow {
  campaign: {
    name: string;
    id: string;
    status: string;
  };
  metrics: {
    costMicros: string;
    impressions: string;
    clicks: string;
    conversions: number;
    conversionsValue: number;
  };
  segments?: {
    date: string;
  };
}

export interface GoogleAdsResult {
  totalSpend: number;
  totalRevenue: number;
  totalImpressions: number;
  totalClicks: number;
  totalConversions: number;
  dailyData: { date: string; spend: number; revenue: number; conversions: number }[];
  campaigns: CampaignRow[];
}

async function getAccessToken(credentials: GoogleAdsCredentials): Promise<string> {
  const response = await fetch(GOOGLE_OAUTH_URL, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      client_id: credentials.clientId,
      client_secret: credentials.clientSecret,
      refresh_token: credentials.refreshToken,
      grant_type: "refresh_token",
    }),
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({}));
    throw new Error(`Google OAuth error: ${JSON.stringify(error)}`);
  }

  const data = await response.json();
  return data.access_token;
}

function cleanCustomerId(customerId: string): string {
  return customerId.replace(/-/g, "");
}

export async function fetchGoogleAdsData(
  credentials: GoogleAdsCredentials,
  startDate: Date,
  endDate: Date
): Promise<GoogleAdsResult> {
  const accessToken = await getAccessToken(credentials);
  const customerId = cleanCustomerId(credentials.customerId);

  const dateFrom = format(startDate, "yyyy-MM-dd");
  const dateTo = format(endDate, "yyyy-MM-dd");

  // GAQL query for campaign performance with daily breakdown
  const query = `
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
    WHERE segments.date BETWEEN '${dateFrom}' AND '${dateTo}'
      AND campaign.status != 'REMOVED'
    ORDER BY segments.date ASC
  `;

  const url = `${GOOGLE_ADS_API_URL}/customers/${customerId}/googleAds:searchStream`;

  const response = await fetch(url, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${accessToken}`,
      "developer-token": credentials.developerToken,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ query }),
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({}));
    throw new Error(
      `Google Ads API error ${response.status}: ${JSON.stringify(error?.error?.message || error)}`
    );
  }

  const streamData = await response.json();

  // searchStream returns array of batches
  const allRows: GoogleAdsCampaignRow[] = [];
  if (Array.isArray(streamData)) {
    for (const batch of streamData) {
      if (batch.results) {
        allRows.push(...batch.results);
      }
    }
  }

  // Aggregate
  const dailyMap = new Map<string, { spend: number; revenue: number; conversions: number }>();
  const campaignMap = new Map<string, CampaignRow>();

  let totalSpend = 0;
  let totalRevenue = 0;
  let totalImpressions = 0;
  let totalClicks = 0;
  let totalConversions = 0;

  for (const row of allRows) {
    const spend = (Number(row.metrics.costMicros) || 0) / 1_000_000; // micros to currency
    const impressions = Number(row.metrics.impressions) || 0;
    const clicks = Number(row.metrics.clicks) || 0;
    const conversions = Number(row.metrics.conversions) || 0;
    const revenue = Number(row.metrics.conversionsValue) || 0;
    const date = row.segments?.date || "";

    totalSpend += spend;
    totalRevenue += revenue;
    totalImpressions += impressions;
    totalClicks += clicks;
    totalConversions += conversions;

    // Daily
    if (date) {
      const daily = dailyMap.get(date) || { spend: 0, revenue: 0, conversions: 0 };
      daily.spend += spend;
      daily.revenue += revenue;
      daily.conversions += conversions;
      dailyMap.set(date, daily);
    }

    // Campaign
    const campaignId = row.campaign.id;
    const existing = campaignMap.get(campaignId);
    if (existing) {
      existing.spend += spend;
      existing.revenue += revenue;
      existing.impressions += impressions;
      existing.clicks += clicks;
      existing.conversions += conversions;
    } else {
      const statusMap: Record<string, "active" | "paused" | "ended"> = {
        ENABLED: "active",
        PAUSED: "paused",
      };
      campaignMap.set(campaignId, {
        id: `google-${campaignId}`,
        name: row.campaign.name || "Unknown Campaign",
        channel: "google",
        status: statusMap[row.campaign.status] || "ended",
        spend,
        revenue,
        roas: 0,
        impressions,
        clicks,
        cpc: 0,
        ctr: 0,
        conversions,
      });
    }
  }

  const campaigns = Array.from(campaignMap.values()).map((c) => ({
    ...c,
    roas: c.spend > 0 ? c.revenue / c.spend : 0,
    cpc: c.clicks > 0 ? c.spend / c.clicks : 0,
    ctr: c.impressions > 0 ? (c.clicks / c.impressions) * 100 : 0,
  }));

  const dailyData = Array.from(dailyMap.entries())
    .map(([date, d]) => ({ date, ...d }))
    .sort((a, b) => a.date.localeCompare(b.date));

  return {
    totalSpend,
    totalRevenue,
    totalImpressions,
    totalClicks,
    totalConversions,
    dailyData,
    campaigns,
  };
}

// Verify Google Ads credentials
export async function verifyGoogleAdsCredentials(
  credentials: GoogleAdsCredentials
): Promise<{ valid: boolean; accountName?: string; error?: string }> {
  try {
    const accessToken = await getAccessToken(credentials);
    const customerId = cleanCustomerId(credentials.customerId);

    const response = await fetch(
      `${GOOGLE_ADS_API_URL}/customers/${customerId}`,
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
          "developer-token": credentials.developerToken,
        },
      }
    );

    if (!response.ok) {
      const error = await response.json().catch(() => ({}));
      return { valid: false, error: JSON.stringify(error?.error?.message || error) };
    }

    const data = await response.json();
    return { valid: true, accountName: data.descriptiveName || customerId };
  } catch (err) {
    return { valid: false, error: String(err) };
  }
}
