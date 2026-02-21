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
  shipped: "bg-green-500/15 text-green-400 border-green-500/30",
  delivered: "bg-gray-500/15 text-gray-400 border-gray-500/30",
};

const STATUS_LABELS: Record<string, string> = {
  ordered: "Ordered",
  in_production: "In Production",
  shipped: "Shipped",
  delivered: "Delivered",
};

const TYPE_ICONS: Record<string, string> = {
  keyboard: "⌨️",
  switches: "🔘",
  keycaps: "🎹",
  accessories: "🔧",
};

export function GroupBuyEntry({
  entry,
  onUpdateStatus,
  onDelete,
}: GroupBuyEntryProps) {
  const days = daysUntil(entry.estimatedShipDate);
  const isOverdue = days < 0;

  return (
    <div className="rounded-lg border border-border-subtle bg-bg-surface p-4">
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <span className="text-lg">{TYPE_ICONS[entry.productType]}</span>
            <h3 className="font-semibold text-text-primary truncate">
              {entry.productName}
            </h3>
          </div>
          <p className="text-sm text-text-muted">{entry.vendor}</p>
        </div>
        <div className="text-right shrink-0">
          <span className="font-mono text-accent font-semibold">
            {formatPriceWhole(entry.cost)}
          </span>
          <div className="mt-1">
            <span
              className={cn(
                "inline-block px-2 py-0.5 rounded text-xs font-medium border",
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
        <p className="mt-2 text-xs text-text-secondary">{entry.notes}</p>
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
            className="text-xs bg-bg-elevated border border-border-subtle rounded px-2 py-1 text-text-secondary"
          >
            <option value="ordered">Ordered</option>
            <option value="in_production">In Production</option>
            <option value="shipped">Shipped</option>
            <option value="delivered">Delivered</option>
          </select>
        )}
        <button
          onClick={() => onDelete(entry._id)}
          className="text-xs text-text-muted hover:text-red-400 transition-colors ml-auto"
        >
          Delete
        </button>
      </div>
    </div>
  );
}
