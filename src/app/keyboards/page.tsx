"use client";

import { useState, Suspense } from "react";
import { useRouter } from "next/navigation";
import { useQuery } from "convex/react";
import { api } from "../../../convex/_generated/api";
import { KeyboardCard } from "@/components/KeyboardCard";
import { KeyboardFilterBar } from "@/components/KeyboardFilterBar";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Id } from "../../../convex/_generated/dataModel";
import { cn } from "@/lib/utils";
import { useFilterParams } from "@/hooks/useFilterParams";
import {
  KeyboardFilterState,
  DEFAULT_KEYBOARD_FILTERS,
  parseKeyboardParams,
  keyboardFiltersToParams,
} from "@/lib/filterParams";

function ActiveFilterBadges({
  filters,
  setFilters,
}: {
  filters: KeyboardFilterState;
  setFilters: (f: KeyboardFilterState) => void;
}) {
  const badges: { key: string; label: string; onDismiss: () => void }[] = [];

  if (filters.size) {
    badges.push({ key: "size", label: `Size: ${filters.size}`, onDismiss: () => setFilters({ ...filters, size: null }) });
  }
  if (filters.brand) {
    badges.push({ key: "brand", label: `Brand: ${filters.brand}`, onDismiss: () => setFilters({ ...filters, brand: null }) });
  }
  if (filters.hotSwapOnly) {
    badges.push({ key: "hotswap", label: "Hot-Swap", onDismiss: () => setFilters({ ...filters, hotSwapOnly: false }) });
  }
  if (filters.wirelessOnly) {
    badges.push({ key: "wireless", label: "Wireless", onDismiss: () => setFilters({ ...filters, wirelessOnly: false }) });
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
    badges.push({ key: "price", label: priceLabel, onDismiss: () => setFilters({ ...filters, minPrice: null, maxPrice: null }) });
  }

  if (badges.length === 0) return null;

  return (
    <div className="flex flex-wrap items-center gap-2 mb-4">
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
  const router = useRouter();
  const [filters, setFilters] = useFilterParams<KeyboardFilterState>(
    DEFAULT_KEYBOARD_FILTERS,
    parseKeyboardParams,
    keyboardFiltersToParams
  );
  const [searchQuery, setSearchQuery] = useState("");
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [compareMode, setCompareMode] = useState(false);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());

  const brands = useQuery(api.keyboards.getAllBrands, {}) ?? [];

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
    searchQuery.trim() ? { query: searchQuery.trim() } : "skip"
  );

  const displayKeyboards = searchQuery.trim() ? searchResults : keyboards;

  const sorted = displayKeyboards
    ? [...displayKeyboards].sort((a: any, b: any) => {
        if (filters.sortBy === "price-low") return a.priceUsd - b.priceUsd;
        if (filters.sortBy === "price-high") return b.priceUsd - a.priceUsd;
        if (filters.sortBy === "brand") return a.brand.localeCompare(b.brand);
        return a.name.localeCompare(b.name);
      })
    : null;

  return (
    <div className="min-h-screen">
      <div className="flex">
        {/* Sidebar - desktop */}
        <aside className="hidden lg:block w-64 flex-shrink-0 border-r border-border-subtle">
          <div className="sticky top-16 h-[calc(100vh-4rem)] overflow-y-auto p-5">
            {!searchQuery.trim() && (
              <KeyboardFilterBar
                filters={filters}
                onChange={setFilters}
                brands={brands}
              />
            )}
          </div>
        </aside>

        {/* Mobile sidebar overlay */}
        {sidebarOpen && (
          <>
            <div
              className="fixed inset-0 bg-black/60 z-40 lg:hidden"
              onClick={() => setSidebarOpen(false)}
            />
            <aside className="fixed inset-y-0 left-0 w-72 bg-bg-surface border-r border-border-default z-50 lg:hidden overflow-y-auto p-5 pt-20">
              <div className="flex items-center justify-between mb-4">
                <h2 className="font-[family-name:var(--font-outfit)] text-sm font-semibold text-text-primary tracking-tight">
                  Filters
                </h2>
                <button
                  onClick={() => setSidebarOpen(false)}
                  className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-bg-elevated text-text-muted hover:text-text-primary transition-colors duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/40 active:scale-[0.95]"
                >
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
              <KeyboardFilterBar
                filters={filters}
                onChange={setFilters}
                brands={brands}
              />
            </aside>
          </>
        )}

        {/* Main content */}
        <main className="flex-1 min-w-0 px-4 lg:px-8 py-6">
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <h1 className="font-[family-name:var(--font-outfit)] text-2xl font-bold text-text-primary tracking-tight">
                Keyboard Explorer
              </h1>
              {sorted && (
                <Badge variant="info" size="sm">
                  {sorted.length}
                </Badge>
              )}
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setSidebarOpen(true)}
                className="lg:hidden flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm text-text-secondary border border-border-subtle hover:border-border-default hover:text-text-primary transition-colors duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/40 active:scale-[0.97]"
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
                </svg>
                Filters
              </button>
              <Button
                variant={compareMode ? "primary" : "secondary"}
                size="sm"
                onClick={() => {
                  setCompareMode(!compareMode);
                  if (compareMode) setSelectedIds(new Set());
                }}
              >
                {compareMode ? "Exit Compare" : "Compare"}
              </Button>
            </div>
          </div>

          {/* Active filter badges */}
          <ActiveFilterBadges filters={filters} setFilters={setFilters} />

          {/* Search bar */}
          <div className="mb-6">
            <div className="relative">
              <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted pointer-events-none" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search keyboards by name, brand, or feature..."
                className="w-full bg-bg-surface border border-border-subtle rounded-lg pl-10 pr-4 py-2.5 text-sm text-text-primary placeholder:text-text-muted transition-colors duration-150 hover:border-border-default focus:border-border-accent focus:outline-none"
              />
            </div>
          </div>

          {/* Grid */}
          {sorted === null ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
              {Array.from({ length: 9 }).map((_, i) => (
                <div key={i} className="rounded-xl border border-border-subtle bg-bg-surface p-4 animate-pulse">
                  <div className="aspect-[16/10] bg-bg-elevated rounded-lg mb-4" />
                  <div className="h-3 w-16 bg-bg-elevated rounded mb-2" />
                  <div className="h-4 w-32 bg-bg-elevated rounded mb-3" />
                  <div className="flex gap-1.5">
                    <div className="h-5 w-14 bg-bg-elevated rounded" />
                    <div className="h-5 w-14 bg-bg-elevated rounded" />
                  </div>
                </div>
              ))}
            </div>
          ) : sorted.length === 0 ? (
            <div className="text-center py-20">
              <p className="text-text-muted text-sm">No keyboards match your filters.</p>
              <p className="text-text-muted/60 text-xs mt-1">Try adjusting your criteria.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
              {sorted.map((kb: any) => (
                <KeyboardCard key={kb._id} keyboard={kb} />
              ))}
            </div>
          )}
        </main>
      </div>

      {/* Floating compare bar */}
      {compareMode && selectedIds.size > 0 && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-30 flex items-center gap-3 px-5 py-3 rounded-xl bg-bg-floating border border-border-accent shadow-floating">
          <span className="text-sm text-text-secondary">
            {selectedIds.size} of 3 selected
          </span>
          <div className="w-px h-5 bg-border-subtle" />
          <Button variant="ghost" size="sm" onClick={() => setSelectedIds(new Set())}>
            Clear
          </Button>
          {selectedIds.size >= 2 && (
            <Button size="sm" onClick={() => router.push(`/keyboards/compare?ids=${Array.from(selectedIds).join(",")}`)}>
              Compare
            </Button>
          )}
        </div>
      )}
    </div>
  );
}

function KeyboardsLoading() {
  return (
    <div className="min-h-screen px-4 lg:px-8 py-6">
      <div className="flex items-center gap-3 mb-6">
        <div className="h-8 w-52 bg-bg-elevated rounded animate-pulse" />
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
        {Array.from({ length: 9 }).map((_, i) => (
          <div key={i} className="rounded-xl border border-border-subtle bg-bg-surface p-4 animate-pulse">
            <div className="aspect-[16/10] bg-bg-elevated rounded-lg mb-4" />
            <div className="h-3 w-16 bg-bg-elevated rounded mb-2" />
            <div className="h-4 w-32 bg-bg-elevated rounded" />
          </div>
        ))}
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
