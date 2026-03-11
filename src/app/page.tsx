"use client";

import React, { useState, useEffect, useCallback } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useWorkspace } from "@/contexts/WorkspaceContext";
import LoginPage from "@/components/auth/LoginPage";
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
import { Plus, Users } from "lucide-react";

export default function DashboardPage() {
  const { isAuthenticated } = useAuth();
  const { activeClientSpace, clientSpaces } = useWorkspace();

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

  const [apiErrors, setApiErrors] = useState<string[]>([]);

  const fetchData = useCallback(async () => {
    if (!activeClientSpace) return;
    setLoading(true);
    setApiErrors([]);
    try {
      const hasCredentials =
        activeClientSpace.metaCredentials ||
        activeClientSpace.googleCredentials ||
        activeClientSpace.shopifyCredentials;

      let data;
      if (hasCredentials) {
        // POST with direct API credentials
        const response = await fetch("/api/windsor", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            startDate: format(dateRange.from, "yyyy-MM-dd"),
            endDate: format(dateRange.to, "yyyy-MM-dd"),
            metaCredentials: activeClientSpace.metaCredentials,
            googleCredentials: activeClientSpace.googleCredentials,
            shopifyCredentials: activeClientSpace.shopifyCredentials,
          }),
        });
        data = await response.json();
      } else {
        // GET demo data
        const params = new URLSearchParams({
          start_date: format(dateRange.from, "yyyy-MM-dd"),
          end_date: format(dateRange.to, "yyyy-MM-dd"),
        });
        const response = await fetch(`/api/windsor?${params.toString()}`);
        data = await response.json();
      }

      setKpis(data.kpis);
      setChannelBreakdown(data.channelBreakdown);
      setDailyPerformance(data.dailyPerformance);
      setCampaigns(data.campaigns);
      setIsDemoData(!!data.demo);
      if (data.errors) setApiErrors(data.errors);
    } catch {
      setIsDemoData(true);
    } finally {
      setLoading(false);
    }
  }, [dateRange, activeClientSpace]);

  useEffect(() => {
    if (activeClientSpace) {
      fetchData();
    }
  }, [fetchData, activeClientSpace]);

  // Not authenticated - show login
  if (!isAuthenticated) {
    return <LoginPage />;
  }

  // No client spaces - show welcome
  if (clientSpaces.length === 0) {
    return (
      <div className="flex min-h-screen">
        <Sidebar />
        <div className="ml-64 flex-1 flex items-center justify-center">
          <div className="text-center max-w-md">
            <div className="w-16 h-16 bg-primary-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <Users className="w-8 h-8 text-primary-600" />
            </div>
            <h1 className="text-2xl font-bold text-gray-900 mb-2">
              Welcome to Neuroid
            </h1>
            <p className="text-gray-500 mb-6">
              Create your first client space to start tracking marketing
              performance across Meta, Google & Shopify.
            </p>
            <Link
              href="/workspace/new"
              className="inline-flex items-center gap-2 px-6 py-3 bg-primary-600 text-white font-medium rounded-lg hover:bg-primary-700 transition-colors"
            >
              <Plus className="w-5 h-5" />
              New Client Space
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // No active client space selected
  if (!activeClientSpace) {
    return (
      <div className="flex min-h-screen">
        <Sidebar />
        <div className="ml-64 flex-1 flex items-center justify-center">
          <div className="text-center">
            <h2 className="text-xl font-semibold text-gray-900 mb-2">
              Select a Client Space
            </h2>
            <p className="text-gray-500">
              Choose a client space from the sidebar to view its dashboard.
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
          {isDemoData && (
            <div className="bg-amber-50 border border-amber-200 rounded-lg px-4 py-3 text-sm text-amber-800">
              Showing demo data. Connect your ad platform APIs in client space
              settings for live data.
            </div>
          )}

          {apiErrors.length > 0 && (
            <div className="bg-red-50 border border-red-200 rounded-lg px-4 py-3 text-sm text-red-800">
              <p className="font-medium mb-1">Some API calls had errors:</p>
              <ul className="list-disc list-inside text-xs space-y-0.5">
                {apiErrors.map((err, i) => (
                  <li key={i}>{err}</li>
                ))}
              </ul>
            </div>
          )}

          <KPICards data={kpis} loading={loading} />

          <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
            <PerformanceChart data={dailyPerformance} loading={loading} />
            <ChannelBreakdown data={channelBreakdown} loading={loading} />
          </div>

          <CampaignTable data={campaigns} loading={loading} />
        </main>
      </div>
    </div>
  );
}
