"use client";

import React, { useState } from "react";
import Sidebar from "@/components/layout/Sidebar";
import { useWorkspace } from "@/contexts/WorkspaceContext";
import { Settings, Key, Trash2 } from "lucide-react";

export default function SettingsPage() {
  const { activeWorkspace, workspaces, deleteWorkspace } = useWorkspace();
  const [showDeleteConfirm, setShowDeleteConfirm] = useState<string | null>(
    null
  );

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

          {/* Active Workspace Info */}
          {activeWorkspace && (
            <div className="bg-white rounded-xl border border-gray-200 p-6 mb-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">
                Current Workspace
              </h2>
              <div className="space-y-3">
                <div>
                  <label className="text-sm text-gray-500">
                    Workspace Name
                  </label>
                  <p className="font-medium text-gray-900">
                    {activeWorkspace.name}
                  </p>
                </div>
                <div>
                  <label className="text-sm text-gray-500">Client</label>
                  <p className="font-medium text-gray-900">
                    {activeWorkspace.clientName}
                  </p>
                </div>
                <div>
                  <label className="text-sm text-gray-500">
                    Connected Channels
                  </label>
                  <div className="flex gap-2 mt-1">
                    {activeWorkspace.connectedChannels.map((ch) => (
                      <span
                        key={ch}
                        className="px-3 py-1 text-xs font-medium bg-primary-50 text-primary-700 rounded-full"
                      >
                        {ch.charAt(0).toUpperCase() + ch.slice(1)}
                      </span>
                    ))}
                  </div>
                </div>
                <div>
                  <label className="text-sm text-gray-500">
                    Windsor.ai API Key
                  </label>
                  <div className="flex items-center gap-2 mt-1">
                    <Key className="w-4 h-4 text-gray-400" />
                    <span className="text-sm text-gray-600">
                      {activeWorkspace.windsorApiKey
                        ? "••••••••" +
                          activeWorkspace.windsorApiKey.slice(-4)
                        : "Not configured (using demo data)"}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* All Workspaces */}
          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">
              All Workspaces
            </h2>
            {workspaces.length === 0 ? (
              <p className="text-gray-500 text-sm">No workspaces created yet.</p>
            ) : (
              <div className="space-y-3">
                {workspaces.map((ws) => (
                  <div
                    key={ws.id}
                    className="flex items-center justify-between p-3 rounded-lg border border-gray-100 hover:bg-gray-50"
                  >
                    <div>
                      <p className="font-medium text-gray-900">{ws.name}</p>
                      <p className="text-sm text-gray-500">{ws.clientName}</p>
                    </div>
                    {showDeleteConfirm === ws.id ? (
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => {
                            deleteWorkspace(ws.id);
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
                        onClick={() => setShowDeleteConfirm(ws.id)}
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
