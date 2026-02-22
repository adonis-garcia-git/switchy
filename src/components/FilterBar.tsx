"use client";

import { useState } from "react";
import { cn } from "@/lib/utils";
import { SWITCH_TYPE_COLORS, SOUND_CHARACTER_LABELS } from "@/lib/constants";

export interface FilterState {
  type: string | null;
  soundCharacter: string | null;
  soundPitch: string | null;
  soundVolume: string | null;
  minForce: number;
  maxForce: number;
  minPrice: number;
  maxPrice: number;
  brand: string | null;
  sortBy: string;
  sortOrder: "asc" | "desc";
}

interface FilterBarProps {
  filters: FilterState;
  onChange: (filters: FilterState) => void;
  brands: string[];
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
}: {
  label: string;
  active: boolean;
  onClick: () => void;
  colorDot?: string;
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
      <span className="truncate">{label}</span>
      {active && (
        <svg className="w-3.5 h-3.5 ml-auto text-accent flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
          <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
        </svg>
      )}
    </button>
  );
}

function RangeSlider({
  label,
  min,
  max,
  step,
  value,
  onChange,
  unit,
}: {
  label: string;
  min: number;
  max: number;
  step: number;
  value: number;
  onChange: (val: number) => void;
  unit: string;
}) {
  return (
    <div>
      <div className="flex items-center justify-between mb-1.5">
        <span className="text-xs text-text-muted">{label}</span>
        <span className="text-xs font-mono text-accent">
          {value}{unit}
        </span>
      </div>
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        className="w-full accent-accent h-1 bg-bg-elevated rounded-full appearance-none cursor-pointer
          [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-3.5 [&::-webkit-slider-thumb]:h-3.5
          [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-accent
          [&::-webkit-slider-thumb]:shadow-[0_0_8px_rgba(118,185,0,0.3)]
          [&::-webkit-slider-thumb]:cursor-pointer"
      />
    </div>
  );
}

export function FilterBar({ filters, onChange, brands }: FilterBarProps) {
  const update = (partial: Partial<FilterState>) => {
    onChange({ ...filters, ...partial });
  };

  const typeColors: Record<string, string> = {
    linear: SWITCH_TYPE_COLORS.linear.hex,
    tactile: SWITCH_TYPE_COLORS.tactile.hex,
    clicky: SWITCH_TYPE_COLORS.clicky.hex,
  };

  const hasActiveFilters =
    filters.type !== null ||
    filters.soundCharacter !== null ||
    filters.brand !== null ||
    filters.minForce > 20 ||
    filters.maxForce < 100;

  return (
    <div className="space-y-0">
      {/* Header */}
      <div className="flex items-center justify-between pb-3 mb-1 border-b border-border-subtle">
        <h3 className="text-xs font-semibold text-text-muted uppercase tracking-wider">
          Filters
        </h3>
        {hasActiveFilters && (
          <button
            onClick={() =>
              onChange({
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
              })
            }
            className="text-[10px] text-accent hover:text-accent-hover transition-colors duration-150 uppercase tracking-wider font-semibold focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/40 rounded px-1"
          >
            Reset
          </button>
        )}
      </div>

      {/* Switch Type */}
      <FilterSection title="Type">
        <RadioOption
          label="All Types"
          active={filters.type === null}
          onClick={() => update({ type: null })}
        />
        {(["linear", "tactile", "clicky"] as const).map((type) => (
          <RadioOption
            key={type}
            label={type.charAt(0).toUpperCase() + type.slice(1)}
            active={filters.type === type}
            onClick={() => update({ type: filters.type === type ? null : type })}
            colorDot={typeColors[type]}
          />
        ))}
      </FilterSection>

      {/* Sound Character */}
      <FilterSection title="Sound">
        <RadioOption
          label="All Sounds"
          active={filters.soundCharacter === null}
          onClick={() => update({ soundCharacter: null })}
        />
        {Object.entries(SOUND_CHARACTER_LABELS).map(([key, label]) => (
          <RadioOption
            key={key}
            label={label}
            active={filters.soundCharacter === key}
            onClick={() =>
              update({
                soundCharacter: filters.soundCharacter === key ? null : key,
              })
            }
          />
        ))}
      </FilterSection>

      {/* Brand */}
      <FilterSection title="Brand" defaultOpen={false}>
        <RadioOption
          label="All Brands"
          active={filters.brand === null}
          onClick={() => update({ brand: null })}
        />
        {brands.map((brand) => (
          <RadioOption
            key={brand}
            label={brand}
            active={filters.brand === brand}
            onClick={() =>
              update({ brand: filters.brand === brand ? null : brand })
            }
          />
        ))}
      </FilterSection>

      {/* Force Range */}
      <FilterSection title="Force">
        <RangeSlider
          label="Min"
          min={20}
          max={100}
          step={5}
          value={filters.minForce}
          onChange={(val) => update({ minForce: val })}
          unit="g"
        />
        <RangeSlider
          label="Max"
          min={20}
          max={100}
          step={5}
          value={filters.maxForce}
          onChange={(val) => update({ maxForce: val })}
          unit="g"
        />
      </FilterSection>

      {/* Sort */}
      <FilterSection title="Sort">
        {[
          { value: "communityRating", label: "Rating" },
          { value: "pricePerSwitch", label: "Price" },
          { value: "actuationForceG", label: "Force" },
          { value: "name", label: "Name" },
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
            onClick={() =>
              update({
                sortOrder: filters.sortOrder === "asc" ? "desc" : "asc",
              })
            }
            className="flex items-center gap-2 w-full px-2.5 py-1.5 rounded-md text-sm text-text-secondary hover:text-text-primary hover:bg-bg-elevated transition-colors duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/40 active:scale-[0.98]"
          >
            <svg
              className={cn(
                "w-3.5 h-3.5 transition-transform duration-150",
                filters.sortOrder === "asc" && "rotate-180"
              )}
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
