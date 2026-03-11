"use client";

import React from "react";
import Sidebar from "@/components/layout/Sidebar";
import { BarChart3 } from "lucide-react";

export default function PerformancePage() {
  return (
    <div className="flex min-h-screen">
      <Sidebar />
      <div className="ml-64 flex-1 p-6">
        <div className="flex items-center justify-center h-full">
          <div className="text-center">
            <div className="w-16 h-16 bg-primary-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <BarChart3 className="w-8 h-8 text-primary-600" />
            </div>
            <h2 className="text-xl font-semibold text-gray-900 mb-2">
              Advanced Performance Analytics
            </h2>
            <p className="text-gray-500 max-w-md">
              Deep-dive performance analytics with attribution modeling, cohort
              analysis, and cross-channel comparisons coming soon.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
