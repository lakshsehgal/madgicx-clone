"use client";

import React, { useState } from "react";
import { useWorkspace } from "@/contexts/WorkspaceContext";
import { useRouter } from "next/navigation";
import { MetaCredentials, GoogleAdsCredentials, ShopifyCredentials } from "@/types";
import {
  Users,
  ArrowLeft,
  CheckCircle2,
  Loader2,
  AlertCircle,
  ChevronDown,
  ChevronUp,
  Eye,
  EyeOff,
} from "lucide-react";
import Link from "next/link";

const channelConfig = [
  {
    key: "meta" as const,
    label: "Meta Ads",
    description: "Facebook & Instagram advertising",
    color: "#1877F2",
  },
  {
    key: "google" as const,
    label: "Google Ads",
    description: "Search, Display, Shopping & Performance Max",
    color: "#4285F4",
  },
  {
    key: "shopify" as const,
    label: "Shopify",
    description: "E-commerce store orders & revenue",
    color: "#96BF48",
  },
];

type VerifyStatus = "idle" | "verifying" | "success" | "error";

export default function NewClientSpacePage() {
  const { createClientSpace } = useWorkspace();
  const router = useRouter();

  const [name, setName] = useState("");

  // Expandable sections
  const [expandedChannel, setExpandedChannel] = useState<string | null>(null);

  // Meta credentials
  const [metaAccessToken, setMetaAccessToken] = useState("");
  const [metaAdAccountId, setMetaAdAccountId] = useState("");
  const [metaVerifyStatus, setMetaVerifyStatus] = useState<VerifyStatus>("idle");
  const [metaAccountName, setMetaAccountName] = useState("");
  const [metaError, setMetaError] = useState("");

  // Google Ads credentials
  const [googleDeveloperToken, setGoogleDeveloperToken] = useState("");
  const [googleClientId, setGoogleClientId] = useState("");
  const [googleClientSecret, setGoogleClientSecret] = useState("");
  const [googleRefreshToken, setGoogleRefreshToken] = useState("");
  const [googleCustomerId, setGoogleCustomerId] = useState("");
  const [googleVerifyStatus, setGoogleVerifyStatus] = useState<VerifyStatus>("idle");
  const [googleAccountName, setGoogleAccountName] = useState("");
  const [googleError, setGoogleError] = useState("");

  // Shopify credentials
  const [shopifyStoreUrl, setShopifyStoreUrl] = useState("");
  const [shopifyAccessToken, setShopifyAccessToken] = useState("");
  const [shopifyVerifyStatus, setShopifyVerifyStatus] = useState<VerifyStatus>("idle");
  const [shopifyShopName, setShopifyShopName] = useState("");
  const [shopifyError, setShopifyError] = useState("");

  // Show/hide password fields
  const [showTokens, setShowTokens] = useState<Record<string, boolean>>({});

  const toggleToken = (key: string) =>
    setShowTokens((prev) => ({ ...prev, [key]: !prev[key] }));

  const toggleChannel = (key: string) =>
    setExpandedChannel((prev) => (prev === key ? null : key));

  // Verify Meta credentials
  const verifyMeta = async () => {
    if (!metaAccessToken || !metaAdAccountId) return;
    setMetaVerifyStatus("verifying");
    setMetaError("");
    try {
      const response = await fetch("/api/windsor", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "verify_meta",
          metaCredentials: {
            accessToken: metaAccessToken,
            adAccountId: metaAdAccountId,
          },
        }),
      });
      const data = await response.json();
      if (data.valid) {
        setMetaVerifyStatus("success");
        setMetaAccountName(data.accountName || metaAdAccountId);
      } else {
        setMetaVerifyStatus("error");
        setMetaError(data.error || "Verification failed");
      }
    } catch {
      setMetaVerifyStatus("error");
      setMetaError("Network error");
    }
  };

  // Verify Google Ads credentials
  const verifyGoogle = async () => {
    if (!googleDeveloperToken || !googleClientId || !googleClientSecret || !googleRefreshToken || !googleCustomerId) return;
    setGoogleVerifyStatus("verifying");
    setGoogleError("");
    try {
      const response = await fetch("/api/windsor", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "verify_google",
          googleCredentials: {
            developerToken: googleDeveloperToken,
            clientId: googleClientId,
            clientSecret: googleClientSecret,
            refreshToken: googleRefreshToken,
            customerId: googleCustomerId,
          },
        }),
      });
      const data = await response.json();
      if (data.valid) {
        setGoogleVerifyStatus("success");
        setGoogleAccountName(data.accountName || googleCustomerId);
      } else {
        setGoogleVerifyStatus("error");
        setGoogleError(data.error || "Verification failed");
      }
    } catch {
      setGoogleVerifyStatus("error");
      setGoogleError("Network error");
    }
  };

  // Verify Shopify credentials
  const verifyShopify = async () => {
    if (!shopifyStoreUrl || !shopifyAccessToken) return;
    setShopifyVerifyStatus("verifying");
    setShopifyError("");
    try {
      const response = await fetch("/api/windsor", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "verify_shopify",
          shopifyCredentials: {
            storeUrl: shopifyStoreUrl,
            accessToken: shopifyAccessToken,
          },
        }),
      });
      const data = await response.json();
      if (data.valid) {
        setShopifyVerifyStatus("success");
        setShopifyShopName(data.shopName || shopifyStoreUrl);
      } else {
        setShopifyVerifyStatus("error");
        setShopifyError(data.error || "Verification failed");
      }
    } catch {
      setShopifyVerifyStatus("error");
      setShopifyError("Network error");
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    let metaCredentials: MetaCredentials | undefined;
    let googleCredentials: GoogleAdsCredentials | undefined;
    let shopifyCredentials: ShopifyCredentials | undefined;

    if (metaAccessToken && metaAdAccountId) {
      metaCredentials = {
        accessToken: metaAccessToken,
        adAccountId: metaAdAccountId,
      };
    }

    if (googleDeveloperToken && googleClientId && googleClientSecret && googleRefreshToken && googleCustomerId) {
      googleCredentials = {
        developerToken: googleDeveloperToken,
        clientId: googleClientId,
        clientSecret: googleClientSecret,
        refreshToken: googleRefreshToken,
        customerId: googleCustomerId.replace(/-/g, ""),
      };
    }

    if (shopifyStoreUrl && shopifyAccessToken) {
      shopifyCredentials = {
        storeUrl: shopifyStoreUrl,
        accessToken: shopifyAccessToken,
      };
    }

    createClientSpace({
      name: name.trim(),
      metaCredentials,
      googleCredentials,
      shopifyCredentials,
    });

    router.push("/");
  };

  const renderVerifyBadge = (status: VerifyStatus, accountName: string, error: string) => {
    if (status === "verifying") {
      return (
        <div className="flex items-center gap-1.5 text-xs text-gray-500 mt-2">
          <Loader2 className="w-3.5 h-3.5 animate-spin" />
          Verifying...
        </div>
      );
    }
    if (status === "success") {
      return (
        <div className="flex items-center gap-1.5 text-xs text-green-600 mt-2">
          <CheckCircle2 className="w-3.5 h-3.5" />
          Connected: {accountName}
        </div>
      );
    }
    if (status === "error") {
      return (
        <div className="flex items-center gap-1.5 text-xs text-red-500 mt-2">
          <AlertCircle className="w-3.5 h-3.5" />
          {error}
        </div>
      );
    }
    return null;
  };

  const inputClass =
    "w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none";

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-6">
      <div className="w-full max-w-xl">
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-sm text-gray-500 hover:text-gray-700 mb-6"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Dashboard
        </Link>

        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-8">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 bg-primary-100 rounded-xl flex items-center justify-center">
              <Users className="w-5 h-5 text-primary-600" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-gray-900">
                New Client Space
              </h1>
              <p className="text-sm text-gray-500">
                Connect ad accounts directly via their APIs
              </p>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Client Name */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Client Name
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g., Jewelsmars"
                required
                className={inputClass}
              />
            </div>

            {/* Platform Connections */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Connect Platforms
              </label>
              <p className="text-xs text-gray-500 mb-3">
                Add API credentials for each platform you want to pull data from.
                Skip any platform to use demo data for it.
              </p>

              <div className="space-y-3">
                {/* META ADS */}
                <div className="border border-gray-200 rounded-xl overflow-hidden">
                  <button
                    type="button"
                    onClick={() => toggleChannel("meta")}
                    className="w-full flex items-center justify-between p-4 hover:bg-gray-50 transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <div
                        className="w-8 h-8 rounded-lg flex items-center justify-center text-white font-bold text-sm"
                        style={{ backgroundColor: channelConfig[0].color }}
                      >
                        M
                      </div>
                      <div className="text-left">
                        <p className="text-sm font-semibold text-gray-900">
                          {channelConfig[0].label}
                          {metaVerifyStatus === "success" && (
                            <CheckCircle2 className="w-4 h-4 text-green-500 inline ml-2" />
                          )}
                        </p>
                        <p className="text-xs text-gray-500">
                          {channelConfig[0].description}
                        </p>
                      </div>
                    </div>
                    {expandedChannel === "meta" ? (
                      <ChevronUp className="w-4 h-4 text-gray-400" />
                    ) : (
                      <ChevronDown className="w-4 h-4 text-gray-400" />
                    )}
                  </button>

                  {expandedChannel === "meta" && (
                    <div className="px-4 pb-4 space-y-3 border-t border-gray-100 pt-3">
                      <div>
                        <label className="block text-xs font-medium text-gray-600 mb-1">
                          Access Token
                        </label>
                        <div className="relative">
                          <input
                            type={showTokens["metaToken"] ? "text" : "password"}
                            value={metaAccessToken}
                            onChange={(e) => setMetaAccessToken(e.target.value)}
                            placeholder="EAAxxxxxxx..."
                            className={inputClass + " pr-10"}
                          />
                          <button
                            type="button"
                            onClick={() => toggleToken("metaToken")}
                            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400"
                          >
                            {showTokens["metaToken"] ? (
                              <EyeOff className="w-4 h-4" />
                            ) : (
                              <Eye className="w-4 h-4" />
                            )}
                          </button>
                        </div>
                      </div>
                      <div>
                        <label className="block text-xs font-medium text-gray-600 mb-1">
                          Ad Account ID
                        </label>
                        <input
                          type="text"
                          value={metaAdAccountId}
                          onChange={(e) => setMetaAdAccountId(e.target.value)}
                          placeholder="act_123456789"
                          className={inputClass}
                        />
                      </div>
                      <button
                        type="button"
                        onClick={verifyMeta}
                        disabled={!metaAccessToken || !metaAdAccountId || metaVerifyStatus === "verifying"}
                        className="px-4 py-1.5 text-xs font-medium bg-blue-50 text-blue-700 rounded-lg hover:bg-blue-100 disabled:opacity-50 transition-colors"
                      >
                        Verify Connection
                      </button>
                      {renderVerifyBadge(metaVerifyStatus, metaAccountName, metaError)}
                    </div>
                  )}
                </div>

                {/* GOOGLE ADS */}
                <div className="border border-gray-200 rounded-xl overflow-hidden">
                  <button
                    type="button"
                    onClick={() => toggleChannel("google")}
                    className="w-full flex items-center justify-between p-4 hover:bg-gray-50 transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <div
                        className="w-8 h-8 rounded-lg flex items-center justify-center text-white font-bold text-sm"
                        style={{ backgroundColor: channelConfig[1].color }}
                      >
                        G
                      </div>
                      <div className="text-left">
                        <p className="text-sm font-semibold text-gray-900">
                          {channelConfig[1].label}
                          {googleVerifyStatus === "success" && (
                            <CheckCircle2 className="w-4 h-4 text-green-500 inline ml-2" />
                          )}
                        </p>
                        <p className="text-xs text-gray-500">
                          {channelConfig[1].description}
                        </p>
                      </div>
                    </div>
                    {expandedChannel === "google" ? (
                      <ChevronUp className="w-4 h-4 text-gray-400" />
                    ) : (
                      <ChevronDown className="w-4 h-4 text-gray-400" />
                    )}
                  </button>

                  {expandedChannel === "google" && (
                    <div className="px-4 pb-4 space-y-3 border-t border-gray-100 pt-3">
                      <div>
                        <label className="block text-xs font-medium text-gray-600 mb-1">
                          Developer Token
                        </label>
                        <input
                          type={showTokens["googleDev"] ? "text" : "password"}
                          value={googleDeveloperToken}
                          onChange={(e) => setGoogleDeveloperToken(e.target.value)}
                          placeholder="Developer token from Google Ads"
                          className={inputClass}
                        />
                      </div>
                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <label className="block text-xs font-medium text-gray-600 mb-1">
                            OAuth Client ID
                          </label>
                          <input
                            type="text"
                            value={googleClientId}
                            onChange={(e) => setGoogleClientId(e.target.value)}
                            placeholder="xxxxx.apps.googleusercontent.com"
                            className={inputClass}
                          />
                        </div>
                        <div>
                          <label className="block text-xs font-medium text-gray-600 mb-1">
                            OAuth Client Secret
                          </label>
                          <input
                            type={showTokens["googleSecret"] ? "text" : "password"}
                            value={googleClientSecret}
                            onChange={(e) => setGoogleClientSecret(e.target.value)}
                            placeholder="Client secret"
                            className={inputClass}
                          />
                        </div>
                      </div>
                      <div>
                        <label className="block text-xs font-medium text-gray-600 mb-1">
                          Refresh Token
                        </label>
                        <input
                          type={showTokens["googleRefresh"] ? "text" : "password"}
                          value={googleRefreshToken}
                          onChange={(e) => setGoogleRefreshToken(e.target.value)}
                          placeholder="OAuth refresh token"
                          className={inputClass}
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-medium text-gray-600 mb-1">
                          Customer ID
                        </label>
                        <input
                          type="text"
                          value={googleCustomerId}
                          onChange={(e) => setGoogleCustomerId(e.target.value)}
                          placeholder="123-456-7890"
                          className={inputClass}
                        />
                      </div>
                      <button
                        type="button"
                        onClick={verifyGoogle}
                        disabled={
                          !googleDeveloperToken ||
                          !googleClientId ||
                          !googleClientSecret ||
                          !googleRefreshToken ||
                          !googleCustomerId ||
                          googleVerifyStatus === "verifying"
                        }
                        className="px-4 py-1.5 text-xs font-medium bg-blue-50 text-blue-700 rounded-lg hover:bg-blue-100 disabled:opacity-50 transition-colors"
                      >
                        Verify Connection
                      </button>
                      {renderVerifyBadge(googleVerifyStatus, googleAccountName, googleError)}
                    </div>
                  )}
                </div>

                {/* SHOPIFY */}
                <div className="border border-gray-200 rounded-xl overflow-hidden">
                  <button
                    type="button"
                    onClick={() => toggleChannel("shopify")}
                    className="w-full flex items-center justify-between p-4 hover:bg-gray-50 transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <div
                        className="w-8 h-8 rounded-lg flex items-center justify-center text-white font-bold text-sm"
                        style={{ backgroundColor: channelConfig[2].color }}
                      >
                        S
                      </div>
                      <div className="text-left">
                        <p className="text-sm font-semibold text-gray-900">
                          {channelConfig[2].label}
                          {shopifyVerifyStatus === "success" && (
                            <CheckCircle2 className="w-4 h-4 text-green-500 inline ml-2" />
                          )}
                        </p>
                        <p className="text-xs text-gray-500">
                          {channelConfig[2].description}
                        </p>
                      </div>
                    </div>
                    {expandedChannel === "shopify" ? (
                      <ChevronUp className="w-4 h-4 text-gray-400" />
                    ) : (
                      <ChevronDown className="w-4 h-4 text-gray-400" />
                    )}
                  </button>

                  {expandedChannel === "shopify" && (
                    <div className="px-4 pb-4 space-y-3 border-t border-gray-100 pt-3">
                      <div>
                        <label className="block text-xs font-medium text-gray-600 mb-1">
                          Store URL
                        </label>
                        <input
                          type="text"
                          value={shopifyStoreUrl}
                          onChange={(e) => setShopifyStoreUrl(e.target.value)}
                          placeholder="mystore.myshopify.com"
                          className={inputClass}
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-medium text-gray-600 mb-1">
                          Admin API Access Token
                        </label>
                        <div className="relative">
                          <input
                            type={showTokens["shopifyToken"] ? "text" : "password"}
                            value={shopifyAccessToken}
                            onChange={(e) => setShopifyAccessToken(e.target.value)}
                            placeholder="shpat_xxxxx..."
                            className={inputClass + " pr-10"}
                          />
                          <button
                            type="button"
                            onClick={() => toggleToken("shopifyToken")}
                            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400"
                          >
                            {showTokens["shopifyToken"] ? (
                              <EyeOff className="w-4 h-4" />
                            ) : (
                              <Eye className="w-4 h-4" />
                            )}
                          </button>
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={verifyShopify}
                        disabled={!shopifyStoreUrl || !shopifyAccessToken || shopifyVerifyStatus === "verifying"}
                        className="px-4 py-1.5 text-xs font-medium bg-green-50 text-green-700 rounded-lg hover:bg-green-100 disabled:opacity-50 transition-colors"
                      >
                        Verify Connection
                      </button>
                      {renderVerifyBadge(shopifyVerifyStatus, shopifyShopName, shopifyError)}
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Info note */}
            <div className="bg-gray-50 rounded-lg px-4 py-3 text-xs text-gray-500">
              Credentials are stored locally in your browser. Platforms without
              credentials will show demo data. You can always update connections
              later in Settings.
            </div>

            {/* Submit */}
            <button
              type="submit"
              disabled={!name.trim()}
              className="w-full py-3 bg-primary-600 text-white font-medium rounded-lg hover:bg-primary-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Create Client Space
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
