"use client";

import { useState, Suspense } from "react";
import { useQuery } from "convex/react";
import { api } from "../../../convex/_generated/api";
import { KeyboardCard } from "@/components/KeyboardCard";
import { Input } from "@/components/ui/Input";
import { Tabs } from "@/components/ui/Tabs";
import { Skeleton } from "@/components/ui/Skeleton";
import { Badge } from "@/components/ui/Badge";
import { useFilterParams } from "@/hooks/useFilterParams";
import {
  KeyboardFilterState,
  DEFAULT_KEYBOARD_FILTERS,
  parseKeyboardParams,
  keyboardFiltersToParams,
} from "@/lib/filterParams";

const SIZE_TABS = [
  { label: "All", value: "all" },
  { label: "60%", value: "60%" },
  { label: "65%", value: "65%" },
  { label: "75%", value: "75%" },
  { label: "TKL", value: "TKL" },
  { label: "Full", value: "full-size" },
];

function ActiveFilterBadges({
  filters,
  setFilters,
}: {
  filters: KeyboardFilterState;
  setFilters: (f: KeyboardFilterState) => void;
}) {
  const badges: { key: string; label: string; onDismiss: () => void }[] = [];

  if (filters.size) {
    badges.push({
      key: "size",
      label: `Size: ${filters.size}`,
      onDismiss: () => setFilters({ ...filters, size: null }),
    });
  }
  if (filters.brand) {
    badges.push({
      key: "brand",
      label: `Brand: ${filters.brand}`,
      onDismiss: () => setFilters({ ...filters, brand: null }),
    });
  }
  if (filters.hotSwapOnly) {
    badges.push({
      key: "hotswap",
      label: "Hot-Swap",
      onDismiss: () => setFilters({ ...filters, hotSwapOnly: false }),
    });
  }
  if (filters.wirelessOnly) {
    badges.push({
      key: "wireless",
      label: "Wireless",
      onDismiss: () => setFilters({ ...filters, wirelessOnly: false }),
    });
  }
  if (filters.minPrice != null || filters.maxPrice != null) {
    let priceLabel: string;
    if (filters.minPrice != null && filters.maxPrice != null) {
      priceLabel = `$${filters.minPrice} – $${filters.maxPrice}`;
    } else if (filters.minPrice != null) {
      priceLabel = `$${filters.minPrice}+`;
    } else {
      priceLabel = `Under $${filters.maxPrice}`;
    }
    badges.push({
      key: "price",
      label: priceLabel,
      onDismiss: () => setFilters({ ...filters, minPrice: null, maxPrice: null }),
    });
  }

  if (badges.length === 0) return null;

  return (
    <div className="flex flex-wrap items-center gap-2">
      {badges.map(({ key, label, onDismiss }) => (
        <button
          key={key}
          onClick={onDismiss}
          className="flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium bg-accent-dim text-accent border border-accent/20 hover:bg-accent/20 transition-colors duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/40 active:scale-[0.97]"
        >
          {label}
          <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      ))}
      <button
        onClick={() => setFilters({ ...DEFAULT_KEYBOARD_FILTERS })}
        className="text-[10px] text-accent hover:text-accent-hover transition-colors duration-150 uppercase tracking-wider font-semibold px-1 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/40 rounded"
      >
        Clear all
      </button>
    </div>
  );
}

