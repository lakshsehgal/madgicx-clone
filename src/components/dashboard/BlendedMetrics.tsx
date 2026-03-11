"use client";

import React from "react";
import { ChannelPerformance, DailyPerformance, ShopifyDetails } from "@/types";
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
} from "recharts";
import { format, parseISO } from "date-fns";

interface BlendedMetricsProps {
  channelBreakdown: ChannelPerformance[];
  dailyPerformance: DailyPerformance[];
  shopifyDetails?: ShopifyDetails;
  loading: boolean;
}

function fmt(value: number): string {
  if (value >= 10000000) return `₹${(value / 10000000).toFixed(2)}Cr`;
  if (value >= 100000) return `₹${(value / 100000).toFixed(1)}L`;
  if (value >= 1000) return `₹${(value / 1000).toFixed(1)}K`;
  return `₹${value.toFixed(0)}`;
}

export default function BlendedMetrics({
  channelBreakdown,
  dailyPerformance,
  shopifyDetails,
  loading,
}: BlendedMetricsProps) {
  const meta = channelBreakdown.find((c) => c.channel === "meta");
  const google = channelBreakdown.find((c) => c.channel === "google");
  const shopify = channelBreakdown.find((c) => c.channel === "shopify");

  const blendedAdspend = (meta?.spend || 0) + (google?.spend || 0);
  const shopifyTotalSales = shopifyDetails?.totalSales || shopify?.revenue || 0;
  const blendedROAS = blendedAdspend > 0 ? shopifyTotalSales / blendedAdspend : 0;
  const shopifyAOV = shopifyDetails?.avgOrderValue || 0;
  const shopifyOrders = shopifyDetails?.totalOrders || shopify?.conversions || 0;
  const blendedCAC = shopifyOrders > 0 ? blendedAdspend / shopifyOrders : 0;

  const cards = [
    { label: "BLENDED AD SPEND", value: fmt(blendedAdspend), sub: `Meta ${fmt(meta?.spend || 0)} + Google ${fmt(google?.spend || 0)}`, color: "metric-card-amber" },
    { label: "SHOPIFY TOTAL SALES", value: fmt(shopifyTotalSales), sub: `${shopifyOrders.toLocaleString()} orders`, color: "metric-card-green" },
    { label: "BLENDED ROAS", value: `${blendedROAS.toFixed(2)}x`, sub: "Shopify Sales / Adspend", color: "metric-card-blue" },
    { label: "TOTAL SHOPIFY ORDERS", value: shopifyOrders.toLocaleString(), sub: "", color: "metric-card-blue" },
    { label: "AVERAGE ORDER VALUE", value: fmt(shopifyAOV), sub: "", color: "metric-card-amber" },
    { label: "BLENDED CAC", value: fmt(blendedCAC), sub: "Total Adspend / Orders", color: "metric-card-amber" },
    { label: "META AD SPEND", value: fmt(meta?.spend || 0), sub: "", color: "metric-card-sky" },
    { label: "GOOGLE AD SPEND", value: fmt(google?.spend || 0), sub: "", color: "metric-card-teal" },
  ];

  const formatDate = (dateStr: string) => {
    try { return format(parseISO(dateStr), "MMM d"); } catch { return dateStr; }
  };

  if (loading) {
    return (
      <div className="space-y-5">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-gray-200 animate-pulse" />
          <div className="h-7 bg-gray-200 rounded w-64 animate-pulse" />
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="bg-white rounded-xl p-5 border border-gray-200 animate-pulse">
              <div className="h-3 bg-gray-200 rounded w-28 mb-4" />
              <div className="h-8 bg-gray-200 rounded w-24" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-5">
      {/* Section Header */}
      <div>
        <div className="flex items-center gap-3 mb-2">
          <div className="section-number">1</div>
          <h2 className="text-2xl font-bold text-gray-900">Blended Executive Summary</h2>
        </div>
        <p className="text-sm text-gray-500 ml-11">
          Cross-channel performance overview — Meta + Google Ads spend vs Shopify revenue.
        </p>
      </div>

      {/* KPI Cards - 2 rows of 4 */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {cards.map((card) => (
          <div key={card.label} className={`metric-card ${card.color} p-5 shadow-card`}>
            <p className="text-[11px] font-semibold text-gray-500 uppercase tracking-wider mb-3">
              {card.label}
            </p>
            <p className="text-3xl font-bold text-gray-900 metric-value">{card.value}</p>
            {card.sub && (
              <p className="text-xs text-gray-400 mt-2">{card.sub}</p>
            )}
          </div>
        ))}
      </div>

      {/* Daily Chart */}
      <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-card">
        <h3 className="text-sm font-semibold text-gray-700 mb-4">Daily Blended Performance</h3>
        <ResponsiveContainer width="100%" height={300}>
          <AreaChart data={dailyPerformance}>
            <defs>
              <linearGradient id="blendedSpendGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#ef4444" stopOpacity={0.15} />
                <stop offset="95%" stopColor="#ef4444" stopOpacity={0} />
              </linearGradient>
              <linearGradient id="shopifyRevGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#10b981" stopOpacity={0.15} />
                <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#f0f2f7" />
            <XAxis dataKey="date" tickFormatter={formatDate} tick={{ fontSize: 11, fill: "#9ca3af" }} stroke="#e5e8f0" />
            <YAxis tick={{ fontSize: 11, fill: "#9ca3af" }} stroke="#e5e8f0" />
            <Tooltip
              labelFormatter={(label) => formatDate(String(label))}
              contentStyle={{ borderRadius: "12px", border: "1px solid #e5e8f0", boxShadow: "0 4px 12px rgba(0,0,0,0.08)", fontSize: "12px" }}
              formatter={(value, name) => {
                const v = Number(value);
                const n = String(name);
                return [`₹${v.toFixed(2)}`, n === "spend" ? "Blended Adspend" : "Shopify Revenue"];
              }}
            />
            <Legend formatter={(value) => (value === "spend" ? "Blended Adspend" : "Shopify Revenue")} wrapperStyle={{ fontSize: "12px" }} />
            <Area type="monotone" dataKey="spend" stroke="#ef4444" strokeWidth={2} fill="url(#blendedSpendGrad)" dot={false} />
            <Area type="monotone" dataKey="shopify_revenue" stroke="#10b981" strokeWidth={2} fill="url(#shopifyRevGrad)" dot={false} />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
