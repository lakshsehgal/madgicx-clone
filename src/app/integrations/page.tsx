"use client";

import React, { useState, useEffect, useCallback } from "react";
import Sidebar from "@/components/layout/Sidebar";
import { useWorkspace } from "@/contexts/WorkspaceContext";
import { useAuth } from "@/contexts/AuthContext";
import LoginPage from "@/components/auth/LoginPage";
import {
  CheckCircle2,
  ExternalLink,
  Loader2,
  X,
  AlertCircle,
  Link2,
  Unplug,
  Store,
} from "lucide-react";

// ─── Types ───────────────────────────────────────────────────────────────────

interface MetaAdAccount {
  id: string;
  name: string;
  status: string;
  currency: string;
}

interface MetaPage {
  id: string;
  name: string;
  category: string;
}

interface GoogleCustomerAccount {
  id: string;
  name: string;
  currencyCode: string;
}

type OAuthResult =
  | {
      platform: "meta";
      accessToken: string;
      userName: string;
      adAccounts: MetaAdAccount[];
      pages: MetaPage[];
    }
  | {
      platform: "google";
      accessToken: string;
      refreshToken: string;
      clientId: string;
      clientSecret: string;
      developerToken: string;
      userName: string;
      email: string;
      customerAccounts: GoogleCustomerAccount[];
    }
  | {
      platform: "shopify";
      accessToken: string;
      storeUrl: string;
      shopName: string;
      email: string;
      currency: string;
      domain: string;
    };

// ─── Platform Config ─────────────────────────────────────────────────────────

const platforms = [
  {
    key: "meta" as const,
    name: "Meta Ads",
    subtitle: "Facebook & Instagram",
    description: "Connect your Facebook Business account to pull ad performance, campaign data, and conversion metrics.",
    color: "#1877F2",
    bgColor: "bg-[#1877F2]",
    lightBg: "bg-blue-50",
    lightText: "text-blue-700",
    icon: "M",
    features: ["Ad Accounts", "Campaign Insights", "Conversion Tracking", "Page Analytics"],
  },
  {
    key: "google" as const,
    name: "Google Ads",
    subtitle: "Search, Display, Shopping & PMax",
    description: "Connect your Google Ads account to pull campaign performance, keyword data, and conversion metrics.",
    color: "#4285F4",
    bgColor: "bg-[#4285F4]",
    lightBg: "bg-blue-50",
    lightText: "text-blue-700",
    icon: "G",
    features: ["Search Campaigns", "Shopping Ads", "Performance Max", "Display Network"],
  },
  {
    key: "shopify" as const,
    name: "Shopify",
    subtitle: "E-commerce Store",
    description: "Connect your Shopify store to pull order data, revenue metrics, and product performance.",
    color: "#96BF48",
    bgColor: "bg-[#96BF48]",
    lightBg: "bg-green-50",
    lightText: "text-green-700",
    icon: "S",
    features: ["Order Data", "Revenue Tracking", "Product Analytics", "Customer Insights"],
  },
];

// ─── Component ───────────────────────────────────────────────────────────────

