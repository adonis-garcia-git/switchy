"use client";

import { useMemo } from "react";
import { useQuery } from "convex/react";
import { api } from "../../../../convex/_generated/api";
import { SelectableItemCard } from "../SelectableItemCard";
import { cn } from "@/lib/utils";
import type { ComponentData } from "@/lib/types";

interface ModPickerProps {
  selected: ComponentData[];
  onToggle: (mod: ComponentData) => void;
}

const MOD_ICONS: Record<string, string> = {
  "PE Foam": "M4 6h16M4 10h16M4 14h16M4 18h16",
  "Case Foam": "M20 7l-8-4-8 4m16 0v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4",
  "Tape Mod": "M4 6h16M4 12h16M4 18h16",
  "Holee Mod": "M12 4v16m8-8H4",
  "Band-Aid Mod": "M18 12H6",
  "Switch Films": "M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z",
  "Lube (Krytox 205g0)": "M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 2h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 8.172V3L8 2z",
  "Spring Swap": "M13 10V3L4 14h7v7l9-11h-7z",
};

const PRICE_RANGE_LABELS: Record<string, { label: string; color: string }> = {
  budget: { label: "$", color: "text-emerald-400" },
  mid: { label: "$$", color: "text-amber-400" },
  premium: { label: "$$$", color: "text-accent" },
};

export function ModPicker({ selected, onToggle }: ModPickerProps) {
  const components = useQuery(api.components.list, { category: "mod" }) as ComponentData[] | undefined;

  const mods = useMemo(() => {
    return components || [];
  }, [components]);

  if (!components) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="h-24 bg-bg-elevated rounded-xl animate-pulse" />
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-3 px-3 py-2 rounded-lg bg-accent-dim border border-accent/20">
        <svg className="w-4 h-4 text-accent shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
        <p className="text-xs text-text-secondary">
          Select any mods you want to include. Each mod affects your build&apos;s sound and difficulty.
          <span className="text-text-muted"> This step is optional.</span>
        </p>
      </div>

      <p className="text-xs text-text-muted">
        {selected.length} mod{selected.length !== 1 ? "s" : ""} selected
      </p>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {mods.map((mod) => {
          const isSelected = selected.some((s) => s.name === mod.name);
          const priceInfo = PRICE_RANGE_LABELS[mod.priceRange] || PRICE_RANGE_LABELS.mid;
          const iconPath = MOD_ICONS[mod.name] || "M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4";

          return (
            <SelectableItemCard
              key={mod.name}
              selected={isSelected}
              onClick={() => onToggle(mod)}
              mode="checkbox"
            >
              <div className="pr-6">
                <div className="flex items-start gap-3">
                  <div className={cn(
                    "w-8 h-8 rounded-lg flex items-center justify-center shrink-0 mt-0.5",
                    isSelected ? "bg-accent/15 text-accent" : "bg-bg-elevated text-text-muted"
                  )}>
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={iconPath} />
                    </svg>
                  </div>
                  <div className="min-w-0">
                    <div className="flex items-center gap-2 mb-0.5">
                      <h4 className="font-semibold text-sm text-text-primary font-[family-name:var(--font-outfit)]">
                        {mod.name}
                      </h4>
                      <span className={cn("text-[10px] font-bold font-[family-name:var(--font-mono)]", priceInfo.color)}>
                        {priceInfo.label}
                      </span>
                    </div>
                    <p className="text-xs text-text-secondary leading-relaxed line-clamp-2">
                      {mod.soundEffect}
                    </p>
                  </div>
                </div>
              </div>
            </SelectableItemCard>
          );
        })}

        {mods.length === 0 && (
          <div className="col-span-full text-center py-12 text-text-muted text-sm">
            No mods found in the database. Seed the database via /seed first.
          </div>
        )}
      </div>
    </div>
  );
}
