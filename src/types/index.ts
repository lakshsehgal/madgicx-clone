export type Channel = "meta" | "google" | "shopify";

export interface Workspace {
  id: string;
  name: string;
  clientName: string;
  windsorApiKey?: string;
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

export interface WindsorRequestParams {
  date_preset?: string;
  start_date?: string;
  end_date?: string;
  fields: string[];
  connector?: string;
}
