export type Channel = "meta" | "google" | "shopify";

// Windsor account as returned by the API
export interface WindsorAccount {
  id: string;
  name: string;
  connector: string; // "facebook", "google_ads", "shopify"
  channel: Channel;
}

// A client space within the Neuroid workspace
export interface ClientSpace {
  id: string;
  name: string;
  metaAccountId?: string;
  metaAccountName?: string;
  googleAccountId?: string;
  googleAccountName?: string;
  shopifyAccountId?: string;
  shopifyAccountName?: string;
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
