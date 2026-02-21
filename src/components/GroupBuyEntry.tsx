"use client";

import { cn, formatPriceWhole, daysUntil } from "@/lib/utils";
import { Id } from "../../convex/_generated/dataModel";

interface GroupBuyData {
  _id: Id<"groupBuys">;
  productName: string;
  vendor: string;
  orderDate: string;
  estimatedShipDate: string;
  cost: number;
  status: "ordered" | "in_production" | "shipped" | "delivered";
  productType: "keyboard" | "switches" | "keycaps" | "accessories";
  notes: string;
}

interface GroupBuyEntryProps {
  entry: GroupBuyData;
  onUpdateStatus: (id: Id<"groupBuys">, status: GroupBuyData["status"]) => void;
  onDelete: (id: Id<"groupBuys">) => void;
}

const STATUS_STYLES: Record<string, string> = {
  ordered: "bg-blue-500/15 text-blue-400 border-blue-500/30",
  in_production: "bg-amber-500/15 text-amber-400 border-amber-500/30",
  shipped: "bg-emerald-500/15 text-emerald-400 border-emerald-500/30",
  delivered: "bg-bg-elevated text-text-secondary border-border-default",
};

const STATUS_LABELS: Record<string, string> = {
  ordered: "Ordered",
  in_production: "In Production",
  shipped: "Shipped",
  delivered: "Delivered",
};

const TYPE_LABELS: Record<string, string> = {
  keyboard: "Keyboard",
  switches: "Switches",
  keycaps: "Keycaps",
  accessories: "Accessories",
};

export function GroupBuyEntry({
  entry,
  onUpdateStatus,
  onDelete,
}: GroupBuyEntryProps) {
  const days = daysUntil(entry.estimatedShipDate);
  const isOverdue = days < 0;

  return (
    <div className="rounded-xl border border-border-subtle bg-bg-surface p-4 shadow-surface hover:border-border-accent hover:glow-accent transition-[border-color,box-shadow] duration-200">
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2.5 mb-1">
            <span className="text-[10px] font-semibold uppercase tracking-wider text-text-muted bg-bg-elevated border border-border-default rounded-md px-2 py-0.5">
              {TYPE_LABELS[entry.productType]}
            </span>
            <h3 className="font-semibold text-text-primary truncate font-[family-name:var(--font-outfit)]">
              {entry.productName}
            </h3>
          </div>
          <p className="text-sm text-text-muted">{entry.vendor}</p>
        </div>
        <div className="text-right shrink-0">
          <span className="font-mono text-accent font-semibold">
            {formatPriceWhole(entry.cost)}
          </span>
          <div className="mt-1.5">
            <span
              className={cn(
                "inline-block px-2.5 py-0.5 rounded-md text-[10px] font-semibold uppercase tracking-wider border",
                STATUS_STYLES[entry.status]
              )}
            >
              {STATUS_LABELS[entry.status]}
            </span>
          </div>
        </div>
      </div>

      <div className="mt-3 flex items-center gap-4 text-xs text-text-muted">
        <span>Ordered: {entry.orderDate}</span>
        <span>Est. Ship: {entry.estimatedShipDate}</span>
        {entry.status !== "delivered" && (
          <span
            className={cn(
              "font-semibold",
              isOverdue ? "text-red-400" : days <= 14 ? "text-amber-400" : "text-text-secondary"
            )}
          >
            {isOverdue
              ? `${Math.abs(days)} days overdue`
              : `${days} days remaining`}
          </span>
        )}
      </div>

      {entry.notes && (
        <p className="mt-2 text-xs text-text-secondary leading-relaxed">{entry.notes}</p>
      )}

      <div className="mt-3 flex items-center gap-2">
        {entry.status !== "delivered" && (
          <select
            value={entry.status}
            onChange={(e) =>
              onUpdateStatus(
                entry._id,
                e.target.value as GroupBuyData["status"]
              )
            }
            className="text-xs bg-bg-elevated border border-border-default rounded-md px-2 py-1.5 text-text-secondary focus:border-border-accent transition-[border-color,box-shadow] duration-150"
          >
            <option value="ordered">Ordered</option>
            <option value="in_production">In Production</option>
            <option value="shipped">Shipped</option>
            <option value="delivered">Delivered</option>
          </select>
        )}
        <button
          onClick={() => onDelete(entry._id)}
          className="text-xs text-text-muted hover:text-red-400 transition-colors duration-150 ml-auto focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-500/40 rounded px-1 py-0.5"
        >
          Delete
        </button>
      </div>
    </div>
  );
}
