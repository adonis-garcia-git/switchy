"use client";

import { cn } from "@/lib/utils";

interface ColorOption {
  id: string;
  label: string;
  color?: string;
}

interface ColorPickerProps {
  options: ColorOption[];
  selected: string | null;
  onSelect: (id: string) => void;
}

export function ColorPicker({ options, selected, onSelect }: ColorPickerProps) {
  return (
    <div className="grid grid-cols-4 sm:grid-cols-8 gap-3">
      {options.map((option) => (
        <button
          key={option.id}
          onClick={() => onSelect(option.id)}
          className={cn(
            "group flex flex-col items-center gap-2 p-3 rounded-xl border transition-[border-color,transform] duration-200",
            "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/40",
            "active:scale-[0.95]",
            selected === option.id
              ? "border-accent bg-accent-dim"
              : "border-border-subtle bg-bg-surface hover:border-border-accent"
          )}
        >
          <div
            className={cn(
              "w-10 h-10 rounded-full border-2 transition-[border-color,box-shadow] duration-200",
              selected === option.id
                ? "border-accent shadow-[0_0_12px_rgba(232,89,12,0.3)]"
                : "border-border-default group-hover:border-border-accent"
            )}
            style={{ backgroundColor: option.color || "#666" }}
          />
          <span className={cn(
            "text-[11px] font-medium transition-colors duration-150",
            selected === option.id ? "text-accent" : "text-text-muted"
          )}>
            {option.label}
          </span>
        </button>
      ))}
    </div>
  );
}
