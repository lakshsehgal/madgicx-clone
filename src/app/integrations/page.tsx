"use client";

import React, { useState, useEffect, useCallback } from "react";
import Sidebar from "@/components/layout/Sidebar";
import { useWorkspace } from "@/contexts/WorkspaceContext";
import { useAuth } from "@/contexts/AuthContext";
import LoginPage from "@/components/auth/LoginPage";
import {
  CheckCircle2,
  Loader2,
  X,
  AlertCircle,
  Link2,
  Unplug,
  Key,
  Eye,
  EyeOff,
  ShieldCheck,
  ExternalLink,
} from "lucide-react";

// ─── Platform Config ─────────────────────────────────────────────────────────

interface PlatformField {
  key: string;
  label: string;
  placeholder: string;
  secret: boolean;
  helpText: string;
}

interface PlatformConfig {
  key: "meta" | "google" | "shopify";
  name: string;
  subtitle: string;
  description: string;
  color: string;
  icon: string;
  features: string[];
  fields: PlatformField[];
  connectMethod: "direct" | "oauth";
}

const platforms: PlatformConfig[] = [
  {
    key: "meta",
    name: "Meta Ads",
    subtitle: "Facebook & Instagram",
    description:
      "Enter your Meta access token and ad account ID to pull ad performance, campaign data, and conversion metrics.",
    color: "#1877F2",
    icon: "M",
    features: ["Ad Accounts", "Campaign Insights", "Conversion Tracking", "Page Analytics"],
    connectMethod: "direct",
    fields: [
      {
        key: "accessToken",
        label: "Access Token",
        placeholder: "EAAxxxxxxx...",
        secret: true,
        helpText: "Generate a long-lived token from Meta Business Settings → System Users.",
      },
      {
        key: "adAccountId",
        label: "Ad Account ID",
        placeholder: "act_123456789",
        secret: false,
        helpText: "Found in Meta Business Suite → Ad Accounts. Starts with act_.",
      },
    ],
  },
  {
    key: "google",
    name: "Google Ads",
    subtitle: "Search, Display, Shopping & PMax",
    description:
      "Enter your Google Ads API credentials to pull campaign performance, keyword data, and conversion metrics.",
    color: "#4285F4",
    icon: "G",
    features: ["Search Campaigns", "Shopping Ads", "Performance Max", "Display Network"],
    connectMethod: "direct",
    fields: [
      {
        key: "developerToken",
        label: "Developer Token",
        placeholder: "aBcDeFgHiJkLmNoPqR",
        secret: true,
        helpText: "Found in Google Ads → Tools & Settings → API Center.",
      },
      {
        key: "clientId",
        label: "OAuth Client ID",
        placeholder: "123456-xxxxx.apps.googleusercontent.com",
        secret: false,
        helpText: "From Google Cloud Console → APIs & Services → Credentials.",
      },
      {
        key: "clientSecret",
        label: "OAuth Client Secret",
        placeholder: "GOCSPX-xxxxxxxx",
        secret: true,
        helpText: "From the same OAuth 2.0 Client in Google Cloud Console.",
      },
      {
        key: "refreshToken",
        label: "Refresh Token",
        placeholder: "1//0xxxxxxx...",
        secret: true,
        helpText: "Generated via OAuth 2.0 playground or your own OAuth flow.",
      },
      {
        key: "customerId",
        label: "Customer ID",
        placeholder: "123-456-7890",
        secret: false,
        helpText: "Your Google Ads account number (with or without dashes).",
      },
    ],
  },
  {
    key: "shopify",
    name: "Shopify",
    subtitle: "E-commerce Store",
    description:
      "Enter your Shopify app credentials from the Partners dashboard. We'll connect to the store via OAuth to get the access token automatically.",
    color: "#96BF48",
    icon: "S",
    features: ["Order Data", "Revenue Tracking", "Product Analytics", "Customer Insights"],
    connectMethod: "oauth",
    fields: [
      {
        key: "storeUrl",
        label: "Store URL",
        placeholder: "mystore.myshopify.com",
        secret: false,
        helpText: "Your Shopify store domain (e.g. mystore.myshopify.com).",
      },
      {
        key: "clientId",
        label: "Client ID",
        placeholder: "6e5a67ca859fcc95ce6e356fc8182eda",
        secret: false,
        helpText: "Found in Shopify Partners → Your App → Settings → Credentials.",
      },
      {
        key: "clientSecret",
        label: "Client Secret",
        placeholder: "your-client-secret",
        secret: true,
        helpText: "Found in Shopify Partners → Your App → Settings → Credentials.",
      },
    ],
  },
];

