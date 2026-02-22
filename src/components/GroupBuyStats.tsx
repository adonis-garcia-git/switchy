"use client";

import { useState } from "react";
import { cn, formatPriceWhole } from "@/lib/utils";

interface GroupBuyStatsData {
  totalPending: number;
  activeCount: number;
  avgWaitDays: number;
  overdueCount: number;
  totalEntries: number;
  deliveredCount: number;
  totalSpentAllTime: number;
  deliveredThisMonth: number;
  longestWait: number;
  spendingByType: Record<string, number>;
  spendingByVendor: Record<string, number>;
}

export function GroupBuyStatsHeader({ stats }: { stats: GroupBuyStatsData }) {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 mb-6">
      <StatCard label="Pending Cost" value={formatPriceWhole(stats.totalPending)} accent />
      <StatCard label="Total Spent" value={formatPriceWhole(stats.totalSpentAllTime)} />
      <StatCard label="Active" value={String(stats.activeCount)} />
      <StatCard
        label="Overdue"
        value={String(stats.overdueCount)}
        danger={stats.overdueCount > 0}
      />
      <StatCard label="Delivered This Mo." value={String(stats.deliveredThisMonth)} success />
      <StatCard label="Longest Wait" value={stats.longestWait > 0 ? `${stats.longestWait}d` : "—"} />
    </div>
  );
}

function StatCard({ label, value, accent, danger, success }: {
  label: string;
  value: string;
  accent?: boolean;
  danger?: boolean;
  success?: boolean;
}) {
  return (
    <div className={cn(
      "rounded-xl border p-4",
      danger
        ? "border-red-500/30 bg-red-500/5"
        : "border-border-subtle bg-bg-surface"
    )}>
      <p className="text-[10px] uppercase tracking-wider text-text-muted font-semibold mb-1">{label}</p>
      <p className={cn(
        "text-xl font-bold font-[family-name:var(--font-mono)]",
        danger ? "text-red-400" : success ? "text-emerald-400" : accent ? "text-accent" : "text-text-primary"
      )}>
        {value}
      </p>
    </div>
  );
}

const TYPE_COLORS: Record<string, string> = {
  keyboard: "bg-blue-500",
  switches: "bg-amber-500",
  keycaps: "bg-emerald-500",
  accessories: "bg-purple-500",
};

const TYPE_LABELS: Record<string, string> = {
  keyboard: "Keyboards",
  switches: "Switches",
  keycaps: "Keycaps",
  accessories: "Accessories",
};

export function SpendingChart({
  spendingByType,
  spendingByVendor,
}: {
  spendingByType: Record<string, number>;
  spendingByVendor?: Record<string, number>;
}) {
  const [tab, setTab] = useState<"category" | "vendor">("category");

  const data = tab === "vendor" && spendingByVendor ? spendingByVendor : spendingByType;
  const total = Object.values(data).reduce((s, v) => s + v, 0);
  if (total === 0) return null;

  const entries = Object.entries(data).sort((a, b) => b[1] - a[1]);
  const showVendorTab = spendingByVendor && Object.keys(spendingByVendor).length > 0;

  // Generate vendor colors deterministically
  const VENDOR_PALETTE = [
    "bg-cyan-500", "bg-rose-500", "bg-indigo-500", "bg-teal-500",
    "bg-orange-500", "bg-pink-500", "bg-lime-500", "bg-violet-500",
  ];

  return (
    <div className="rounded-xl border border-border-subtle bg-bg-surface p-5">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-xs font-semibold text-text-muted uppercase tracking-wider">
          Spending Breakdown
        </h3>
        {showVendorTab && (
          <div className="flex border border-border-default rounded-md overflow-hidden">
            <button
              onClick={() => setTab("category")}
              className={cn(
                "px-2.5 py-1 text-[10px] font-semibold transition-colors duration-150",
                "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/40",
                tab === "category" ? "bg-accent-dim text-accent" : "text-text-muted hover:text-text-primary"
              )}
            >
              Category
            </button>
            <button
              onClick={() => setTab("vendor")}
              className={cn(
                "px-2.5 py-1 text-[10px] font-semibold transition-colors duration-150",
                "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/40",
                tab === "vendor" ? "bg-accent-dim text-accent" : "text-text-muted hover:text-text-primary"
              )}
            >
              Vendor
            </button>
          </div>
        )}
      </div>
      <div className="space-y-3">
        {entries.map(([key, amount], i) => {
          const pct = Math.round((amount / total) * 100);
          const color =
            tab === "category"
              ? TYPE_COLORS[key] || "bg-text-muted"
              : VENDOR_PALETTE[i % VENDOR_PALETTE.length];
          const label = tab === "category" ? TYPE_LABELS[key] || key : key;

          return (
            <div key={key}>
              <div className="flex items-center justify-between mb-1">
                <span className="text-sm text-text-secondary truncate mr-2">{label}</span>
                <span className="text-xs font-mono text-text-primary shrink-0">
                  {formatPriceWhole(amount)}
                  <span className="text-text-muted ml-1">({pct}%)</span>
                </span>
              </div>
              <div className="w-full h-2 bg-bg-elevated rounded-full overflow-hidden">
                <div
                  className={cn("h-full rounded-full transition-[width] duration-300", color)}
                  style={{ width: `${pct}%` }}
                />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
