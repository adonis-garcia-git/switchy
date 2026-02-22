"use client";

import { useEffect } from "react";
import { cn, formatPriceWhole, daysUntil } from "@/lib/utils";
import { Id } from "../../convex/_generated/dataModel";

type GroupBuyStatus = "ordered" | "in_production" | "shipped" | "delivered";

interface GroupBuyData {
  _id: Id<"groupBuys">;
  productName: string;
  vendor: string;
  orderDate: string;
  estimatedShipDate: string;
  cost: number;
  status: GroupBuyStatus;
  productType: string;
  notes: string;
  trackingUrl?: string;
  trackingNumber?: string;
}

const COLUMNS: { status: GroupBuyStatus; label: string; color: string }[] = [
  { status: "ordered", label: "Ordered", color: "border-blue-500/30" },
  { status: "in_production", label: "In Production", color: "border-amber-500/30" },
  { status: "shipped", label: "Shipped", color: "border-emerald-500/30" },
  { status: "delivered", label: "Delivered", color: "border-border-default" },
];

interface GroupBuyKanbanProps {
  entries: GroupBuyData[];
  onUpdateStatus: (id: Id<"groupBuys">, status: GroupBuyStatus) => void;
  onExitSelection?: () => void;
}

export function GroupBuyKanban({ entries, onUpdateStatus, onExitSelection }: GroupBuyKanbanProps) {
  // Exit selection mode when switching to kanban
  useEffect(() => {
    onExitSelection?.();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {COLUMNS.map((col) => {
        const items = entries.filter((e) => e.status === col.status);
        return (
          <div key={col.status}>
            <div className={cn("border-t-2 rounded-t-none pt-3 mb-3", col.color)}>
              <div className="flex items-center justify-between">
                <h3 className="text-xs font-semibold text-text-muted uppercase tracking-wider">
                  {col.label}
                </h3>
                <span className="text-[10px] font-mono text-text-muted bg-bg-elevated rounded px-1.5 py-0.5">
                  {items.length}
                </span>
              </div>
            </div>
            <div className="space-y-2">
              {items.length === 0 ? (
                <div className="rounded-lg border border-dashed border-border-subtle p-4 text-center">
                  <p className="text-xs text-text-muted">No items</p>
                </div>
              ) : (
                items.map((entry) => {
                  const days = daysUntil(entry.estimatedShipDate);
                  const isOverdue = days < 0 && entry.status !== "delivered";
                  return (
                    <div
                      key={entry._id}
                      className={cn(
                        "rounded-lg border bg-bg-surface p-3 shadow-surface",
                        isOverdue ? "border-red-500/30" : "border-border-subtle"
                      )}
                    >
                      <p className="text-sm font-semibold text-text-primary truncate font-[family-name:var(--font-outfit)]">
                        {entry.productName}
                      </p>
                      <p className="text-xs text-text-muted mt-0.5">{entry.vendor}</p>
                      <div className="flex items-center justify-between mt-2">
                        <span className="text-xs font-mono text-accent">{formatPriceWhole(entry.cost)}</span>
                        {entry.status !== "delivered" && (
                          <span className={cn(
                            "text-[10px] font-semibold",
                            isOverdue ? "text-red-400" : days <= 14 ? "text-amber-400" : "text-text-muted"
                          )}>
                            {isOverdue ? `${Math.abs(days)}d overdue` : `${days}d left`}
                          </span>
                        )}
                      </div>
                      {entry.trackingUrl && entry.status === "shipped" && (
                        <a
                          href={entry.trackingUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-[10px] text-accent hover:text-accent-hover mt-1.5 inline-block transition-colors duration-150"
                        >
                          Track package &rarr;
                        </a>
                      )}
                      {/* Quick status advance */}
                      {entry.status !== "delivered" && (
                        <div className="mt-2 pt-2 border-t border-border-subtle">
                          <select
                            value={entry.status}
                            onChange={(e) => onUpdateStatus(entry._id, e.target.value as GroupBuyStatus)}
                            className="text-[10px] bg-bg-elevated border border-border-default rounded px-1.5 py-1 text-text-secondary w-full focus:border-border-accent transition-[border-color] duration-150"
                          >
                            <option value="ordered">Ordered</option>
                            <option value="in_production">In Production</option>
                            <option value="shipped">Shipped</option>
                            <option value="delivered">Delivered</option>
                          </select>
                        </div>
                      )}
                    </div>
                  );
                })
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}
