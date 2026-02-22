"use client";

import { cn } from "@/lib/utils";
import { Input } from "@/components/ui/Input";

interface FilterChip {
  label: string;
  value: string;
  active: boolean;
}

interface FilterBarProps {
  searchValue: string;
  onSearchChange: (value: string) => void;
  searchPlaceholder?: string;
  filters?: {
    label: string;
    chips: FilterChip[];
    onChange: (value: string) => void;
  }[];
  className?: string;
}

export function FilterBar({
  searchValue,
  onSearchChange,
  searchPlaceholder = "Search...",
  filters,
  className,
}: FilterBarProps) {
  return (
    <div className={cn("space-y-3", className)}>
      {/* Search input */}
      <div className="relative">
        <svg
          className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted pointer-events-none"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
          />
        </svg>
        <Input
          value={searchValue}
          onChange={(e) => onSearchChange(e.target.value)}
          placeholder={searchPlaceholder}
          className="pl-10 bg-bg-elevated/60 border-border-subtle"
        />
        {searchValue && (
          <button
            onClick={() => onSearchChange("")}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-text-muted hover:text-text-secondary transition-color duration-150"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        )}
      </div>

      {/* Filter chip rows */}
      {filters && filters.length > 0 && (
        <div className="space-y-2">
          {filters.map((filterGroup) => (
            <div key={filterGroup.label} className="flex items-center gap-2 flex-wrap">
              <span className="text-[10px] uppercase tracking-wider text-text-muted font-medium shrink-0 w-14">
                {filterGroup.label}
              </span>
              <div className="flex gap-1.5 flex-wrap">
                {filterGroup.chips.map((chip) => (
                  <button
                    key={chip.value}
                    onClick={() => filterGroup.onChange(chip.active ? "" : chip.value)}
                    className={cn(
                      "px-2.5 py-1 text-xs font-medium rounded-md transition-[background-color,color,border-color] duration-150",
                      "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/40",
                      "active:scale-[0.96]",
                      chip.active
                        ? "bg-accent/15 text-accent border border-accent/30"
                        : "bg-bg-elevated text-text-secondary border border-border-subtle hover:border-border-default hover:text-text-primary"
                    )}
                  >
                    {chip.label}
                  </button>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
