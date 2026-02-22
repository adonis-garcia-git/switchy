"use client";

import { useState, useMemo, useEffect } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "../../convex/_generated/api";
import { Id } from "../../convex/_generated/dataModel";
import { GroupBuyEntry } from "@/components/GroupBuyEntry";
import { GroupBuyKanban } from "@/components/GroupBuyKanban";
import { GroupBuyStatsHeader, SpendingChart } from "@/components/GroupBuyStats";
import { GroupBuyActivityLog } from "@/components/GroupBuyActivityLog";
import { GroupBuyTimeline } from "@/components/GroupBuyTimeline";
import { GroupBuyBudget } from "@/components/GroupBuyBudget";
import { Button } from "@/components/ui/Button";
import { cn, formatPriceWhole, daysUntil } from "@/lib/utils";

type GroupBuyStatus = "ordered" | "in_production" | "shipped" | "delivered";
type ProductType = "keyboard" | "switches" | "keycaps" | "accessories";

export interface TrackerPrefillData {
  listingId: string;
  productName: string;
  vendor: string;
  cost: number;
  productType: ProductType;
  estimatedShipDate?: string;
  imageUrl?: string;
}

interface GroupBuyTrackerProps {
  prefillData?: TrackerPrefillData | null;
  onClearPrefill?: () => void;
  onSwitchToDiscover?: () => void;
  onTrackedDataChange?: (types: string[], names: string[]) => void;
}

