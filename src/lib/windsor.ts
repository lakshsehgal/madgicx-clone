import {
  ChannelPerformance,
  DailyPerformance,
  CampaignRow,
  KPIData,
  Channel,
} from "@/types";
import { format } from "date-fns";

// Demo data generator for when no API credentials are configured
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
