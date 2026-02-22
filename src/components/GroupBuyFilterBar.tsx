"use client";

import { useState } from "react";
import { cn } from "@/lib/utils";
import { GROUP_BUY_LISTING_STATUS_COLORS, GROUP_BUY_PRODUCT_TYPES } from "@/lib/constants";
import { GroupBuyGlossaryTip } from "@/components/GroupBuyGlossaryTip";
import type { GroupBuyListingFilterState } from "@/lib/types";

const STATUS_GLOSSARY_TERMS: Record<string, string> = {
  ic: "IC",
  extras: "Extras",
};

interface GroupBuyFilterBarProps {
  filters: GroupBuyListingFilterState;
  onChange: (filters: GroupBuyListingFilterState) => void;
}

function FilterSection({
  title,
  defaultOpen = true,
  children,
}: {
  title: string;
  defaultOpen?: boolean;
  children: React.ReactNode;
}) {
  const [open, setOpen] = useState(defaultOpen);

  return (
    <div className="border-b border-border-subtle last:border-b-0">
      <button
        onClick={() => setOpen(!open)}
        className="flex items-center justify-between w-full py-3 px-1 text-xs font-semibold text-text-secondary uppercase tracking-wider hover:text-text-primary transition-colors duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/40 rounded"
      >
        {title}
        <svg
          className={cn(
            "w-3.5 h-3.5 text-text-muted transition-transform duration-150",
            open && "rotate-180"
          )}
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth={2}
        >
          <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
        </svg>
      </button>
      {open && <div className="pb-4 space-y-2">{children}</div>}
    </div>
  );
}

function RadioOption({
  label,
  active,
  onClick,
  colorDot,
  glossaryTerm,
}: {
  label: string;
  active: boolean;
  onClick: () => void;
  colorDot?: string;
  glossaryTerm?: string;
}) {
  return (
    <button
      onClick={onClick}
      className={cn(
        "flex items-center gap-2 w-full px-2.5 py-1.5 rounded-md text-sm transition-colors duration-150",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/40",
        "active:scale-[0.98]",
        active
          ? "bg-accent-dim text-accent font-medium"
          : "text-text-secondary hover:text-text-primary hover:bg-bg-elevated"
      )}
    >
      {colorDot && (
        <span
          className="w-2 h-2 rounded-full flex-shrink-0"
          style={{ backgroundColor: colorDot }}
        />
      )}
      <span className="truncate">
        {glossaryTerm ? <GroupBuyGlossaryTip term={glossaryTerm}>{label}</GroupBuyGlossaryTip> : label}
      </span>
      {active && (
        <svg className="w-3.5 h-3.5 ml-auto text-accent flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
          <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
        </svg>
      )}
    </button>
  );
}

export function GroupBuyFilterBar({ filters, onChange }: GroupBuyFilterBarProps) {
  const update = (partial: Partial<GroupBuyListingFilterState>) => {
    onChange({ ...filters, ...partial });
  };

  const statusColors: Record<string, string> = {
    ic: "#38BDF8",
    upcoming: "#3B82F6",
    live: "#10B981",
    ended: "#71717A",
    fulfilled: "#8B5CF6",
    shipped: "#A855F7",
    extras: "#2DD4BF",
  };

  const hasActiveFilters =
    filters.productType !== null ||
    filters.status !== null ||
    filters.minPrice !== null ||
    filters.maxPrice !== null;

  return (
    <div className="space-y-0">
      <div className="flex items-center justify-between pb-3 mb-1 border-b border-border-subtle">
        <h3 className="text-xs font-semibold text-text-muted uppercase tracking-wider">
          Filters
        </h3>
        {hasActiveFilters && (
          <button
            onClick={() =>
              onChange({
                productType: null,
                status: null,
                minPrice: null,
                maxPrice: null,
                sortBy: "endingSoon",
              })
            }
            className="text-[10px] text-accent hover:text-accent-hover transition-colors duration-150 uppercase tracking-wider font-semibold focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/40 rounded px-1"
          >
            Reset
          </button>
        )}
      </div>

      {/* Product Type */}
      <FilterSection title="Product Type">
        <RadioOption
          label="All Types"
          active={filters.productType === null}
          onClick={() => update({ productType: null })}
        />
        {GROUP_BUY_PRODUCT_TYPES.map((pt) => (
          <RadioOption
            key={pt.value}
            label={pt.label}
            active={filters.productType === pt.value}
            onClick={() =>
              update({ productType: filters.productType === pt.value ? null : pt.value })
            }
          />
        ))}
      </FilterSection>

      {/* Status */}
      <FilterSection title="Status">
        <RadioOption
          label="All Statuses"
          active={filters.status === null}
          onClick={() => update({ status: null })}
        />
        {(Object.entries(GROUP_BUY_LISTING_STATUS_COLORS) as [string, { label: string }][]).map(
          ([key, val]) => {
            const glossaryTerm = STATUS_GLOSSARY_TERMS[key];
            return (
              <RadioOption
                key={key}
                label={val.label}
                active={filters.status === key}
                onClick={() =>
                  update({ status: filters.status === key ? null : key })
                }
                colorDot={statusColors[key]}
                glossaryTerm={glossaryTerm}
              />
            );
          }
        )}
      </FilterSection>

      {/* Price Range */}
      <FilterSection title="Price Range" defaultOpen={false}>
        <div className="space-y-2">
          <div>
            <label className="text-xs text-text-muted mb-1 block">Min ($)</label>
            <input
              type="number"
              placeholder="0"
              value={filters.minPrice ?? ""}
              onChange={(e) =>
                update({ minPrice: e.target.value ? Number(e.target.value) : null })
              }
              className="w-full bg-bg-elevated border border-border-default rounded-md px-2.5 py-1.5 text-sm text-text-primary placeholder:text-text-muted/60 focus:border-border-accent transition-[border-color] duration-150"
            />
          </div>
          <div>
            <label className="text-xs text-text-muted mb-1 block">Max ($)</label>
            <input
              type="number"
              placeholder="Any"
              value={filters.maxPrice ?? ""}
              onChange={(e) =>
                update({ maxPrice: e.target.value ? Number(e.target.value) : null })
              }
              className="w-full bg-bg-elevated border border-border-default rounded-md px-2.5 py-1.5 text-sm text-text-primary placeholder:text-text-muted/60 focus:border-border-accent transition-[border-color] duration-150"
            />
          </div>
        </div>
      </FilterSection>

      {/* Sort */}
      <FilterSection title="Sort">
        {[
          { value: "endingSoon", label: "Ending Soon" },
          { value: "newest", label: "Newest" },
          { value: "priceLow", label: "Price: Low → High" },
          { value: "priceHigh", label: "Price: High → Low" },
          { value: "popular", label: "Most Popular" },
        ].map((opt) => (
          <RadioOption
            key={opt.value}
            label={opt.label}
            active={filters.sortBy === opt.value}
            onClick={() => update({ sortBy: opt.value })}
          />
        ))}
      </FilterSection>
    </div>
  );
}
