"use client";

import { cn, formatPriceWhole } from "@/lib/utils";

interface GroupBuyStatsData {
  totalPending: number;
  activeCount: number;
  avgWaitDays: number;
  overdueCount: number;
  totalEntries: number;
  deliveredCount: number;
  spendingByType: Record<string, number>;
}

export function GroupBuyStatsHeader({ stats }: { stats: GroupBuyStatsData }) {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
      <StatCard label="Pending Cost" value={formatPriceWhole(stats.totalPending)} accent />
      <StatCard label="Active" value={String(stats.activeCount)} />
      <StatCard label="Avg Wait" value={`${stats.avgWaitDays}d`} />
      <StatCard
        label="Overdue"
        value={String(stats.overdueCount)}
        danger={stats.overdueCount > 0}
      />
    </div>
  );
}

function StatCard({ label, value, accent, danger }: { label: string; value: string; accent?: boolean; danger?: boolean }) {
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
        danger ? "text-red-400" : accent ? "text-accent" : "text-text-primary"
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

export function SpendingChart({ spendingByType }: { spendingByType: Record<string, number> }) {
  const total = Object.values(spendingByType).reduce((s, v) => s + v, 0);
  if (total === 0) return null;

  const entries = Object.entries(spendingByType).sort((a, b) => b[1] - a[1]);

  return (
    <div className="rounded-xl border border-border-subtle bg-bg-surface p-5 mb-6">
      <h3 className="text-xs font-semibold text-text-muted uppercase tracking-wider mb-4">
        Spending by Category
      </h3>
      <div className="space-y-3">
        {entries.map(([type, amount]) => {
          const pct = Math.round((amount / total) * 100);
          return (
            <div key={type}>
              <div className="flex items-center justify-between mb-1">
                <span className="text-sm text-text-secondary">{TYPE_LABELS[type] || type}</span>
                <span className="text-xs font-mono text-text-primary">{formatPriceWhole(amount)}</span>
              </div>
              <div className="w-full h-2 bg-bg-elevated rounded-full overflow-hidden">
                <div
                  className={cn("h-full rounded-full transition-[width] duration-300", TYPE_COLORS[type] || "bg-text-muted")}
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
