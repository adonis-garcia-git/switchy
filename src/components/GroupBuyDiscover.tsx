"use client";

import { useState, useCallback } from "react";
import { useQuery } from "convex/react";
import { api } from "../../convex/_generated/api";
import { GroupBuyFilterBar } from "@/components/GroupBuyFilterBar";
import { GroupBuyListingCard } from "@/components/GroupBuyListingCard";
import { GroupBuyListingDetail } from "@/components/GroupBuyListingDetail";
import { GroupBuyEndingSoon } from "@/components/GroupBuyEndingSoon";
import { GroupBuyNewcomerGuide } from "@/components/GroupBuyNewcomerGuide";
import { GroupBuyResourceLinks } from "@/components/GroupBuyResourceLinks";
import { Badge } from "@/components/ui/Badge";
import { Pagination } from "@/components/ui/Pagination";
import { GridViewToggle } from "@/components/ui/GridViewToggle";
import { useGridView } from "@/hooks/useGridView";
import { usePagination } from "@/hooks/usePagination";
import type { GroupBuyListingFilterState } from "@/lib/types";
import { cn } from "@/lib/utils";

interface GroupBuyDiscoverProps {
  onTrackThis: (listing: any) => void;
  trackedListingIds: string[];
}

const DEFAULT_FILTERS: GroupBuyListingFilterState = {
  productType: null,
  status: null,
  minPrice: null,
  maxPrice: null,
  sortBy: "endingSoon",
};

export function GroupBuyDiscover({ onTrackThis, trackedListingIds }: GroupBuyDiscoverProps) {
  const [filters, setFilters] = useState<GroupBuyListingFilterState>(DEFAULT_FILTERS);
  const [searchQuery, setSearchQuery] = useState("");
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [selectedListing, setSelectedListing] = useState<any>(null);
  const { view, setView, gridClassName, skeletonCount, itemsPerPage } = useGridView("grid-4");

  const trackedSet = new Set(trackedListingIds);

  // Queries
  const listings = useQuery(api.groupBuyListings.list, {
    productType: (filters.productType as any) || undefined,
    status: (filters.status as any) || undefined,
    minPrice: filters.minPrice ?? undefined,
    maxPrice: filters.maxPrice ?? undefined,
    sortBy: filters.sortBy,
  });

  const searchResults = useQuery(
    api.groupBuyListings.search,
    searchQuery.trim() ? { query: searchQuery.trim() } : "skip"
  );

  const endingSoon = useQuery(api.groupBuyListings.getEndingSoon, {});

  const displayListings = searchQuery.trim() ? searchResults : listings;

  const {
    page,
    setPage,
    totalPages,
    totalItems,
    paginatedItems,
    resetPage,
    rangeStart,
    rangeEnd,
  } = usePagination(displayListings, itemsPerPage);

  const handleFilterChange = useCallback((f: GroupBuyListingFilterState) => {
    setFilters(f);
    resetPage();
  }, [resetPage]);

  return (
    <div className="flex h-full">
      {/* Sidebar - desktop */}
      <aside className="hidden lg:block w-64 flex-shrink-0 border-r border-border-subtle">
        <div className="h-full overflow-y-auto p-5">
          {!searchQuery.trim() && (
            <>
              <GroupBuyFilterBar
                filters={filters}
                onChange={handleFilterChange}
              />
              <GroupBuyResourceLinks />
            </>
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
            <GroupBuyFilterBar
              filters={filters}
              onChange={handleFilterChange}
            />
          </aside>
        </>
      )}

      {/* Main content */}
      <main className="flex-1 min-w-0 px-4 lg:px-8 py-6 overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <h2 className="font-[family-name:var(--font-outfit)] text-lg font-bold text-text-primary tracking-tight">
              Browse Group Buys
            </h2>
            {displayListings && (
              <Badge variant="info" size="sm">
                {totalItems}
              </Badge>
            )}
          </div>
          <div className="flex items-center gap-2">
            <GridViewToggle view={view} onChange={setView} />
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
              onChange={(e) => { setSearchQuery(e.target.value); resetPage(); }}
              placeholder="Search group buys by name..."
              className="w-full bg-bg-surface border border-border-subtle rounded-lg pl-10 pr-4 py-2.5 text-sm text-text-primary placeholder:text-text-muted transition-colors duration-150 hover:border-border-default"
            />
          </div>
        </div>

        {/* Newcomer Guide */}
        {!searchQuery.trim() && <GroupBuyNewcomerGuide />}

        {/* Ending Soon Banner */}
        {!searchQuery.trim() && endingSoon && endingSoon.length > 0 && (
          <GroupBuyEndingSoon
            listings={endingSoon}
            trackedIds={trackedSet}
            onTrackThis={(listing) => onTrackThis(listing)}
          />
        )}

        {/* Grid */}
        {paginatedItems === null ? (
          <div className={gridClassName}>
            {Array.from({ length: skeletonCount }).map((_, i) => (
              <div
                key={i}
                className="rounded-xl border border-border-subtle bg-bg-surface overflow-hidden animate-pulse"
              >
                <div className="aspect-[4/3] bg-bg-elevated" />
                <div className="p-5">
                  <div className="h-2.5 w-20 bg-bg-elevated rounded mb-2" />
                  <div className="h-4 w-40 bg-bg-elevated rounded mb-3" />
                  <div className="flex gap-1 mb-3">
                    <div className="h-4 w-12 bg-bg-elevated rounded" />
                    <div className="h-4 w-16 bg-bg-elevated rounded" />
                  </div>
                  <div className="h-px bg-border-subtle mb-3" />
                  <div className="flex justify-between">
                    <div className="h-5 w-16 bg-bg-elevated rounded" />
                    <div className="h-4 w-20 bg-bg-elevated rounded" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : totalItems === 0 ? (
          <div className="text-center py-20">
            <p className="text-text-muted text-sm">
              No group buys match your filters.
            </p>
            <p className="text-text-muted/60 text-xs mt-1">
              Try adjusting your criteria or search.
            </p>
          </div>
        ) : (
          <>
            <div className={gridClassName}>
              {paginatedItems.map((listing: any) => (
                <GroupBuyListingCard
                  key={listing._id}
                  listing={listing}
                  isTracked={trackedSet.has(listing._id)}
                  onTrackThis={() => onTrackThis(listing)}
                  onClick={() => setSelectedListing(listing)}
                />
              ))}
            </div>
            <Pagination
              page={page}
              totalPages={totalPages}
              totalItems={totalItems}
              rangeStart={rangeStart}
              rangeEnd={rangeEnd}
              onPageChange={setPage}
              noun="listings"
            />
          </>
        )}
      </main>

      {/* Detail Modal */}
      {selectedListing && (
        <GroupBuyListingDetail
          listing={selectedListing}
          isTracked={trackedSet.has(selectedListing._id)}
          onTrackThis={() => {
            onTrackThis(selectedListing);
            setSelectedListing(null);
          }}
          onClose={() => setSelectedListing(null)}
        />
      )}
    </div>
  );
}
