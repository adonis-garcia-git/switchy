"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useQuery } from "convex/react";
import { api } from "../../../convex/_generated/api";
import { SwitchCard } from "@/components/SwitchCard";
import { FilterBar, FilterState } from "@/components/FilterBar";
import { Id } from "../../../convex/_generated/dataModel";

const DEFAULT_FILTERS: FilterState = {
  type: null,
  soundCharacter: null,
  soundPitch: null,
  soundVolume: null,
  minForce: 20,
  maxForce: 100,
  minPrice: 0,
  maxPrice: 2,
  brand: null,
  sortBy: "communityRating",
  sortOrder: "desc",
};

export default function SwitchesPage() {
  const router = useRouter();
  const [filters, setFilters] = useState<FilterState>(DEFAULT_FILTERS);
  const [compareMode, setCompareMode] = useState(false);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [searchQuery, setSearchQuery] = useState("");

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
      <main className="max-w-7xl mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold">Switch Explorer</h1>
          <div className="flex items-center gap-3">
            <button
              onClick={() => {
                setCompareMode(!compareMode);
                if (compareMode) setSelectedIds(new Set());
              }}
              className={`px-3 py-1.5 rounded-lg text-sm font-medium border transition-colors ${
                compareMode
                  ? "border-accent bg-accent-dim text-accent"
                  : "border-border-subtle text-text-muted hover:text-text-secondary"
              }`}
            >
              {compareMode ? "Exit Compare" : "Compare"}
            </button>
            {compareMode && selectedIds.size >= 2 && (
              <button
                onClick={handleCompare}
                className="px-4 py-1.5 rounded-lg bg-accent text-bg-primary text-sm font-semibold hover:bg-accent-hover transition-colors"
              >
                Compare ({selectedIds.size})
              </button>
            )}
          </div>
        </div>

        {/* Search */}
        <div className="mb-4">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search switches by name..."
            className="w-full sm:w-80 bg-bg-surface border border-border-subtle rounded-lg px-4 py-2 text-sm text-text-primary placeholder:text-text-muted"
          />
        </div>

        {!searchQuery.trim() && (
          <FilterBar
            filters={filters}
            onChange={setFilters}
            brands={brands}
          />
        )}

        {/* Results count */}
        <p className="text-sm text-text-muted my-4">
          {displaySwitches?.length ?? 0} switches found
        </p>

        {/* Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {displaySwitches?.map((sw: any) => (
            <SwitchCard
              key={sw._id}
              sw={sw}
              compareMode={compareMode}
              isSelected={selectedIds.has(sw._id)}
              onCompareToggle={handleCompareToggle}
            />
          ))}
        </div>

        {displaySwitches && displaySwitches.length === 0 && (
          <div className="text-center py-16 text-text-muted">
            No switches match your filters. Try adjusting your criteria.
          </div>
        )}
      </main>
    </div>
  );
}
