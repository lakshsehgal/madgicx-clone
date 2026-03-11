import { NextRequest, NextResponse } from "next/server";
import { generateDemoData } from "@/lib/windsor";
import { fetchMetaData, verifyMetaCredentials } from "@/lib/meta-api";
import { fetchGoogleAdsData, verifyGoogleAdsCredentials } from "@/lib/google-ads-api";
import { fetchShopifyData, verifyShopifyCredentials } from "@/lib/shopify-api";
import {
  MetaCredentials,
  GoogleAdsCredentials,
  ShopifyCredentials,
  KPIData,
  ChannelPerformance,
  DailyPerformance,
  CampaignRow,
  ShopifyDetails,
} from "@/types";

// GET - demo data fallback
export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const startDate = searchParams.get("start_date") || "";
  const endDate = searchParams.get("end_date") || "";

  if (!startDate || !endDate) {
    return NextResponse.json(
      { error: "start_date and end_date are required" },
      { status: 400 }
    );
  }

  const data = generateDemoData(new Date(startDate), new Date(endDate));
  return NextResponse.json({ ...data, demo: true });
}

// POST - fetch real data from direct APIs
export async function POST(request: NextRequest) {
  const body = await request.json();
  const { action, startDate, endDate, metaCredentials, googleCredentials, shopifyCredentials } = body;

  // Credential verification endpoints
  if (action === "verify_meta") {
    const result = await verifyMetaCredentials(metaCredentials as MetaCredentials);
    return NextResponse.json(result);
  }
  if (action === "verify_google") {
    const result = await verifyGoogleAdsCredentials(googleCredentials as GoogleAdsCredentials);
    return NextResponse.json(result);
  }
  if (action === "verify_shopify") {
    const result = await verifyShopifyCredentials(shopifyCredentials as ShopifyCredentials);
    return NextResponse.json(result);
  }

  // Fetch performance data
  if (!startDate || !endDate) {
    return NextResponse.json(
      { error: "startDate and endDate are required" },
      { status: 400 }
    );
  }

  const start = new Date(startDate);
  const end = new Date(endDate);

  const hasAnyCredentials = metaCredentials || googleCredentials || shopifyCredentials;
  if (!hasAnyCredentials) {
    const data = generateDemoData(start, end);
    return NextResponse.json({ ...data, demo: true });
  }

  try {
    const [metaResult, googleResult, shopifyResult] = await Promise.allSettled([
      metaCredentials ? fetchMetaData(metaCredentials, start, end) : Promise.resolve(null),
      googleCredentials ? fetchGoogleAdsData(googleCredentials, start, end) : Promise.resolve(null),
      shopifyCredentials ? fetchShopifyData(shopifyCredentials, start, end) : Promise.resolve(null),
    ]);

    const meta = metaResult.status === "fulfilled" ? metaResult.value : null;
    const google = googleResult.status === "fulfilled" ? googleResult.value : null;
    const shopify = shopifyResult.status === "fulfilled" ? shopifyResult.value : null;

    const errors: string[] = [];
    if (metaCredentials && metaResult.status === "rejected") {
      errors.push(`Meta: ${metaResult.reason}`);
    }
    if (googleCredentials && googleResult.status === "rejected") {
      errors.push(`Google: ${googleResult.reason}`);
    }
    if (shopifyCredentials && shopifyResult.status === "rejected") {
      errors.push(`Shopify: ${shopifyResult.reason}`);
    }

    // Build channel breakdown with enhanced metrics
    const channelBreakdown: ChannelPerformance[] = [];

    if (meta) {
      const metaClicks = meta.totalClicks;
      const metaImpressions = meta.totalImpressions;
      channelBreakdown.push({
        channel: "meta",
        spend: meta.totalSpend,
        revenue: meta.totalRevenue,
        roas: meta.totalSpend > 0 ? meta.totalRevenue / meta.totalSpend : 0,
        conversions: meta.totalConversions,
        impressions: metaImpressions,
        clicks: metaClicks,
        cpc: metaClicks > 0 ? meta.totalSpend / metaClicks : 0,
        ctr: metaImpressions > 0 ? (metaClicks / metaImpressions) * 100 : 0,
        cpm: metaImpressions > 0 ? (meta.totalSpend / metaImpressions) * 1000 : 0,
        campaignCount: meta.campaigns.length,
      });
    }

    if (google) {
      const gClicks = google.totalClicks;
      const gImpressions = google.totalImpressions;
      channelBreakdown.push({
        channel: "google",
        spend: google.totalSpend,
        revenue: google.totalRevenue,
        roas: google.totalSpend > 0 ? google.totalRevenue / google.totalSpend : 0,
        conversions: google.totalConversions,
        impressions: gImpressions,
        clicks: gClicks,
        cpc: gClicks > 0 ? google.totalSpend / gClicks : 0,
        ctr: gImpressions > 0 ? (gClicks / gImpressions) * 100 : 0,
        cpm: gImpressions > 0 ? (google.totalSpend / gImpressions) * 1000 : 0,
        campaignCount: google.campaigns.length,
      });
    }

    if (shopify) {
      channelBreakdown.push({
        channel: "shopify",
        spend: 0,
        revenue: shopify.totalRevenue,
        roas: 0,
        conversions: shopify.totalOrders,
        impressions: 0,
        clicks: 0,
        cpc: 0,
        ctr: 0,
      });
    }

    // Aggregate KPIs
    const totalSpend = (meta?.totalSpend || 0) + (google?.totalSpend || 0);
    const totalRevenue = (meta?.totalRevenue || 0) + (google?.totalRevenue || 0) + (shopify?.totalRevenue || 0);
    const totalImpressions = (meta?.totalImpressions || 0) + (google?.totalImpressions || 0);
    const totalClicks = (meta?.totalClicks || 0) + (google?.totalClicks || 0);
    const totalConversions = (meta?.totalConversions || 0) + (google?.totalConversions || 0) + (shopify?.totalOrders || 0);

    const kpis: KPIData = {
      spend: totalSpend,
      revenue: totalRevenue,
      roas: totalSpend > 0 ? totalRevenue / totalSpend : 0,
      cpc: totalClicks > 0 ? totalSpend / totalClicks : 0,
      ctr: totalImpressions > 0 ? (totalClicks / totalImpressions) * 100 : 0,
      conversions: totalConversions,
      impressions: totalImpressions,
      clicks: totalClicks,
    };

    // Merge daily performance with per-channel breakdowns
    const dailyMap = new Map<string, DailyPerformance>();

    const addDaily = (items: { date: string; spend?: number; revenue: number; conversions?: number; orders?: number }[], channel: string) => {
      for (const item of items) {
        const existing = dailyMap.get(item.date) || {
          date: item.date,
          spend: 0,
          revenue: 0,
          roas: 0,
          conversions: 0,
        };
        const spend = ("spend" in item ? item.spend : 0) || 0;
        const conversions = ("conversions" in item ? item.conversions : item.orders) || 0;
        existing.spend += spend;
        existing.revenue += item.revenue;
        existing.conversions += conversions;

        if (channel === "meta") {
          existing.meta_spend = (existing.meta_spend || 0) + spend;
          existing.meta_revenue = (existing.meta_revenue || 0) + item.revenue;
        }
        if (channel === "google") {
          existing.google_spend = (existing.google_spend || 0) + spend;
          existing.google_revenue = (existing.google_revenue || 0) + item.revenue;
        }
        if (channel === "shopify") {
          existing.shopify_revenue = (existing.shopify_revenue || 0) + item.revenue;
          existing.shopify_orders = (existing.shopify_orders || 0) + (("orders" in item ? item.orders : 0) || 0);
        }

        existing.roas = existing.spend > 0 ? existing.revenue / existing.spend : 0;
        dailyMap.set(item.date, existing);
      }
    };

    if (meta) addDaily(meta.dailyData, "meta");
    if (google) addDaily(google.dailyData, "google");
    if (shopify) addDaily(shopify.dailyData, "shopify");

    const dailyPerformance = Array.from(dailyMap.values()).sort((a, b) =>
      a.date.localeCompare(b.date)
    );

    // Merge campaigns
    const campaigns: CampaignRow[] = [
      ...(meta?.campaigns || []),
      ...(google?.campaigns || []),
      ...(shopify?.productBreakdown || []),
    ];

    // Shopify details
    const shopifyDetails: ShopifyDetails | undefined = shopify
      ? {
          totalSales: shopify.totalRevenue,
          totalOrders: shopify.totalOrders,
          avgOrderValue: shopify.avgOrderValue,
          totalItems: shopify.totalItems,
        }
      : undefined;

    return NextResponse.json({
      kpis,
      channelBreakdown,
      dailyPerformance,
      campaigns,
      shopifyDetails,
      errors: errors.length > 0 ? errors : undefined,
    });
  } catch (err) {
    const data = generateDemoData(start, end);
    return NextResponse.json({
      ...data,
      demo: true,
      error: `API call failed: ${String(err)}`,
    });
  }
}
