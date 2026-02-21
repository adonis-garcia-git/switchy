"use client";

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

function TypeToggle({
  type,
  label,
  active,
  onClick,
}: {
  type: "linear" | "tactile" | "clicky";
  label: string;
  active: boolean;
  onClick: () => void;
}) {
  const colors = SWITCH_TYPE_COLORS[type];
  return (
    <button
      onClick={onClick}
      className={cn(
        "px-3 py-1.5 rounded-lg text-sm font-medium transition-all border",
        active
          ? `${colors.bg} ${colors.text} ${colors.border}`
          : "border-border-subtle text-text-muted hover:text-text-secondary hover:border-border-default"
      )}
    >
      {label}
    </button>
  );
}

export function FilterBar({ filters, onChange, brands }: FilterBarProps) {
  const update = (partial: Partial<FilterState>) => {
    onChange({ ...filters, ...partial });
  };

  return (
    <div className="space-y-4 p-4 rounded-xl bg-bg-surface border border-border-subtle">
      {/* Type toggles */}
      <div>
        <label className="block text-xs text-text-muted uppercase tracking-wider mb-2">
          Type
        </label>
        <div className="flex gap-2 flex-wrap">
          <button
            onClick={() => update({ type: null })}
            className={cn(
              "px-3 py-1.5 rounded-lg text-sm font-medium transition-all border",
              filters.type === null
                ? "border-accent/30 bg-accent-dim text-accent"
                : "border-border-subtle text-text-muted hover:text-text-secondary"
            )}
          >
            All
          </button>
          {(["linear", "tactile", "clicky"] as const).map((type) => (
            <TypeToggle
              key={type}
              type={type}
              label={type.charAt(0).toUpperCase() + type.slice(1)}
              active={filters.type === type}
              onClick={() =>
                update({ type: filters.type === type ? null : type })
              }
            />
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Sound Character */}
        <div>
          <label className="block text-xs text-text-muted uppercase tracking-wider mb-2">
            Sound Character
          </label>
          <select
            value={filters.soundCharacter || ""}
            onChange={(e) =>
              update({ soundCharacter: e.target.value || null })
            }
            className="w-full bg-bg-elevated border border-border-subtle rounded-lg px-3 py-2 text-sm text-text-primary"
          >
            <option value="">All</option>
            {Object.entries(SOUND_CHARACTER_LABELS).map(([key, label]) => (
              <option key={key} value={key}>
                {label}
              </option>
            ))}
          </select>
        </div>

        {/* Brand */}
        <div>
          <label className="block text-xs text-text-muted uppercase tracking-wider mb-2">
            Brand
          </label>
          <select
            value={filters.brand || ""}
            onChange={(e) => update({ brand: e.target.value || null })}
            className="w-full bg-bg-elevated border border-border-subtle rounded-lg px-3 py-2 text-sm text-text-primary"
          >
            <option value="">All Brands</option>
            {brands.map((brand) => (
              <option key={brand} value={brand}>
                {brand}
              </option>
            ))}
          </select>
        </div>

        {/* Sort */}
        <div>
          <label className="block text-xs text-text-muted uppercase tracking-wider mb-2">
            Sort By
          </label>
          <select
            value={filters.sortBy}
            onChange={(e) => update({ sortBy: e.target.value })}
            className="w-full bg-bg-elevated border border-border-subtle rounded-lg px-3 py-2 text-sm text-text-primary"
          >
            <option value="communityRating">Rating</option>
            <option value="pricePerSwitch">Price</option>
            <option value="actuationForceG">Force</option>
            <option value="name">Name</option>
          </select>
        </div>

        {/* Sort Order */}
        <div>
          <label className="block text-xs text-text-muted uppercase tracking-wider mb-2">
            Order
          </label>
          <button
            onClick={() =>
              update({
                sortOrder: filters.sortOrder === "asc" ? "desc" : "asc",
              })
            }
            className="w-full bg-bg-elevated border border-border-subtle rounded-lg px-3 py-2 text-sm text-text-primary text-left hover:border-border-default transition-colors"
          >
            {filters.sortOrder === "asc" ? "Ascending ↑" : "Descending ↓"}
          </button>
        </div>
      </div>

      {/* Force range */}
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-xs text-text-muted uppercase tracking-wider mb-2">
            Min Force (g)
          </label>
          <input
            type="range"
            min={20}
            max={100}
            step={5}
            value={filters.minForce}
            onChange={(e) => update({ minForce: Number(e.target.value) })}
            className="w-full accent-accent"
          />
          <span className="text-xs font-mono text-text-secondary">
            {filters.minForce}g
          </span>
        </div>
        <div>
          <label className="block text-xs text-text-muted uppercase tracking-wider mb-2">
            Max Force (g)
          </label>
          <input
            type="range"
            min={20}
            max={100}
            step={5}
            value={filters.maxForce}
            onChange={(e) => update({ maxForce: Number(e.target.value) })}
            className="w-full accent-accent"
          />
          <span className="text-xs font-mono text-text-secondary">
            {filters.maxForce}g
          </span>
        </div>
      </div>
    </div>
  );
}
