"use client";

import React from "react";
import { ChannelPerformance, CampaignRow, AdRow, DailyPerformance } from "@/types";
import { Megaphone } from "lucide-react";
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
  metaAds?: AdRow[];
  dailyPerformance: DailyPerformance[];
  loading: boolean;
  accountId?: string;
}

function fmt(value: number): string {
  if (value >= 10000000) return `₹${(value / 10000000).toFixed(2)}Cr`;
  if (value >= 100000) return `₹${(value / 100000).toFixed(1)}L`;
  if (value >= 1000) return `₹${(value / 1000).toFixed(1)}K`;
  return `₹${value.toFixed(0)}`;
}

function fmtNum(value: number): string {
  if (value >= 10000000) return `${(value / 10000000).toFixed(2)}Cr`;
  if (value >= 100000) return `${(value / 100000).toFixed(1)}L`;
  if (value >= 1000) return `${(value / 1000).toFixed(1)}K`;
  return value.toLocaleString();
}

export default function MetaMetrics({
  channelData,
  campaigns,
  metaAds,
  dailyPerformance,
  loading,
  accountId,
}: MetaMetricsProps) {
  const metaCampaigns = campaigns.filter((c) => c.channel === "meta");
  const adRows = metaAds || [];

  if (loading) {
    return (
      <div className="space-y-5">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-gray-200 animate-pulse" />
          <div className="h-7 bg-gray-200 rounded w-56 animate-pulse" />
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="bg-white rounded-xl p-5 border border-gray-200 animate-pulse">
              <div className="h-3 bg-gray-200 rounded w-24 mb-4" />
              <div className="h-8 bg-gray-200 rounded w-20" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (!channelData) {
    return (
      <div className="space-y-5">
        <div className="flex items-center gap-3">
          <div className="section-number">2</div>
          <h2 className="text-2xl font-bold text-gray-900">Meta Ads Performance</h2>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 p-8 text-center shadow-card">
          <div className="w-12 h-12 bg-blue-50 rounded-xl flex items-center justify-center mx-auto mb-3">
            <Megaphone className="w-6 h-6 text-blue-400" />
          </div>
          <p className="text-sm text-gray-500">Connect Meta Ads to see metrics here</p>
        </div>
      </div>
    );
  }

  const cpa = channelData.conversions > 0 ? channelData.spend / channelData.conversions : 0;

  const row1 = [
    { label: "META TOTAL SPEND", value: fmt(channelData.spend), color: "metric-card-amber" },
    { label: "META ATTRIBUTED REVENUE", value: fmt(channelData.revenue), color: "metric-card-green" },
    { label: "META ROAS", value: `${channelData.roas.toFixed(2)}x`, color: "metric-card-blue" },
    { label: "TOTAL PURCHASES", value: channelData.conversions.toLocaleString(), color: "metric-card-blue" },
  ];

  const row2 = [
    { label: "TOTAL IMPRESSIONS", value: fmtNum(channelData.impressions), color: "metric-card-sky" },
    { label: "BLENDED CPM (₹)", value: fmt(channelData.cpm || 0), color: "metric-card-amber" },
    { label: "AVG CPA (₹)", value: fmt(cpa), color: "metric-card-red" },
    { label: "AVG CTR", value: `${channelData.ctr.toFixed(2)}%`, color: "metric-card-teal" },
  ];

  const formatDate = (dateStr: string) => {
    try { return format(parseISO(dateStr), "MMM d"); } catch { return dateStr; }
  };

  const metaDailyData = dailyPerformance
    .filter((d) => d.meta_spend && d.meta_spend > 0)
    .map((d) => ({ date: d.date, spend: d.meta_spend || 0, revenue: d.meta_revenue || 0 }));

  return (
    <div className="space-y-5">
      {/* Section Header */}
      <div>
        <div className="flex items-center gap-3 mb-2">
          <div className="section-number">2</div>
          <h2 className="text-2xl font-bold text-gray-900">Meta Ads Performance</h2>
        </div>
        {accountId && (
          <div className="ml-11 mb-2">
            <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-amber-50 text-amber-700 border border-amber-200">
              META ADS &middot; ACCOUNT: {accountId}
            </span>
          </div>
        )}
        <p className="text-sm text-gray-500 ml-11">
          All active campaigns — ranked by spend. Revenue = Meta-attributed conversion value.
        </p>
      </div>

      {/* Row 1 */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {row1.map((card) => (
          <div key={card.label} className={`metric-card ${card.color} p-5 shadow-card`}>
            <p className="text-[11px] font-semibold text-gray-500 uppercase tracking-wider mb-3">{card.label}</p>
            <p className="text-3xl font-bold text-gray-900 metric-value">{card.value}</p>
          </div>
        ))}
      </div>

      {/* Row 2 */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {row2.map((card) => (
          <div key={card.label} className={`metric-card ${card.color} p-5 shadow-card`}>
            <p className="text-[11px] font-semibold text-gray-500 uppercase tracking-wider mb-3">{card.label}</p>
            <p className="text-3xl font-bold text-gray-900 metric-value">{card.value}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
        {/* Daily Chart */}
        {metaDailyData.length > 0 && (
          <div className="bg-white rounded-xl border border-gray-200 p-5 shadow-card">
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
          <div className="bg-white rounded-xl border border-gray-200 p-5 shadow-card">
            <h3 className="text-sm font-semibold text-gray-700 mb-4">Top Meta Campaigns</h3>
            <div className="overflow-x-auto max-h-[300px] overflow-y-auto">
              <table className="w-full text-xs">
                <thead className="sticky top-0 bg-white">
                  <tr className="border-b border-gray-200">
                    <th className="text-left py-2 px-2 font-semibold text-gray-400 uppercase tracking-wider">Campaign</th>
                    <th className="text-right py-2 px-2 font-semibold text-gray-400 uppercase tracking-wider">Spend</th>
                    <th className="text-right py-2 px-2 font-semibold text-gray-400 uppercase tracking-wider">Revenue</th>
                    <th className="text-right py-2 px-2 font-semibold text-gray-400 uppercase tracking-wider">ROAS</th>
                    <th className="text-right py-2 px-2 font-semibold text-gray-400 uppercase tracking-wider">CPA</th>
                  </tr>
                </thead>
                <tbody>
                  {metaCampaigns
                    .sort((a, b) => b.spend - a.spend)
                    .slice(0, 15)
                    .map((c) => (
                      <tr key={c.id} className="border-b border-gray-100 hover:bg-gray-50 transition-colors">
                        <td className="py-2.5 px-2 font-medium text-gray-800 max-w-[200px] truncate">{c.name}</td>
                        <td className="text-right py-2.5 px-2 text-gray-600">{fmt(c.spend)}</td>
                        <td className="text-right py-2.5 px-2 text-gray-600">{fmt(c.revenue)}</td>
                        <td className="text-right py-2.5 px-2">
                          <span className={`font-semibold ${c.roas >= 2 ? "text-emerald-600" : c.roas >= 1 ? "text-amber-600" : "text-red-500"}`}>
                            {c.roas.toFixed(2)}x
                          </span>
                        </td>
                        <td className="text-right py-2.5 px-2 text-gray-600">
                          {c.conversions > 0 ? fmt(c.spend / c.conversions) : "—"}
                        </td>
                      </tr>
                    ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>

      {/* Creative Analytics Section — actual ad-level data */}
      {adRows.length > 0 && (
        <div className="bg-white rounded-xl border border-gray-200 p-5 shadow-card">
          <div className="flex items-center gap-2 mb-4">
            <h3 className="text-sm font-semibold text-gray-700">Creative Analytics</h3>
            <span className="text-[10px] px-2 py-0.5 rounded-full bg-blue-50 text-blue-600 font-medium">By Ad</span>
            <span className="text-[10px] text-gray-400 ml-auto">{adRows.length} ads</span>
          </div>
          <div className="overflow-x-auto max-h-[400px] overflow-y-auto">
            <table className="w-full text-xs">
              <thead className="sticky top-0 bg-white">
                <tr className="border-b border-gray-200">
                  <th className="text-left py-2 px-2 font-semibold text-gray-400 uppercase tracking-wider">Ad / Creative</th>
                  <th className="text-left py-2 px-2 font-semibold text-gray-400 uppercase tracking-wider">Campaign</th>
                  <th className="text-right py-2 px-2 font-semibold text-gray-400 uppercase tracking-wider">Spend</th>
                  <th className="text-right py-2 px-2 font-semibold text-gray-400 uppercase tracking-wider">Impr.</th>
                  <th className="text-right py-2 px-2 font-semibold text-gray-400 uppercase tracking-wider">Clicks</th>
                  <th className="text-right py-2 px-2 font-semibold text-gray-400 uppercase tracking-wider">CTR</th>
                  <th className="text-right py-2 px-2 font-semibold text-gray-400 uppercase tracking-wider">CPC</th>
                  <th className="text-right py-2 px-2 font-semibold text-gray-400 uppercase tracking-wider">Conv.</th>
                  <th className="text-right py-2 px-2 font-semibold text-gray-400 uppercase tracking-wider">CPA</th>
                  <th className="text-right py-2 px-2 font-semibold text-gray-400 uppercase tracking-wider">ROAS</th>
                </tr>
              </thead>
              <tbody>
                {adRows
                  .slice(0, 30)
                  .map((ad, i) => (
                    <tr key={ad.id} className="border-b border-gray-100 hover:bg-gray-50 transition-colors">
                      <td className="py-2.5 px-2">
                        <div className="flex items-center gap-2">
                          <div className="w-6 h-6 rounded bg-gradient-to-br from-blue-100 to-blue-200 flex items-center justify-center text-[9px] font-bold text-blue-600 shrink-0">
                            {i + 1}
                          </div>
                          <span className="font-medium text-gray-800 max-w-[180px] truncate" title={ad.name}>{ad.name}</span>
                        </div>
                      </td>
                      <td className="py-2.5 px-2 text-gray-500 max-w-[140px] truncate" title={ad.campaignName}>{ad.campaignName}</td>
                      <td className="text-right py-2.5 px-2 text-gray-600 font-medium">{fmt(ad.spend)}</td>
                      <td className="text-right py-2.5 px-2 text-gray-600">{fmtNum(ad.impressions)}</td>
                      <td className="text-right py-2.5 px-2 text-gray-600">{fmtNum(ad.clicks)}</td>
                      <td className="text-right py-2.5 px-2 text-gray-600">{ad.ctr.toFixed(2)}%</td>
                      <td className="text-right py-2.5 px-2 text-gray-600">{fmt(ad.cpc)}</td>
                      <td className="text-right py-2.5 px-2 text-gray-700 font-medium">{ad.conversions.toLocaleString()}</td>
                      <td className="text-right py-2.5 px-2 text-gray-600">
                        {ad.conversions > 0 ? fmt(ad.spend / ad.conversions) : "—"}
                      </td>
                      <td className="text-right py-2.5 px-2">
                        <span className={`font-semibold ${ad.roas >= 2 ? "text-emerald-600" : ad.roas >= 1 ? "text-amber-600" : "text-red-500"}`}>
                          {ad.roas.toFixed(2)}x
                        </span>
                      </td>
                    </tr>
                  ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
