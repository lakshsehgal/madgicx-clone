"use client";

import React from "react";
import { CampaignRow, DailyPerformance, ShopifyDetails } from "@/types";
import { ShoppingCart } from "lucide-react";
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Cell,
} from "recharts";
import { format, parseISO } from "date-fns";

interface ShopifyMetricsProps {
  shopifyDetails?: ShopifyDetails;
  campaigns: CampaignRow[];
  dailyPerformance: DailyPerformance[];
  loading: boolean;
  storeUrl?: string;
}

function fmt(value: number): string {
  if (value >= 10000000) return `₹${(value / 10000000).toFixed(2)}Cr`;
  if (value >= 100000) return `₹${(value / 100000).toFixed(1)}L`;
  if (value >= 1000) return `₹${(value / 1000).toFixed(1)}K`;
  return `₹${value.toFixed(0)}`;
}

const SKU_COLORS = ["#5E8E3E", "#7CB342", "#9CCC65", "#AED581", "#C5E1A5", "#DCEDC8", "#66BB6A", "#43A047", "#388E3C", "#2E7D32"];

export default function ShopifyMetrics({
  shopifyDetails,
  campaigns,
  dailyPerformance,
  loading,
  storeUrl,
}: ShopifyMetricsProps) {
  const shopifyProducts = campaigns.filter((c) => c.channel === "shopify");

  if (loading) {
    return (
      <div className="space-y-5">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-gray-200 animate-pulse" />
          <div className="h-7 bg-gray-200 rounded w-48 animate-pulse" />
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="bg-white rounded-xl p-5 border border-gray-200 animate-pulse">
              <div className="h-3 bg-gray-200 rounded w-24 mb-4" />
              <div className="h-8 bg-gray-200 rounded w-20" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (!shopifyDetails && shopifyProducts.length === 0) {
    return (
      <div className="space-y-5">
        <div className="flex items-center gap-3">
          <div className="section-number">4</div>
          <h2 className="text-2xl font-bold text-gray-900">Shopify Metrics</h2>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 p-8 text-center shadow-card">
          <div className="w-12 h-12 bg-green-50 rounded-xl flex items-center justify-center mx-auto mb-3">
            <ShoppingCart className="w-6 h-6 text-green-400" />
          </div>
          <p className="text-sm text-gray-500">Connect Shopify to see store metrics here</p>
        </div>
      </div>
    );
  }

  const totalSales = shopifyDetails?.totalSales || 0;
  const totalOrders = shopifyDetails?.totalOrders || 0;
  const aov = shopifyDetails?.avgOrderValue || 0;
  const totalItems = shopifyDetails?.totalItems || 0;

  const cards = [
    { label: "SHOPIFY TOTAL SALES", value: fmt(totalSales), color: "metric-card-green" },
    { label: "AVERAGE ORDER VALUE", value: fmt(aov), color: "metric-card-amber" },
    { label: "TOTAL ORDERS", value: totalOrders.toLocaleString(), color: "metric-card-blue" },
    { label: "ITEMS SOLD", value: totalItems.toLocaleString(), color: "metric-card-teal" },
  ];

  const formatDate = (dateStr: string) => {
    try { return format(parseISO(dateStr), "MMM d"); } catch { return dateStr; }
  };

  const shopifyDailyData = dailyPerformance
    .map((d) => ({ date: d.date, revenue: d.shopify_revenue || 0, orders: d.shopify_orders || 0 }))
    .filter((d) => d.revenue > 0 || d.orders > 0);

  return (
    <div className="space-y-5">
      {/* Section Header */}
      <div>
        <div className="flex items-center gap-3 mb-2">
          <div className="section-number">4</div>
          <h2 className="text-2xl font-bold text-gray-900">Shopify Metrics</h2>
        </div>
        {storeUrl && (
          <div className="ml-11 mb-2">
            <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-green-50 text-green-700 border border-green-200">
              SHOPIFY &middot; {storeUrl}
            </span>
          </div>
        )}
        <p className="text-sm text-gray-500 ml-11">
          Store performance — orders, revenue, and product breakdown.
        </p>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {cards.map((card) => (
          <div key={card.label} className={`metric-card ${card.color} p-5 shadow-card`}>
            <p className="text-[11px] font-semibold text-gray-500 uppercase tracking-wider mb-3">{card.label}</p>
            <p className="text-3xl font-bold text-gray-900 metric-value">{card.value}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
        {/* Daily Sales Chart */}
        {shopifyDailyData.length > 0 && (
          <div className="bg-white rounded-xl border border-gray-200 p-5 shadow-card">
            <h3 className="text-sm font-semibold text-gray-700 mb-4">Daily Sales</h3>
            <ResponsiveContainer width="100%" height={280}>
              <AreaChart data={shopifyDailyData}>
                <defs>
                  <linearGradient id="shopifyAreaGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.2} />
                    <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f2f7" />
                <XAxis dataKey="date" tickFormatter={formatDate} tick={{ fontSize: 10, fill: "#9ca3af" }} stroke="#e5e8f0" />
                <YAxis tick={{ fontSize: 10, fill: "#9ca3af" }} stroke="#e5e8f0" />
                <Tooltip
                  labelFormatter={(label) => formatDate(String(label))}
                  contentStyle={{ borderRadius: "12px", border: "1px solid #e5e8f0", fontSize: "12px" }}
                  formatter={(value, name) => {
                    if (String(name) === "revenue") return [`₹${Number(value).toFixed(2)}`, "Revenue"];
                    return [value, "Orders"];
                  }}
                />
                <Area type="monotone" dataKey="revenue" stroke="#10b981" strokeWidth={2} fill="url(#shopifyAreaGrad)" dot={false} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        )}

        {/* Sale by SKU */}
        {shopifyProducts.length > 0 && (
          <div className="bg-white rounded-xl border border-gray-200 p-5 shadow-card">
            <h3 className="text-sm font-semibold text-gray-700 mb-4">Sales by SKU (Top Products)</h3>
            <ResponsiveContainer width="100%" height={280}>
              <BarChart data={shopifyProducts.slice(0, 10)} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f2f7" horizontal={false} />
                <XAxis type="number" tick={{ fontSize: 10, fill: "#9ca3af" }} stroke="#e5e8f0" />
                <YAxis dataKey="name" type="category" tick={{ fontSize: 10, fill: "#6b7280" }} width={130} stroke="#e5e8f0" />
                <Tooltip
                  contentStyle={{ borderRadius: "12px", border: "1px solid #e5e8f0", fontSize: "12px" }}
                  formatter={(value) => [`₹${Number(value).toFixed(2)}`, "Revenue"]}
                />
                <Bar dataKey="revenue" radius={[0, 6, 6, 0]}>
                  {shopifyProducts.slice(0, 10).map((_, index) => (
                    <Cell key={`cell-${index}`} fill={SKU_COLORS[index % SKU_COLORS.length]} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        )}
      </div>

      {/* Products Table */}
      {shopifyProducts.length > 0 && (
        <div className="bg-white rounded-xl border border-gray-200 p-5 shadow-card">
          <h3 className="text-sm font-semibold text-gray-700 mb-4">Product Performance</h3>
          <div className="overflow-x-auto">
            <table className="w-full text-xs">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="text-left py-2 px-3 font-semibold text-gray-400 uppercase tracking-wider">Product</th>
                  <th className="text-right py-2 px-3 font-semibold text-gray-400 uppercase tracking-wider">Revenue</th>
                  <th className="text-right py-2 px-3 font-semibold text-gray-400 uppercase tracking-wider">Units Sold</th>
                  <th className="text-right py-2 px-3 font-semibold text-gray-400 uppercase tracking-wider">Orders</th>
                </tr>
              </thead>
              <tbody>
                {shopifyProducts.map((p) => (
                  <tr key={p.id} className="border-b border-gray-100 hover:bg-gray-50 transition-colors">
                    <td className="py-2.5 px-3 font-medium text-gray-800">{p.name}</td>
                    <td className="text-right py-2.5 px-3 text-gray-600 font-medium">{fmt(p.revenue)}</td>
                    <td className="text-right py-2.5 px-3 text-gray-600">{p.conversions.toLocaleString()}</td>
                    <td className="text-right py-2.5 px-3 text-gray-600">{p.clicks.toLocaleString()}</td>
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
