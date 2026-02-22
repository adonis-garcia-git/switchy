"use client";

import { useState, useCallback, Suspense } from "react";
import { useQuery } from "convex/react";
import { api } from "../../../convex/_generated/api";
import { AccessoryCard } from "@/components/AccessoryCard";
import { AccessoryFilterBar } from "@/components/AccessoryFilterBar";
import { Badge } from "@/components/ui/Badge";
import { Pagination } from "@/components/ui/Pagination";
import { useFilterParams } from "@/hooks/useFilterParams";
import { usePagination } from "@/hooks/usePagination";
import { useGridView } from "@/hooks/useGridView";
import { GridViewToggle } from "@/components/ui/GridViewToggle";
import type { AccessoryFilterState } from "@/lib/types";
import { ACCESSORY_SUBCATEGORIES } from "@/lib/constants";
import {
  DEFAULT_ACCESSORY_FILTERS,
  parseAccessoryParams,
  accessoryFiltersToParams,
} from "@/lib/filterParams";
import { SponsoredCarousel } from "@/components/SponsoredCarousel";
import { usePromotedInsert } from "@/hooks/usePromotedInsert";
import { PromotedProductCard } from "@/components/PromotedProductCard";

const SUBCATEGORY_LABEL = Object.fromEntries(
  ACCESSORY_SUBCATEGORIES.map((s) => [s.value, s.label])
);

function ActiveFilterBadges({
  filters,
  setFilters,
}: {
  filters: AccessoryFilterState;
  setFilters: (f: AccessoryFilterState) => void;
}) {
  const badges: { key: string; label: string; onDismiss: () => void }[] = [];

  if (filters.subcategory) {
    badges.push({ key: "subcategory", label: SUBCATEGORY_LABEL[filters.subcategory] || filters.subcategory, onDismiss: () => setFilters({ ...filters, subcategory: null }) });
  }
  if (filters.brand) {
    badges.push({ key: "brand", label: `Brand: ${filters.brand}`, onDismiss: () => setFilters({ ...filters, brand: null }) });
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
        onClick={() => setFilters({ ...DEFAULT_ACCESSORY_FILTERS })}
        className="text-[10px] text-accent hover:text-accent-hover transition-colors duration-150 uppercase tracking-wider font-semibold px-1 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/40 rounded"
      >
        Clear all
      </button>
    </div>
  );
}

