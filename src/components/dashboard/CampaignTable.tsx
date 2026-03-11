"use client";

import React, { useState, useMemo } from "react";
import { CampaignRow, Channel } from "@/types";
import { ArrowUpDown, Search } from "lucide-react";

interface CampaignTableProps {
  data: CampaignRow[];
  loading: boolean;
}

const channelColors: Record<string, string> = {
  meta: "bg-blue-100 text-blue-800",
  google: "bg-sky-100 text-sky-800",
  shopify: "bg-green-100 text-green-800",
};

const channelLabels: Record<string, string> = {
  meta: "Meta",
  google: "Google",
  shopify: "Shopify",
};

type SortKey = keyof CampaignRow;

export default function CampaignTable({ data, loading }: CampaignTableProps) {
  const [search, setSearch] = useState("");
  const [channelFilter, setChannelFilter] = useState<Channel | "all">("all");
  const [sortKey, setSortKey] = useState<SortKey>("spend");
  const [sortDir, setSortDir] = useState<"asc" | "desc">("desc");

  const handleSort = (key: SortKey) => {
    if (sortKey === key) {
      setSortDir((d) => (d === "asc" ? "desc" : "asc"));
    } else {
      setSortKey(key);
      setSortDir("desc");
    }
  };

  const filtered = useMemo(() => {
    let result = data;
    if (channelFilter !== "all") {
      result = result.filter((r) => r.channel === channelFilter);
    }
    if (search) {
      const q = search.toLowerCase();
      result = result.filter((r) => r.name.toLowerCase().includes(q));
    }
    result = [...result].sort((a, b) => {
      const aVal = a[sortKey];
      const bVal = b[sortKey];
      if (typeof aVal === "number" && typeof bVal === "number") {
        return sortDir === "asc" ? aVal - bVal : bVal - aVal;
      }
      return sortDir === "asc"
        ? String(aVal).localeCompare(String(bVal))
        : String(bVal).localeCompare(String(aVal));
    });
    return result;
  }, [data, channelFilter, search, sortKey, sortDir]);

  if (loading) {
    return (
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <div className="h-4 bg-gray-200 rounded w-40 mb-6 animate-pulse" />
        <div className="space-y-3">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="h-10 bg-gray-100 rounded animate-pulse" />
          ))}
        </div>
      </div>
    );
  }

  const columns: { key: SortKey; label: string; align?: string }[] = [
    { key: "name", label: "Campaign" },
    { key: "channel", label: "Channel" },
    { key: "status", label: "Status" },
    { key: "spend", label: "Spend", align: "right" },
    { key: "revenue", label: "Revenue", align: "right" },
    { key: "roas", label: "ROAS", align: "right" },
    { key: "impressions", label: "Impressions", align: "right" },
    { key: "clicks", label: "Clicks", align: "right" },
    { key: "cpc", label: "CPC", align: "right" },
    { key: "ctr", label: "CTR", align: "right" },
    { key: "conversions", label: "Conv.", align: "right" },
  ];

  return (
    <div className="bg-white rounded-xl border border-gray-200 p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-900">Campaigns</h3>
        <div className="flex items-center gap-3">
          {/* Search */}
          <div className="relative">
            <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search campaigns..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9 pr-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none w-56"
            />
          </div>
          {/* Channel filter */}
          <select
            value={channelFilter}
            onChange={(e) =>
              setChannelFilter(e.target.value as Channel | "all")
            }
            className="px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 outline-none"
          >
            <option value="all">All Channels</option>
            <option value="meta">Meta</option>
            <option value="google">Google</option>
            <option value="shopify">Shopify</option>
          </select>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-gray-200">
              {columns.map((col) => (
                <th
                  key={col.key}
                  className={`py-3 px-3 font-medium text-gray-500 cursor-pointer hover:text-gray-700 whitespace-nowrap ${
                    col.align === "right" ? "text-right" : "text-left"
                  }`}
                  onClick={() => handleSort(col.key)}
                >
                  <span className="inline-flex items-center gap-1">
                    {col.label}
                    {sortKey === col.key && (
                      <ArrowUpDown className="w-3 h-3" />
                    )}
                  </span>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {filtered.map((row) => (
              <tr
                key={row.id}
                className="border-b border-gray-100 hover:bg-gray-50 transition-colors"
              >
                <td className="py-3 px-3 font-medium text-gray-900 max-w-[200px] truncate">
                  {row.name}
                </td>
                <td className="py-3 px-3">
                  <span
                    className={`px-2 py-0.5 text-xs font-medium rounded-full ${channelColors[row.channel]}`}
                  >
                    {channelLabels[row.channel]}
                  </span>
                </td>
                <td className="py-3 px-3">
                  <span
                    className={`inline-flex items-center gap-1 text-xs font-medium ${
                      row.status === "active"
                        ? "text-green-600"
                        : row.status === "paused"
                        ? "text-amber-600"
                        : "text-gray-500"
                    }`}
                  >
                    <span
                      className={`w-1.5 h-1.5 rounded-full ${
                        row.status === "active"
                          ? "bg-green-500"
                          : row.status === "paused"
                          ? "bg-amber-500"
                          : "bg-gray-400"
                      }`}
                    />
                    {row.status.charAt(0).toUpperCase() + row.status.slice(1)}
                  </span>
                </td>
                <td className="py-3 px-3 text-right text-gray-700">
                  ₹{row.spend.toFixed(2)}
                </td>
                <td className="py-3 px-3 text-right text-gray-700">
                  ₹{row.revenue.toFixed(2)}
                </td>
                <td className="py-3 px-3 text-right">
                  <span
                    className={`font-medium ${
                      row.roas >= 2
                        ? "text-green-600"
                        : row.roas >= 1
                        ? "text-amber-600"
                        : "text-red-600"
                    }`}
                  >
                    {row.roas.toFixed(2)}x
                  </span>
                </td>
                <td className="py-3 px-3 text-right text-gray-700">
                  {row.impressions.toLocaleString()}
                </td>
                <td className="py-3 px-3 text-right text-gray-700">
                  {row.clicks.toLocaleString()}
                </td>
                <td className="py-3 px-3 text-right text-gray-700">
                  ₹{row.cpc.toFixed(2)}
                </td>
                <td className="py-3 px-3 text-right text-gray-700">
                  {row.ctr.toFixed(2)}%
                </td>
                <td className="py-3 px-3 text-right text-gray-700">
                  {row.conversions.toLocaleString()}
                </td>
              </tr>
            ))}
            {filtered.length === 0 && (
              <tr>
                <td
                  colSpan={11}
                  className="py-8 text-center text-gray-500"
                >
                  No campaigns found
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
