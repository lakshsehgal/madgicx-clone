"use client";

import React from "react";
import { ChannelPerformance, CampaignRow, DailyPerformance } from "@/types";
import {
  DollarSign,
  TrendingUp,
  Target,
  Megaphone,
  Eye,
  MousePointerClick,
  Percent,
} from "lucide-react";
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
} from "recharts";
import { format, parseISO } from "date-fns";

interface MetaMetricsProps {
  channelData?: ChannelPerformance;
  campaigns: CampaignRow[];
  dailyPerformance: DailyPerformance[];
  loading: boolean;
}

function formatCurrency(value: number): string {
  if (value >= 10000000) return `₹${(value / 10000000).toFixed(2)}Cr`;
  if (value >= 100000) return `₹${(value / 100000).toFixed(1)}L`;
  if (value >= 1000) return `₹${(value / 1000).toFixed(1)}K`;
  return `₹${value.toFixed(0)}`;
}

function formatNumber(value: number): string {
  if (value >= 1000000) return `${(value / 1000000).toFixed(1)}M`;
  if (value >= 1000) return `${(value / 1000).toFixed(1)}K`;
  return value.toLocaleString();
}

export default function MetaMetrics({
  channelData,
  campaigns,
  dailyPerformance,
  loading,
}: MetaMetricsProps) {
  const metaCampaigns = campaigns.filter((c) => c.channel === "meta");

  if (loading) {
    return (
      <div className="space-y-4">
        <div className="h-6 bg-gray-200 rounded w-36 animate-pulse" />
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-3">
          {Array.from({ length: 7 }).map((_, i) => (
            <div key={i} className="bg-white rounded-2xl p-4 border border-border-light animate-pulse">
              <div className="h-3 bg-gray-200 rounded w-16 mb-2" />
              <div className="h-6 bg-gray-200 rounded w-20" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (!channelData) {
    return (
      <div className="space-y-4">
        <h2 className="section-header section-header-meta text-lg font-bold text-gray-900">
          Meta Metrics
        </h2>
        <div className="bg-white rounded-2xl border border-border-light p-8 text-center shadow-card">
          <div className="w-12 h-12 bg-blue-50 rounded-xl flex items-center justify-center mx-auto mb-3">
            <Megaphone className="w-6 h-6 text-blue-400" />
          </div>
          <p className="text-sm text-gray-500">Connect Meta Ads to see metrics here</p>
        </div>
      </div>
    );
  }

  const cards = [
    { label: "Adspend", value: formatCurrency(channelData.spend), icon: DollarSign, color: "text-blue-600", bg: "bg-blue-50" },
    { label: "Revenue", value: formatCurrency(channelData.revenue), icon: TrendingUp, color: "text-emerald-600", bg: "bg-emerald-50" },
    { label: "ROAS", value: `${channelData.roas.toFixed(2)}x`, icon: Target, color: "text-violet-600", bg: "bg-violet-50" },
    { label: "Campaigns", value: String(channelData.campaignCount || metaCampaigns.length), icon: Megaphone, color: "text-blue-600", bg: "bg-blue-50" },
    { label: "CPM", value: `₹${(channelData.cpm || 0).toFixed(2)}`, icon: Eye, color: "text-cyan-600", bg: "bg-cyan-50" },
    { label: "CTR", value: `${channelData.ctr.toFixed(2)}%`, icon: Percent, color: "text-amber-600", bg: "bg-amber-50" },
    { label: "CPC", value: `₹${channelData.cpc.toFixed(2)}`, icon: MousePointerClick, color: "text-rose-600", bg: "bg-rose-50" },
  ];

  const formatDate = (dateStr: string) => {
    try { return format(parseISO(dateStr), "MMM d"); } catch { return dateStr; }
  };

  const metaDailyData = dailyPerformance
    .filter((d) => d.meta_spend && d.meta_spend > 0)
    .map((d) => ({
      date: d.date,
      spend: d.meta_spend || 0,
      revenue: d.meta_revenue || 0,
    }));

  return (
    <div className="space-y-4">
      <h2 className="section-header section-header-meta text-lg font-bold text-gray-900">
        Meta Metrics
      </h2>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-3">
        {cards.map((card) => {
          const Icon = card.icon;
          return (
            <div key={card.label} className="metric-card bg-white rounded-2xl p-4 border border-border-light shadow-card">
              <div className="flex items-center gap-1.5 mb-2">
                <div className={`p-1 rounded-md ${card.bg}`}>
                  <Icon className={`w-3 h-3 ${card.color}`} />
                </div>
                <span className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider">{card.label}</span>
              </div>
              <p className="text-lg font-bold text-gray-900 metric-value">{card.value}</p>
            </div>
          );
        })}
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
        {/* Daily Meta Chart */}
        {metaDailyData.length > 0 && (
          <div className="bg-white rounded-2xl border border-border-light p-5 shadow-card">
            <h3 className="text-sm font-semibold text-gray-700 mb-4">Daily Meta Spend vs Revenue</h3>
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={metaDailyData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f2f7" />
                <XAxis dataKey="date" tickFormatter={formatDate} tick={{ fontSize: 10, fill: "#9ca3af" }} stroke="#e5e8f0" />
                <YAxis tick={{ fontSize: 10, fill: "#9ca3af" }} stroke="#e5e8f0" />
                <Tooltip
                  labelFormatter={(label) => formatDate(String(label))}
                  contentStyle={{ borderRadius: "12px", border: "1px solid #e5e8f0", fontSize: "12px" }}
                  formatter={(value, name) => [`₹${Number(value).toFixed(2)}`, String(name) === "spend" ? "Adspend" : "Revenue"]}
                />
                <Bar dataKey="spend" fill="#3B82F6" radius={[4, 4, 0, 0]} name="spend" />
                <Bar dataKey="revenue" fill="#10B981" radius={[4, 4, 0, 0]} name="revenue" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        )}

        {/* Campaign Table */}
        {metaCampaigns.length > 0 && (
          <div className="bg-white rounded-2xl border border-border-light p-5 shadow-card">
            <h3 className="text-sm font-semibold text-gray-700 mb-4">Top Meta Campaigns</h3>
            <div className="overflow-x-auto">
              <table className="w-full text-xs">
                <thead>
                  <tr className="border-b border-border-light">
                    <th className="text-left py-2 px-2 font-semibold text-gray-400 uppercase tracking-wider">Campaign</th>
                    <th className="text-right py-2 px-2 font-semibold text-gray-400 uppercase tracking-wider">Spend</th>
                    <th className="text-right py-2 px-2 font-semibold text-gray-400 uppercase tracking-wider">Revenue</th>
                    <th className="text-right py-2 px-2 font-semibold text-gray-400 uppercase tracking-wider">ROAS</th>
                    <th className="text-right py-2 px-2 font-semibold text-gray-400 uppercase tracking-wider">CPC</th>
                    <th className="text-right py-2 px-2 font-semibold text-gray-400 uppercase tracking-wider">CTR</th>
                  </tr>
                </thead>
                <tbody>
                  {metaCampaigns.slice(0, 10).map((c) => (
                    <tr key={c.id} className="border-b border-border-light/50 hover:bg-surface-tertiary transition-colors">
                      <td className="py-2.5 px-2 font-medium text-gray-800 max-w-[180px] truncate">{c.name}</td>
                      <td className="text-right py-2.5 px-2 text-gray-600">{formatCurrency(c.spend)}</td>
                      <td className="text-right py-2.5 px-2 text-gray-600">{formatCurrency(c.revenue)}</td>
                      <td className="text-right py-2.5 px-2">
                        <span className={`font-semibold ${c.roas >= 2 ? "text-emerald-600" : c.roas >= 1 ? "text-amber-600" : "text-red-500"}`}>
                          {c.roas.toFixed(2)}x
                        </span>
                      </td>
                      <td className="text-right py-2.5 px-2 text-gray-600">₹{c.cpc.toFixed(2)}</td>
                      <td className="text-right py-2.5 px-2 text-gray-600">{c.ctr.toFixed(2)}%</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>

      {/* Impressions & Clicks summary */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <div className="bg-gradient-to-br from-blue-50 to-white rounded-2xl p-4 border border-blue-100">
          <p className="text-[10px] font-semibold text-blue-400 uppercase tracking-wider mb-1">Impressions</p>
          <p className="text-lg font-bold text-gray-900">{formatNumber(channelData.impressions)}</p>
        </div>
        <div className="bg-gradient-to-br from-blue-50 to-white rounded-2xl p-4 border border-blue-100">
          <p className="text-[10px] font-semibold text-blue-400 uppercase tracking-wider mb-1">Clicks</p>
          <p className="text-lg font-bold text-gray-900">{formatNumber(channelData.clicks)}</p>
        </div>
        <div className="bg-gradient-to-br from-blue-50 to-white rounded-2xl p-4 border border-blue-100">
          <p className="text-[10px] font-semibold text-blue-400 uppercase tracking-wider mb-1">Conversions</p>
          <p className="text-lg font-bold text-gray-900">{formatNumber(channelData.conversions)}</p>
        </div>
        <div className="bg-gradient-to-br from-blue-50 to-white rounded-2xl p-4 border border-blue-100">
          <p className="text-[10px] font-semibold text-blue-400 uppercase tracking-wider mb-1">Frequency</p>
          <p className="text-lg font-bold text-gray-900">
            {channelData.impressions > 0 && channelData.clicks > 0
              ? (channelData.impressions / (channelData.impressions / (channelData.clicks / channelData.ctr * 100))).toFixed(1)
              : "—"}
          </p>
        </div>
      </div>
    </div>
  );
}
