"use client";

import React from "react";
import Sidebar from "@/components/layout/Sidebar";
import { Zap } from "lucide-react";

export default function AutomationPage() {
  return (
    <div className="flex min-h-screen">
      <Sidebar />
      <div className="ml-64 flex-1 p-6">
        <div className="flex items-center justify-center h-full">
          <div className="text-center">
            <div className="w-16 h-16 bg-amber-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <Zap className="w-8 h-8 text-amber-600" />
            </div>
            <h2 className="text-xl font-semibold text-gray-900 mb-2">
              Marketing Automation
            </h2>
            <p className="text-gray-500 max-w-md">
              Automated bid management, budget allocation, and creative testing
              rules coming soon.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
