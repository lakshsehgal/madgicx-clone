export type Channel = "meta" | "google" | "shopify";

// Direct API credentials for each platform
export interface MetaCredentials {
  accessToken: string;
  adAccountId: string; // Format: act_XXXXX
}

export interface GoogleAdsCredentials {
  developerToken: string;
  clientId: string;
  clientSecret: string;
  refreshToken: string;
  customerId: string; // Format: XXX-XXX-XXXX (stored without dashes)
}

export interface ShopifyCredentials {
  storeUrl: string; // e.g., mystore.myshopify.com
  accessToken: string;
  clientId?: string; // Shopify app Client ID (from Partners dashboard)
  clientSecret?: string; // Shopify app Client Secret
}

// A client space within the Neuroid workspace
export interface ClientSpace {
  id: string;
  name: string;
  metaCredentials?: MetaCredentials;
  googleCredentials?: GoogleAdsCredentials;
  shopifyCredentials?: ShopifyCredentials;
  connectedChannels: Channel[];
  createdAt: string;
}

export interface KPIData {
  spend: number;
  revenue: number;
  roas: number;
  cpc: number;
  ctr: number;
  conversions: number;
  impressions: number;
  clicks: number;
}

export interface ChannelPerformance {
  channel: Channel;
  spend: number;
  revenue: number;
  roas: number;
  conversions: number;
  impressions: number;
  clicks: number;
  cpc: number;
  ctr: number;
}

export interface DailyPerformance {
  date: string;
  spend: number;
  revenue: number;
  roas: number;
  conversions: number;
  meta_spend?: number;
  google_spend?: number;
  shopify_revenue?: number;
}

export interface CampaignRow {
  id: string;
  name: string;
  channel: Channel;
  status: "active" | "paused" | "ended";
  spend: number;
  revenue: number;
  roas: number;
  impressions: number;
  clicks: number;
  cpc: number;
  ctr: number;
  conversions: number;
}

export interface DateRange {
  from: Date;
  to: Date;
}
