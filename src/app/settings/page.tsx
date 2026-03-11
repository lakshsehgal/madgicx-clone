"use client";

import React, { useState } from "react";
import Sidebar from "@/components/layout/Sidebar";
import { useWorkspace } from "@/contexts/WorkspaceContext";
import { useAuth } from "@/contexts/AuthContext";
import { Settings, Trash2, Users, Shield } from "lucide-react";
import LoginPage from "@/components/auth/LoginPage";

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
                Active Client Space
              </h2>
              <div className="space-y-3">
                <div>
                  <label className="text-sm text-gray-500">Client Name</label>
                  <p className="font-medium text-gray-900">
                    {activeClientSpace.name}
                  </p>
                </div>
                <div>
                  <label className="text-sm text-gray-500">
                    Connected Accounts
                  </label>
                  <div className="space-y-1.5 mt-1">
                    {activeClientSpace.metaAccountName && (
                      <div className="flex items-center gap-2">
                        <span className="w-2 h-2 rounded-full bg-blue-500" />
                        <span className="text-sm text-gray-700">
                          Meta: {activeClientSpace.metaAccountName}
                        </span>
                      </div>
                    )}
                    {activeClientSpace.googleAccountName && (
                      <div className="flex items-center gap-2">
                        <span className="w-2 h-2 rounded-full bg-red-500" />
                        <span className="text-sm text-gray-700">
                          Google: {activeClientSpace.googleAccountName}
                        </span>
                      </div>
                    )}
                    {activeClientSpace.shopifyAccountName && (
                      <div className="flex items-center gap-2">
                        <span className="w-2 h-2 rounded-full bg-green-500" />
                        <span className="text-sm text-gray-700">
                          Shopify: {activeClientSpace.shopifyAccountName}
                        </span>
                      </div>
                    )}
                    {!activeClientSpace.metaAccountName &&
                      !activeClientSpace.googleAccountName &&
                      !activeClientSpace.shopifyAccountName && (
                        <span className="text-sm text-gray-400 italic">
                          No accounts connected (using demo data)
                        </span>
                      )}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Windsor.ai Connection */}
          <div className="bg-white rounded-xl border border-gray-200 p-6 mb-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <Shield className="w-5 h-5 text-gray-500" />
              Windsor.ai Connection
            </h2>
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-green-500" />
              <span className="text-sm text-gray-700">
                API key configured and active
              </span>
            </div>
            <p className="text-xs text-gray-400 mt-1">
              The Windsor.ai API key is managed by the system administrator.
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
                        {space.connectedChannels
                          .map(
                            (c) => c.charAt(0).toUpperCase() + c.slice(1)
                          )
                          .join(", ") || "No accounts"}
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
