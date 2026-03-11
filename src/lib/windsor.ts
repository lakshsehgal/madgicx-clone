import {
  ChannelPerformance,
  DailyPerformance,
  CampaignRow,
  KPIData,
  Channel,
} from "@/types";
import { format } from "date-fns";

const WINDSOR_BASE_URL = "https://connectors.windsor.ai/all";

interface WindsorOptions {
  apiKey: string;
  startDate: Date;
  endDate: Date;
}

async function fetchWindsorData(
  options: WindsorOptions,
  connector: string,
  fields: string[]
) {
  const params = new URLSearchParams({
    api_key: options.apiKey,
    date_from: format(options.startDate, "yyyy-MM-dd"),
    date_to: format(options.endDate, "yyyy-MM-dd"),
    _connector: connector,
    _fields: fields.join(","),
  });

  const response = await fetch(`${WINDSOR_BASE_URL}?${params.toString()}`);
  if (!response.ok) {
    throw new Error(`Windsor API error: ${response.statusText}`);
  }
  return response.json();
}

export async function fetchPerformanceData(
  options: WindsorOptions
): Promise<{
  kpis: KPIData;
  channelBreakdown: ChannelPerformance[];
  dailyPerformance: DailyPerformance[];
  campaigns: CampaignRow[];
}> {
  const fields = [
    "campaign",
    "source",
    "spend",
    "revenue",
    "impressions",
    "clicks",
    "conversions",
    "date",
  ];

  try {
    const [metaData, googleData, shopifyData] = await Promise.allSettled([
      fetchWindsorData(options, "facebook", fields),
      fetchWindsorData(options, "google_ads", fields),
      fetchWindsorData(options, "shopify", [
        "source",
        "revenue",
        "conversions",
        "date",
      ]),
    ]);

    const meta =
      metaData.status === "fulfilled" ? metaData.value?.data || [] : [];
    const google =
      googleData.status === "fulfilled" ? googleData.value?.data || [] : [];
    const shopify =
      shopifyData.status === "fulfilled" ? shopifyData.value?.data || [] : [];

    return processWindsorData(meta, google, shopify);
  } catch {
    // Return demo data if API fails
    return generateDemoData(options.startDate, options.endDate);
  }
}

