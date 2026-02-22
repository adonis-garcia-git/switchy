"use client";

import { FilterSection, RadioOption, RangeSlider } from "@/components/filters/FilterPrimitives";
import { KEYCAP_PROFILES, KEYCAP_MATERIALS } from "@/lib/constants";
import type { KeycapFilterState } from "@/lib/types";
import { DEFAULT_KEYCAP_FILTERS } from "@/lib/filterParams";

interface KeycapFilterBarProps {
  filters: KeycapFilterState;
  onChange: (filters: KeycapFilterState) => void;
  brands: string[];
}

export function KeycapFilterBar({ filters, onChange, brands }: KeycapFilterBarProps) {
  const update = (partial: Partial<KeycapFilterState>) => {
    onChange({ ...filters, ...partial });
  };

  const hasActiveFilters =
    filters.profile !== null ||
    filters.material !== null ||
    filters.brand !== null ||
    filters.minPrice != null ||
    filters.maxPrice != null;

  return (
    <div className="space-y-0">
      <div className="flex items-center justify-between pb-3 mb-1 border-b border-border-subtle">
        <h3 className="text-xs font-semibold text-text-muted uppercase tracking-wider">
          Filters
        </h3>
        {hasActiveFilters && (
          <button
            onClick={() => onChange({ ...DEFAULT_KEYCAP_FILTERS })}
            className="text-[10px] text-accent hover:text-accent-hover transition-colors duration-150 uppercase tracking-wider font-semibold focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/40 rounded px-1"
          >
            Reset
          </button>
        )}
      </div>

      <FilterSection title="Profile">
        <RadioOption label="All Profiles" active={filters.profile === null} onClick={() => update({ profile: null })} />
        {KEYCAP_PROFILES.map((profile) => (
          <RadioOption
            key={profile}
            label={profile}
            active={filters.profile === profile}
            onClick={() => update({ profile: filters.profile === profile ? null : profile })}
          />
        ))}
      </FilterSection>

      <FilterSection title="Material">
        <RadioOption label="All Materials" active={filters.material === null} onClick={() => update({ material: null })} />
        {KEYCAP_MATERIALS.map((mat) => (
          <RadioOption
            key={mat}
            label={mat}
            active={filters.material === mat}
            onClick={() => update({ material: filters.material === mat ? null : mat })}
          />
        ))}
      </FilterSection>

      <FilterSection title="Brand" defaultOpen={false}>
        <RadioOption label="All Brands" active={filters.brand === null} onClick={() => update({ brand: null })} />
        {brands.map((brand) => (
          <RadioOption
            key={brand}
            label={brand}
            active={filters.brand === brand}
            onClick={() => update({ brand: filters.brand === brand ? null : brand })}
          />
        ))}
      </FilterSection>

      <FilterSection title="Price">
        <RangeSlider label="Min" min={0} max={300} step={10} value={filters.minPrice ?? 0} onChange={(val) => update({ minPrice: val > 0 ? val : null })} unit="$" />
        <RangeSlider label="Max" min={0} max={300} step={10} value={filters.maxPrice ?? 300} onChange={(val) => update({ maxPrice: val < 300 ? val : null })} unit="$" />
      </FilterSection>

      <FilterSection title="Sort">
        {[
          { value: "name", label: "Name" },
          { value: "price", label: "Price" },
          { value: "brand", label: "Brand" },
        ].map((opt) => (
          <RadioOption
            key={opt.value}
            label={opt.label}
            active={filters.sortBy === opt.value}
            onClick={() => update({ sortBy: opt.value })}
          />
        ))}
        <div className="pt-2">
          <button
            onClick={() => update({ sortOrder: filters.sortOrder === "asc" ? "desc" : "asc" })}
            className="flex items-center gap-2 w-full px-2.5 py-1.5 rounded-md text-sm text-text-secondary hover:text-text-primary hover:bg-bg-elevated transition-colors duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/40 active:scale-[0.98]"
          >
            <svg
              className={`w-3.5 h-3.5 transition-transform duration-150 ${filters.sortOrder === "asc" ? "rotate-180" : ""}`}
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
            </svg>
            {filters.sortOrder === "asc" ? "Ascending" : "Descending"}
          </button>
        </div>
      </FilterSection>
    </div>
  );
}
