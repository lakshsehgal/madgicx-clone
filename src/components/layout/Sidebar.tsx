"use client";

import React, { useState } from "react";
import { useWorkspace } from "@/contexts/WorkspaceContext";
import { useAuth } from "@/contexts/AuthContext";
import {
  LayoutDashboard,
  ChevronDown,
  Plus,
  Users,
  Trash2,
  Settings,
  BarChart3,
  Zap,
  LogOut,
  FileText,
  Link2,
  AlertTriangle,
} from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";

export default function Sidebar() {
  const { clientSpaces, activeClientSpace, setActiveClientSpace, deleteClientSpace } =
    useWorkspace();
  const { logout } = useAuth();
  const [clientDropdownOpen, setClientDropdownOpen] = useState(false);
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
  const pathname = usePathname();

  const navItems = [
    { href: "/", label: "Dashboard", icon: LayoutDashboard },
    { href: "/performance", label: "Performance", icon: BarChart3 },
    { href: "/integrations", label: "Integrations", icon: Link2 },
    { href: "/automation", label: "Automation", icon: Zap },
    { href: "/settings", label: "Settings", icon: Settings },
    { href: "/api-docs", label: "API Application", icon: FileText },
  ];

  const handleLogout = () => {
    if (!showLogoutConfirm) {
      setShowLogoutConfirm(true);
      return;
    }
    logout();
  };

  return (
    <aside className="fixed left-0 top-0 h-screen w-64 bg-sidebar-bg text-white flex flex-col z-50 border-r border-white/[0.04]">
      {/* Logo */}
      <div className="p-5 border-b border-white/[0.06]">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 bg-gradient-to-br from-primary-400 via-primary-500 to-accent-500 rounded-xl flex items-center justify-center shadow-glow-primary">
            <Zap className="w-5 h-5 text-white" />
          </div>
          <div>
            <span className="text-lg font-bold tracking-tight block leading-none">Neurotic</span>
            <span className="text-[10px] text-slate-500 font-medium tracking-wider uppercase">by Neuroid</span>
          </div>
        </div>
      </div>

      {/* Client Space Selector */}
      <div className="p-3 border-b border-white/[0.06]">
        <div className="relative">
          <button
            onClick={() => setClientDropdownOpen(!clientDropdownOpen)}
            className="w-full flex items-center justify-between p-2.5 rounded-xl bg-white/[0.04] hover:bg-white/[0.08] border border-white/[0.06] transition-all"
          >
            <div className="flex items-center gap-2 min-w-0">
              <Users className="w-4 h-4 text-primary-400 shrink-0" />
              <span className="text-sm font-medium truncate">
                {activeClientSpace?.name || "Select Client"}
              </span>
            </div>
            <ChevronDown
              className={`w-4 h-4 text-slate-500 transition-transform shrink-0 ${
                clientDropdownOpen ? "rotate-180" : ""
              }`}
            />
          </button>

          {clientDropdownOpen && (
            <div className="absolute top-full left-0 right-0 mt-1.5 bg-[#151929] rounded-xl shadow-elevated border border-white/[0.08] overflow-hidden z-50">
              <div className="px-3 py-2 border-b border-white/[0.04]">
                <span className="text-[10px] font-semibold text-slate-500 uppercase tracking-widest">
                  Client Spaces
                </span>
              </div>
              <div className="max-h-48 overflow-y-auto">
                {clientSpaces.map((space) => (
                  <button
                    key={space.id}
                    onClick={() => {
                      setActiveClientSpace(space.id);
                      setClientDropdownOpen(false);
                    }}
                    className={`w-full flex items-center justify-between p-2.5 text-sm hover:bg-white/[0.06] transition-colors group ${
                      activeClientSpace?.id === space.id
                        ? "bg-primary-500/10 text-primary-400"
                        : "text-gray-300"
                    }`}
                  >
                    <div className="min-w-0">
                      <span className="truncate block font-medium">{space.name}</span>
                      <span className="text-[11px] text-slate-500">
                        {space.connectedChannels
                          .map((c) => c.charAt(0).toUpperCase() + c.slice(1))
                          .join(", ") || "No accounts"}
                      </span>
                    </div>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        deleteClientSpace(space.id);
                      }}
                      className="opacity-0 group-hover:opacity-100 p-1 hover:text-red-400 transition-all"
                    >
                      <Trash2 className="w-3 h-3" />
                    </button>
                  </button>
                ))}
              </div>
              <Link
                href="/workspace/new"
                onClick={() => setClientDropdownOpen(false)}
                className="flex items-center gap-2 p-2.5 text-sm text-primary-400 hover:bg-white/[0.06] transition-colors border-t border-white/[0.06] font-medium"
              >
                <Plus className="w-4 h-4" />
                New Client Space
              </Link>
            </div>
          )}
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-3 space-y-0.5">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-medium transition-all ${
                isActive
                  ? "bg-primary-500/15 text-primary-400 shadow-glow-primary/5"
                  : "text-slate-400 hover:text-white hover:bg-white/[0.04]"
              }`}
            >
              <Icon className="w-[18px] h-[18px]" />
              {item.label}
            </Link>
          );
        })}
      </nav>

      {/* Footer */}
      <div className="p-4 border-t border-white/[0.06] space-y-2">
        <div className="flex items-center gap-2 text-[11px] text-slate-600 px-1">
          <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 shadow-glow-green/50" />
          Direct API connections
        </div>

        {showLogoutConfirm ? (
          <div className="bg-amber-500/10 border border-amber-500/20 rounded-xl p-3 space-y-2">
            <div className="flex items-center gap-2 text-amber-400 text-xs font-medium">
              <AlertTriangle className="w-3.5 h-3.5" />
              Sign out?
            </div>
            <p className="text-[11px] text-slate-400">Your workspace data will be preserved.</p>
            <div className="flex gap-2">
              <button
                onClick={handleLogout}
                className="flex-1 px-3 py-1.5 rounded-lg text-xs font-medium bg-red-500/20 text-red-400 hover:bg-red-500/30 transition-colors"
              >
                Sign Out
              </button>
              <button
                onClick={() => setShowLogoutConfirm(false)}
                className="flex-1 px-3 py-1.5 rounded-lg text-xs font-medium bg-white/[0.06] text-slate-400 hover:bg-white/[0.1] transition-colors"
              >
                Cancel
              </button>
            </div>
          </div>
        ) : (
          <button
            onClick={handleLogout}
            className="flex items-center gap-2 w-full px-3.5 py-2.5 rounded-xl text-sm text-slate-500 hover:text-white hover:bg-white/[0.04] transition-all"
          >
            <LogOut className="w-4 h-4" />
            Sign Out
          </button>
        )}
      </div>
    </aside>
  );
}
