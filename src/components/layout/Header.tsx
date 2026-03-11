"use client";

import React, { useState } from "react";
import { useWorkspace } from "@/contexts/WorkspaceContext";
import { format, subDays } from "date-fns";
import { Calendar, RefreshCw } from "lucide-react";
import { DateRange } from "@/types";

interface HeaderProps {
  dateRange: DateRange;
  onDateRangeChange: (range: DateRange) => void;
  onRefresh: () => void;
  loading?: boolean;
}

const presets = [
  { label: "Last 7 days", days: 7 },
  { label: "Last 14 days", days: 14 },
  { label: "Last 30 days", days: 30 },
  { label: "Last 90 days", days: 90 },
];

export default function Header({
  dateRange,
  onDateRangeChange,
  onRefresh,
  loading,
}: HeaderProps) {
  const { activeClientSpace } = useWorkspace();
  const [showDatePicker, setShowDatePicker] = useState(false);

  return (
    <header className="bg-white/80 glass border-b border-border-light px-6 py-4 sticky top-0 z-40">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-gray-900 tracking-tight">
            {activeClientSpace
              ? `${activeClientSpace.name}`
              : "Marketing Dashboard"}
          </h1>
          {activeClientSpace && (
            <p className="text-xs text-gray-400 mt-0.5 font-medium">
              {activeClientSpace.connectedChannels
                .map((c) => c.charAt(0).toUpperCase() + c.slice(1))
                .join(" + ") || "No accounts connected"}
            </p>
          )}
        </div>

        <div className="flex items-center gap-2.5">
          {/* Date Range Picker */}
          <div className="relative">
            <button
              onClick={() => setShowDatePicker(!showDatePicker)}
              className="flex items-center gap-2 px-4 py-2.5 bg-white border border-border rounded-xl text-sm font-medium text-gray-600 hover:border-primary-300 hover:text-primary-600 transition-all shadow-card"
            >
              <Calendar className="w-4 h-4" />
              {format(dateRange.from, "MMM d")} -{" "}
              {format(dateRange.to, "MMM d, yyyy")}
            </button>

            {showDatePicker && (
              <div className="absolute right-0 top-full mt-2 bg-white rounded-xl shadow-elevated border border-border-light p-2 z-50 min-w-[220px]">
                {presets.map((preset) => (
                  <button
                    key={preset.days}
                    onClick={() => {
                      onDateRangeChange({
                        from: subDays(new Date(), preset.days),
                        to: new Date(),
                      });
                      setShowDatePicker(false);
                    }}
                    className="w-full text-left px-3.5 py-2.5 text-sm rounded-lg hover:bg-surface-tertiary transition-colors font-medium text-gray-600 hover:text-gray-900"
                  >
                    {preset.label}
                  </button>
                ))}
                <hr className="my-2 border-border-light" />
                <div className="px-3 py-2 space-y-2">
                  <div>
                    <label className="text-[11px] text-gray-400 font-medium uppercase tracking-wider">From</label>
                    <input
                      type="date"
                      value={format(dateRange.from, "yyyy-MM-dd")}
                      onChange={(e) =>
                        onDateRangeChange({
                          ...dateRange,
                          from: new Date(e.target.value),
                        })
                      }
                      className="w-full mt-1 px-3 py-1.5 text-sm border border-border rounded-lg focus:ring-2 focus:ring-primary-500/20 focus:border-primary-400 outline-none"
                    />
                  </div>
                  <div>
                    <label className="text-[11px] text-gray-400 font-medium uppercase tracking-wider">To</label>
                    <input
                      type="date"
                      value={format(dateRange.to, "yyyy-MM-dd")}
                      onChange={(e) =>
                        onDateRangeChange({
                          ...dateRange,
                          to: new Date(e.target.value),
                        })
                      }
                      className="w-full mt-1 px-3 py-1.5 text-sm border border-border rounded-lg focus:ring-2 focus:ring-primary-500/20 focus:border-primary-400 outline-none"
                    />
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Refresh */}
          <button
            onClick={onRefresh}
            disabled={loading}
            className="p-2.5 rounded-xl border border-border bg-white hover:border-primary-300 hover:text-primary-600 transition-all disabled:opacity-50 shadow-card"
          >
            <RefreshCw
              className={`w-4 h-4 text-gray-500 ${loading ? "animate-spin" : ""}`}
            />
          </button>
        </div>
      </div>
    </header>
  );
}
