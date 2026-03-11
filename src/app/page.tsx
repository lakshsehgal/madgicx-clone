"use client";

import React, { useState, useEffect, useCallback } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useWorkspace } from "@/contexts/WorkspaceContext";
import LoginPage from "@/components/auth/LoginPage";
import Sidebar from "@/components/layout/Sidebar";
import Header from "@/components/layout/Header";
import BlendedMetrics from "@/components/dashboard/BlendedMetrics";
import MetaMetrics from "@/components/dashboard/MetaMetrics";
import GoogleMetrics from "@/components/dashboard/GoogleMetrics";
import ShopifyMetrics from "@/components/dashboard/ShopifyMetrics";
import {
  ChannelPerformance,
  DailyPerformance,
  CampaignRow,
  AdRow,
  DateRange,
  ShopifyDetails,
} from "@/types";
import { subDays, format } from "date-fns";
import Link from "next/link";
import { Plus, Users, Zap } from "lucide-react";

export default function DashboardPage() {
  const { isAuthenticated } = useAuth();
  const { activeClientSpace, clientSpaces } = useWorkspace();

  const [dateRange, setDateRange] = useState<DateRange>({
    from: subDays(new Date(), 30),
    to: new Date(),
  });
  const [loading, setLoading] = useState(false);
  const [channelBreakdown, setChannelBreakdown] = useState<ChannelPerformance[]>([]);
  const [dailyPerformance, setDailyPerformance] = useState<DailyPerformance[]>([]);
  const [campaigns, setCampaigns] = useState<CampaignRow[]>([]);
  const [shopifyDetails, setShopifyDetails] = useState<ShopifyDetails | undefined>();
  const [metaAds, setMetaAds] = useState<AdRow[]>([]);
  const [isDemoData, setIsDemoData] = useState(false);
  const [apiErrors, setApiErrors] = useState<string[]>([]);

  const cacheKey = activeClientSpace
    ? `neurotic_dash_${activeClientSpace.id}_${format(dateRange.from, "yyyyMMdd")}_${format(dateRange.to, "yyyyMMdd")}`
    : "";

  // Restore cached data on mount / workspace change so the UI renders instantly
  useEffect(() => {
    if (!cacheKey) return;
    try {
      const cached = sessionStorage.getItem(cacheKey);
      if (cached) {
        const d = JSON.parse(cached);
        setChannelBreakdown(d.channelBreakdown || []);
        setDailyPerformance(d.dailyPerformance || []);
        setCampaigns(d.campaigns || []);
        setMetaAds(d.metaAds || []);
        setShopifyDetails(d.shopifyDetails);
        setIsDemoData(!!d.demo);
      }
    } catch { /* ignore */ }
  }, [cacheKey]);

  const fetchData = useCallback(async () => {
    if (!activeClientSpace) return;

    // If we already have cached data for this key, skip the loading spinner (stale-while-revalidate)
    let hasCached = false;
    try { hasCached = !!sessionStorage.getItem(cacheKey); } catch { /* ignore */ }
    if (!hasCached) {
      setLoading(true);
    }
    setApiErrors([]);
    try {
      const hasCredentials =
        activeClientSpace.metaCredentials ||
        activeClientSpace.googleCredentials ||
        activeClientSpace.shopifyCredentials;

      let data;
      if (hasCredentials) {
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
        const params = new URLSearchParams({
          start_date: format(dateRange.from, "yyyy-MM-dd"),
          end_date: format(dateRange.to, "yyyy-MM-dd"),
        });
        const response = await fetch(`/api/windsor?${params.toString()}`);
        data = await response.json();
      }

      setChannelBreakdown(data.channelBreakdown || []);
      setDailyPerformance(data.dailyPerformance || []);
      setCampaigns(data.campaigns || []);
      setMetaAds(data.metaAds || []);
      setShopifyDetails(data.shopifyDetails);
      setIsDemoData(!!data.demo);
      if (data.errors) setApiErrors(data.errors);

      // Cache the result for instant subsequent loads
      try { sessionStorage.setItem(cacheKey, JSON.stringify(data)); } catch { /* quota */ }
    } catch {
      setIsDemoData(true);
    } finally {
      setLoading(false);
    }
  }, [dateRange, activeClientSpace, cacheKey]);

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
        <div className="ml-64 flex-1 flex items-center justify-center bg-mesh-gradient">
          <div className="text-center max-w-md">
            <div className="w-16 h-16 bg-gradient-to-br from-primary-400 via-primary-500 to-accent-500 rounded-2xl flex items-center justify-center mx-auto mb-5 shadow-glow-primary rotate-3">
              <Zap className="w-8 h-8 text-white" />
            </div>
            <h1 className="text-2xl font-bold text-gray-900 mb-2">
              Welcome to Neurotic
            </h1>
            <p className="text-gray-500 mb-6 text-sm leading-relaxed">
              Create your first client space to start tracking marketing
              performance across Meta, Google & Shopify.
            </p>
            <Link
              href="/workspace/new"
              className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-primary-500 to-primary-600 text-white font-semibold rounded-xl hover:from-primary-600 hover:to-primary-700 transition-all shadow-lg shadow-primary-500/25"
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
        <div className="ml-64 flex-1 flex items-center justify-center bg-mesh-gradient">
          <div className="text-center">
            <div className="w-14 h-14 bg-surface-tertiary rounded-2xl flex items-center justify-center mx-auto mb-4">
              <Users className="w-7 h-7 text-gray-400" />
            </div>
            <h2 className="text-xl font-bold text-gray-900 mb-2">
              Select a Client Space
            </h2>
            <p className="text-gray-500 text-sm">
              Choose a client space from the sidebar to view its dashboard.
            </p>
          </div>
        </div>
      </div>
    );
  }

  const metaChannel = channelBreakdown.find((c) => c.channel === "meta");
  const googleChannel = channelBreakdown.find((c) => c.channel === "google");

  return (
    <div className="flex min-h-screen">
      <Sidebar />
      <div className="ml-64 flex-1 bg-surface-secondary">
        <Header
          dateRange={dateRange}
          onDateRangeChange={setDateRange}
          onRefresh={fetchData}
          loading={loading}
        />

        <main className="p-6 space-y-8 max-w-[1400px]">
          {isDemoData && (
            <div className="bg-amber-50 border border-amber-200/60 rounded-xl px-5 py-3 text-sm text-amber-700 flex items-center gap-2">
              <div className="w-1.5 h-1.5 rounded-full bg-amber-400" />
              Showing demo data. Connect your ad platform APIs in client space settings for live data.
            </div>
          )}

          {apiErrors.length > 0 && (
            <div className="bg-red-50 border border-red-200/60 rounded-xl px-5 py-3 text-sm text-red-700">
              <p className="font-semibold mb-1">Some API calls had errors:</p>
              <ul className="list-disc list-inside text-xs space-y-0.5 text-red-600">
                {apiErrors.map((err, i) => (
                  <li key={i}>{err}</li>
                ))}
              </ul>
            </div>
          )}

          {/* SECTION 1: Blended Metrics */}
          <BlendedMetrics
            channelBreakdown={channelBreakdown}
            dailyPerformance={dailyPerformance}
            shopifyDetails={shopifyDetails}
            loading={loading}
          />

          {/* Divider */}
          <div className="border-t border-border-light" />

          {/* SECTION 2: Meta Metrics */}
          <MetaMetrics
            channelData={metaChannel}
            campaigns={campaigns}
            metaAds={metaAds}
            dailyPerformance={dailyPerformance}
            loading={loading}
            accountId={activeClientSpace?.metaCredentials?.adAccountId}
          />

          {/* Divider */}
          <div className="border-t border-border-light" />

          {/* SECTION 3: Google Metrics */}
          <GoogleMetrics
            channelData={googleChannel}
            campaigns={campaigns}
            dailyPerformance={dailyPerformance}
            loading={loading}
            customerId={activeClientSpace?.googleCredentials?.customerId}
          />

          {/* Divider */}
          <div className="border-t border-border-light" />

          {/* SECTION 4: Shopify Metrics */}
          <ShopifyMetrics
            shopifyDetails={shopifyDetails}
            campaigns={campaigns}
            dailyPerformance={dailyPerformance}
            loading={loading}
            storeUrl={activeClientSpace?.shopifyCredentials?.storeUrl}
          />
        </main>
      </div>
    </div>
  );
}