function processWindsorData(
  meta: Record<string, unknown>[],
  google: Record<string, unknown>[],
  shopify: Record<string, unknown>[]
): {
  kpis: KPIData;
  channelBreakdown: ChannelPerformance[];
  dailyPerformance: DailyPerformance[];
  campaigns: CampaignRow[];
} {
  const aggregate = (
    data: Record<string, unknown>[],
    channel: Channel
  ): ChannelPerformance => {
    interface Totals { spend: number; revenue: number; impressions: number; clicks: number; conversions: number; }
    const totals = data.reduce<Totals>(
      (acc, row) => ({
        spend: acc.spend + (Number(row.spend) || 0),
        revenue: acc.revenue + (Number(row.revenue) || 0),
        impressions: acc.impressions + (Number(row.impressions) || 0),
        clicks: acc.clicks + (Number(row.clicks) || 0),
        conversions: acc.conversions + (Number(row.conversions) || 0),
      }),
      { spend: 0, revenue: 0, impressions: 0, clicks: 0, conversions: 0 }
    );

    return {
      channel,
      ...totals,
      roas: totals.spend > 0 ? totals.revenue / totals.spend : 0,
      cpc: totals.clicks > 0 ? totals.spend / totals.clicks : 0,
      ctr:
        totals.impressions > 0
          ? (totals.clicks / totals.impressions) * 100
          : 0,
    };
  };

  const metaPerf = aggregate(meta, "meta");
  const googlePerf = aggregate(google, "google");
  const shopifyPerf = aggregate(shopify, "shopify");

  const channelBreakdown = [metaPerf, googlePerf, shopifyPerf];

  const kpis: KPIData = {
    spend: metaPerf.spend + googlePerf.spend + shopifyPerf.spend,
    revenue: metaPerf.revenue + googlePerf.revenue + shopifyPerf.revenue,
    roas: 0,
    cpc: 0,
    ctr: 0,
    conversions:
      metaPerf.conversions + googlePerf.conversions + shopifyPerf.conversions,
    impressions:
      metaPerf.impressions + googlePerf.impressions + shopifyPerf.impressions,
    clicks: metaPerf.clicks + googlePerf.clicks + shopifyPerf.clicks,
  };
  kpis.roas = kpis.spend > 0 ? kpis.revenue / kpis.spend : 0;
  kpis.cpc = kpis.clicks > 0 ? kpis.spend / kpis.clicks : 0;
  kpis.ctr =
    kpis.impressions > 0 ? (kpis.clicks / kpis.impressions) * 100 : 0;

  // Build daily performance from all sources
  const dailyMap = new Map<string, DailyPerformance>();
  [...meta, ...google, ...shopify].forEach((row) => {
    const date = String(row.date);
    const existing = dailyMap.get(date) || {
      date,
      spend: 0,
      revenue: 0,
      roas: 0,
      conversions: 0,
    };
    existing.spend += Number(row.spend) || 0;
    existing.revenue += Number(row.revenue) || 0;
    existing.conversions += Number(row.conversions) || 0;
    existing.roas =
      existing.spend > 0 ? existing.revenue / existing.spend : 0;
    dailyMap.set(date, existing);
  });
  const dailyPerformance = Array.from(dailyMap.values()).sort((a, b) =>
    a.date.localeCompare(b.date)
  );

  // Build campaign rows
  const campaigns: CampaignRow[] = [];
  const addCampaigns = (
    data: Record<string, unknown>[],
    channel: Channel
  ) => {
    const campaignMap = new Map<string, CampaignRow>();
    data.forEach((row) => {
      const name = String(row.campaign || "Unknown Campaign");
      const existing = campaignMap.get(name);
      if (existing) {
        existing.spend += Number(row.spend) || 0;
        existing.revenue += Number(row.revenue) || 0;
        existing.impressions += Number(row.impressions) || 0;
        existing.clicks += Number(row.clicks) || 0;
        existing.conversions += Number(row.conversions) || 0;
      } else {
        campaignMap.set(name, {
          id: `${channel}-${campaigns.length + campaignMap.size}`,
          name,
          channel,
          status: "active",
          spend: Number(row.spend) || 0,
          revenue: Number(row.revenue) || 0,
          roas: 0,
          impressions: Number(row.impressions) || 0,
          clicks: Number(row.clicks) || 0,
          cpc: 0,
          ctr: 0,
          conversions: Number(row.conversions) || 0,
        });
      }
    });
    campaignMap.forEach((c) => {
      c.roas = c.spend > 0 ? c.revenue / c.spend : 0;
      c.cpc = c.clicks > 0 ? c.spend / c.clicks : 0;
      c.ctr = c.impressions > 0 ? (c.clicks / c.impressions) * 100 : 0;
      campaigns.push(c);
    });
  };

  addCampaigns(meta, "meta");
  addCampaigns(google, "google");
  addCampaigns(shopify, "shopify");

  return { kpis, channelBreakdown, dailyPerformance, campaigns };
}