function KeyboardsContent() {
  const [search, setSearch] = useState("");
  const [filters, setFilters] = useFilterParams<KeyboardFilterState>(
    DEFAULT_KEYBOARD_FILTERS,
    parseKeyboardParams,
    keyboardFiltersToParams
  );

  const keyboards = useQuery(api.keyboards.list, {
    size: filters.size || undefined,
    brand: filters.brand || undefined,
    hotSwapOnly: filters.hotSwapOnly || undefined,
    wirelessOnly: filters.wirelessOnly || undefined,
    minPrice: filters.minPrice ?? undefined,
    maxPrice: filters.maxPrice ?? undefined,
  });

  const searchResults = useQuery(
    api.keyboards.search,
    search.trim() ? { query: search.trim() } : "skip"
  );

  const displayKeyboards = search.trim() ? searchResults : keyboards;

  const sorted = displayKeyboards
    ? [...displayKeyboards].sort((a: any, b: any) => {
        if (filters.sortBy === "price-low") return a.priceUsd - b.priceUsd;
        if (filters.sortBy === "price-high") return b.priceUsd - a.priceUsd;
        return a.name.localeCompare(b.name);
      })
    : null;

  return (
    <div className="p-6 lg:p-8">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex items-center gap-3 mb-8">
          <h1 className="text-2xl font-bold text-text-primary font-[family-name:var(--font-outfit)] tracking-tight">
            Keyboard Explorer
          </h1>
          <Badge variant="info" size="md">
            {sorted ? sorted.length : "..."}
          </Badge>
        </div>

        {/* Active filter badges */}
        <div className="mb-4">
          <ActiveFilterBadges filters={filters} setFilters={setFilters} />
        </div>

        {/* Search + Filters */}
        <div className="space-y-4 mb-8">
          <Input
            placeholder="Search keyboards by name, brand, or feature..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />

          <div className="flex flex-wrap items-center gap-4">
            <Tabs
              tabs={SIZE_TABS}
              activeTab={filters.size || "all"}
              onChange={(val) => setFilters({ ...filters, size: val === "all" ? null : val })}
            />

            <label className="flex items-center gap-2 text-sm text-text-secondary cursor-pointer select-none group">
              <input
                type="checkbox"
                checked={filters.hotSwapOnly}
                onChange={(e) => setFilters({ ...filters, hotSwapOnly: e.target.checked })}
                className="w-4 h-4 rounded border-border-default bg-bg-surface accent-accent cursor-pointer"
              />
              <span className="group-hover:text-text-primary transition-colors duration-150">
                Hot-swap only
              </span>
            </label>

            <label className="flex items-center gap-2 text-sm text-text-secondary cursor-pointer select-none group">
              <input
                type="checkbox"
                checked={filters.wirelessOnly}
                onChange={(e) => setFilters({ ...filters, wirelessOnly: e.target.checked })}
                className="w-4 h-4 rounded border-border-default bg-bg-surface accent-accent cursor-pointer"
              />
              <span className="group-hover:text-text-primary transition-colors duration-150">
                Wireless only
              </span>
            </label>

            <select
              value={filters.sortBy}
              onChange={(e) => setFilters({ ...filters, sortBy: e.target.value })}
              className="bg-bg-surface border border-border-default rounded-lg px-3 py-2 text-sm text-text-primary cursor-pointer hover:border-border-accent focus:border-border-accent focus:outline-none transition-[border-color] duration-150"
            >
              <option value="name">Sort: Name</option>
              <option value="price-low">Sort: Price (Low)</option>
              <option value="price-high">Sort: Price (High)</option>
            </select>
          </div>
        </div>

        {/* Grid */}
        {!sorted ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {Array.from({ length: 6 }).map((_, i) => (
              <Skeleton key={i} variant="card" className="h-56" />
            ))}
          </div>
        ) : sorted.length === 0 ? (
          <div className="text-center py-20">
            <p className="text-text-muted text-sm">No keyboards found matching your filters.</p>
            <p className="text-text-muted/60 text-xs mt-1">Try adjusting your search or filter criteria.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {sorted.map((kb: any) => (
              <KeyboardCard key={kb._id} keyboard={kb} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function KeyboardsLoading() {
  return (
    <div className="p-6 lg:p-8">
      <div className="max-w-6xl mx-auto">
        <div className="flex items-center gap-3 mb-8">
          <div className="h-8 w-52 bg-bg-elevated rounded animate-pulse" />
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="rounded-xl border border-border-subtle bg-bg-surface p-4 h-56 animate-pulse" />
          ))}
        </div>
      </div>
    </div>
  );
}

export default function KeyboardsPage() {
  return (
    <Suspense fallback={<KeyboardsLoading />}>
      <KeyboardsContent />
    </Suspense>
  );
}