export function GroupBuyTracker({ prefillData, onClearPrefill, onSwitchToDiscover, onTrackedDataChange }: GroupBuyTrackerProps) {
  const groupBuys = useQuery(api.groupBuys.listByUser, {});
  const stats = useQuery(api.groupBuys.getStats, {});
  const partnerships = useQuery(api.groupBuyPartnerships.listActive, {});
  const createGroupBuy = useMutation(api.groupBuys.create);
  const createFromListing = useMutation(api.groupBuys.createFromListing);
  const updateGroupBuy = useMutation(api.groupBuys.update);
  const removeGroupBuy = useMutation(api.groupBuys.remove);
  const bulkUpdate = useMutation(api.groupBuys.bulkUpdateStatus);

  const partnerVendors = new Set(
    partnerships?.map((p: any) => p.vendorName.toLowerCase()) ?? []
  );

  // Derive tracked product types and names for recommendations
  const trackedProductTypes = useMemo(() => {
    if (!groupBuys || groupBuys.length === 0) return [] as string[];
    const types = new Set((groupBuys as any[]).map((e) => e.productType));
    return Array.from(types);
  }, [groupBuys]);

  const trackedProductNames = useMemo(() => {
    if (!groupBuys || groupBuys.length === 0) return [] as string[];
    return (groupBuys as any[]).map((e) => e.productName);
  }, [groupBuys]);

  useEffect(() => {
    onTrackedDataChange?.(trackedProductTypes, trackedProductNames);
  }, [trackedProductTypes, trackedProductNames, onTrackedDataChange]);

  const [showForm, setShowForm] = useState(false);
  const [viewMode, setViewMode] = useState<"list" | "kanban">("list");
  const [filterType, setFilterType] = useState<string | null>(null);
  const [sortBy, setSortBy] = useState<string>("date");
  const [searchQuery, setSearchQuery] = useState("");
  const [prefillListingId, setPrefillListingId] = useState<string | null>(null);

  // Selection mode
  const [selectionMode, setSelectionMode] = useState(false);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [bulkStatus, setBulkStatus] = useState<GroupBuyStatus>("shipped");

  const defaultFormData = {
    productName: "",
    vendor: "",
    orderDate: new Date().toISOString().slice(0, 10),
    estimatedShipDate: "",
    cost: "",
    status: "ordered" as GroupBuyStatus,
    productType: "keyboard" as ProductType,
    notes: "",
    trackingUrl: "",
    imageUrl: "",
  };

  const [formData, setFormData] = useState(defaultFormData);

  // Auto-open form with prefill data
  useEffect(() => {
    if (prefillData) {
      setFormData({
        productName: prefillData.productName,
        vendor: prefillData.vendor,
        orderDate: new Date().toISOString().slice(0, 10),
        estimatedShipDate: prefillData.estimatedShipDate || "",
        cost: String(prefillData.cost),
        status: "ordered",
        productType: prefillData.productType,
        notes: "",
        trackingUrl: "",
        imageUrl: prefillData.imageUrl || "",
      });
      setPrefillListingId(prefillData.listingId);
      setShowForm(true);
    }
  }, [prefillData]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (prefillListingId) {
      await createFromListing({
        listingId: prefillListingId as Id<"groupBuyListings">,
        productName: formData.productName,
        vendor: formData.vendor,
        orderDate: formData.orderDate,
        estimatedShipDate: formData.estimatedShipDate,
        cost: parseFloat(formData.cost) || 0,
        status: formData.status,
        productType: formData.productType,
        notes: formData.notes,
        trackingUrl: formData.trackingUrl || undefined,
        imageUrl: prefillData?.imageUrl || undefined,
      });
    } else {
      await createGroupBuy({
        ...formData,
        cost: parseFloat(formData.cost) || 0,
        trackingUrl: formData.trackingUrl || undefined,
        imageUrl: formData.imageUrl || undefined,
      });
    }

    setFormData(defaultFormData);
    setPrefillListingId(null);
    setShowForm(false);
    onClearPrefill?.();
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

  const handleToggleSelect = (id: Id<"groupBuys">) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  };

  const handleBulkApply = async () => {
    if (selectedIds.size === 0) return;
    await bulkUpdate({
      ids: Array.from(selectedIds) as Id<"groupBuys">[],
      status: bulkStatus,
    });
    setSelectedIds(new Set());
    setSelectionMode(false);
  };

  const exitSelectionMode = () => {
    setSelectionMode(false);
    setSelectedIds(new Set());
  };

  // Filter and sort
  const filteredEntries = useMemo(() => {
    if (!groupBuys) return [];
    let result = groupBuys as any[];

    // Search filter
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      result = result.filter(
        (e) =>
          e.productName.toLowerCase().includes(q) ||
          e.vendor.toLowerCase().includes(q) ||
          (e.notes && e.notes.toLowerCase().includes(q))
      );
    }

    if (filterType) {
      result = result.filter((e) => e.productType === filterType);
    }
    return result.sort((a, b) => {
      if (sortBy === "cost") return b.cost - a.cost;
      if (sortBy === "status") {
        const order = { ordered: 0, in_production: 1, shipped: 2, delivered: 3 };
        return (order[a.status as GroupBuyStatus] ?? 0) - (order[b.status as GroupBuyStatus] ?? 0);
      }
      return new Date(b.orderDate).getTime() - new Date(a.orderDate).getTime();
    });
  }, [groupBuys, filterType, sortBy, searchQuery]);

  const activeEntries = filteredEntries.filter((e: any) => e.status !== "delivered");
  const deliveredEntries = filteredEntries.filter((e: any) => e.status === "delivered");
  const overdueEntries = activeEntries.filter((e: any) => daysUntil(e.estimatedShipDate) < 0);
  const hasEntries = groupBuys && groupBuys.length > 0;

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

  // Empty state
  if (groupBuys && groupBuys.length === 0 && !showForm) {
    return (
      <div className="text-center py-16">
        {/* Illustration */}
        <div className="mb-6 flex justify-center">
          <svg className="w-24 h-24 text-text-muted/30" viewBox="0 0 120 120" fill="none">
            <rect x="20" y="30" width="80" height="65" rx="8" stroke="currentColor" strokeWidth="2" strokeDasharray="4 3" />
            <rect x="30" y="42" width="60" height="8" rx="3" fill="currentColor" opacity="0.15" />
            <rect x="30" y="56" width="45" height="8" rx="3" fill="currentColor" opacity="0.1" />
            <rect x="30" y="70" width="55" height="8" rx="3" fill="currentColor" opacity="0.08" />
            <circle cx="90" cy="25" r="14" stroke="currentColor" strokeWidth="2" fill="none" />
            <path d="M85 25h10M90 20v10" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
          </svg>
        </div>

        <h2 className="text-lg font-semibold text-text-primary mb-2 font-[family-name:var(--font-outfit)]">
          Start tracking your group buys
        </h2>
        <p className="text-sm text-text-secondary max-w-md mx-auto mb-8 leading-relaxed">
          Keep tabs on all your pending orders, monitor spending, and never miss a delivery date.
        </p>

        {/* CTAs */}
        <div className="flex items-center justify-center gap-3 mb-10">
          <Button
            onClick={() => setShowForm(true)}
            size="sm"
          >
            + Add Your First Entry
          </Button>
          {onSwitchToDiscover && (
            <button
              onClick={onSwitchToDiscover}
              className="px-4 py-2 text-sm font-semibold text-text-secondary hover:text-text-primary border border-border-default hover:border-border-accent rounded-lg transition-colors duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/40"
            >
              Browse Discover
            </button>
          )}
        </div>

        {/* Feature highlights */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 max-w-xl mx-auto">
          {[
            {
              icon: (
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 18.75a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m3 0h6m-9 0H3.375a1.125 1.125 0 01-1.125-1.125V14.25m17.25 4.5a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m3 0H6.375c-.621 0-1.125-.504-1.125-1.125V14.25m17.25 0V4.875c0-.621-.504-1.125-1.125-1.125H3.375c-.621 0-1.125.504-1.125 1.125v9.375" />
                </svg>
              ),
              title: "Track Deliveries",
              desc: "Monitor order status and estimated ship dates",
            },
            {
              icon: (
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M3 13.125C3 12.504 3.504 12 4.125 12h2.25c.621 0 1.125.504 1.125 1.125v6.75C7.5 20.496 6.996 21 6.375 21h-2.25A1.125 1.125 0 013 19.875v-6.75zM9.75 8.625c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v11.25c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V8.625zM16.5 4.125c0-.621.504-1.125 1.125-1.125h2.25C20.496 3 21 3.504 21 4.125v15.75c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V4.125z" />
                </svg>
              ),
              title: "Spending Insights",
              desc: "Budget tracking and spending breakdowns",
            },
            {
              icon: (
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 4.5v15m6-15v15m-10.875 0h15.75c.621 0 1.125-.504 1.125-1.125V5.625c0-.621-.504-1.125-1.125-1.125H4.125C3.504 4.5 3 5.004 3 5.625v12.75c0 .621.504 1.125 1.125 1.125z" />
                </svg>
              ),
              title: "Status Board",
              desc: "Kanban view to visualize order pipeline",
            },
          ].map((feature) => (
            <div
              key={feature.title}
              className="rounded-xl border border-border-subtle bg-bg-surface/50 p-4 text-center"
            >
              <div className="w-9 h-9 rounded-lg bg-bg-elevated border border-border-subtle flex items-center justify-center mx-auto mb-2.5 text-text-muted">
                {feature.icon}
              </div>
              <p className="text-xs font-semibold text-text-primary mb-0.5">{feature.title}</p>
              <p className="text-[10px] text-text-muted leading-relaxed">{feature.desc}</p>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div>
      {/* 1. Header actions */}
      <div className="flex items-center justify-between mb-6">
        <div />
        <div className="flex items-center gap-2">
          {hasEntries && (
            <>
              <button
                onClick={handleExportCSV}
                className="text-xs text-text-muted hover:text-text-primary transition-colors duration-150 px-2 py-1 rounded hover:bg-bg-elevated focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/40"
                title="Export as CSV"
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </button>
              {viewMode === "list" && (
                <button
                  onClick={() => {
                    if (selectionMode) {
                      exitSelectionMode();
                    } else {
                      setSelectionMode(true);
                    }
                  }}
                  className={cn(
                    "text-xs px-3 py-1.5 rounded-md font-semibold transition-colors duration-150",
                    "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/40",
                    selectionMode
                      ? "bg-accent-dim text-accent border border-accent/20"
                      : "text-text-muted hover:text-text-primary border border-border-default hover:border-border-accent"
                  )}
                >
                  {selectionMode ? "Cancel Select" : "Select"}
                </button>
              )}
            </>
          )}
          <Button
            variant={showForm ? "secondary" : "primary"}
            size="sm"
            onClick={() => {
              if (showForm) {
                setPrefillListingId(null);
                onClearPrefill?.();
              }
              setShowForm(!showForm);
            }}
          >
            {showForm ? "Cancel" : "+ Add Entry"}
          </Button>
        </div>
      </div>

      {/* 2. Stats Header (6 cards) */}
      {stats && <GroupBuyStatsHeader stats={stats} />}

      {/* 3. Budget Tracker */}
      {stats && <GroupBuyBudget totalSpent={stats.totalSpentAllTime ?? 0} />}

      {/* 4. Activity Log + Spending Chart — side by side on desktop */}
      {(() => {
        const hasActivity = true; // component handles its own empty state
        const hasSpending = stats?.spendingByType && Object.keys(stats.spendingByType).length > 0;
        return (
          <div className={cn("gap-4 mb-6", hasSpending ? "grid grid-cols-1 lg:grid-cols-2" : "")}>
            <GroupBuyActivityLog />
            {hasSpending && (
              <SpendingChart
                spendingByType={stats.spendingByType}
                spendingByVendor={stats.spendingByVendor}
              />
            )}
          </div>
        );
      })()}

      {/* 5. Delivery Timeline Strip */}
      {hasEntries && <GroupBuyTimeline entries={groupBuys as any} />}

      {/* 6. Overdue Warning */}
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

      {/* 8. Search + Filters + Sort + View Toggle */}
      <div className="flex items-center justify-between mb-4 gap-3 flex-wrap">
        <div className="flex items-center gap-2 flex-1 min-w-0 overflow-x-auto">
          {/* Search */}
          <div className="relative shrink-0">
            <svg className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-text-muted pointer-events-none" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search..."
              className="w-40 bg-bg-elevated border border-border-default rounded-md pl-8 pr-2.5 py-1.5 text-xs text-text-primary placeholder:text-text-muted/50 focus:border-border-accent transition-[border-color] duration-150"
            />
          </div>

          {/* Filter pills */}
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
          {prefillListingId && (
            <div className="flex items-center gap-2 text-xs text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 rounded-lg px-3 py-2">
              <svg className="w-3.5 h-3.5 shrink-0" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a.75.75 0 000 1.5h.253a.25.25 0 01.244.304l-.459 2.066A1.75 1.75 0 0010.747 15H11a.75.75 0 000-1.5h-.253a.25.25 0 01-.244-.304l.459-2.066A1.75 1.75 0 009.253 9H9z" clipRule="evenodd" />
              </svg>
              Pre-filled from Discover — adjust details as needed
            </div>
          )}
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
          <div>
            <label className="block text-xs text-text-muted uppercase tracking-wider font-semibold mb-1.5">Image URL (Optional)</label>
            <input value={formData.imageUrl} onChange={(e) => setFormData({ ...formData, imageUrl: e.target.value })} className="w-full bg-bg-elevated border border-border-default rounded-lg px-3 py-2.5 text-sm text-text-primary placeholder:text-text-muted/60 focus:border-border-accent transition-[border-color] duration-150" placeholder="https://example.com/image.jpg" />
          </div>
          <Button type="submit" size="sm">Add Group Buy</Button>
        </form>
      )}

      {/* 9. Content: List / Kanban / Empty filtered state */}
      {viewMode === "kanban" ? (
        <GroupBuyKanban
          entries={filteredEntries as any}
          onUpdateStatus={handleUpdateStatus}
          onExitSelection={selectionMode ? exitSelectionMode : undefined}
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
                    selectable={selectionMode}
                    selected={selectedIds.has(entry._id)}
                    onToggleSelect={handleToggleSelect}
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
                    selectable={selectionMode}
                    selected={selectedIds.has(entry._id)}
                    onToggleSelect={handleToggleSelect}
                  />
                ))}
              </div>
            </div>
          )}

          {/* No results from search/filter */}
          {hasEntries && filteredEntries.length === 0 && (
            <div className="text-center py-12 text-text-muted">
              <p className="mb-1">No entries match your search or filters.</p>
              <button
                onClick={() => { setSearchQuery(""); setFilterType(null); }}
                className="text-xs text-accent hover:text-accent-hover transition-colors duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/40 rounded"
              >
                Clear filters
              </button>
            </div>
          )}
        </>
      )}

      {/* 10. Bulk Action Bar (floating, when selection active) */}
      {selectionMode && selectedIds.size > 0 && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50">
          <div className="bg-bg-elevated border border-border-accent rounded-xl px-5 py-3 shadow-lg flex items-center gap-4">
            <span className="text-sm font-semibold text-text-primary whitespace-nowrap">
              {selectedIds.size} selected
            </span>
            <select
              value={bulkStatus}
              onChange={(e) => setBulkStatus(e.target.value as GroupBuyStatus)}
              className="text-xs bg-bg-surface border border-border-default rounded-md px-2.5 py-1.5 text-text-secondary focus:border-border-accent transition-[border-color] duration-150"
            >
              <option value="ordered">Ordered</option>
              <option value="in_production">In Production</option>
              <option value="shipped">Shipped</option>
              <option value="delivered">Delivered</option>
            </select>
            <button
              onClick={handleBulkApply}
              className="px-4 py-1.5 text-xs font-semibold rounded-lg bg-accent text-bg-primary hover:bg-accent-hover active:scale-[0.97] transition-[background-color,transform] duration-150"
            >
              Apply
            </button>
            <button
              onClick={exitSelectionMode}
              className="text-xs text-text-muted hover:text-text-primary transition-colors duration-150"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* 11. Affiliate disclosure */}
      {partnerships && partnerships.length > 0 && (
        <p className="text-[10px] text-text-muted mt-8 leading-relaxed border-t border-border-subtle pt-4">
          Some vendors listed here are partners. We may earn a commission on purchases made through partner links at no extra cost to you.
        </p>
      )}
    </div>
  );
}