export default function IntegrationsPage() {
  const { isAuthenticated } = useAuth();
  const { activeClientSpace, updateClientSpace, clientSpaces } = useWorkspace();

  // OAuth result from callback
  const [oauthResult, setOauthResult] = useState<OAuthResult | null>(null);
  const [error, setError] = useState<{ message: string; platform: string } | null>(null);

  // Account selector state
  const [selectedMetaAccount, setSelectedMetaAccount] = useState<string>("");
  const [selectedGoogleAccount, setSelectedGoogleAccount] = useState<string>("");
  const [saving, setSaving] = useState(false);

  // Shopify store input
  const [shopifyDomain, setShopifyDomain] = useState("");
  const [showShopifyInput, setShowShopifyInput] = useState(false);

  // Parse OAuth result from URL fragment on load
  const parseOAuthResult = useCallback(() => {
    // Check for errors in query params
    const params = new URLSearchParams(window.location.search);
    const errorMsg = params.get("error");
    const platform = params.get("platform");
    if (errorMsg && platform) {
      setError({ message: errorMsg, platform });
      window.history.replaceState({}, "", "/integrations");
      return;
    }

    // Check for OAuth result in fragment
    const hash = window.location.hash;
    if (hash.includes("oauth_result=")) {
      try {
        const encoded = hash.split("oauth_result=")[1];
        const data = JSON.parse(decodeURIComponent(encoded)) as OAuthResult;
        setOauthResult(data);
      } catch {
        setError({ message: "Failed to parse OAuth response", platform: "unknown" });
      }
      window.history.replaceState({}, "", "/integrations");
    }
  }, []);

  useEffect(() => {
    parseOAuthResult();
  }, [parseOAuthResult]);

  // Connect handlers
  const handleConnectMeta = () => {
    window.location.href = "/api/auth/meta";
  };

  const handleConnectGoogle = () => {
    window.location.href = "/api/auth/google";
  };

  const handleConnectShopify = () => {
    if (!shopifyDomain.trim()) return;
    const domain = shopifyDomain.trim().replace(/^https?:\/\//, "").replace(/\/$/, "");
    window.location.href = `/api/auth/shopify?shop=${encodeURIComponent(domain)}`;
  };

  // Save selected account to workspace
  const handleSaveMetaAccount = async () => {
    if (!oauthResult || oauthResult.platform !== "meta" || !selectedMetaAccount || !activeClientSpace) return;
    setSaving(true);

    const account = oauthResult.adAccounts.find((a) => a.id === selectedMetaAccount);
    updateClientSpace(activeClientSpace.id, {
      metaCredentials: {
        accessToken: oauthResult.accessToken,
        adAccountId: selectedMetaAccount,
      },
      connectedChannels: [
        ...activeClientSpace.connectedChannels.filter((c) => c !== "meta"),
        "meta",
      ],
    });

    setSaving(false);
    setOauthResult(null);
  };

  const handleSaveGoogleAccount = async () => {
    if (!oauthResult || oauthResult.platform !== "google" || !activeClientSpace) return;
    setSaving(true);

    const customerId = selectedGoogleAccount || oauthResult.customerAccounts[0]?.id || "";
    updateClientSpace(activeClientSpace.id, {
      googleCredentials: {
        developerToken: oauthResult.developerToken,
        clientId: oauthResult.clientId,
        clientSecret: oauthResult.clientSecret,
        refreshToken: oauthResult.refreshToken,
        customerId: customerId.replace(/-/g, ""),
      },
      connectedChannels: [
        ...activeClientSpace.connectedChannels.filter((c) => c !== "google"),
        "google",
      ],
    });

    setSaving(false);
    setOauthResult(null);
  };

  const handleSaveShopifyAccount = async () => {
    if (!oauthResult || oauthResult.platform !== "shopify" || !activeClientSpace) return;
    setSaving(true);

    updateClientSpace(activeClientSpace.id, {
      shopifyCredentials: {
        storeUrl: oauthResult.storeUrl,
        accessToken: oauthResult.accessToken,
      },
      connectedChannels: [
        ...activeClientSpace.connectedChannels.filter((c) => c !== "shopify"),
        "shopify",
      ],
    });

    setSaving(false);
    setOauthResult(null);
  };

  // Disconnect handler
  const handleDisconnect = (platform: "meta" | "google" | "shopify") => {
    if (!activeClientSpace) return;
    const updates: Record<string, unknown> = {
      connectedChannels: activeClientSpace.connectedChannels.filter((c) => c !== platform),
    };
    if (platform === "meta") updates.metaCredentials = undefined;
    if (platform === "google") updates.googleCredentials = undefined;
    if (platform === "shopify") updates.shopifyCredentials = undefined;
    updateClientSpace(activeClientSpace.id, updates);
  };

  const isConnected = (platform: string) => {
    return activeClientSpace?.connectedChannels.includes(platform as "meta" | "google" | "shopify");
  };

  if (!isAuthenticated) return <LoginPage />;

  return (
    <div className="flex min-h-screen">
      <Sidebar />
      <div className="ml-64 flex-1 p-6 bg-gray-50">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-3">
              <div className="w-10 h-10 bg-primary-100 rounded-xl flex items-center justify-center">
                <Link2 className="w-5 h-5 text-primary-600" />
              </div>
              Integrations
            </h1>
            <p className="text-gray-500 mt-1 ml-[52px]">
              Connect your ad platforms and stores with one click. Select which accounts to pull data from.
            </p>
          </div>

          {/* No workspace warning */}
          {!activeClientSpace && clientSpaces.length === 0 && (
            <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 mb-6 flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-amber-500 mt-0.5 shrink-0" />
              <div>
                <p className="text-sm font-medium text-amber-800">No Client Space Selected</p>
                <p className="text-sm text-amber-600 mt-1">
                  Create a client space first to connect integrations.{" "}
                  <a href="/workspace/new" className="underline font-medium">Create one now</a>
                </p>
              </div>
            </div>
          )}

          {/* Error banner */}
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-xl p-4 mb-6 flex items-start justify-between">
              <div className="flex items-start gap-3">
                <AlertCircle className="w-5 h-5 text-red-500 mt-0.5 shrink-0" />
                <div>
                  <p className="text-sm font-medium text-red-800">
                    {error.platform.charAt(0).toUpperCase() + error.platform.slice(1)} connection failed
                  </p>
                  <p className="text-sm text-red-600 mt-1">{error.message}</p>
                </div>
              </div>
              <button onClick={() => setError(null)} className="text-red-400 hover:text-red-600">
                <X className="w-4 h-4" />
              </button>
            </div>
          )}

          {/* Platform Cards */}
          <div className="space-y-4">
            {platforms.map((platform) => {
              const connected = isConnected(platform.key);
              return (
                <div
                  key={platform.key}
                  className={`bg-white rounded-2xl border-2 transition-all ${
                    connected ? "border-green-200 shadow-sm" : "border-gray-200 hover:border-gray-300"
                  }`}
                >
                  <div className="p-6">
                    <div className="flex items-start justify-between">
                      {/* Left: Platform info */}
                      <div className="flex items-start gap-4">
                        <div
                          className="w-12 h-12 rounded-xl flex items-center justify-center text-white font-bold text-lg shadow-sm"
                          style={{ backgroundColor: platform.color }}
                        >
                          {platform.icon}
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <h3 className="text-lg font-semibold text-gray-900">{platform.name}</h3>
                            {connected && (
                              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-700">
                                <CheckCircle2 className="w-3 h-3" />
                                Connected
                              </span>
                            )}
                          </div>
                          <p className="text-sm text-gray-500 mt-0.5">{platform.subtitle}</p>
                          <p className="text-sm text-gray-600 mt-2 max-w-lg">{platform.description}</p>

                          {/* Feature tags */}
                          <div className="flex flex-wrap gap-2 mt-3">
                            {platform.features.map((feature) => (
                              <span
                                key={feature}
                                className="px-2.5 py-1 rounded-lg text-xs font-medium bg-gray-100 text-gray-600"
                              >
                                {feature}
                              </span>
                            ))}
                          </div>

                          {/* Connected account info */}
                          {connected && activeClientSpace && (
                            <div className="mt-3 p-3 rounded-lg bg-green-50 border border-green-100">
                              <p className="text-xs font-medium text-green-700">
                                {platform.key === "meta" && (
                                  <>Ad Account: {activeClientSpace.metaCredentials?.adAccountId}</>
                                )}
                                {platform.key === "google" && (
                                  <>Customer ID: {activeClientSpace.googleCredentials?.customerId}</>
                                )}
                                {platform.key === "shopify" && (
                                  <>Store: {activeClientSpace.shopifyCredentials?.storeUrl}</>
                                )}
                              </p>
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Right: Action button */}
                      <div className="shrink-0 ml-4">
                        {connected ? (
                          <button
                            onClick={() => handleDisconnect(platform.key)}
                            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium border border-red-200 text-red-600 hover:bg-red-50 transition-colors"
                          >
                            <Unplug className="w-4 h-4" />
                            Disconnect
                          </button>
                        ) : platform.key === "shopify" ? (
                          <div className="flex flex-col items-end gap-2">
                            {showShopifyInput ? (
                              <div className="flex items-center gap-2">
                                <input
                                  type="text"
                                  value={shopifyDomain}
                                  onChange={(e) => setShopifyDomain(e.target.value)}
                                  placeholder="mystore.myshopify.com"
                                  className="px-3 py-2 border border-gray-300 rounded-lg text-sm w-56 focus:ring-2 focus:ring-green-500 focus:border-green-500 outline-none"
                                  onKeyDown={(e) => e.key === "Enter" && handleConnectShopify()}
                                />
                                <button
                                  onClick={handleConnectShopify}
                                  disabled={!shopifyDomain.trim() || !activeClientSpace}
                                  className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium text-white disabled:opacity-50 transition-colors"
                                  style={{ backgroundColor: platform.color }}
                                >
                                  <ExternalLink className="w-4 h-4" />
                                  Install
                                </button>
                                <button
                                  onClick={() => setShowShopifyInput(false)}
                                  className="p-2 text-gray-400 hover:text-gray-600"
                                >
                                  <X className="w-4 h-4" />
                                </button>
                              </div>
                            ) : (
                              <button
                                onClick={() => setShowShopifyInput(true)}
                                disabled={!activeClientSpace}
                                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-medium text-white disabled:opacity-50 transition-all hover:shadow-md"
                                style={{ backgroundColor: platform.color }}
                              >
                                <Store className="w-4 h-4" />
                                Connect Store
                              </button>
                            )}
                          </div>
                        ) : (
                          <button
                            onClick={platform.key === "meta" ? handleConnectMeta : handleConnectGoogle}
                            disabled={!activeClientSpace}
                            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-medium text-white disabled:opacity-50 transition-all hover:shadow-md"
                            style={{ backgroundColor: platform.color }}
                          >
                            <ExternalLink className="w-4 h-4" />
                            Connect
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* How it works */}
          <div className="mt-8 bg-white rounded-2xl border border-gray-200 p-6">
            <h3 className="text-sm font-semibold text-gray-900 mb-4">How it works</h3>
            <div className="grid grid-cols-3 gap-6">
              {[
                { step: "1", title: "Click Connect", desc: "Opens the platform's official login page" },
                { step: "2", title: "Authorize Access", desc: "Grant read-only access to your data" },
                { step: "3", title: "Select Accounts", desc: "Choose which accounts to pull data from" },
              ].map((item) => (
                <div key={item.step} className="text-center">
                  <div className="w-8 h-8 rounded-full bg-primary-100 text-primary-600 flex items-center justify-center text-sm font-bold mx-auto mb-2">
                    {item.step}
                  </div>
                  <p className="text-sm font-medium text-gray-900">{item.title}</p>
                  <p className="text-xs text-gray-500 mt-1">{item.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* ─── Account Selector Modal ─────────────────────────────────────────── */}
      {oauthResult && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[80vh] overflow-y-auto">
            <div className="p-6">
              {/* Close button */}
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                  <div
                    className="w-10 h-10 rounded-xl flex items-center justify-center text-white font-bold"
                    style={{
                      backgroundColor:
                        oauthResult.platform === "meta"
                          ? "#1877F2"
                          : oauthResult.platform === "google"
                          ? "#4285F4"
                          : "#96BF48",
                    }}
                  >
                    {oauthResult.platform === "meta" ? "M" : oauthResult.platform === "google" ? "G" : "S"}
                  </div>
                  <div>
                    <h2 className="text-lg font-semibold text-gray-900">
                      {oauthResult.platform === "meta" && "Select Ad Account"}
                      {oauthResult.platform === "google" && "Select Customer Account"}
                      {oauthResult.platform === "shopify" && "Confirm Store Connection"}
                    </h2>
                    <p className="text-sm text-gray-500">
                      {oauthResult.platform === "meta" && `Logged in as ${oauthResult.userName}`}
                      {oauthResult.platform === "google" && `Logged in as ${oauthResult.email || oauthResult.userName}`}
                      {oauthResult.platform === "shopify" && oauthResult.shopName}
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => setOauthResult(null)}
                  className="p-2 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* ── Meta: Select Ad Account ── */}
              {oauthResult.platform === "meta" && (
                <div className="space-y-3">
                  {oauthResult.adAccounts.length === 0 ? (
                    <p className="text-sm text-gray-500 text-center py-6">
                      No ad accounts found. Make sure your Facebook account has access to a Business ad account.
                    </p>
                  ) : (
                    <>
                      <p className="text-sm text-gray-600 mb-3">
                        Choose which ad account to connect:
                      </p>
                      {oauthResult.adAccounts.map((account) => (
                        <label
                          key={account.id}
                          className={`flex items-center gap-3 p-3 rounded-xl border-2 cursor-pointer transition-all ${
                            selectedMetaAccount === account.id
                              ? "border-blue-500 bg-blue-50"
                              : "border-gray-200 hover:border-gray-300"
                          }`}
                        >
                          <input
                            type="radio"
                            name="metaAccount"
                            value={account.id}
                            checked={selectedMetaAccount === account.id}
                            onChange={(e) => setSelectedMetaAccount(e.target.value)}
                            className="w-4 h-4 text-blue-600"
                          />
                          <div className="flex-1">
                            <p className="text-sm font-medium text-gray-900">{account.name}</p>
                            <p className="text-xs text-gray-500">
                              {account.id} &middot; {account.currency} &middot;{" "}
                              <span className={account.status === "active" ? "text-green-600" : "text-gray-400"}>
                                {account.status}
                              </span>
                            </p>
                          </div>
                        </label>
                      ))}

                      {oauthResult.pages.length > 0 && (
                        <div className="mt-4 pt-4 border-t border-gray-100">
                          <p className="text-xs font-medium text-gray-500 mb-2">
                            Pages you manage ({oauthResult.pages.length})
                          </p>
                          <div className="flex flex-wrap gap-2">
                            {oauthResult.pages.map((page) => (
                              <span
                                key={page.id}
                                className="px-2.5 py-1 rounded-lg text-xs bg-gray-100 text-gray-700"
                              >
                                {page.name}
                              </span>
                            ))}
                          </div>
                        </div>
                      )}
                    </>
                  )}

                  <button
                    onClick={handleSaveMetaAccount}
                    disabled={!selectedMetaAccount || saving || !activeClientSpace}
                    className="w-full mt-4 py-3 rounded-xl text-sm font-medium text-white bg-[#1877F2] hover:bg-[#166FE5] disabled:opacity-50 transition-colors flex items-center justify-center gap-2"
                  >
                    {saving ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <CheckCircle2 className="w-4 h-4" />
                    )}
                    Connect Selected Account
                  </button>
                </div>
              )}

              {/* ── Google: Select Customer Account ── */}
              {oauthResult.platform === "google" && (
                <div className="space-y-3">
                  {oauthResult.customerAccounts.length === 0 ? (
                    <div className="space-y-3">
                      <p className="text-sm text-gray-600">
                        No Google Ads accounts found automatically. Enter your Customer ID manually:
                      </p>
                      <input
                        type="text"
                        value={selectedGoogleAccount}
                        onChange={(e) => setSelectedGoogleAccount(e.target.value)}
                        placeholder="123-456-7890"
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                      />
                    </div>
                  ) : (
                    <>
                      <p className="text-sm text-gray-600 mb-3">
                        Choose which Google Ads account to connect:
                      </p>
                      {oauthResult.customerAccounts.map((account) => (
                        <label
                          key={account.id}
                          className={`flex items-center gap-3 p-3 rounded-xl border-2 cursor-pointer transition-all ${
                            selectedGoogleAccount === account.id
                              ? "border-blue-500 bg-blue-50"
                              : "border-gray-200 hover:border-gray-300"
                          }`}
                        >
                          <input
                            type="radio"
                            name="googleAccount"
                            value={account.id}
                            checked={selectedGoogleAccount === account.id}
                            onChange={(e) => setSelectedGoogleAccount(e.target.value)}
                            className="w-4 h-4 text-blue-600"
                          />
                          <div className="flex-1">
                            <p className="text-sm font-medium text-gray-900">{account.name}</p>
                            <p className="text-xs text-gray-500">
                              {account.id} &middot; {account.currencyCode}
                            </p>
                          </div>
                        </label>
                      ))}
                    </>
                  )}

                  <button
                    onClick={handleSaveGoogleAccount}
                    disabled={(!selectedGoogleAccount && oauthResult.customerAccounts.length === 0) || saving || !activeClientSpace}
                    className="w-full mt-4 py-3 rounded-xl text-sm font-medium text-white bg-[#4285F4] hover:bg-[#3B78DB] disabled:opacity-50 transition-colors flex items-center justify-center gap-2"
                  >
                    {saving ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <CheckCircle2 className="w-4 h-4" />
                    )}
                    Connect Google Ads
                  </button>
                </div>
              )}

              {/* ── Shopify: Confirm ── */}
              {oauthResult.platform === "shopify" && (
                <div className="space-y-4">
                  <div className="p-4 rounded-xl bg-green-50 border border-green-100">
                    <div className="flex items-center gap-3">
                      <Store className="w-8 h-8 text-green-600" />
                      <div>
                        <p className="text-sm font-medium text-gray-900">{oauthResult.shopName}</p>
                        <p className="text-xs text-gray-500">
                          {oauthResult.domain} &middot; {oauthResult.currency}
                        </p>
                        {oauthResult.email && (
                          <p className="text-xs text-gray-500">{oauthResult.email}</p>
                        )}
                      </div>
                    </div>
                  </div>

                  <button
                    onClick={handleSaveShopifyAccount}
                    disabled={saving || !activeClientSpace}
                    className="w-full py-3 rounded-xl text-sm font-medium text-white bg-[#96BF48] hover:bg-[#87AB3F] disabled:opacity-50 transition-colors flex items-center justify-center gap-2"
                  >
                    {saving ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <CheckCircle2 className="w-4 h-4" />
                    )}
                    Connect Store
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
