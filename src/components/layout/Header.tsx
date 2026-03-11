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
    <header className="bg-white border-b border-gray-200 px-6 py-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            {activeClientSpace
              ? `${activeClientSpace.name} Dashboard`
              : "Marketing Dashboard"}
          </h1>
          {activeClientSpace && (
            <p className="text-sm text-gray-500 mt-0.5">
              {activeClientSpace.connectedChannels
                .map((c) => c.charAt(0).toUpperCase() + c.slice(1))
                .join(", ") || "No accounts connected"}
            </p>
          )}
        </div>

        <div className="flex items-center gap-3">
          {/* Date Range Picker */}
          <div className="relative">
            <button
              onClick={() => setShowDatePicker(!showDatePicker)}
              className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
            >
              <Calendar className="w-4 h-4" />
              {format(dateRange.from, "MMM d")} -{" "}
              {format(dateRange.to, "MMM d, yyyy")}
            </button>

            {showDatePicker && (
              <div className="absolute right-0 top-full mt-2 bg-white rounded-lg shadow-xl border border-gray-200 p-3 z-50 min-w-[200px]">
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
                    className="w-full text-left px-3 py-2 text-sm rounded-md hover:bg-gray-100 transition-colors"
                  >
                    {preset.label}
                  </button>
                ))}
                <hr className="my-2" />
                <div className="px-3 py-2 space-y-2">
                  <div>
                    <label className="text-xs text-gray-500">From</label>
                    <input
                      type="date"
                      value={format(dateRange.from, "yyyy-MM-dd")}
                      onChange={(e) =>
                        onDateRangeChange({
                          ...dateRange,
                          from: new Date(e.target.value),
                        })
                      }
                      className="w-full mt-1 px-2 py-1 text-sm border rounded"
                    />
                  </div>
                  <div>
                    <label className="text-xs text-gray-500">To</label>
                    <input
                      type="date"
                      value={format(dateRange.to, "yyyy-MM-dd")}
                      onChange={(e) =>
                        onDateRangeChange({
                          ...dateRange,
                          to: new Date(e.target.value),
                        })
                      }
                      className="w-full mt-1 px-2 py-1 text-sm border rounded"
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
            className="p-2 rounded-lg border border-gray-300 hover:bg-gray-50 transition-colors disabled:opacity-50"
          >
            <RefreshCw
              className={`w-4 h-4 text-gray-600 ${loading ? "animate-spin" : ""}`}
            />
          </button>
        </div>
      </div>
    </header>
  );
}
