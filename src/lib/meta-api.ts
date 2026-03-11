import { MetaCredentials, CampaignRow } from "@/types";
import { format } from "date-fns";

const META_GRAPH_URL = "https://graph.facebook.com/v21.0";

interface MetaInsightRow {
  campaign_name: string;
  campaign_id: string;
  spend: string;
  impressions: string;
  clicks: string;
  actions?: { action_type: string; value: string }[];
  action_values?: { action_type: string; value: string }[];
  date_start: string;
  date_stop: string;
  effective_status?: string;
}

interface MetaApiResponse {
  data: MetaInsightRow[];
  paging?: { next?: string };
}

export interface MetaResult {
  totalSpend: number;
  totalRevenue: number;
  totalImpressions: number;
  totalClicks: number;
  totalConversions: number;
  dailyData: { date: string; spend: number; revenue: number; conversions: number }[];
  campaigns: CampaignRow[];
}

function extractConversions(actions?: { action_type: string; value: string }[]): number {
  if (!actions) return 0;
  const purchaseAction = actions.find(
    (a) => a.action_type === "purchase" || a.action_type === "offsite_conversion.fb_pixel_purchase"
  );
  if (purchaseAction) return Number(purchaseAction.value) || 0;
  // Fallback to any conversion-like action
  const convAction = actions.find(
    (a) => a.action_type === "omni_purchase" || a.action_type === "complete_registration"
  );
  return convAction ? Number(convAction.value) || 0 : 0;
}

function extractRevenue(actionValues?: { action_type: string; value: string }[]): number {
  if (!actionValues) return 0;
  const purchaseValue = actionValues.find(
    (a) => a.action_type === "purchase" || a.action_type === "offsite_conversion.fb_pixel_purchase"
  );
  if (purchaseValue) return Number(purchaseValue.value) || 0;
  const omniValue = actionValues.find((a) => a.action_type === "omni_purchase");
  return omniValue ? Number(omniValue.value) || 0 : 0;
}

export async function fetchMetaData(
  credentials: MetaCredentials,
  startDate: Date,
  endDate: Date
): Promise<MetaResult> {
  const { accessToken, adAccountId } = credentials;
  const accountId = adAccountId.startsWith("act_") ? adAccountId : `act_${adAccountId}`;

  // Fetch campaign-level insights
  const fields = "campaign_name,campaign_id,spend,impressions,clicks,actions,action_values";
  const timeRange = JSON.stringify({
    since: format(startDate, "yyyy-MM-dd"),
    until: format(endDate, "yyyy-MM-dd"),
  });

  const params = new URLSearchParams({
    access_token: accessToken,
    fields,
    time_range: timeRange,
    time_increment: "1", // daily breakdown
    level: "campaign",
    limit: "500",
  });

  const url = `${META_GRAPH_URL}/${accountId}/insights?${params.toString()}`;
  let allRows: MetaInsightRow[] = [];

  // Paginate through results
  let nextUrl: string | null = url;
  while (nextUrl) {
    const response = await fetch(nextUrl);
    if (!response.ok) {
      const error = await response.json().catch(() => ({}));
      throw new Error(
        `Meta API error ${response.status}: ${JSON.stringify(error?.error?.message || error)}`
      );
    }
    const data: MetaApiResponse = await response.json();
    allRows = allRows.concat(data.data || []);
    nextUrl = data.paging?.next || null;
  }

  // Aggregate daily data
  const dailyMap = new Map<string, { spend: number; revenue: number; conversions: number }>();
  const campaignMap = new Map<string, CampaignRow>();

  let totalSpend = 0;
  let totalRevenue = 0;
  let totalImpressions = 0;
  let totalClicks = 0;
  let totalConversions = 0;

  for (const row of allRows) {
    const spend = Number(row.spend) || 0;
    const impressions = Number(row.impressions) || 0;
    const clicks = Number(row.clicks) || 0;
    const conversions = extractConversions(row.actions);
    const revenue = extractRevenue(row.action_values);
    const date = row.date_start;

    totalSpend += spend;
    totalRevenue += revenue;
    totalImpressions += impressions;
    totalClicks += clicks;
    totalConversions += conversions;

    // Daily aggregation
    const daily = dailyMap.get(date) || { spend: 0, revenue: 0, conversions: 0 };
    daily.spend += spend;
    daily.revenue += revenue;
    daily.conversions += conversions;
    dailyMap.set(date, daily);

    // Campaign aggregation
    const campaignKey = row.campaign_id || row.campaign_name;
    const existing = campaignMap.get(campaignKey);
    if (existing) {
      existing.spend += spend;
      existing.revenue += revenue;
      existing.impressions += impressions;
      existing.clicks += clicks;
      existing.conversions += conversions;
    } else {
      campaignMap.set(campaignKey, {
        id: `meta-${campaignKey}`,
        name: row.campaign_name || "Unknown Campaign",
        channel: "meta",
        status: "active",
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

  // Compute derived metrics for campaigns
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

// Verify Meta credentials by making a lightweight API call
export async function verifyMetaCredentials(
  credentials: MetaCredentials
): Promise<{ valid: boolean; accountName?: string; error?: string }> {
  const accountId = credentials.adAccountId.startsWith("act_")
    ? credentials.adAccountId
    : `act_${credentials.adAccountId}`;

  try {
    const response = await fetch(
      `${META_GRAPH_URL}/${accountId}?fields=name,account_status&access_token=${credentials.accessToken}`
    );
    const data = await response.json();
    if (data.error) {
      return { valid: false, error: data.error.message };
    }
    return { valid: true, accountName: data.name };
  } catch (err) {
    return { valid: false, error: String(err) };
  }
}
