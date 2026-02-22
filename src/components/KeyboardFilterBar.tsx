"use client";

import { FilterSection, RadioOption, RangeSlider, CheckboxOption } from "@/components/filters/FilterPrimitives";
import { KeyboardFilterState, DEFAULT_KEYBOARD_FILTERS } from "@/lib/filterParams";

interface KeyboardFilterBarProps {
  filters: KeyboardFilterState;
  onChange: (filters: KeyboardFilterState) => void;
  brands: string[];
}

const SIZES = ["60%", "65%", "75%", "TKL", "full-size", "96%"];
const MOUNTINGS = ["Gasket", "Tray", "Top Mount", "Sandwich", "Plate Mount"];

export function KeyboardFilterBar({ filters, onChange, brands }: KeyboardFilterBarProps) {
  const update = (partial: Partial<KeyboardFilterState>) => {
    onChange({ ...filters, ...partial });
  };

  const hasActiveFilters =
    filters.size !== null ||
    filters.brand !== null ||
    filters.hotSwapOnly ||
    filters.wirelessOnly ||
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
            onClick={() => onChange({ ...DEFAULT_KEYBOARD_FILTERS })}
            className="text-[10px] text-accent hover:text-accent-hover transition-colors duration-150 uppercase tracking-wider font-semibold focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/40 rounded px-1"
          >
            Reset
          </button>
        )}
      </div>

      <FilterSection title="Size">
        <RadioOption label="All Sizes" active={filters.size === null} onClick={() => update({ size: null })} />
        {SIZES.map((size) => (
          <RadioOption
            key={size}
            label={size}
            active={filters.size === size}
            onClick={() => update({ size: filters.size === size ? null : size })}
          />
        ))}
      </FilterSection>

      <FilterSection title="Features">
        <CheckboxOption label="Hot-Swap" checked={filters.hotSwapOnly} onChange={(v) => update({ hotSwapOnly: v })} />
        <CheckboxOption label="Wireless" checked={filters.wirelessOnly} onChange={(v) => update({ wirelessOnly: v })} />
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
        <RangeSlider label="Min" min={0} max={700} step={25} value={filters.minPrice ?? 0} onChange={(val) => update({ minPrice: val > 0 ? val : null })} unit="$" />
        <RangeSlider label="Max" min={0} max={700} step={25} value={filters.maxPrice ?? 700} onChange={(val) => update({ maxPrice: val < 700 ? val : null })} unit="$" />
      </FilterSection>

      <FilterSection title="Sort">
        {[
          { value: "recommended", label: "Recommended" },
          { value: "name", label: "Name" },
          { value: "price-low", label: "Price (Low)" },
          { value: "price-high", label: "Price (High)" },
          { value: "brand", label: "Brand" },
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
