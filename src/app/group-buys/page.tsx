"use client";

import { useState, useMemo } from "react";
import { useQuery, useMutation } from "convex/react";
import { useUser, SignInButton } from "@clerk/nextjs";
import { api } from "../../../convex/_generated/api";
import { Id } from "../../../convex/_generated/dataModel";
import { GroupBuyEntry } from "@/components/GroupBuyEntry";
import { GroupBuyKanban } from "@/components/GroupBuyKanban";
import { GroupBuyStatsHeader, SpendingChart } from "@/components/GroupBuyStats";
import { Button } from "@/components/ui/Button";
import { cn, formatPriceWhole, daysUntil } from "@/lib/utils";

type GroupBuyStatus = "ordered" | "in_production" | "shipped" | "delivered";
type ProductType = "keyboard" | "switches" | "keycaps" | "accessories";

export default function GroupBuysPage() {
  const { isSignedIn } = useUser();
  const groupBuys = useQuery(api.groupBuys.listByUser, {});
  const stats = useQuery(api.groupBuys.getStats, {});
  const partnerships = useQuery(api.groupBuyPartnerships.listActive, {});
  const createGroupBuy = useMutation(api.groupBuys.create);
  const updateGroupBuy = useMutation(api.groupBuys.update);
  const removeGroupBuy = useMutation(api.groupBuys.remove);

  const partnerVendors = new Set(
    partnerships?.map((p: any) => p.vendorName.toLowerCase()) ?? []
  );

  const [showForm, setShowForm] = useState(false);
  const [viewMode, setViewMode] = useState<"list" | "kanban">("list");
  const [filterType, setFilterType] = useState<string | null>(null);
  const [sortBy, setSortBy] = useState<string>("date");
  const [formData, setFormData] = useState({
    productName: "",
    vendor: "",
    orderDate: "",
    estimatedShipDate: "",
    cost: "",
    status: "ordered" as GroupBuyStatus,
    productType: "keyboard" as ProductType,
    notes: "",
    trackingUrl: "",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await createGroupBuy({
      ...formData,
      cost: parseFloat(formData.cost) || 0,
      trackingUrl: formData.trackingUrl || undefined,
    });
    setFormData({
      productName: "",
      vendor: "",
      orderDate: "",
      estimatedShipDate: "",
      cost: "",
      status: "ordered",
      productType: "keyboard",
      notes: "",
      trackingUrl: "",
    });
    setShowForm(false);
  };

  const handleUpdateStatus = async (id: Id<"groupBuys">, status: GroupBuyStatus) => {
    await updateGroupBuy({ id, status });
  };

  const handleUpdate = async (id: Id<"groupBuys">, fields: Record<string, unknown>) => {
    await updateGroupBuy({ id, ...fields } as any);
  };

  const handleDelete = async (id: Id<"groupBuys">) => {
    await removeGroupBuy({ id });
  };

  // Filter and sort
  const filteredEntries = useMemo(() => {
    if (!groupBuys) return [];
    let result = groupBuys as any[];
    if (filterType) {
      result = result.filter((e) => e.productType === filterType);
    }
    return result.sort((a, b) => {
      if (sortBy === "cost") return b.cost - a.cost;
      if (sortBy === "status") {
        const order = { ordered: 0, in_production: 1, shipped: 2, delivered: 3 };
        return (order[a.status as GroupBuyStatus] ?? 0) - (order[b.status as GroupBuyStatus] ?? 0);
      }
      // Default: date (newest first)
      return new Date(b.orderDate).getTime() - new Date(a.orderDate).getTime();
    });
  }, [groupBuys, filterType, sortBy]);

  const activeEntries = filteredEntries.filter((e: any) => e.status !== "delivered");
  const deliveredEntries = filteredEntries.filter((e: any) => e.status === "delivered");

  // Overdue warning
  const overdueEntries = activeEntries.filter((e: any) => daysUntil(e.estimatedShipDate) < 0);

  // CSV export
  const handleExportCSV = () => {
    if (!groupBuys || groupBuys.length === 0) return;
    const headers = ["Product Name", "Vendor", "Order Date", "Est. Ship Date", "Cost", "Status", "Type", "Notes"];
    const rows = (groupBuys as any[]).map((e) => [
      e.productName,
      e.vendor,
      e.orderDate,
      e.estimatedShipDate,
      e.cost,
      e.status,
      e.productType,
      e.notes,
    ]);
    const csv = [headers, ...rows].map((row) => row.map((cell: any) => `"${String(cell).replace(/"/g, '""')}"`).join(",")).join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "group-buys.csv";
    a.click();
    URL.revokeObjectURL(url);
  };

  if (!isSignedIn) {
    return (
      <div className="min-h-screen">
        <div className="max-w-3xl mx-auto px-4 py-16 text-center">
          <h1 className="text-2xl font-bold font-[family-name:var(--font-outfit)] tracking-tight mb-4">
            Group Buy Tracker
          </h1>
          <p className="text-text-secondary mb-6 leading-relaxed">
            Sign in to track your pending group buys and orders.
          </p>
          <SignInButton mode="modal">
            <Button>Sign In</Button>
          </SignInButton>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      <main className="max-w-5xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold font-[family-name:var(--font-outfit)] tracking-tight">
              Group Buy Tracker
            </h1>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handleExportCSV}
              className="text-xs text-text-muted hover:text-text-primary transition-colors duration-150 px-2 py-1 rounded hover:bg-bg-elevated focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/40"
              title="Export as CSV"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </button>
            <Button
              variant={showForm ? "secondary" : "primary"}
              size="sm"
              onClick={() => setShowForm(!showForm)}
            >
              {showForm ? "Cancel" : "+ Add Entry"}
            </Button>
          </div>
        </div>

        {/* Stats Header */}
        {stats && <GroupBuyStatsHeader stats={stats} />}

        {/* Overdue Warning */}
        {overdueEntries.length > 0 && (
          <div className="mb-4 rounded-xl border border-red-500/30 bg-red-500/5 p-4 flex items-center gap-3">
            <svg className="w-5 h-5 text-red-400 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
            <p className="text-sm text-red-400">
              <span className="font-semibold">{overdueEntries.length} item{overdueEntries.length > 1 ? "s" : ""}</span> past estimated ship date
            </p>
          </div>
        )}

        {/* Spending chart */}
        {stats?.spendingByType && Object.keys(stats.spendingByType).length > 0 && (
          <SpendingChart spendingByType={stats.spendingByType} />
        )}

        {/* Filters + View Toggle */}
        <div className="flex items-center justify-between mb-4 gap-3 flex-wrap">
          <div className="flex items-center gap-1.5 overflow-x-auto">
            {[
              { value: null, label: "All" },
              { value: "keyboard", label: "Keyboards" },
              { value: "switches", label: "Switches" },
              { value: "keycaps", label: "Keycaps" },
              { value: "accessories", label: "Accessories" },
            ].map((opt) => (
              <button
                key={opt.value ?? "all"}
                onClick={() => setFilterType(opt.value)}
                className={cn(
                  "px-3 py-1.5 rounded-md text-xs font-semibold whitespace-nowrap transition-[background-color,color] duration-150",
                  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/40",
                  filterType === opt.value
                    ? "bg-accent-dim text-accent"
                    : "bg-bg-surface text-text-secondary border border-border-default hover:text-text-primary"
                )}
              >
                {opt.label}
              </button>
            ))}
          </div>

          <div className="flex items-center gap-2">
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="text-xs bg-bg-elevated border border-border-default rounded-md px-2 py-1.5 text-text-secondary focus:border-border-accent transition-[border-color] duration-150"
            >
              <option value="date">Sort: Date</option>
              <option value="cost">Sort: Cost</option>
              <option value="status">Sort: Status</option>
            </select>

            <div className="flex border border-border-default rounded-md overflow-hidden">
              <button
                onClick={() => setViewMode("list")}
                className={cn(
                  "px-2.5 py-1.5 text-xs transition-colors duration-150",
                  viewMode === "list" ? "bg-accent-dim text-accent" : "text-text-muted hover:text-text-primary"
                )}
                title="List view"
              >
                <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              </button>
              <button
                onClick={() => setViewMode("kanban")}
                className={cn(
                  "px-2.5 py-1.5 text-xs transition-colors duration-150",
                  viewMode === "kanban" ? "bg-accent-dim text-accent" : "text-text-muted hover:text-text-primary"
                )}
                title="Kanban view"
              >
                <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 17V7m0 10a2 2 0 01-2 2H5a2 2 0 01-2-2V7a2 2 0 012-2h2a2 2 0 012 2m0 10a2 2 0 002 2h2a2 2 0 002-2M9 7a2 2 0 012-2h2a2 2 0 012 2m0 10V7m0 10a2 2 0 002 2h2a2 2 0 002-2V7a2 2 0 00-2-2h-2a2 2 0 00-2 2" />
                </svg>
              </button>
            </div>
          </div>
        </div>

        {/* Add Form */}
        {showForm && (
          <form
            onSubmit={handleSubmit}
            className="rounded-xl border border-border-default bg-bg-surface p-5 mb-6 space-y-4 shadow-surface"
          >
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs text-text-muted uppercase tracking-wider font-semibold mb-1.5">Product Name</label>
                <input required value={formData.productName} onChange={(e) => setFormData({ ...formData, productName: e.target.value })} className="w-full bg-bg-elevated border border-border-default rounded-lg px-3 py-2.5 text-sm text-text-primary placeholder:text-text-muted/60 focus:border-border-accent transition-[border-color] duration-150" placeholder="Keychron Q1 Pro" />
              </div>
              <div>
                <label className="block text-xs text-text-muted uppercase tracking-wider font-semibold mb-1.5">Vendor</label>
                <input required value={formData.vendor} onChange={(e) => setFormData({ ...formData, vendor: e.target.value })} className="w-full bg-bg-elevated border border-border-default rounded-lg px-3 py-2.5 text-sm text-text-primary placeholder:text-text-muted/60 focus:border-border-accent transition-[border-color] duration-150" placeholder="Keychron.com" />
              </div>
              <div>
                <label className="block text-xs text-text-muted uppercase tracking-wider font-semibold mb-1.5">Order Date</label>
                <input type="date" required value={formData.orderDate} onChange={(e) => setFormData({ ...formData, orderDate: e.target.value })} className="w-full bg-bg-elevated border border-border-default rounded-lg px-3 py-2.5 text-sm text-text-primary focus:border-border-accent transition-[border-color] duration-150" />
              </div>
              <div>
                <label className="block text-xs text-text-muted uppercase tracking-wider font-semibold mb-1.5">Est. Ship Date</label>
                <input type="date" required value={formData.estimatedShipDate} onChange={(e) => setFormData({ ...formData, estimatedShipDate: e.target.value })} className="w-full bg-bg-elevated border border-border-default rounded-lg px-3 py-2.5 text-sm text-text-primary focus:border-border-accent transition-[border-color] duration-150" />
              </div>
              <div>
                <label className="block text-xs text-text-muted uppercase tracking-wider font-semibold mb-1.5">Cost ($)</label>
                <input type="number" step="0.01" required value={formData.cost} onChange={(e) => setFormData({ ...formData, cost: e.target.value })} className="w-full bg-bg-elevated border border-border-default rounded-lg px-3 py-2.5 text-sm text-text-primary placeholder:text-text-muted/60 focus:border-border-accent transition-[border-color] duration-150" placeholder="199.00" />
              </div>
              <div>
                <label className="block text-xs text-text-muted uppercase tracking-wider font-semibold mb-1.5">Product Type</label>
                <select value={formData.productType} onChange={(e) => setFormData({ ...formData, productType: e.target.value as ProductType })} className="w-full bg-bg-elevated border border-border-default rounded-lg px-3 py-2.5 text-sm text-text-primary focus:border-border-accent transition-[border-color] duration-150">
                  <option value="keyboard">Keyboard</option>
                  <option value="switches">Switches</option>
                  <option value="keycaps">Keycaps</option>
                  <option value="accessories">Accessories</option>
                </select>
              </div>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs text-text-muted uppercase tracking-wider font-semibold mb-1.5">Notes</label>
                <textarea value={formData.notes} onChange={(e) => setFormData({ ...formData, notes: e.target.value })} rows={2} className="w-full bg-bg-elevated border border-border-default rounded-lg px-3 py-2.5 text-sm text-text-primary resize-none placeholder:text-text-muted/60 focus:border-border-accent transition-[border-color] duration-150" placeholder="Optional notes..." />
              </div>
              <div>
                <label className="block text-xs text-text-muted uppercase tracking-wider font-semibold mb-1.5">Tracking URL (Optional)</label>
                <input value={formData.trackingUrl} onChange={(e) => setFormData({ ...formData, trackingUrl: e.target.value })} className="w-full bg-bg-elevated border border-border-default rounded-lg px-3 py-2.5 text-sm text-text-primary placeholder:text-text-muted/60 focus:border-border-accent transition-[border-color] duration-150" placeholder="https://tracking.example.com/..." />
              </div>
            </div>
            <Button type="submit" size="sm">Add Group Buy</Button>
          </form>
        )}

        {/* Content */}
        {viewMode === "kanban" ? (
          <GroupBuyKanban
            entries={filteredEntries as any}
            onUpdateStatus={handleUpdateStatus}
          />
        ) : (
          <>
            {/* Active entries */}
            {activeEntries.length > 0 && (
              <div className="space-y-3 mb-8">
                {activeEntries.map((entry: any) => (
                  <div key={entry._id} className="relative">
                    {partnerVendors.has(entry.vendor?.toLowerCase()) && (
                      <span className="absolute -top-2 right-3 z-10 inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-[10px] font-semibold uppercase tracking-wider">
                        <svg className="w-2.5 h-2.5" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M16.704 4.153a.75.75 0 01.143 1.052l-8 10.5a.75.75 0 01-1.127.075l-4.5-4.5a.75.75 0 011.06-1.06l3.894 3.893 7.48-9.817a.75.75 0 011.05-.143z" clipRule="evenodd" />
                        </svg>
                        Partner Deal
                      </span>
                    )}
                    <GroupBuyEntry
                      entry={entry}
                      onUpdateStatus={handleUpdateStatus}
                      onUpdate={handleUpdate}
                      onDelete={handleDelete}
                    />
                  </div>
                ))}
              </div>
            )}

            {/* Delivered */}
            {deliveredEntries.length > 0 && (
              <div>
                <h2 className="text-xs font-semibold text-text-muted uppercase tracking-wider mb-3 font-[family-name:var(--font-outfit)]">
                  Delivered
                </h2>
                <div className="space-y-3 opacity-60">
                  {deliveredEntries.map((entry: any) => (
                    <GroupBuyEntry
                      key={entry._id}
                      entry={entry}
                      onUpdateStatus={handleUpdateStatus}
                      onUpdate={handleUpdate}
                      onDelete={handleDelete}
                    />
                  ))}
                </div>
              </div>
            )}

            {groupBuys && filteredEntries.length === 0 && !showForm && (
              <div className="text-center py-16 text-text-muted">
                <p className="mb-2">No group buys tracked yet.</p>
                <p className="text-sm">Click &ldquo;+ Add Entry&rdquo; to start tracking.</p>
              </div>
            )}
          </>
        )}

        {/* Affiliate disclosure */}
        {partnerships && partnerships.length > 0 && (
          <p className="text-[10px] text-text-muted mt-8 leading-relaxed border-t border-border-subtle pt-4">
            Some vendors listed here are partners. We may earn a commission on purchases made through partner links at no extra cost to you.
          </p>
        )}
      </main>
    </div>
  );
}