// ─── Component ───────────────────────────────────────────────────────────────

export default function IntegrationsPage() {
  const { isAuthenticated } = useAuth();
  const { activeClientSpace, updateClientSpace, clientSpaces } = useWorkspace();

  const [expandedPlatform, setExpandedPlatform] = useState<string | null>(null);
  const [formData, setFormData] = useState<Record<string, Record<string, string>>>({});
  const [visibleFields, setVisibleFields] = useState<Record<string, boolean>>({});
  const [saving, setSaving] = useState<string | null>(null);
  const [verifying, setVerifying] = useState<string | null>(null);
  const [error, setError] = useState<{ message: string; platform: string } | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [googleCustomerAccounts, setGoogleCustomerAccounts] = useState<{ id: string; name: string; currencyCode: string }[]>([]);

  // ─── Handle OAuth callback (Shopify & Google) from URL fragment ──────────
  const handleOAuthResult = useCallback(() => {
    if (typeof window === "undefined") return;

    const hash = window.location.hash;
    if (!hash.includes("oauth_result=")) return;

    try {
      const encoded = hash.split("oauth_result=")[1];
      const payload = JSON.parse(decodeURIComponent(encoded));

      if (payload.platform === "shopify" && payload.accessToken && activeClientSpace) {
        updateClientSpace(activeClientSpace.id, {
          shopifyCredentials: {
            storeUrl: payload.storeUrl,
            accessToken: payload.accessToken,
            clientId: payload.clientId,
            clientSecret: payload.clientSecret,
          },
          connectedChannels: [
            ...activeClientSpace.connectedChannels.filter((c) => c !== "shopify"),
            "shopify",
          ],
        });
        setSuccess("shopify");
      }

      if (payload.platform === "google" && payload.refreshToken && activeClientSpace) {
        // Auto-pick first customer account if available, otherwise leave for manual entry
        const customerId = payload.customerAccounts?.[0]?.id || "";

        updateClientSpace(activeClientSpace.id, {
          googleCredentials: {
            developerToken: payload.developerToken || "",
            clientId: payload.clientId || "",
            clientSecret: payload.clientSecret || "",
            refreshToken: payload.refreshToken,
            customerId: customerId.replace(/-/g, ""),
          },
          connectedChannels: [
            ...activeClientSpace.connectedChannels.filter((c) => c !== "google"),
            "google",
          ],
        });

        // Store customer accounts in state so user can pick one
        if (payload.customerAccounts?.length > 0) {
          setGoogleCustomerAccounts(payload.customerAccounts);
        }

        setSuccess("google");
      }
    } catch {
      setError({ message: "Failed to process OAuth response.", platform: "unknown" });
    }

    // Clear the hash
    window.history.replaceState(null, "", window.location.pathname + window.location.search);
  }, [activeClientSpace, updateClientSpace]);

  // Check for OAuth callback on mount and URL changes
  useEffect(() => {
    handleOAuthResult();
  }, [handleOAuthResult]);

  // Check for error query params (from failed OAuth)
  useEffect(() => {
    if (typeof window === "undefined") return;
    const params = new URLSearchParams(window.location.search);
    const errorMsg = params.get("error");
    const platform = params.get("platform");
    if (errorMsg && platform) {
      setError({ message: errorMsg, platform });
      window.history.replaceState(null, "", window.location.pathname);
    }
  }, []);

  const isConnected = (platform: string) => {
    return activeClientSpace?.connectedChannels.includes(platform as "meta" | "google" | "shopify");
  };

  const toggleVisibility = (fieldKey: string) => {
    setVisibleFields((prev) => ({ ...prev, [fieldKey]: !prev[fieldKey] }));
  };

  const updateField = (platform: string, field: string, value: string) => {
    setFormData((prev) => ({
      ...prev,
      [platform]: { ...prev[platform], [field]: value },
    }));
  };

  const getFieldValue = (platform: string, field: string) => {
    return formData[platform]?.[field] || "";
  };

  const isFormComplete = (platformKey: string) => {
    const platform = platforms.find((p) => p.key === platformKey);
    if (!platform) return false;
    return platform.fields.every((f) => getFieldValue(platformKey, f.key).trim() !== "");
  };

  // Test connection by calling the verify endpoint (Meta & Google only)
  const handleTestConnection = async (platformKey: string) => {
    if (!isFormComplete(platformKey)) return;
    setVerifying(platformKey);
    setError(null);
    setSuccess(null);

    try {
      const fields = formData[platformKey] || {};
      let body: Record<string, unknown> = {};

      if (platformKey === "meta") {
        body = {
          action: "verify_meta",
          metaCredentials: {
            accessToken: fields.accessToken,
            adAccountId: fields.adAccountId,
          },
        };
      } else if (platformKey === "google") {
        body = {
          action: "verify_google",
          googleCredentials: {
            developerToken: fields.developerToken,
            clientId: fields.clientId,
            clientSecret: fields.clientSecret,
            refreshToken: fields.refreshToken,
            customerId: fields.customerId.replace(/-/g, ""),
          },
        };
      }

      const res = await fetch("/api/windsor", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      const result = await res.json();

      if (result.valid) {
        setSuccess(platformKey);
      } else {
        setError({
          message: result.error || "Connection test failed. Check your credentials.",
          platform: platformKey,
        });
      }
    } catch {
      setError({
        message: "Network error. Could not reach the verification endpoint.",
        platform: platformKey,
      });
    } finally {
      setVerifying(null);
    }
  };

  // Save credentials to workspace (Meta & Google direct save)
  const handleSave = async (platformKey: string) => {
    if (!activeClientSpace || !isFormComplete(platformKey)) return;
    setSaving(platformKey);
    setError(null);

    const fields = formData[platformKey] || {};

    if (platformKey === "meta") {
      updateClientSpace(activeClientSpace.id, {
        metaCredentials: {
          accessToken: fields.accessToken,
          adAccountId: fields.adAccountId,
        },
        connectedChannels: [
          ...activeClientSpace.connectedChannels.filter((c) => c !== "meta"),
          "meta",
        ],
      });
    } else if (platformKey === "google") {
      updateClientSpace(activeClientSpace.id, {
        googleCredentials: {
          developerToken: fields.developerToken,
          clientId: fields.clientId,
          clientSecret: fields.clientSecret,
          refreshToken: fields.refreshToken,
          customerId: fields.customerId.replace(/-/g, ""),
        },
        connectedChannels: [
          ...activeClientSpace.connectedChannels.filter((c) => c !== "google"),
          "google",
        ],
      });
    }

    setSaving(null);
    setExpandedPlatform(null);
    setSuccess(null);
    setFormData((prev) => ({ ...prev, [platformKey]: {} }));
  };

  // Shopify: Initiate OAuth flow to get access token automatically
  const handleShopifyInstall = () => {
    const fields = formData["shopify"] || {};
    const storeUrl = fields.storeUrl?.replace(/^https?:\/\//, "").replace(/\/$/, "");
    const clientId = fields.clientId;
    const clientSecret = fields.clientSecret;

    if (!storeUrl || !clientId || !clientSecret) return;

    const params = new URLSearchParams({
      shop: storeUrl,
      client_id: clientId,
      client_secret: clientSecret,
    });

    window.location.href = `/api/auth/shopify?${params.toString()}`;
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
              Connect your ad platforms and stores to pull performance data.
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

          {/* OAuth success banners */}
          {success === "shopify" && isConnected("shopify") && (
            <div className="bg-green-50 border border-green-200 rounded-xl p-4 mb-6 flex items-start justify-between">
              <div className="flex items-start gap-3">
                <CheckCircle2 className="w-5 h-5 text-green-500 mt-0.5 shrink-0" />
                <div>
                  <p className="text-sm font-medium text-green-800">Shopify connected successfully!</p>
                  <p className="text-sm text-green-600 mt-1">
                    Store: {activeClientSpace?.shopifyCredentials?.storeUrl}
                  </p>
                </div>
              </div>
              <button onClick={() => setSuccess(null)} className="text-green-400 hover:text-green-600">
                <X className="w-4 h-4" />
              </button>
            </div>
          )}

          {success === "google" && isConnected("google") && (
            <div className="bg-green-50 border border-green-200 rounded-xl p-4 mb-6 flex items-start justify-between">
              <div className="flex items-start gap-3">
                <CheckCircle2 className="w-5 h-5 text-green-500 mt-0.5 shrink-0" />
                <div>
                  <p className="text-sm font-medium text-green-800">Google Ads connected successfully!</p>
                  {googleCustomerAccounts.length > 0 && (
                    <div className="mt-2">
                      <p className="text-xs text-green-700 font-medium mb-1">Available accounts:</p>
                      <div className="space-y-1">
                        {googleCustomerAccounts.map((acc) => (
                          <button
                            key={acc.id}
                            onClick={() => {
                              if (activeClientSpace) {
                                const existing = activeClientSpace.googleCredentials;
                                if (existing) {
                                  updateClientSpace(activeClientSpace.id, {
                                    googleCredentials: { ...existing, customerId: acc.id.replace(/-/g, "") },
                                  });
                                }
                              }
                            }}
                            className={`block w-full text-left px-3 py-1.5 rounded-lg text-xs border transition-colors ${
                              activeClientSpace?.googleCredentials?.customerId === acc.id.replace(/-/g, "")
                                ? "bg-green-100 border-green-300 text-green-800"
                                : "bg-white border-green-200 text-green-700 hover:bg-green-50"
                            }`}
                          >
                            <span className="font-medium">{acc.name}</span>
                            <span className="text-green-500 ml-2">({acc.id})</span>
                            {activeClientSpace?.googleCredentials?.customerId === acc.id.replace(/-/g, "") && (
                              <CheckCircle2 className="w-3 h-3 inline ml-2" />
                            )}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                  {googleCustomerAccounts.length === 0 && (
                    <p className="text-sm text-green-600 mt-1">
                      Customer ID: {activeClientSpace?.googleCredentials?.customerId}
                    </p>
                  )}
                </div>
              </div>
              <button onClick={() => { setSuccess(null); setGoogleCustomerAccounts([]); }} className="text-green-400 hover:text-green-600">
                <X className="w-4 h-4" />
              </button>
            </div>
          )}

          {/* Platform Cards */}
          <div className="space-y-4">
            {platforms.map((platform) => {
              const connected = isConnected(platform.key);
              const expanded = expandedPlatform === platform.key;

              return (
                <div
                  key={platform.key}
                  className={`bg-white rounded-2xl border-2 transition-all ${
                    connected
                      ? "border-green-200 shadow-sm"
                      : expanded
                      ? "border-gray-300 shadow-md"
                      : "border-gray-200 hover:border-gray-300"
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
                        ) : (
                          <button
                            onClick={() =>
                              setExpandedPlatform(expanded ? null : platform.key)
                            }
                            disabled={!activeClientSpace}
                            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-medium text-white disabled:opacity-50 transition-all hover:shadow-md"
                            style={{ backgroundColor: platform.color }}
                          >
                            <Key className="w-4 h-4" />
                            {expanded ? "Cancel" : "Connect"}
                          </button>
                        )}
                      </div>
                    </div>

                    {/* ─── Credential Form (expanded) ─────────────────────────── */}
                    {expanded && !connected && (
                      <div className="mt-6 pt-6 border-t border-gray-100">
                        {/* Google OAuth quick-connect option */}
                        {platform.key === "google" && (
                          <div className="mb-5">
                            <button
                              onClick={() => { window.location.href = "/api/auth/google"; }}
                              disabled={!activeClientSpace}
                              className="w-full inline-flex items-center justify-center gap-3 px-5 py-3 rounded-xl text-sm font-medium border-2 border-blue-200 bg-blue-50 text-blue-700 hover:bg-blue-100 hover:border-blue-300 transition-all disabled:opacity-50"
                            >
                              <svg className="w-5 h-5" viewBox="0 0 24 24"><path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 01-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4"/><path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/><path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/><path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/></svg>
                              Connect with Google (OAuth)
                            </button>
                            <p className="text-xs text-gray-400 text-center mt-2">Recommended — automatically gets your tokens and finds your ad accounts</p>
                            <div className="flex items-center gap-3 my-4">
                              <div className="flex-1 border-t border-gray-200" />
                              <span className="text-xs text-gray-400 font-medium">or enter credentials manually</span>
                              <div className="flex-1 border-t border-gray-200" />
                            </div>
                          </div>
                        )}

                        <div className="space-y-4">
                          {platform.fields.map((field) => {
                            const fieldId = `${platform.key}-${field.key}`;
                            const isVisible = visibleFields[fieldId];

                            return (
                              <div key={field.key}>
                                <label
                                  htmlFor={fieldId}
                                  className="block text-sm font-medium text-gray-700 mb-1"
                                >
                                  {field.label}
                                </label>
                                <div className="relative">
                                  <input
                                    id={fieldId}
                                    type={field.secret && !isVisible ? "password" : "text"}
                                    value={getFieldValue(platform.key, field.key)}
                                    onChange={(e) =>
                                      updateField(platform.key, field.key, e.target.value)
                                    }
                                    placeholder={field.placeholder}
                                    className="w-full px-3 py-2.5 border border-gray-300 rounded-xl text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none pr-10 font-mono"
                                  />
                                  {field.secret && (
                                    <button
                                      type="button"
                                      onClick={() => toggleVisibility(fieldId)}
                                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                                    >
                                      {isVisible ? (
                                        <EyeOff className="w-4 h-4" />
                                      ) : (
                                        <Eye className="w-4 h-4" />
                                      )}
                                    </button>
                                  )}
                                </div>
                                <p className="text-xs text-gray-400 mt-1">{field.helpText}</p>
                              </div>
                            );
                          })}
                        </div>

                        {/* Success message (for direct-save platforms) */}
                        {success === platform.key && platform.connectMethod === "direct" && (
                          <div className="mt-4 p-3 rounded-xl bg-green-50 border border-green-200 flex items-center gap-2">
                            <CheckCircle2 className="w-4 h-4 text-green-600" />
                            <p className="text-sm text-green-700 font-medium">
                              Connection verified successfully!
                            </p>
                          </div>
                        )}

                        {/* Action buttons */}
                        <div className="flex items-center gap-3 mt-5">
                          {platform.connectMethod === "direct" ? (
                            <>
                              {/* Meta & Google: Test + Save */}
                              <button
                                onClick={() => handleTestConnection(platform.key)}
                                disabled={!isFormComplete(platform.key) || verifying === platform.key}
                                className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium border border-gray-300 text-gray-700 hover:bg-gray-50 disabled:opacity-50 transition-colors"
                              >
                                {verifying === platform.key ? (
                                  <Loader2 className="w-4 h-4 animate-spin" />
                                ) : (
                                  <ShieldCheck className="w-4 h-4" />
                                )}
                                Test Connection
                              </button>

                              <button
                                onClick={() => handleSave(platform.key)}
                                disabled={
                                  !isFormComplete(platform.key) ||
                                  saving === platform.key ||
                                  !activeClientSpace
                                }
                                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-medium text-white disabled:opacity-50 transition-all hover:shadow-md"
                                style={{ backgroundColor: platform.color }}
                              >
                                {saving === platform.key ? (
                                  <Loader2 className="w-4 h-4 animate-spin" />
                                ) : (
                                  <CheckCircle2 className="w-4 h-4" />
                                )}
                                Save & Connect
                              </button>
                            </>
                          ) : (
                            <>
                              {/* Shopify: OAuth — get token automatically */}
                              <button
                                onClick={handleShopifyInstall}
                                disabled={!isFormComplete(platform.key) || !activeClientSpace}
                                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-medium text-white disabled:opacity-50 transition-all hover:shadow-md"
                                style={{ backgroundColor: platform.color }}
                              >
                                <ExternalLink className="w-4 h-4" />
                                Connect to Shopify
                              </button>
                              <p className="text-xs text-gray-400">
                                You&apos;ll be redirected to Shopify to authorize. The access token is obtained automatically.
                              </p>
                            </>
                          )}
                        </div>
                      </div>
                    )}
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
                {
                  step: "1",
                  title: "Get Credentials",
                  desc: "Get API keys from Meta/Google, or Client ID & Secret from Shopify Partners",
                },
                {
                  step: "2",
                  title: "Enter & Connect",
                  desc: "Paste credentials above. For Shopify, we handle the token exchange via OAuth automatically.",
                },
                {
                  step: "3",
                  title: "Pull Data",
                  desc: "Your dashboard will start showing real campaign and revenue data.",
                },
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

          {/* Security note */}
          <div className="mt-4 flex items-start gap-2 px-2">
            <ShieldCheck className="w-4 h-4 text-gray-400 mt-0.5 shrink-0" />
            <p className="text-xs text-gray-400">
              Credentials are stored locally in your browser. Shopify tokens are obtained via secure OAuth.
              Nothing is shared with third parties.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
