"use client";

import { useState } from "react";
import { cn } from "@/lib/utils";

export function FilterSection({
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

export function RadioOption({
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

export function RangeSlider({
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
          [&::-webkit-slider-thumb]:shadow-[0_0_8px_rgba(232,89,12,0.3)]
          [&::-webkit-slider-thumb]:cursor-pointer"
      />
    </div>
  );
}

export function CheckboxOption({
  label,
  checked,
  onChange,
}: {
  label: string;
  checked: boolean;
  onChange: (checked: boolean) => void;
}) {
  return (
    <label className="flex items-center gap-2 px-2.5 py-1.5 rounded-md text-sm text-text-secondary hover:text-text-primary hover:bg-bg-elevated transition-colors duration-150 cursor-pointer select-none group">
      <input
        type="checkbox"
        checked={checked}
        onChange={(e) => onChange(e.target.checked)}
        className="w-3.5 h-3.5 rounded border-border-default bg-bg-surface accent-accent cursor-pointer"
      />
      <span className="group-hover:text-text-primary transition-colors duration-150 truncate">
        {label}
      </span>
    </label>
  );
}
