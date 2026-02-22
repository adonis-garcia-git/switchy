"use client";

import { useState, Suspense } from "react";
import { useRouter } from "next/navigation";
import { useQuery } from "convex/react";
import { api } from "../../../convex/_generated/api";
import { SwitchCard } from "@/components/SwitchCard";
import { FilterBar, FilterState } from "@/components/FilterBar";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Id } from "../../../convex/_generated/dataModel";
import { cn } from "@/lib/utils";
import { useFilterParams } from "@/hooks/useFilterParams";
import {
  DEFAULT_SWITCH_FILTERS,
  parseSwitchParams,
  switchFiltersToParams,
} from "@/lib/filterParams";

function SwitchesContent() {
  const router = useRouter();
  const [filters, setFilters] = useFilterParams<FilterState>(
    DEFAULT_SWITCH_FILTERS,
    parseSwitchParams,
    switchFiltersToParams
  );
  const [compareMode, setCompareMode] = useState(false);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [searchQuery, setSearchQuery] = useState("");
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const brands = useQuery(api.switches.getAllBrands, {}) ?? [];

  const switches = useQuery(api.switches.list, {
    type: (filters.type as "linear" | "tactile" | "clicky") || undefined,
    brand: filters.brand || undefined,
    soundCharacter: filters.soundCharacter || undefined,
    soundPitch: filters.soundPitch || undefined,
    soundVolume: filters.soundVolume || undefined,
    minForce: filters.minForce > 20 ? filters.minForce : undefined,
    maxForce: filters.maxForce < 100 ? filters.maxForce : undefined,
    sortBy: filters.sortBy,
    sortOrder: filters.sortOrder,
  });

  const searchResults = useQuery(
    api.switches.search,
    searchQuery.trim() ? { query: searchQuery.trim() } : "skip"
  );

  const displaySwitches = searchQuery.trim() ? searchResults : switches;

  const handleCompareToggle = (id: Id<"switches">) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else if (next.size < 3) {
        next.add(id);
      }
      return next;
    });
  };

  const handleCompare = () => {
    const ids = Array.from(selectedIds).join(",");
    router.push(`/switches/compare?ids=${ids}`);
  };

  return (
    <div className="min-h-screen">
      <div className="flex">
        {/* Sidebar - desktop */}
        <aside className="hidden lg:block w-64 flex-shrink-0 border-r border-border-subtle">
          <div className="sticky top-16 h-[calc(100vh-4rem)] overflow-y-auto p-5">
            {!searchQuery.trim() && (
              <FilterBar
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
              <FilterBar
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
                Switch Explorer
              </h1>
              {displaySwitches && (
                <Badge variant="info" size="sm">
                  {displaySwitches.length}
                </Badge>
              )}
            </div>
            <div className="flex items-center gap-2">
              {/* Mobile filter toggle */}
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

          {/* Search bar */}
          <div className="mb-6">
            <div className="relative">
              <svg
                className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted pointer-events-none"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2}
              >
                <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search switches by name..."
                className="w-full bg-bg-surface border border-border-subtle rounded-lg pl-10 pr-4 py-2.5 text-sm text-text-primary placeholder:text-text-muted transition-colors duration-150 hover:border-border-default"
              />
            </div>
          </div>

          {/* Grid */}
          {displaySwitches === undefined ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
              {Array.from({ length: 9 }).map((_, i) => (
                <div
                  key={i}
                  className="rounded-xl border border-border-subtle bg-bg-surface p-4 animate-pulse"
                >
                  <div className="flex justify-between mb-3">
                    <div>
                      <div className="h-2.5 w-16 bg-bg-elevated rounded mb-2" />
                      <div className="h-4 w-32 bg-bg-elevated rounded" />
                    </div>
                    <div className="h-5 w-14 bg-bg-elevated rounded" />
                  </div>
                  <div className="h-px bg-border-subtle mb-3" />
                  <div className="h-3 w-24 bg-bg-elevated rounded mb-3" />
                  <div className="h-3 w-20 bg-bg-elevated rounded mb-3" />
                  <div className="flex gap-1">
                    <div className="h-3 w-3 bg-bg-elevated rounded" />
                    <div className="h-3 w-3 bg-bg-elevated rounded" />
                    <div className="h-3 w-3 bg-bg-elevated rounded" />
                    <div className="h-3 w-3 bg-bg-elevated rounded" />
                    <div className="h-3 w-3 bg-bg-elevated rounded" />
                  </div>
                </div>
              ))}
            </div>
          ) : displaySwitches.length === 0 ? (
            <div className="text-center py-20">
              <p className="text-text-muted text-sm">
                No switches match your filters.
              </p>
              <p className="text-text-muted/60 text-xs mt-1">
                Try adjusting your criteria.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
              {displaySwitches.map((sw: any) => (
                <SwitchCard
                  key={sw._id}
                  sw={sw}
                  compareMode={compareMode}
                  isSelected={selectedIds.has(sw._id)}
                  onCompareToggle={handleCompareToggle}
                />
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
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setSelectedIds(new Set())}
          >
            Clear
          </Button>
          {selectedIds.size >= 2 && (
            <Button size="sm" onClick={handleCompare}>
              Compare
            </Button>
          )}
        </div>
      )}
    </div>
  );
}

function SwitchesLoading() {
  return (
    <div className="min-h-screen px-4 lg:px-8 py-6">
      <div className="flex items-center gap-3 mb-6">
        <div className="h-8 w-48 bg-bg-elevated rounded animate-pulse" />
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
        {Array.from({ length: 9 }).map((_, i) => (
          <div
            key={i}
            className="rounded-xl border border-border-subtle bg-bg-surface p-4 animate-pulse"
          >
            <div className="flex justify-between mb-3">
              <div>
                <div className="h-2.5 w-16 bg-bg-elevated rounded mb-2" />
                <div className="h-4 w-32 bg-bg-elevated rounded" />
              </div>
              <div className="h-5 w-14 bg-bg-elevated rounded" />
            </div>
            <div className="h-px bg-border-subtle mb-3" />
            <div className="h-3 w-24 bg-bg-elevated rounded mb-3" />
            <div className="h-3 w-20 bg-bg-elevated rounded" />
          </div>
        ))}
      </div>
    </div>
  );
}

export default function SwitchesPage() {
  return (
    <Suspense fallback={<SwitchesLoading />}>
      <SwitchesContent />
    </Suspense>
  );
}