function AccessoriesContent() {
  const [filters, setFiltersRaw] = useFilterParams<AccessoryFilterState>(
    DEFAULT_ACCESSORY_FILTERS,
    parseAccessoryParams,
    accessoryFiltersToParams
  );
  const [searchQuery, setSearchQuery] = useState("");
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { view, setView, gridClassName, skeletonCount, isList } = useGridView();

  const brands = useQuery(api.accessories.getAllBrands, {}) ?? [];

  const accessories = useQuery(api.accessories.list, {
    subcategory: filters.subcategory || undefined,
    brand: filters.brand || undefined,
    minPrice: filters.minPrice ?? undefined,
    maxPrice: filters.maxPrice ?? undefined,
  });

  const searchResults = useQuery(
    api.accessories.search,
    searchQuery.trim() ? { query: searchQuery.trim() } : "skip"
  );

  const displayAccessories = searchQuery.trim() ? searchResults : accessories;

  const sorted = displayAccessories
    ? [...displayAccessories].sort((a: any, b: any) => {
        if (filters.sortBy === "recommended") return 0;
        const dir = filters.sortOrder === "asc" ? 1 : -1;
        if (filters.sortBy === "price") return (a.priceUsd - b.priceUsd) * dir;
        if (filters.sortBy === "brand") return a.brand.localeCompare(b.brand) * dir;
        return a.name.localeCompare(b.name) * dir;
      })
    : null;

  const promotedSponsorships = useQuery(api.sponsorships.getActiveByType, {
    placement: "promoted_search",
    productType: "accessory",
  });

  const {
    page,
    setPage,
    totalPages,
    totalItems,
    paginatedItems: paginatedAccessories,
    resetPage,
    rangeStart,
    rangeEnd,
  } = usePagination(sorted);

  const mergedItems = usePromotedInsert(paginatedAccessories, promotedSponsorships);

  const setFilters = useCallback((f: AccessoryFilterState) => { setFiltersRaw(f); resetPage(); }, [setFiltersRaw, resetPage]);

  return (
    <div className="min-h-screen">
      <div className="flex">
        {/* Sidebar - desktop */}
        <aside className="hidden lg:block w-64 flex-shrink-0 border-r border-border-subtle">
          <div className="sticky top-16 h-[calc(100vh-4rem)] overflow-y-auto p-5">
            {!searchQuery.trim() && (
              <AccessoryFilterBar
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
            <div className="fixed inset-0 bg-black/60 z-40 lg:hidden" onClick={() => setSidebarOpen(false)} />
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
              <AccessoryFilterBar filters={filters} onChange={setFilters} brands={brands} />
            </aside>
          </>
        )}

        {/* Main content */}
        <main className="flex-1 min-w-0 px-4 lg:px-8 py-6">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <h1 className="font-[family-name:var(--font-outfit)] text-2xl font-bold text-text-primary tracking-tight">
                Accessories
              </h1>
              {sorted && <Badge variant="info" size="sm">{totalItems}</Badge>}
            </div>
            <div className="flex items-center gap-2">
              <GridViewToggle view={view} onChange={setView} />
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

          <ActiveFilterBadges filters={filters} setFilters={setFilters} />

          <div className="mb-6">
            <div className="relative">
              <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted pointer-events-none" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => { setSearchQuery(e.target.value); resetPage(); }}
                placeholder="Search accessories by name or brand..."
                className="w-full bg-bg-surface border border-border-subtle rounded-lg pl-10 pr-4 py-2.5 text-sm text-text-primary placeholder:text-text-muted transition-colors duration-150 hover:border-border-default focus:border-border-accent focus:outline-none"
              />
            </div>
          </div>

          {/* Sponsored carousel */}
          <SponsoredCarousel productType="accessory" />

          {mergedItems === null ? (
            <div className={gridClassName}>
              {Array.from({ length: skeletonCount }).map((_, i) => (
                <div key={i} className="rounded-xl border border-border-subtle bg-bg-surface p-4 animate-pulse">
                  <div className="aspect-[4/3] bg-bg-elevated rounded-lg mb-4" />
                  <div className="h-3 w-16 bg-bg-elevated rounded mb-2" />
                  <div className="h-4 w-32 bg-bg-elevated rounded" />
                </div>
              ))}
            </div>
          ) : totalItems === 0 ? (
            <div className="text-center py-20">
              <p className="text-text-muted text-sm">No accessories match your filters.</p>
              <p className="text-text-muted/60 text-xs mt-1">Try adjusting your criteria.</p>
            </div>
          ) : (
            <>
              <div className={gridClassName}>
                {(() => {
                  let featuredShown = false;
                  return mergedItems!.map((item: any) => {
                    if (item.isPromoted) {
                      return (
                        <PromotedProductCard
                          key={item._id}
                          sponsorshipId={item._id.replace("promoted-", "")}
                          vendorName={item.vendorName}
                          productName={item.productName}
                          productUrl={item.productUrl}
                          imageUrl={item.imageUrl}
                          priceUsd={item.priceUsd}
                        />
                      );
                    }
                    const isFeatured = !featuredShown;
                    if (isFeatured) featuredShown = true;
                    return <AccessoryCard key={item._id} accessory={item} featured={isFeatured} />;
                  });
                })()}
              </div>
              <Pagination
                page={page}
                totalPages={totalPages}
                totalItems={totalItems}
                rangeStart={rangeStart}
                rangeEnd={rangeEnd}
                onPageChange={setPage}
                noun="accessories"
              />
            </>
          )}
        </main>
      </div>
    </div>
  );
}

function AccessoriesLoading() {
  return (
    <div className="min-h-screen px-4 lg:px-8 py-6">
      <div className="flex items-center gap-3 mb-6">
        <div className="h-8 w-48 bg-bg-elevated rounded animate-pulse" />
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3.5">
        {Array.from({ length: 9 }).map((_, i) => (
          <div key={i} className="rounded-xl border border-border-subtle bg-bg-surface p-4 animate-pulse">
            <div className="aspect-[4/3] bg-bg-elevated rounded-lg mb-4" />
            <div className="h-3 w-16 bg-bg-elevated rounded mb-2" />
            <div className="h-4 w-32 bg-bg-elevated rounded" />
          </div>
        ))}
      </div>
    </div>
  );
}

export default function AccessoriesPage() {
  return (
    <Suspense fallback={<AccessoriesLoading />}>
      <AccessoriesContent />
    </Suspense>
  );
}
