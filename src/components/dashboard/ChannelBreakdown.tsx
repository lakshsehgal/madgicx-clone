"use client";

import React from "react";
import { ChannelPerformance } from "@/types";
import {
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Tooltip,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
} from "recharts";

interface ChannelBreakdownProps {
  data: ChannelPerformance[];
  loading: boolean;
}

const channelColors: Record<string, string> = {
  meta: "#1877F2",
  google: "#4285F4",
  shopify: "#96BF48",
};

const channelLabels: Record<string, string> = {
  meta: "Meta Ads",
  google: "Google Ads",
  shopify: "Shopify",
};

export default function ChannelBreakdown({
  data,
  loading,
}: ChannelBreakdownProps) {
  if (loading) {
    return (
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <div className="h-4 bg-gray-200 rounded w-40 mb-6 animate-pulse" />
        <div className="h-64 bg-gray-100 rounded animate-pulse" />
      </div>
    );
  }

  const pieData = data.map((ch) => ({
    name: channelLabels[ch.channel],
    value: ch.spend,
    color: channelColors[ch.channel],
  }));

  const barData = data.map((ch) => ({
    name: channelLabels[ch.channel],
    Spend: ch.spend,
    Revenue: ch.revenue,
    color: channelColors[ch.channel],
  }));

  return (
    <div className="bg-white rounded-xl border border-gray-200 p-6">
      <h3 className="text-lg font-semibold text-gray-900 mb-6">
        Channel Breakdown
      </h3>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Pie Chart - Spend Distribution */}
        <div>
          <p className="text-sm font-medium text-gray-500 mb-3 text-center">
            Spend Distribution
          </p>
          <ResponsiveContainer width="100%" height={220}>
            <PieChart>
              <Pie
                data={pieData}
                cx="50%"
                cy="50%"
                innerRadius={50}
                outerRadius={80}
                paddingAngle={4}
                dataKey="value"
              >
                {pieData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip
                formatter={(value) => [`$${Number(value).toFixed(2)}`, "Spend"]}
                contentStyle={{
                  borderRadius: "8px",
                  border: "1px solid #e5e7eb",
                }}
              />
            </PieChart>
          </ResponsiveContainer>
          <div className="flex justify-center gap-4 mt-2">
            {pieData.map((entry) => (
              <div key={entry.name} className="flex items-center gap-1.5">
                <div
                  className="w-3 h-3 rounded-full"
                  style={{ backgroundColor: entry.color }}
                />
                <span className="text-xs text-gray-600">{entry.name}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Bar Chart - Spend vs Revenue */}
        <div>
          <p className="text-sm font-medium text-gray-500 mb-3 text-center">
            Spend vs Revenue
          </p>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={barData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis dataKey="name" tick={{ fontSize: 11 }} />
              <YAxis tick={{ fontSize: 11 }} />
              <Tooltip
                formatter={(value, name) => [
                  `$${Number(value).toFixed(2)}`,
                  String(name),
                ]}
                contentStyle={{
                  borderRadius: "8px",
                  border: "1px solid #e5e7eb",
                }}
              />
              <Bar dataKey="Spend" fill="#ef4444" radius={[4, 4, 0, 0]} />
              <Bar dataKey="Revenue" fill="#22c55e" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Channel Stats Table */}
      <div className="mt-6 overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-gray-200">
              <th className="text-left py-2 px-3 font-medium text-gray-500">
                Channel
              </th>
              <th className="text-right py-2 px-3 font-medium text-gray-500">
                Spend
              </th>
              <th className="text-right py-2 px-3 font-medium text-gray-500">
                Revenue
              </th>
              <th className="text-right py-2 px-3 font-medium text-gray-500">
                ROAS
              </th>
              <th className="text-right py-2 px-3 font-medium text-gray-500">
                Conv.
              </th>
              <th className="text-right py-2 px-3 font-medium text-gray-500">
                CPC
              </th>
            </tr>
          </thead>
          <tbody>
            {data.map((ch) => (
              <tr
                key={ch.channel}
                className="border-b border-gray-100 hover:bg-gray-50"
              >
                <td className="py-2.5 px-3">
                  <div className="flex items-center gap-2">
                    <div
                      className="w-2.5 h-2.5 rounded-full"
                      style={{
                        backgroundColor: channelColors[ch.channel],
                      }}
                    />
                    <span className="font-medium text-gray-900">
                      {channelLabels[ch.channel]}
                    </span>
                  </div>
                </td>
                <td className="text-right py-2.5 px-3 text-gray-700">
                  ${ch.spend.toFixed(2)}
                </td>
                <td className="text-right py-2.5 px-3 text-gray-700">
                  ${ch.revenue.toFixed(2)}
                </td>
                <td className="text-right py-2.5 px-3">
                  <span
                    className={`font-medium ${
                      ch.roas >= 2
                        ? "text-green-600"
                        : ch.roas >= 1
                        ? "text-amber-600"
                        : "text-red-600"
                    }`}
                  >
                    {ch.roas.toFixed(2)}x
                  </span>
                </td>
                <td className="text-right py-2.5 px-3 text-gray-700">
                  {ch.conversions.toLocaleString()}
                </td>
                <td className="text-right py-2.5 px-3 text-gray-700">
                  ${ch.cpc.toFixed(2)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