export function generateDemoData(
  startDate: Date,
  endDate: Date
): {
  kpis: KPIData;
  channelBreakdown: ChannelPerformance[];
  dailyPerformance: DailyPerformance[];
  campaigns: CampaignRow[];
} {
  const days: DailyPerformance[] = [];
  const current = new Date(startDate);

  while (current <= endDate) {
    const metaSpend = 200 + Math.random() * 300;
    const googleSpend = 150 + Math.random() * 250;
    const shopifyRevenue = 800 + Math.random() * 1200;
    const spend = metaSpend + googleSpend;
    const revenue = shopifyRevenue + spend * (1.5 + Math.random() * 2);

    days.push({
      date: format(current, "yyyy-MM-dd"),
      spend: Math.round(spend * 100) / 100,
      revenue: Math.round(revenue * 100) / 100,
      roas: Math.round((revenue / spend) * 100) / 100,
      conversions: Math.floor(15 + Math.random() * 40),
      meta_spend: Math.round(metaSpend * 100) / 100,
      google_spend: Math.round(googleSpend * 100) / 100,
      shopify_revenue: Math.round(shopifyRevenue * 100) / 100,
    });
    current.setDate(current.getDate() + 1);
  }

  const totalSpend = days.reduce((s, d) => s + d.spend, 0);
  const totalRevenue = days.reduce((s, d) => s + d.revenue, 0);
  const totalConversions = days.reduce((s, d) => s + d.conversions, 0);
  const totalImpressions = days.length * (15000 + Math.random() * 10000);
  const totalClicks = totalImpressions * (0.02 + Math.random() * 0.03);

  const metaSpendTotal = days.reduce((s, d) => s + (d.meta_spend || 0), 0);
  const googleSpendTotal = days.reduce(
    (s, d) => s + (d.google_spend || 0),
    0
  );
  const shopifyRevenueTotal = days.reduce(
    (s, d) => s + (d.shopify_revenue || 0),
    0
  );

  const kpis: KPIData = {
    spend: Math.round(totalSpend * 100) / 100,
    revenue: Math.round(totalRevenue * 100) / 100,
    roas: Math.round((totalRevenue / totalSpend) * 100) / 100,
    cpc: Math.round((totalSpend / totalClicks) * 100) / 100,
    ctr: Math.round((totalClicks / totalImpressions) * 10000) / 100,
    conversions: totalConversions,
    impressions: Math.round(totalImpressions),
    clicks: Math.round(totalClicks),
  };

  const makeChannel = (
    channel: Channel,
    spend: number,
    revMul: number
  ): ChannelPerformance => {
    const rev = spend * revMul;
    const imp = Math.round(spend * 30 + Math.random() * 5000);
    const clk = Math.round(imp * (0.025 + Math.random() * 0.02));
    const conv = Math.round(clk * (0.04 + Math.random() * 0.03));
    return {
      channel,
      spend: Math.round(spend * 100) / 100,
      revenue: Math.round(rev * 100) / 100,
      roas: Math.round((rev / spend) * 100) / 100,
      conversions: conv,
      impressions: imp,
      clicks: clk,
      cpc: Math.round((spend / clk) * 100) / 100,
      ctr: Math.round((clk / imp) * 10000) / 100,
    };
  };

  const channelBreakdown: ChannelPerformance[] = [
    makeChannel("meta", metaSpendTotal, 2.8),
    makeChannel("google", googleSpendTotal, 3.2),
    makeChannel("shopify", shopifyRevenueTotal * 0.05, 18),
  ];

  const demoCampaigns: CampaignRow[] = [
    "Summer Sale - Prospecting",
    "Retargeting - Cart Abandoners",
    "Brand Awareness - Lookalike",
    "Dynamic Product Ads",
    "Search - Brand Terms",
    "Search - Generic Terms",
    "Shopping - All Products",
    "Performance Max - Main",
    "Shopify - Email Flow",
    "Shopify - SMS Blast",
  ].map((name, i) => {
    const channel: Channel =
      i < 4 ? "meta" : i < 8 ? "google" : "shopify";
    const spend = 500 + Math.random() * 2000;
    const rev = spend * (1.5 + Math.random() * 4);
    const imp = Math.round(spend * 25 + Math.random() * 8000);
    const clk = Math.round(imp * (0.02 + Math.random() * 0.03));
    return {
      id: `demo-${i}`,
      name,
      channel,
      status: Math.random() > 0.2 ? ("active" as const) : ("paused" as const),
      spend: Math.round(spend * 100) / 100,
      revenue: Math.round(rev * 100) / 100,
      roas: Math.round((rev / spend) * 100) / 100,
      impressions: imp,
      clicks: clk,
      cpc: Math.round((spend / clk) * 100) / 100,
      ctr: Math.round((clk / imp) * 10000) / 100,
      conversions: Math.floor(clk * (0.03 + Math.random() * 0.04)),
    };
  });

  return {
    kpis,
    channelBreakdown,
    dailyPerformance: days,
    campaigns: demoCampaigns,
  };
}
