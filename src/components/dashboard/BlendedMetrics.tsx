"use client";

import React from "react";
import {
  ChannelPerformance,
  DailyPerformance,
  ShopifyDetails,
} from "@/types";
import {
  DollarSign,
  TrendingUp,
  Target,
  ShoppingCart,
  UserCheck,
} from "lucide-react";
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

function formatCurrency(value: number): string {
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
    {
      label: "Blended Adspend",
      value: formatCurrency(blendedAdspend),
      subtitle: "Meta + Google",
      icon: DollarSign,
      gradient: "from-red-500 to-orange-500",
      bgGlow: "bg-red-500/5",
    },
    {
      label: "Shopify Total Sales",
      value: formatCurrency(shopifyTotalSales),
      subtitle: `${shopifyOrders} orders`,
      icon: ShoppingCart,
      gradient: "from-emerald-500 to-green-500",
      bgGlow: "bg-emerald-500/5",
    },
    {
      label: "Blended ROAS",
      value: `${blendedROAS.toFixed(2)}x`,
      subtitle: "Sales / Adspend",
      icon: Target,
      gradient: "from-primary-500 to-violet-500",
      bgGlow: "bg-primary-500/5",
    },
    {
      label: "Shopify AOV",
      value: formatCurrency(shopifyAOV),
      subtitle: "Avg Order Value",
      icon: TrendingUp,
      gradient: "from-cyan-500 to-blue-500",
      bgGlow: "bg-cyan-500/5",
    },
    {
      label: "Blended CAC",
      value: formatCurrency(blendedCAC),
      subtitle: "Adspend / Orders",
      icon: UserCheck,
      gradient: "from-amber-500 to-orange-500",
      bgGlow: "bg-amber-500/5",
    },
  ];

  const formatDate = (dateStr: string) => {
    try {
      return format(parseISO(dateStr), "MMM d");
    } catch {
      return dateStr;
    }
  };

  if (loading) {
    return (
      <div className="space-y-4">
        <div className="h-6 bg-gray-200 rounded w-48 animate-pulse" />
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="bg-white rounded-2xl p-5 border border-border-light animate-pulse">
              <div className="h-3 bg-gray-200 rounded w-20 mb-3" />
              <div className="h-7 bg-gray-200 rounded w-24" />
            </div>
          ))}
        </div>
        <div className="bg-white rounded-2xl border border-border-light p-6 animate-pulse">
          <div className="h-72 bg-gray-100 rounded-xl" />
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <h2 className="section-header section-header-blended text-lg font-bold text-gray-900">
        Blended Metrics
      </h2>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3">
        {cards.map((card) => {
          const Icon = card.icon;
          return (
            <div
              key={card.label}
              className={`metric-card bg-white rounded-2xl p-5 border border-border-light shadow-card relative overflow-hidden`}
            >
              <div className={`absolute top-0 right-0 w-24 h-24 ${card.bgGlow} rounded-full -translate-y-8 translate-x-8`} />
              <div className="relative">
                <div className="flex items-center gap-2 mb-3">
                  <div className={`p-1.5 rounded-lg bg-gradient-to-br ${card.gradient}`}>
                    <Icon className="w-3.5 h-3.5 text-white" />
                  </div>
                  <span className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider">
                    {card.label}
                  </span>
                </div>
                <p className="text-2xl font-bold text-gray-900 metric-value">{card.value}</p>
                <p className="text-[11px] text-gray-400 mt-1 font-medium">{card.subtitle}</p>
              </div>
            </div>
          );
        })}
      </div>

      {/* Daily Numbers Chart */}
      <div className="bg-white rounded-2xl border border-border-light p-6 shadow-card">
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
            <XAxis
              dataKey="date"
              tickFormatter={formatDate}
              tick={{ fontSize: 11, fill: "#9ca3af" }}
              stroke="#e5e8f0"
            />
            <YAxis tick={{ fontSize: 11, fill: "#9ca3af" }} stroke="#e5e8f0" />
            <Tooltip
              labelFormatter={(label) => formatDate(String(label))}
              contentStyle={{
                borderRadius: "12px",
                border: "1px solid #e5e8f0",
                boxShadow: "0 4px 12px rgba(0,0,0,0.08)",
                fontSize: "12px",
              }}
              formatter={(value, name) => {
                const v = Number(value);
                const n = String(name);
                const label = n === "spend" ? "Blended Adspend" : "Shopify Revenue";
                return [`₹${v.toFixed(2)}`, label];
              }}
            />
            <Legend
              formatter={(value) => (value === "spend" ? "Blended Adspend" : "Shopify Revenue")}
              wrapperStyle={{ fontSize: "12px" }}
            />
            <Area
              type="monotone"
              dataKey="spend"
              stroke="#ef4444"
              strokeWidth={2}
              fill="url(#blendedSpendGrad)"
              dot={false}
            />
            <Area
              type="monotone"
              dataKey="shopify_revenue"
              stroke="#10b981"
              strokeWidth={2}
              fill="url(#shopifyRevGrad)"
              dot={false}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
