"use client";

import React, { useState } from "react";
import { useWorkspace } from "@/contexts/WorkspaceContext";
import {
  LayoutDashboard,
  ChevronDown,
  Plus,
  Building2,
  Trash2,
  Settings,
  BarChart3,
  Zap,
} from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";

export default function Sidebar() {
  const { workspaces, activeWorkspace, setActiveWorkspace, deleteWorkspace } =
    useWorkspace();
  const [workspaceDropdownOpen, setWorkspaceDropdownOpen] = useState(false);
  const pathname = usePathname();

  const navItems = [
    { href: "/", label: "Dashboard", icon: LayoutDashboard },
    { href: "/performance", label: "Performance", icon: BarChart3 },
    { href: "/automation", label: "Automation", icon: Zap },
    { href: "/settings", label: "Settings", icon: Settings },
  ];

  return (
    <aside className="fixed left-0 top-0 h-screen w-64 bg-sidebar-bg text-white flex flex-col z-50">
      {/* Logo */}
      <div className="p-5 border-b border-white/10">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-gradient-to-br from-primary-400 to-primary-600 rounded-lg flex items-center justify-center">
            <BarChart3 className="w-5 h-5 text-white" />
          </div>
          <span className="text-xl font-bold tracking-tight">Madgicx</span>
        </div>
      </div>

      {/* Workspace Selector */}
      <div className="p-3 border-b border-white/10">
        <div className="relative">
          <button
            onClick={() => setWorkspaceDropdownOpen(!workspaceDropdownOpen)}
            className="w-full flex items-center justify-between p-2.5 rounded-lg bg-sidebar-hover hover:bg-sidebar-active transition-colors"
          >
            <div className="flex items-center gap-2 min-w-0">
              <Building2 className="w-4 h-4 text-primary-400 shrink-0" />
              <span className="text-sm font-medium truncate">
                {activeWorkspace?.name || "Select Workspace"}
              </span>
            </div>
            <ChevronDown
              className={`w-4 h-4 text-gray-400 transition-transform shrink-0 ${
                workspaceDropdownOpen ? "rotate-180" : ""
              }`}
            />
          </button>

          {workspaceDropdownOpen && (
            <div className="absolute top-full left-0 right-0 mt-1 bg-slate-800 rounded-lg shadow-xl border border-white/10 overflow-hidden z-50">
              <div className="max-h-48 overflow-y-auto">
                {workspaces.map((ws) => (
                  <button
                    key={ws.id}
                    onClick={() => {
                      setActiveWorkspace(ws.id);
                      setWorkspaceDropdownOpen(false);
                    }}
                    className={`w-full flex items-center justify-between p-2.5 text-sm hover:bg-sidebar-active transition-colors group ${
                      activeWorkspace?.id === ws.id
                        ? "bg-sidebar-active text-primary-400"
                        : "text-gray-300"
                    }`}
                  >
                    <span className="truncate">{ws.name}</span>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        deleteWorkspace(ws.id);
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
                onClick={() => setWorkspaceDropdownOpen(false)}
                className="flex items-center gap-2 p-2.5 text-sm text-primary-400 hover:bg-sidebar-active transition-colors border-t border-white/10"
              >
                <Plus className="w-4 h-4" />
                New Workspace
              </Link>
            </div>
          )}
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-3 space-y-1">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                isActive
                  ? "bg-primary-600/20 text-primary-400"
                  : "text-gray-400 hover:text-white hover:bg-sidebar-hover"
              }`}
            >
              <Icon className="w-5 h-5" />
              {item.label}
            </Link>
          );
        })}
      </nav>

      {/* Footer */}
      <div className="p-4 border-t border-white/10">
        <div className="flex items-center gap-2 text-xs text-gray-500">
          <div className="w-2 h-2 rounded-full bg-green-500" />
          Connected via Windsor.ai
        </div>
      </div>
    </aside>
  );
}
