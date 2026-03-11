"use client";

import React, { useState } from "react";
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
      "Enter your Shopify app credentials from the Partners dashboard. The app must already be installed on the client's store.",
    color: "#96BF48",
    icon: "S",
    features: ["Order Data", "Revenue Tracking", "Product Analytics", "Customer Insights"],
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
      {
        key: "accessToken",
        label: "Admin API Access Token",
        placeholder: "shpat_xxxxxxxxxxxxxxxx",
        secret: true,
        helpText: "Generated when the app was installed. Found in Partners → Your App → API credentials.",
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

  // Test connection by calling the verify endpoint
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
      } else if (platformKey === "shopify") {
        body = {
          action: "verify_shopify",
          shopifyCredentials: {
            storeUrl: fields.storeUrl.replace(/^https?:\/\//, "").replace(/\/$/, ""),
            accessToken: fields.accessToken,
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

  // Save credentials to workspace
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
    } else if (platformKey === "shopify") {
      updateClientSpace(activeClientSpace.id, {
        shopifyCredentials: {
          storeUrl: fields.storeUrl.replace(/^https?:\/\//, "").replace(/\/$/, ""),
          accessToken: fields.accessToken,
          clientId: fields.clientId,
          clientSecret: fields.clientSecret,
        },
        connectedChannels: [
          ...activeClientSpace.connectedChannels.filter((c) => c !== "shopify"),
          "shopify",
        ],
      });
    }

    setSaving(null);
    setExpandedPlatform(null);
    setSuccess(null);
    setFormData((prev) => ({ ...prev, [platformKey]: {} }));
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
              Enter your API credentials to connect your ad platforms and stores.
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

                        {/* Success message */}
                        {success === platform.key && (
                          <div className="mt-4 p-3 rounded-xl bg-green-50 border border-green-200 flex items-center gap-2">
                            <CheckCircle2 className="w-4 h-4 text-green-600" />
                            <p className="text-sm text-green-700 font-medium">
                              Connection verified successfully!
                            </p>
                          </div>
                        )}

                        {/* Action buttons */}
                        <div className="flex items-center gap-3 mt-5">
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
                  desc: "Get API keys from each platform's developer or partner settings",
                },
                {
                  step: "2",
                  title: "Enter & Test",
                  desc: "Paste your credentials and verify they work with the Test Connection button",
                },
                {
                  step: "3",
                  title: "Save & Pull Data",
                  desc: "Save your credentials and your dashboard will start showing real data",
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
              Credentials are stored locally in your browser and sent directly to platform APIs via our server.
              They are never shared with third parties.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
