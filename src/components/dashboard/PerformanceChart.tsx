"use client";

import React, { useState } from "react";
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  BarChart,
  Bar,
} from "recharts";
import { DailyPerformance } from "@/types";
import { format, parseISO } from "date-fns";

interface PerformanceChartProps {
  data: DailyPerformance[];
  loading: boolean;
}

type ChartType = "line" | "bar";
type MetricKey = "spend" | "revenue" | "roas" | "conversions";

const metrics: { key: MetricKey; label: string; color: string }[] = [
  { key: "spend", label: "Spend", color: "#ef4444" },
  { key: "revenue", label: "Revenue", color: "#22c55e" },
  { key: "roas", label: "ROAS", color: "#6366f1" },
  { key: "conversions", label: "Conversions", color: "#f59e0b" },
];

export default function PerformanceChart({
  data,
  loading,
}: PerformanceChartProps) {
  const [chartType, setChartType] = useState<ChartType>("line");
  const [activeMetrics, setActiveMetrics] = useState<MetricKey[]>([
    "spend",
    "revenue",
  ]);

  const toggleMetric = (key: MetricKey) => {
    setActiveMetrics((prev) =>
      prev.includes(key)
        ? prev.length > 1
          ? prev.filter((m) => m !== key)
          : prev
        : [...prev, key]
    );
  };

  const formatDate = (dateStr: string) => {
    try {
      return format(parseISO(dateStr), "MMM d");
    } catch {
      return dateStr;
    }
  };

  if (loading) {
    return (
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <div className="h-4 bg-gray-200 rounded w-40 mb-6 animate-pulse" />
        <div className="h-80 bg-gray-100 rounded animate-pulse" />
      </div>
    );
  }

  const ChartComponent = chartType === "line" ? LineChart : BarChart;

  return (
    <div className="bg-white rounded-xl border border-gray-200 p-6">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold text-gray-900">
          Performance Over Time
        </h3>
        <div className="flex items-center gap-4">
          {/* Metric toggles */}
          <div className="flex items-center gap-2">
            {metrics.map((m) => (
              <button
                key={m.key}
                onClick={() => toggleMetric(m.key)}
                className={`px-3 py-1 text-xs font-medium rounded-full transition-colors ${
                  activeMetrics.includes(m.key)
                    ? "text-white"
                    : "text-gray-500 bg-gray-100 hover:bg-gray-200"
                }`}
                style={
                  activeMetrics.includes(m.key)
                    ? { backgroundColor: m.color }
                    : undefined
                }
              >
                {m.label}
              </button>
            ))}
          </div>

          {/* Chart type toggle */}
          <div className="flex items-center bg-gray-100 rounded-lg p-0.5">
            <button
              onClick={() => setChartType("line")}
              className={`px-3 py-1 text-xs font-medium rounded-md transition-colors ${
                chartType === "line"
                  ? "bg-white shadow text-gray-900"
                  : "text-gray-500"
              }`}
            >
              Line
            </button>
            <button
              onClick={() => setChartType("bar")}
              className={`px-3 py-1 text-xs font-medium rounded-md transition-colors ${
                chartType === "bar"
                  ? "bg-white shadow text-gray-900"
                  : "text-gray-500"
              }`}
            >
              Bar
            </button>
          </div>
        </div>
      </div>

      <ResponsiveContainer width="100%" height={350}>
        <ChartComponent data={data}>
          <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
          <XAxis
            dataKey="date"
            tickFormatter={formatDate}
            tick={{ fontSize: 12 }}
            stroke="#9ca3af"
          />
          <YAxis tick={{ fontSize: 12 }} stroke="#9ca3af" />
          <Tooltip
            labelFormatter={(label) => formatDate(String(label))}
            contentStyle={{
              borderRadius: "8px",
              border: "1px solid #e5e7eb",
              boxShadow: "0 4px 6px -1px rgba(0,0,0,0.1)",
            }}
            formatter={(value, name) => {
              const v = Number(value);
              const n = String(name);
              if (n === "roas") return [`${v.toFixed(2)}x`, "ROAS"];
              if (n === "spend" || n === "revenue")
                return [`₹${v.toFixed(2)}`, n.charAt(0).toUpperCase() + n.slice(1)];
              return [v, n.charAt(0).toUpperCase() + n.slice(1)];
            }}
          />
          <Legend />
          {activeMetrics.map((key) => {
            const metric = metrics.find((m) => m.key === key)!;
            return chartType === "line" ? (
              <Line
                key={key}
                type="monotone"
                dataKey={key}
                stroke={metric.color}
                strokeWidth={2}
                dot={false}
                name={key}
              />
            ) : (
              <Bar
                key={key}
                dataKey={key}
                fill={metric.color}
                radius={[4, 4, 0, 0]}
                name={key}
              />
            );
          })}
        </ChartComponent>
      </ResponsiveContainer>
    </div>
  );
}
