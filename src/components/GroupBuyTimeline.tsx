"use client";

import { useMemo, useState } from "react";
import { cn, formatPriceWhole } from "@/lib/utils";

interface TimelineEntry {
  _id: string;
  productName: string;
  estimatedShipDate: string;
  productType: string;
  cost: number;
  status: string;
}

const TYPE_DOT_COLORS: Record<string, string> = {
  keyboard: "bg-blue-400",
  switches: "bg-amber-400",
  keycaps: "bg-emerald-400",
  accessories: "bg-purple-400",
};

const TYPE_PILL_STYLES: Record<string, string> = {
  keyboard: "bg-blue-500/15 text-blue-400 border-blue-500/25",
  switches: "bg-amber-500/15 text-amber-400 border-amber-500/25",
  keycaps: "bg-emerald-500/15 text-emerald-400 border-emerald-500/25",
  accessories: "bg-purple-500/15 text-purple-400 border-purple-500/25",
};

const MONTH_NAMES = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

export function GroupBuyTimeline({ entries }: { entries: TimelineEntry[] }) {
  const [hoveredId, setHoveredId] = useState<string | null>(null);

  const activeEntries = useMemo(
    () => entries.filter((e) => e.status !== "delivered"),
    [entries]
  );

  const { months, positioned, todayPct } = useMemo(() => {
    const now = new Date();
    const startMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const months: { label: string; start: Date; end: Date }[] = [];

    for (let i = 0; i < 6; i++) {
      const m = new Date(startMonth.getFullYear(), startMonth.getMonth() + i, 1);
      const mEnd = new Date(m.getFullYear(), m.getMonth() + 1, 0);
      months.push({
        label: `${MONTH_NAMES[m.getMonth()]} ${m.getFullYear() !== now.getFullYear() ? m.getFullYear() : ""}`.trim(),
        start: m,
        end: mEnd,
      });
    }

    const timelineStart = months[0].start.getTime();
    const timelineEnd = months[months.length - 1].end.getTime();
    const range = timelineEnd - timelineStart;

    const todayPct = Math.max(0, Math.min(100, ((now.getTime() - timelineStart) / range) * 100));

    const positioned = activeEntries.map((entry) => {
      const shipDate = new Date(entry.estimatedShipDate).getTime();
      const isOverdue = shipDate < now.getTime();
      let pct: number;

      if (shipDate < timelineStart) {
        pct = 0; // overdue items pinned to left
      } else if (shipDate > timelineEnd) {
        pct = 100;
      } else {
        pct = ((shipDate - timelineStart) / range) * 100;
      }

      return { ...entry, pct, isOverdue };
    });

    return { months, positioned, todayPct };
  }, [activeEntries]);

  if (activeEntries.length === 0) return null;

  return (
    <div className="rounded-xl border border-border-subtle bg-bg-surface p-5 mb-6">
      <h3 className="text-xs font-semibold text-text-muted uppercase tracking-wider mb-5">
        Delivery Timeline
      </h3>

      <div className="relative">
        {/* Month grid */}
        <div className="flex border-b border-border-subtle mb-6">
          {months.map((m, i) => (
            <div
              key={i}
              className="flex-1 text-center pb-2 border-l border-border-subtle first:border-l-0"
            >
              <span className="text-[10px] text-text-muted font-medium">{m.label}</span>
            </div>
          ))}
        </div>

        {/* Track */}
        <div className="relative h-10">
          {/* Track line */}
          <div className="absolute top-1/2 left-0 right-0 h-px bg-border-subtle -translate-y-1/2" />

          {/* Today indicator */}
          <div
            className="absolute top-0 bottom-0 flex flex-col items-center z-10"
            style={{ left: `${todayPct}%` }}
          >
            <div className="w-px h-full bg-accent/50" />
            <span className="absolute -top-5 text-[9px] font-semibold text-accent bg-bg-surface px-1.5 py-0.5 rounded border border-accent/20 whitespace-nowrap">
              Today
            </span>
          </div>

          {/* Entry markers */}
          {positioned.map((entry) => (
            <div
              key={entry._id}
              className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2 z-20"
              style={{ left: `${Math.max(1, Math.min(99, entry.pct))}%` }}
              onMouseEnter={() => setHoveredId(entry._id)}
              onMouseLeave={() => setHoveredId(null)}
            >
              <div
                className={cn(
                  "w-3.5 h-3.5 rounded-full border-2 border-bg-surface cursor-pointer transition-transform duration-150 hover:scale-150",
                  entry.isOverdue ? "bg-red-400" : TYPE_DOT_COLORS[entry.productType] || "bg-text-muted"
                )}
              />

              {/* Tooltip */}
              {hoveredId === entry._id && (
                <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 pointer-events-none z-30">
                  <div className="bg-bg-elevated border border-border-default rounded-lg p-2.5 shadow-lg whitespace-nowrap">
                    <p className="text-xs font-semibold text-text-primary">{entry.productName}</p>
                    <div className="flex items-center gap-2 mt-1">
                      <span
                        className={cn(
                          "text-[9px] font-semibold uppercase tracking-wider px-1.5 py-0.5 rounded border",
                          TYPE_PILL_STYLES[entry.productType] || "bg-bg-surface text-text-muted border-border-default"
                        )}
                      >
                        {entry.productType}
                      </span>
                      <span className="text-[10px] font-mono text-accent">{formatPriceWhole(entry.cost)}</span>
                    </div>
                    <p className="text-[10px] text-text-muted mt-1">
                      {entry.isOverdue ? (
                        <span className="text-red-400 font-semibold">Overdue</span>
                      ) : (
                        `Ships ${entry.estimatedShipDate}`
                      )}
                    </p>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Overdue count indicator */}
        {positioned.some((e) => e.isOverdue) && (
          <div className="mt-3 flex items-center gap-1.5 text-[10px] text-red-400">
            <div className="w-2 h-2 rounded-full bg-red-400" />
            {positioned.filter((e) => e.isOverdue).length} overdue — pinned to left edge
          </div>
        )}
      </div>
    </div>
  );
}
