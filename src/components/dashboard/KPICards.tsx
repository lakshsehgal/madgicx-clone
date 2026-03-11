"use client";

import React from "react";
import { KPIData } from "@/types";
import {
  DollarSign,
  TrendingUp,
  MousePointerClick,
  Eye,
  Target,
  Percent,
} from "lucide-react";

interface KPICardsProps {
  data: KPIData | null;
  loading: boolean;
}

interface KPICardItem {
  label: string;
  value: string;
  icon: React.ElementType;
  color: string;
  bgColor: string;
}

function formatCurrency(value: number): string {
  if (value >= 1000000) return `$${(value / 1000000).toFixed(1)}M`;
  if (value >= 1000) return `$${(value / 1000).toFixed(1)}K`;
  return `$${value.toFixed(2)}`;
}

function formatNumber(value: number): string {
  if (value >= 1000000) return `${(value / 1000000).toFixed(1)}M`;
  if (value >= 1000) return `${(value / 1000).toFixed(1)}K`;
  return value.toLocaleString();
}

export default function KPICards({ data, loading }: KPICardsProps) {
  const cards: KPICardItem[] = data
    ? [
        {
          label: "Total Spend",
          value: formatCurrency(data.spend),
          icon: DollarSign,
          color: "text-red-600",
          bgColor: "bg-red-50",
        },
        {
          label: "Revenue",
          value: formatCurrency(data.revenue),
          icon: TrendingUp,
          color: "text-green-600",
          bgColor: "bg-green-50",
        },
        {
          label: "ROAS",
          value: `${data.roas.toFixed(2)}x`,
          icon: Target,
          color: "text-primary-600",
          bgColor: "bg-primary-50",
        },
        {
          label: "CPC",
          value: `$${data.cpc.toFixed(2)}`,
          icon: MousePointerClick,
          color: "text-amber-600",
          bgColor: "bg-amber-50",
        },
        {
          label: "CTR",
          value: `${data.ctr.toFixed(2)}%`,
          icon: Percent,
          color: "text-cyan-600",
          bgColor: "bg-cyan-50",
        },
        {
          label: "Conversions",
          value: formatNumber(data.conversions),
          icon: Eye,
          color: "text-violet-600",
          bgColor: "bg-violet-50",
        },
      ]
    : [];

  if (loading) {
    return (
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        {Array.from({ length: 6 }).map((_, i) => (
          <div
            key={i}
            className="bg-white rounded-xl p-4 border border-gray-200 animate-pulse"
          >
            <div className="h-4 bg-gray-200 rounded w-20 mb-3" />
            <div className="h-8 bg-gray-200 rounded w-24" />
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
      {cards.map((card) => {
        const Icon = card.icon;
        return (
          <div
            key={card.label}
            className="bg-white rounded-xl p-4 border border-gray-200 hover:shadow-md transition-shadow"
          >
            <div className="flex items-center gap-2 mb-2">
              <div className={`p-1.5 rounded-lg ${card.bgColor}`}>
                <Icon className={`w-4 h-4 ${card.color}`} />
              </div>
              <span className="text-xs font-medium text-gray-500 uppercase tracking-wider">
                {card.label}
              </span>
            </div>
            <p className="text-2xl font-bold text-gray-900">{card.value}</p>
          </div>
        );
      })}
    </div>
  );
}
