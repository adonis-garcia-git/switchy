"use client";

import { useState } from "react";
import { useQuery } from "convex/react";
import { api } from "../../convex/_generated/api";
import { cn } from "@/lib/utils";

const STATUS_LABELS: Record<string, string> = {
  ordered: "Ordered",
  in_production: "In Production",
  shipped: "Shipped",
  delivered: "Delivered",
};

const TYPE_COLORS: Record<string, string> = {
  keyboard: "bg-blue-500/15 text-blue-400 border-blue-500/25",
  switches: "bg-amber-500/15 text-amber-400 border-amber-500/25",
  keycaps: "bg-emerald-500/15 text-emerald-400 border-emerald-500/25",
  accessories: "bg-purple-500/15 text-purple-400 border-purple-500/25",
};

function relativeTime(timestamp: number): string {
  const now = Date.now();
  const diff = now - timestamp;
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "Just now";
  if (mins < 60) return `${mins}m ago`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days < 7) return `${days}d ago`;
  const weeks = Math.floor(days / 7);
  if (weeks < 4) return `${weeks}w ago`;
  return new Date(timestamp).toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

export function GroupBuyActivityLog() {
  const events = useQuery(api.groupBuys.getActivityLog, {});
  const [expanded, setExpanded] = useState(false);

  if (!events || events.length === 0) return null;

  const visible = expanded ? events : events.slice(0, 8);

  return (
    <div className="rounded-xl border border-border-subtle bg-bg-surface p-5">
      <button
        onClick={() => setExpanded(!expanded)}
        className="w-full flex items-center justify-between mb-4 group focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/40 rounded"
      >
        <h3 className="text-xs font-semibold text-text-muted uppercase tracking-wider">
          Recent Activity
        </h3>
        <span className="text-[10px] text-text-muted group-hover:text-text-secondary transition-colors duration-150 flex items-center gap-1">
          {expanded ? "Collapse" : `Show all (${events.length})`}
          <svg
            className={cn("w-3 h-3 transition-transform duration-200", expanded && "rotate-180")}
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2}
          >
            <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
          </svg>
        </span>
      </button>

      <div className="relative pl-5">
        {/* Vertical line */}
        <div className="absolute left-[7px] top-1 bottom-1 w-px bg-border-subtle" />

        <div className="space-y-4">
          {visible.map((event: any, i: number) => {
            const dotColor =
              event.type === "created"
                ? "bg-accent"
                : event.type === "delivered"
                  ? "bg-emerald-400"
                  : "bg-amber-400";

            return (
              <div key={`${event.productName}-${event.timestamp}-${i}`} className="relative flex items-start gap-3">
                {/* Dot */}
                <div
                  className={cn(
                    "absolute -left-5 top-1.5 w-[9px] h-[9px] rounded-full ring-2 ring-bg-surface",
                    dotColor
                  )}
                />

                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-sm text-text-primary font-medium truncate">
                      {event.productName}
                    </span>
                    <span
                      className={cn(
                        "text-[9px] font-semibold uppercase tracking-wider px-1.5 py-0.5 rounded border",
                        TYPE_COLORS[event.productType] || "bg-bg-elevated text-text-muted border-border-default"
                      )}
                    >
                      {event.productType}
                    </span>
                  </div>
                  <p className="text-xs text-text-muted mt-0.5">
                    {event.type === "created" && "Added to tracker"}
                    {event.type === "delivered" && (
                      <span className="text-emerald-400">Marked as delivered</span>
                    )}
                    {event.type === "status_change" && (
                      <>
                        {STATUS_LABELS[event.from] || event.from}
                        <span className="mx-1 text-text-muted/50">&rarr;</span>
                        {STATUS_LABELS[event.to] || event.to}
                      </>
                    )}
                    <span className="ml-2 text-text-muted/60">{relativeTime(event.timestamp)}</span>
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
