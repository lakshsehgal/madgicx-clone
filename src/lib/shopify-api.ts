import { ShopifyCredentials, CampaignRow } from "@/types";
import { format, eachDayOfInterval } from "date-fns";

interface ShopifyOrder {
  id: number;
  name: string;
  created_at: string;
  total_price: string;
  subtotal_price: string;
  total_discounts: string;
  financial_status: string;
  source_name: string;
  referring_site: string;
  landing_site: string;
  line_items: {
    title: string;
    quantity: number;
    price: string;
  }[];
}

interface ShopifyOrdersResponse {
  orders: ShopifyOrder[];
}

export interface ShopifyResult {
  totalRevenue: number;
  totalOrders: number;
  totalItems: number;
  avgOrderValue: number;
  dailyData: { date: string; revenue: number; orders: number }[];
  productBreakdown: CampaignRow[];
}

function cleanStoreUrl(url: string): string {
  let clean = url.trim();
  clean = clean.replace(/^https?:\/\//, "");
  clean = clean.replace(/\/$/, "");
  if (!clean.includes(".")) {
    clean = `${clean}.myshopify.com`;
  }
  return clean;
}

export async function fetchShopifyData(
  credentials: ShopifyCredentials,
  startDate: Date,
  endDate: Date
): Promise<ShopifyResult> {
  if (!credentials.accessToken || !credentials.storeUrl) {
    throw new Error("Missing Shopify store URL or access token");
  }
  const storeUrl = cleanStoreUrl(credentials.storeUrl);
  const baseUrl = `https://${storeUrl}/admin/api/2024-10`;

  const dateFrom = format(startDate, "yyyy-MM-dd'T'00:00:00-00:00");
  const dateTo = format(endDate, "yyyy-MM-dd'T'23:59:59-00:00");

  // Fetch orders in the date range — request only the fields we need for aggregation
  const neededFields = "id,name,created_at,total_price,financial_status,line_items";
  const allOrders: ShopifyOrder[] = [];
  const firstUrl = `${baseUrl}/orders.json?created_at_min=${encodeURIComponent(dateFrom)}&created_at_max=${encodeURIComponent(dateTo)}&status=any&limit=250&fields=${neededFields}`;

  const maxPages = 8; // Cap at ~2000 orders to prevent extreme slowness
  let pageCount = 0;

  const fetchPage = async (url: string): Promise<void> => {
    if (pageCount >= maxPages) return; // Safety cap
    pageCount++;

    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 15000); // 15s timeout per page

    try {
      const response = await fetch(url, {
        headers: {
          "X-Shopify-Access-Token": credentials.accessToken,
          "Content-Type": "application/json",
        },
        signal: controller.signal,
      });

      if (!response.ok) {
        const error = await response.text().catch(() => "");
        throw new Error(`Shopify API error ${response.status}: ${error}`);
      }

      const data: ShopifyOrdersResponse = await response.json();
      allOrders.push(...(data.orders || []));

      // Handle pagination via Link header
      const linkHeader = response.headers.get("Link");
      if (linkHeader && pageCount < maxPages) {
        const nextMatch = linkHeader.match(/<([^>]+)>;\s*rel="next"/);
        if (nextMatch) {
          await fetchPage(nextMatch[1]);
        }
      }
    } finally {
      clearTimeout(timeout);
    }
  };

  await fetchPage(firstUrl);

  // Aggregate daily data
  const dailyMap = new Map<string, { revenue: number; orders: number }>();
  const productMap = new Map<string, { revenue: number; quantity: number; orders: number }>();

  // Initialize all days in range
  const days = eachDayOfInterval({ start: startDate, end: endDate });
  for (const day of days) {
    dailyMap.set(format(day, "yyyy-MM-dd"), { revenue: 0, orders: 0 });
  }

  let totalRevenue = 0;
  let totalItems = 0;

  for (const order of allOrders) {
    if (order.financial_status === "voided" || order.financial_status === "refunded") continue;

    const revenue = Number(order.total_price) || 0;
    const date = format(new Date(order.created_at), "yyyy-MM-dd");

    totalRevenue += revenue;

    const daily = dailyMap.get(date) || { revenue: 0, orders: 0 };
    daily.revenue += revenue;
    daily.orders += 1;
    dailyMap.set(date, daily);

    // Product breakdown
    for (const item of order.line_items) {
      totalItems += item.quantity;
      const existing = productMap.get(item.title);
      if (existing) {
        existing.revenue += Number(item.price) * item.quantity;
        existing.quantity += item.quantity;
        existing.orders += 1;
      } else {
        productMap.set(item.title, {
          revenue: Number(item.price) * item.quantity,
          quantity: item.quantity,
          orders: 1,
        });
      }
    }
  }

  const totalOrders = allOrders.filter(
    (o) => o.financial_status !== "voided" && o.financial_status !== "refunded"
  ).length;

  // Convert product breakdown to CampaignRow format (for consistency in the table)
  const productBreakdown: CampaignRow[] = Array.from(productMap.entries())
    .map(([name, data], i) => ({
      id: `shopify-${i}`,
      name,
      channel: "shopify" as const,
      status: "active" as const,
      spend: 0, // Shopify doesn't have spend
      revenue: data.revenue,
      roas: 0,
      impressions: 0,
      clicks: data.orders,
      cpc: 0,
      ctr: 0,
      conversions: data.quantity,
    }))
    .sort((a, b) => b.revenue - a.revenue)
    .slice(0, 20); // Top 20 products

  const dailyData = Array.from(dailyMap.entries())
    .map(([date, d]) => ({ date, ...d }))
    .sort((a, b) => a.date.localeCompare(b.date));

  return {
    totalRevenue,
    totalOrders,
    totalItems,
    avgOrderValue: totalOrders > 0 ? totalRevenue / totalOrders : 0,
    dailyData,
    productBreakdown,
  };
}

// Verify Shopify credentials
export async function verifyShopifyCredentials(
  credentials: ShopifyCredentials
): Promise<{ valid: boolean; shopName?: string; error?: string }> {
  const storeUrl = cleanStoreUrl(credentials.storeUrl);

  try {
    const response = await fetch(
      `https://${storeUrl}/admin/api/2024-10/shop.json`,
      {
        headers: {
          "X-Shopify-Access-Token": credentials.accessToken,
          "Content-Type": "application/json",
        },
      }
    );

    if (!response.ok) {
      return { valid: false, error: `HTTP ${response.status}` };
    }

    const data = await response.json();
    return { valid: true, shopName: data.shop?.name || storeUrl };
  } catch (err) {
    return { valid: false, error: String(err) };
  }
}
