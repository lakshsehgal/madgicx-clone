"use client";

import React, { useState } from "react";
import Sidebar from "@/components/layout/Sidebar";
import { useWorkspace } from "@/contexts/WorkspaceContext";
import { useAuth } from "@/contexts/AuthContext";
import { Settings, Trash2, Users, Shield, CheckCircle2, XCircle } from "lucide-react";
import LoginPage from "@/components/auth/LoginPage";

function maskToken(token: string): string {
  if (token.length <= 8) return "****";
  return token.slice(0, 4) + "****" + token.slice(-4);
}

export default function SettingsPage() {
  const { isAuthenticated } = useAuth();
  const { activeClientSpace, clientSpaces, deleteClientSpace } = useWorkspace();
  const [showDeleteConfirm, setShowDeleteConfirm] = useState<string | null>(null);

  if (!isAuthenticated) return <LoginPage />;

  return (
    <div className="flex min-h-screen">
      <Sidebar />
      <div className="ml-64 flex-1 p-6">
        <div className="max-w-2xl">
          <div className="flex items-center gap-3 mb-8">
            <div className="w-10 h-10 bg-gray-100 rounded-xl flex items-center justify-center">
              <Settings className="w-5 h-5 text-gray-600" />
            </div>
            <h1 className="text-2xl font-bold text-gray-900">Settings</h1>
          </div>

          {/* Active Client Space Info */}
          {activeClientSpace && (
            <div className="bg-white rounded-xl border border-gray-200 p-6 mb-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <Users className="w-5 h-5 text-gray-500" />
                Active Client Space: {activeClientSpace.name}
              </h2>

              {/* API Connections Status */}
              <div className="space-y-3">
                <h3 className="text-sm font-medium text-gray-700">API Connections</h3>

                {/* Meta */}
                <div className="flex items-center justify-between p-3 rounded-lg bg-gray-50">
                  <div className="flex items-center gap-3">
                    <div className="w-7 h-7 rounded-lg bg-[#1877F2] flex items-center justify-center text-white text-xs font-bold">
                      M
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-900">Meta Ads</p>
                      {activeClientSpace.metaCredentials ? (
                        <p className="text-xs text-gray-500">
                          Account: {activeClientSpace.metaCredentials.adAccountId} &middot;
                          Token: {maskToken(activeClientSpace.metaCredentials.accessToken)}
                        </p>
                      ) : (
                        <p className="text-xs text-gray-400">Not connected</p>
                      )}
                    </div>
                  </div>
                  {activeClientSpace.metaCredentials ? (
                    <CheckCircle2 className="w-5 h-5 text-green-500" />
                  ) : (
                    <XCircle className="w-5 h-5 text-gray-300" />
                  )}
                </div>

                {/* Google */}
                <div className="flex items-center justify-between p-3 rounded-lg bg-gray-50">
                  <div className="flex items-center gap-3">
                    <div className="w-7 h-7 rounded-lg bg-[#4285F4] flex items-center justify-center text-white text-xs font-bold">
                      G
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-900">Google Ads</p>
                      {activeClientSpace.googleCredentials ? (
                        <p className="text-xs text-gray-500">
                          Customer ID: {activeClientSpace.googleCredentials.customerId}
                        </p>
                      ) : (
                        <p className="text-xs text-gray-400">Not connected</p>
                      )}
                    </div>
                  </div>
                  {activeClientSpace.googleCredentials ? (
                    <CheckCircle2 className="w-5 h-5 text-green-500" />
                  ) : (
                    <XCircle className="w-5 h-5 text-gray-300" />
                  )}
                </div>

                {/* Shopify */}
                <div className="flex items-center justify-between p-3 rounded-lg bg-gray-50">
                  <div className="flex items-center gap-3">
                    <div className="w-7 h-7 rounded-lg bg-[#96BF48] flex items-center justify-center text-white text-xs font-bold">
                      S
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-900">Shopify</p>
                      {activeClientSpace.shopifyCredentials ? (
                        <p className="text-xs text-gray-500">
                          Store: {activeClientSpace.shopifyCredentials.storeUrl}
                        </p>
                      ) : (
                        <p className="text-xs text-gray-400">Not connected</p>
                      )}
                    </div>
                  </div>
                  {activeClientSpace.shopifyCredentials ? (
                    <CheckCircle2 className="w-5 h-5 text-green-500" />
                  ) : (
                    <XCircle className="w-5 h-5 text-gray-300" />
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Data Source Info */}
          <div className="bg-white rounded-xl border border-gray-200 p-6 mb-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <Shield className="w-5 h-5 text-gray-500" />
              Data Sources
            </h2>
            <p className="text-sm text-gray-600 mb-2">
              Neurotic connects directly to your ad platforms via their official APIs:
            </p>
            <ul className="text-xs text-gray-500 space-y-1 list-disc list-inside">
              <li>Meta Marketing API (v21.0) - Campaign insights and conversion data</li>
              <li>Google Ads API (v18) - Campaign performance via GAQL</li>
              <li>Shopify Admin API (2024-10) - Order and revenue data</li>
            </ul>
            <p className="text-xs text-gray-400 mt-3">
              All credentials are stored locally in your browser. No data passes through third-party services.
            </p>
          </div>

          {/* All Client Spaces */}
          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">
              All Client Spaces
            </h2>
            {clientSpaces.length === 0 ? (
              <p className="text-gray-500 text-sm">
                No client spaces created yet.
              </p>
            ) : (
              <div className="space-y-3">
                {clientSpaces.map((space) => (
                  <div
                    key={space.id}
                    className="flex items-center justify-between p-3 rounded-lg border border-gray-100 hover:bg-gray-50"
                  >
                    <div>
                      <p className="font-medium text-gray-900">{space.name}</p>
                      <p className="text-sm text-gray-500">
                        {space.connectedChannels.length > 0
                          ? space.connectedChannels
                              .map((c) => c.charAt(0).toUpperCase() + c.slice(1))
                              .join(", ")
                          : "Demo data only"}
                      </p>
                    </div>
                    {showDeleteConfirm === space.id ? (
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => {
                            deleteClientSpace(space.id);
                            setShowDeleteConfirm(null);
                          }}
                          className="px-3 py-1 text-xs font-medium text-white bg-red-500 rounded hover:bg-red-600"
                        >
                          Confirm
                        </button>
                        <button
                          onClick={() => setShowDeleteConfirm(null)}
                          className="px-3 py-1 text-xs font-medium text-gray-600 bg-gray-100 rounded hover:bg-gray-200"
                        >
                          Cancel
                        </button>
                      </div>
                    ) : (
                      <button
                        onClick={() => setShowDeleteConfirm(space.id)}
                        className="p-2 text-gray-400 hover:text-red-500 transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
