"use client";

import React, { useState, useEffect, useCallback } from "react";
import { useWorkspace } from "@/contexts/WorkspaceContext";
import Sidebar from "@/components/layout/Sidebar";
import Header from "@/components/layout/Header";
import KPICards from "@/components/dashboard/KPICards";
import PerformanceChart from "@/components/dashboard/PerformanceChart";
import ChannelBreakdown from "@/components/dashboard/ChannelBreakdown";
import CampaignTable from "@/components/dashboard/CampaignTable";
import {
  KPIData,
  ChannelPerformance,
  DailyPerformance,
  CampaignRow,
  DateRange,
} from "@/types";
import { subDays, format } from "date-fns";
import Link from "next/link";
import { Plus, BarChart3 } from "lucide-react";

export default function DashboardPage() {
  const { activeWorkspace, workspaces } = useWorkspace();

  const [dateRange, setDateRange] = useState<DateRange>({
    from: subDays(new Date(), 30),
    to: new Date(),
  });
  const [loading, setLoading] = useState(false);
  const [kpis, setKpis] = useState<KPIData | null>(null);
  const [channelBreakdown, setChannelBreakdown] = useState<
    ChannelPerformance[]
  >([]);
  const [dailyPerformance, setDailyPerformance] = useState<
    DailyPerformance[]
  >([]);
  const [campaigns, setCampaigns] = useState<CampaignRow[]>([]);
  const [isDemoData, setIsDemoData] = useState(false);

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        start_date: format(dateRange.from, "yyyy-MM-dd"),
        end_date: format(dateRange.to, "yyyy-MM-dd"),
      });

      if (activeWorkspace?.windsorApiKey) {
        params.set("api_key", activeWorkspace.windsorApiKey);
      }

      const response = await fetch(`/api/windsor?${params.toString()}`);
      const data = await response.json();

      setKpis(data.kpis);
      setChannelBreakdown(data.channelBreakdown);
      setDailyPerformance(data.dailyPerformance);
      setCampaigns(data.campaigns);
      setIsDemoData(!!data.demo);
    } catch {
      setIsDemoData(true);
    } finally {
      setLoading(false);
    }
  }, [dateRange, activeWorkspace]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Empty state - no workspaces
  if (workspaces.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center max-w-md">
          <div className="w-16 h-16 bg-primary-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <BarChart3 className="w-8 h-8 text-primary-600" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">
            Welcome to Madgicx
          </h1>
          <p className="text-gray-500 mb-6">
            Create your first workspace to start tracking marketing performance
            across Meta, Google & Shopify.
          </p>
          <Link
            href="/workspace/new"
            className="inline-flex items-center gap-2 px-6 py-3 bg-primary-600 text-white font-medium rounded-lg hover:bg-primary-700 transition-colors"
          >
            <Plus className="w-5 h-5" />
            Create Workspace
          </Link>
        </div>
      </div>
    );
  }

  // No active workspace selected
  if (!activeWorkspace) {
    return (
      <div className="flex min-h-screen">
        <Sidebar />
        <div className="ml-64 flex-1 flex items-center justify-center">
          <div className="text-center">
            <h2 className="text-xl font-semibold text-gray-900 mb-2">
              Select a Workspace
            </h2>
            <p className="text-gray-500">
              Choose a workspace from the sidebar to view its dashboard.
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen">
      <Sidebar />
      <div className="ml-64 flex-1">
        <Header
          dateRange={dateRange}
          onDateRangeChange={setDateRange}
          onRefresh={fetchData}
          loading={loading}
        />

        <main className="p-6 space-y-6">
          {/* Demo data banner */}
          {isDemoData && (
            <div className="bg-amber-50 border border-amber-200 rounded-lg px-4 py-3 text-sm text-amber-800">
              Showing demo data. Connect your Windsor.ai API key in workspace
              settings for live data.
            </div>
          )}

          {/* KPI Cards */}
          <KPICards data={kpis} loading={loading} />

          {/* Charts Row */}
          <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
            <PerformanceChart data={dailyPerformance} loading={loading} />
            <ChannelBreakdown data={channelBreakdown} loading={loading} />
          </div>

          {/* Campaign Table */}
          <CampaignTable data={campaigns} loading={loading} />
        </main>
      </div>
    </div>
  );
}
