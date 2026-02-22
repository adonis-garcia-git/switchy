"use client";

import { cn } from "@/lib/utils";
import type { GridView } from "@/hooks/useGridView";

interface GridViewToggleProps {
  view: GridView;
  onChange: (view: GridView) => void;
}

const OPTIONS: { value: GridView; label: string; icon: React.ReactNode }[] = [
  {
    value: "grid-4",
    label: "4×4 grid",
    icon: (
      <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
        <rect x="1" y="1" width="2.5" height="2.5" rx="0.5" fill="currentColor" />
        <rect x="4.83" y="1" width="2.5" height="2.5" rx="0.5" fill="currentColor" />
        <rect x="8.67" y="1" width="2.5" height="2.5" rx="0.5" fill="currentColor" />
        <rect x="12.5" y="1" width="2.5" height="2.5" rx="0.5" fill="currentColor" />
        <rect x="1" y="4.83" width="2.5" height="2.5" rx="0.5" fill="currentColor" />
        <rect x="4.83" y="4.83" width="2.5" height="2.5" rx="0.5" fill="currentColor" />
        <rect x="8.67" y="4.83" width="2.5" height="2.5" rx="0.5" fill="currentColor" />
        <rect x="12.5" y="4.83" width="2.5" height="2.5" rx="0.5" fill="currentColor" />
        <rect x="1" y="8.67" width="2.5" height="2.5" rx="0.5" fill="currentColor" />
        <rect x="4.83" y="8.67" width="2.5" height="2.5" rx="0.5" fill="currentColor" />
        <rect x="8.67" y="8.67" width="2.5" height="2.5" rx="0.5" fill="currentColor" />
        <rect x="12.5" y="8.67" width="2.5" height="2.5" rx="0.5" fill="currentColor" />
        <rect x="1" y="12.5" width="2.5" height="2.5" rx="0.5" fill="currentColor" />
        <rect x="4.83" y="12.5" width="2.5" height="2.5" rx="0.5" fill="currentColor" />
        <rect x="8.67" y="12.5" width="2.5" height="2.5" rx="0.5" fill="currentColor" />
        <rect x="12.5" y="12.5" width="2.5" height="2.5" rx="0.5" fill="currentColor" />
      </svg>
    ),
  },
  {
    value: "grid-3",
    label: "3×3 grid",
    icon: (
      <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
        <rect x="1" y="1" width="3.33" height="3.33" rx="0.5" fill="currentColor" />
        <rect x="6.33" y="1" width="3.33" height="3.33" rx="0.5" fill="currentColor" />
        <rect x="11.67" y="1" width="3.33" height="3.33" rx="0.5" fill="currentColor" />
        <rect x="1" y="6.33" width="3.33" height="3.33" rx="0.5" fill="currentColor" />
        <rect x="6.33" y="6.33" width="3.33" height="3.33" rx="0.5" fill="currentColor" />
        <rect x="11.67" y="6.33" width="3.33" height="3.33" rx="0.5" fill="currentColor" />
        <rect x="1" y="11.67" width="3.33" height="3.33" rx="0.5" fill="currentColor" />
        <rect x="6.33" y="11.67" width="3.33" height="3.33" rx="0.5" fill="currentColor" />
        <rect x="11.67" y="11.67" width="3.33" height="3.33" rx="0.5" fill="currentColor" />
      </svg>
    ),
  },
  {
    value: "grid-2",
    label: "2×2 grid",
    icon: (
      <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
        <rect x="1" y="1" width="5.5" height="5.5" rx="0.75" fill="currentColor" />
        <rect x="9.5" y="1" width="5.5" height="5.5" rx="0.75" fill="currentColor" />
        <rect x="1" y="9.5" width="5.5" height="5.5" rx="0.75" fill="currentColor" />
        <rect x="9.5" y="9.5" width="5.5" height="5.5" rx="0.75" fill="currentColor" />
      </svg>
    ),
  },
];

export function GridViewToggle({ view, onChange }: GridViewToggleProps) {
  return (
    <div
      className="inline-flex items-center rounded-lg border border-border-subtle bg-bg-surface p-0.5 gap-0.5"
      role="radiogroup"
      aria-label="Grid density"
    >
      {OPTIONS.map((opt) => {
        const isActive = view === opt.value;
        return (
          <button
            key={opt.value}
            role="radio"
            aria-checked={isActive}
            aria-label={opt.label}
            title={opt.label}
            onClick={() => onChange(opt.value)}
            className={cn(
              "relative flex items-center justify-center w-7 h-7 rounded-md transition-colors duration-150",
              "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/40",
              "active:scale-[0.93]",
              isActive
                ? "bg-bg-elevated text-text-primary shadow-[0_1px_3px_rgba(0,0,0,0.15)]"
                : "text-text-muted hover:text-text-secondary hover:bg-bg-elevated/50"
            )}
          >
            {opt.icon}
          </button>
        );
      })}
    </div>
  );
}
