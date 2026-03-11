"use client";

import React, { useState } from "react";
import { useWorkspace } from "@/contexts/WorkspaceContext";
import { useRouter } from "next/navigation";
import { Channel } from "@/types";
import { Building2, ArrowLeft, CheckCircle2 } from "lucide-react";
import Link from "next/link";

const channels: { id: Channel; name: string; description: string; color: string }[] = [
  {
    id: "meta",
    name: "Meta Ads",
    description: "Facebook & Instagram advertising",
    color: "#1877F2",
  },
  {
    id: "google",
    name: "Google Ads",
    description: "Search, Display & Shopping campaigns",
    color: "#4285F4",
  },
  {
    id: "shopify",
    name: "Shopify",
    description: "E-commerce store data",
    color: "#96BF48",
  },
];

export default function NewWorkspacePage() {
  const { createWorkspace } = useWorkspace();
  const router = useRouter();

  const [name, setName] = useState("");
  const [clientName, setClientName] = useState("");
  const [windsorApiKey, setWindsorApiKey] = useState("");
  const [selectedChannels, setSelectedChannels] = useState<Channel[]>([]);

  const toggleChannel = (channel: Channel) => {
    setSelectedChannels((prev) =>
      prev.includes(channel)
        ? prev.filter((c) => c !== channel)
        : [...prev, channel]
    );
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !clientName.trim()) return;

    createWorkspace({
      name: name.trim(),
      clientName: clientName.trim(),
      windsorApiKey: windsorApiKey.trim() || undefined,
      connectedChannels: selectedChannels.length > 0 ? selectedChannels : ["meta", "google", "shopify"],
    });

    router.push("/");
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-6">
      <div className="w-full max-w-lg">
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
              <Building2 className="w-5 h-5 text-primary-600" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-gray-900">
                Create Workspace
              </h1>
              <p className="text-sm text-gray-500">
                Set up a new client workspace
              </p>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Workspace Name */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Workspace Name
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g., Acme Corp - Q1 2024"
                required
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none"
              />
            </div>

            {/* Client Name */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Client Name
              </label>
              <input
                type="text"
                value={clientName}
                onChange={(e) => setClientName(e.target.value)}
                placeholder="e.g., Acme Corporation"
                required
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none"
              />
            </div>

            {/* Windsor API Key */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Windsor.ai API Key{" "}
                <span className="text-gray-400 font-normal">(optional)</span>
              </label>
              <input
                type="password"
                value={windsorApiKey}
                onChange={(e) => setWindsorApiKey(e.target.value)}
                placeholder="Enter your Windsor.ai API key"
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none"
              />
              <p className="text-xs text-gray-400 mt-1">
                Leave empty to use demo data
              </p>
            </div>

            {/* Channel Selection */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Connect Channels
              </label>
              <div className="space-y-2">
                {channels.map((ch) => (
                  <button
                    key={ch.id}
                    type="button"
                    onClick={() => toggleChannel(ch.id)}
                    className={`w-full flex items-center justify-between p-3 rounded-lg border-2 transition-all ${
                      selectedChannels.includes(ch.id)
                        ? "border-primary-500 bg-primary-50"
                        : "border-gray-200 hover:border-gray-300"
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div
                        className="w-8 h-8 rounded-lg flex items-center justify-center text-white font-bold text-sm"
                        style={{ backgroundColor: ch.color }}
                      >
                        {ch.name.charAt(0)}
                      </div>
                      <div className="text-left">
                        <p className="text-sm font-medium text-gray-900">
                          {ch.name}
                        </p>
                        <p className="text-xs text-gray-500">
                          {ch.description}
                        </p>
                      </div>
                    </div>
                    {selectedChannels.includes(ch.id) && (
                      <CheckCircle2 className="w-5 h-5 text-primary-500" />
                    )}
                  </button>
                ))}
              </div>
            </div>

            {/* Submit */}
            <button
              type="submit"
              className="w-full py-3 bg-primary-600 text-white font-medium rounded-lg hover:bg-primary-700 transition-colors"
            >
              Create Workspace
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
