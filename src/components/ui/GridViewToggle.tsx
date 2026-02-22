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
    label: "Dense grid",
    icon: (
      <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
        <rect x="1" y="1" width="3" height="3" rx="0.5" fill="currentColor" />
        <rect x="5.5" y="1" width="3" height="3" rx="0.5" fill="currentColor" />
        <rect x="10" y="1" width="3" height="3" rx="0.5" fill="currentColor" />
        <rect x="1" y="5.5" width="3" height="3" rx="0.5" fill="currentColor" />
        <rect x="5.5" y="5.5" width="3" height="3" rx="0.5" fill="currentColor" />
        <rect x="10" y="5.5" width="3" height="3" rx="0.5" fill="currentColor" />
        <rect x="1" y="10" width="3" height="3" rx="0.5" fill="currentColor" />
        <rect x="5.5" y="10" width="3" height="3" rx="0.5" fill="currentColor" />
        <rect x="10" y="10" width="3" height="3" rx="0.5" fill="currentColor" />
      </svg>
    ),
  },
  {
    value: "grid-3",
    label: "Comfortable grid",
    icon: (
      <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
        <rect x="1" y="1" width="4.5" height="4.5" rx="0.75" fill="currentColor" />
        <rect x="7.5" y="1" width="4.5" height="4.5" rx="0.75" fill="currentColor" />
        <rect x="1" y="7.5" width="4.5" height="4.5" rx="0.75" fill="currentColor" />
        <rect x="7.5" y="7.5" width="4.5" height="4.5" rx="0.75" fill="currentColor" />
      </svg>
    ),
  },
  {
    value: "list",
    label: "List view",
    icon: (
      <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
        <rect x="1" y="2" width="14" height="2.5" rx="0.5" fill="currentColor" />
        <rect x="1" y="6.75" width="14" height="2.5" rx="0.5" fill="currentColor" />
        <rect x="1" y="11.5" width="14" height="2.5" rx="0.5" fill="currentColor" />
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
