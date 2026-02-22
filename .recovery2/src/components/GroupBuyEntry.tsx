"use client";

import { useState } from "react";
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
  trackingUrl?: string;
  trackingNumber?: string;
  imageUrl?: string;
}

interface GroupBuyEntryProps {
  entry: GroupBuyData;
  onUpdateStatus: (id: Id<"groupBuys">, status: GroupBuyData["status"]) => void;
  onUpdate: (id: Id<"groupBuys">, fields: Record<string, unknown>) => void;
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
  onUpdate,
  onDelete,
}: GroupBuyEntryProps) {
  const [editing, setEditing] = useState(false);
  const [editData, setEditData] = useState({
    productName: entry.productName,
    vendor: entry.vendor,
    orderDate: entry.orderDate,
    estimatedShipDate: entry.estimatedShipDate,
    cost: String(entry.cost),
    notes: entry.notes,
    trackingUrl: entry.trackingUrl || "",
    trackingNumber: entry.trackingNumber || "",
  });

  const days = daysUntil(entry.estimatedShipDate);
  const isOverdue = days < 0 && entry.status !== "delivered";

  const handleSave = () => {
    onUpdate(entry._id, {
      productName: editData.productName,
      vendor: editData.vendor,
      orderDate: editData.orderDate,
      estimatedShipDate: editData.estimatedShipDate,
      cost: parseFloat(editData.cost) || entry.cost,
      notes: editData.notes,
      trackingUrl: editData.trackingUrl || undefined,
      trackingNumber: editData.trackingNumber || undefined,
    });
    setEditing(false);
  };

  if (editing) {
    return (
      <div className={cn(
        "rounded-xl border bg-bg-surface p-4 shadow-surface",
        isOverdue ? "border-red-500/30" : "border-border-accent"
      )}>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-3">
          <div>
            <label className="block text-[10px] text-text-muted uppercase tracking-wider font-semibold mb-1">Product Name</label>
            <input value={editData.productName} onChange={(e) => setEditData({ ...editData, productName: e.target.value })} className="w-full bg-bg-elevated border border-border-default rounded-lg px-2.5 py-1.5 text-sm text-text-primary focus:border-border-accent transition-[border-color] duration-150" />
          </div>
          <div>
            <label className="block text-[10px] text-text-muted uppercase tracking-wider font-semibold mb-1">Vendor</label>
            <input value={editData.vendor} onChange={(e) => setEditData({ ...editData, vendor: e.target.value })} className="w-full bg-bg-elevated border border-border-default rounded-lg px-2.5 py-1.5 text-sm text-text-primary focus:border-border-accent transition-[border-color] duration-150" />
          </div>
          <div>
            <label className="block text-[10px] text-text-muted uppercase tracking-wider font-semibold mb-1">Order Date</label>
            <input type="date" value={editData.orderDate} onChange={(e) => setEditData({ ...editData, orderDate: e.target.value })} className="w-full bg-bg-elevated border border-border-default rounded-lg px-2.5 py-1.5 text-sm text-text-primary focus:border-border-accent transition-[border-color] duration-150" />
          </div>
          <div>
            <label className="block text-[10px] text-text-muted uppercase tracking-wider font-semibold mb-1">Est. Ship Date</label>
            <input type="date" value={editData.estimatedShipDate} onChange={(e) => setEditData({ ...editData, estimatedShipDate: e.target.value })} className="w-full bg-bg-elevated border border-border-default rounded-lg px-2.5 py-1.5 text-sm text-text-primary focus:border-border-accent transition-[border-color] duration-150" />
          </div>
          <div>
            <label className="block text-[10px] text-text-muted uppercase tracking-wider font-semibold mb-1">Cost ($)</label>
            <input type="number" step="0.01" value={editData.cost} onChange={(e) => setEditData({ ...editData, cost: e.target.value })} className="w-full bg-bg-elevated border border-border-default rounded-lg px-2.5 py-1.5 text-sm text-text-primary focus:border-border-accent transition-[border-color] duration-150" />
          </div>
          <div>
            <label className="block text-[10px] text-text-muted uppercase tracking-wider font-semibold mb-1">Tracking URL</label>
            <input value={editData.trackingUrl} onChange={(e) => setEditData({ ...editData, trackingUrl: e.target.value })} placeholder="https://..." className="w-full bg-bg-elevated border border-border-default rounded-lg px-2.5 py-1.5 text-sm text-text-primary placeholder:text-text-muted/40 focus:border-border-accent transition-[border-color] duration-150" />
          </div>
        </div>
        <div className="mb-3">
          <label className="block text-[10px] text-text-muted uppercase tracking-wider font-semibold mb-1">Notes</label>
          <textarea value={editData.notes} onChange={(e) => setEditData({ ...editData, notes: e.target.value })} rows={2} className="w-full bg-bg-elevated border border-border-default rounded-lg px-2.5 py-1.5 text-sm text-text-primary resize-none focus:border-border-accent transition-[border-color] duration-150" />
        </div>
        <div className="flex items-center gap-2">
          <button onClick={handleSave} className="px-3 py-1.5 text-xs font-semibold rounded-lg bg-accent text-bg-primary hover:bg-accent-hover active:scale-[0.97] transition-[background-color,transform] duration-150">Save</button>
          <button onClick={() => setEditing(false)} className="px-3 py-1.5 text-xs font-semibold rounded-lg text-text-secondary hover:text-text-primary hover:bg-bg-elevated transition-colors duration-150">Cancel</button>
        </div>
      </div>
    );
  }

  return (
    <div className={cn(
      "rounded-xl border bg-bg-surface p-4 shadow-surface hover:border-border-accent hover:glow-accent transition-[border-color,box-shadow] duration-200",
      isOverdue ? "border-red-500/30" : "border-border-subtle"
    )}>
      <div className="flex items-start justify-between gap-3">
        {entry.imageUrl && (
          <img
            src={entry.imageUrl}
            alt={entry.productName}
            className="w-14 h-14 rounded-lg object-cover border border-border-subtle shrink-0"
          />
        )}
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

      {/* Tracking link */}
      {entry.trackingUrl && entry.status === "shipped" && (
        <div className="mt-2">
          <a
            href={entry.trackingUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="text-xs text-accent hover:text-accent-hover transition-colors duration-150 inline-flex items-center gap-1"
          >
            <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
            </svg>
            Track Package{entry.trackingNumber ? ` (${entry.trackingNumber})` : ""}
          </a>
        </div>
      )}

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
            className="text-xs bg-bg-elevated border border-border-default rounded-md px-2 py-1.5 text-text-secondary focus:border-border-accent transition-[border-color] duration-150"
          >
            <option value="ordered">Ordered</option>
            <option value="in_production">In Production</option>
            <option value="shipped">Shipped</option>
            <option value="delivered">Delivered</option>
          </select>
        )}
        <button
          onClick={() => setEditing(true)}
          className="text-xs text-text-muted hover:text-accent transition-colors duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/40 rounded px-1 py-0.5"
        >
          Edit
        </button>
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
