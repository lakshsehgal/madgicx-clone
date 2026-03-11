"use client";

import React, { useState, useEffect } from "react";
import { useWorkspace } from "@/contexts/WorkspaceContext";
import { useRouter } from "next/navigation";
import { WindsorAccount } from "@/types";
import {
  Users,
  ArrowLeft,
  CheckCircle2,
  Loader2,
  AlertCircle,
  Search,
} from "lucide-react";
import Link from "next/link";

const channelColors: Record<string, string> = {
  meta: "#1877F2",
  google: "#4285F4",
  shopify: "#96BF48",
};

const channelLabels: Record<string, string> = {
  meta: "Meta Ads",
  google: "Google Ads",
  shopify: "Shopify",
};

export default function NewClientSpacePage() {
  const { createClientSpace } = useWorkspace();
  const router = useRouter();

  const [name, setName] = useState("");
  const [accounts, setAccounts] = useState<WindsorAccount[]>([]);
  const [loadingAccounts, setLoadingAccounts] = useState(true);
  const [accountError, setAccountError] = useState("");

  const [selectedMeta, setSelectedMeta] = useState<WindsorAccount | null>(null);
  const [selectedGoogle, setSelectedGoogle] = useState<WindsorAccount | null>(null);
  const [selectedShopify, setSelectedShopify] = useState<WindsorAccount | null>(null);

  const [searchMeta, setSearchMeta] = useState("");
  const [searchGoogle, setSearchGoogle] = useState("");
  const [searchShopify, setSearchShopify] = useState("");

  // Fetch available accounts from Windsor
  useEffect(() => {
    async function loadAccounts() {
      setLoadingAccounts(true);
      setAccountError("");
      try {
        const response = await fetch("/api/windsor?action=accounts");
        const data = await response.json();
        if (data.accounts && Array.isArray(data.accounts)) {
          setAccounts(data.accounts);
        } else {
          setAccountError("No accounts found");
        }
      } catch {
        setAccountError("Failed to load accounts from Windsor.ai");
      } finally {
        setLoadingAccounts(false);
      }
    }
    loadAccounts();
  }, []);

  const metaAccounts = accounts.filter((a) => a.channel === "meta");
  const googleAccounts = accounts.filter((a) => a.channel === "google");
  const shopifyAccounts = accounts.filter((a) => a.channel === "shopify");

  const filteredMeta = metaAccounts.filter((a) =>
    a.name.toLowerCase().includes(searchMeta.toLowerCase())
  );
  const filteredGoogle = googleAccounts.filter((a) =>
    a.name.toLowerCase().includes(searchGoogle.toLowerCase())
  );
  const filteredShopify = shopifyAccounts.filter((a) =>
    a.name.toLowerCase().includes(searchShopify.toLowerCase())
  );

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    createClientSpace({
      name: name.trim(),
      metaAccountId: selectedMeta?.id,
      metaAccountName: selectedMeta?.name,
      googleAccountId: selectedGoogle?.id,
      googleAccountName: selectedGoogle?.name,
      shopifyAccountId: selectedShopify?.id,
      shopifyAccountName: selectedShopify?.name,
    });

    router.push("/");
  };

  const renderAccountSelector = (
    label: string,
    channel: string,
    accountList: WindsorAccount[],
    selected: WindsorAccount | null,
    setSelected: (a: WindsorAccount | null) => void,
    search: string,
    setSearch: (s: string) => void
  ) => {
    const color = channelColors[channel];

    return (
      <div className="border border-gray-200 rounded-xl p-4">
        <div className="flex items-center gap-2 mb-3">
          <div
            className="w-7 h-7 rounded-lg flex items-center justify-center text-white font-bold text-xs"
            style={{ backgroundColor: color }}
          >
            {label.charAt(0)}
          </div>
          <div>
            <h3 className="text-sm font-semibold text-gray-900">{label}</h3>
            <p className="text-xs text-gray-500">
              {accountList.length} account{accountList.length !== 1 ? "s" : ""}{" "}
              available
            </p>
          </div>
        </div>

        {selected ? (
          <div className="flex items-center justify-between bg-primary-50 border border-primary-200 rounded-lg p-3">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-primary-600" />
              <span className="text-sm font-medium text-primary-700">
                {selected.name}
              </span>
            </div>
            <button
              type="button"
              onClick={() => setSelected(null)}
              className="text-xs text-primary-600 hover:text-primary-800 font-medium"
            >
              Change
            </button>
          </div>
        ) : accountList.length === 0 ? (
          <div className="text-sm text-gray-400 italic py-2">
            No {label.toLowerCase()} accounts found in Windsor
          </div>
        ) : (
          <div>
            {accountList.length > 3 && (
              <div className="relative mb-2">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400" />
                <input
                  type="text"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Search accounts..."
                  className="w-full pl-9 pr-3 py-2 text-sm border border-gray-200 rounded-lg focus:ring-1 focus:ring-primary-500 focus:border-primary-500 outline-none"
                />
              </div>
            )}
            <div className="max-h-40 overflow-y-auto space-y-1">
              {(accountList.length > 3
                ? accountList.filter((a) =>
                    a.name.toLowerCase().includes(search.toLowerCase())
                  )
                : accountList
              ).map((account) => (
                <button
                  key={account.id}
                  type="button"
                  onClick={() => setSelected(account)}
                  className="w-full text-left p-2.5 rounded-lg text-sm hover:bg-gray-50 border border-transparent hover:border-gray-200 transition-colors flex items-center justify-between group"
                >
                  <span className="text-gray-700 truncate">{account.name}</span>
                  <span className="text-xs text-gray-400 group-hover:text-primary-600 shrink-0 ml-2">
                    Select
                  </span>
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
    );
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
              <Users className="w-5 h-5 text-primary-600" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-gray-900">
                New Client Space
              </h1>
              <p className="text-sm text-gray-500">
                Set up a new client within Neuroid
              </p>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Client Space Name */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Client Name
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g., Acme Corporation"
                required
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none"
              />
            </div>

            {/* Account Selection */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Connect Ad Accounts
              </label>
              <p className="text-xs text-gray-500 mb-3">
                Select the specific accounts for this client from your Windsor.ai
                connections
              </p>

              {loadingAccounts ? (
                <div className="flex items-center justify-center py-8 text-gray-400">
                  <Loader2 className="w-5 h-5 animate-spin mr-2" />
                  Loading available accounts from Windsor.ai...
                </div>
              ) : accountError && accounts.length === 0 ? (
                <div className="flex items-center gap-2 text-amber-600 text-sm bg-amber-50 border border-amber-200 rounded-lg px-4 py-3">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <div>
                    <p className="font-medium">{accountError}</p>
                    <p className="text-xs text-amber-500 mt-0.5">
                      You can still create the client space -- it will use demo
                      data
                    </p>
                  </div>
                </div>
              ) : (
                <div className="space-y-3">
                  {renderAccountSelector(
                    "Meta Ads",
                    "meta",
                    filteredMeta.length > 0 || searchMeta
                      ? filteredMeta
                      : metaAccounts,
                    selectedMeta,
                    setSelectedMeta,
                    searchMeta,
                    setSearchMeta
                  )}
                  {renderAccountSelector(
                    "Google Ads",
                    "google",
                    filteredGoogle.length > 0 || searchGoogle
                      ? filteredGoogle
                      : googleAccounts,
                    selectedGoogle,
                    setSelectedGoogle,
                    searchGoogle,
                    setSearchGoogle
                  )}
                  {renderAccountSelector(
                    "Shopify",
                    "shopify",
                    filteredShopify.length > 0 || searchShopify
                      ? filteredShopify
                      : shopifyAccounts,
                    selectedShopify,
                    setSelectedShopify,
                    searchShopify,
                    setSearchShopify
                  )}
                </div>
              )}
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
