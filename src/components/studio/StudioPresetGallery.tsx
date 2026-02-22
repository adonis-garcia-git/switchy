"use client";

import { useState, useMemo } from "react";
import { cn } from "@/lib/utils";
import { COLORWAYS } from "@/components/3d/colorways";
import type { KeycapColorway } from "@/components/3d/colorways";
import type { KeyboardViewerConfig } from "@/lib/keyboard3d";

interface StudioPresetGalleryProps {
  activeColorway?: string;
  onApply: (update: Partial<KeyboardViewerConfig>) => void;
}

const colorwayEntries = Object.entries(COLORWAYS);

function applyColorway(key: string, colorway: KeycapColorway): Partial<KeyboardViewerConfig> {
  return {
    colorway: key,
    customColorway: colorway,
    keycapColor: colorway.alphas,
    keycapAccentColor: colorway.accents,
  };
}

export function StudioPresetGallery({ activeColorway, onApply }: StudioPresetGalleryProps) {
  return (
    <div>
      <h4 className="text-[10px] font-semibold text-text-muted uppercase tracking-wider mb-2 px-1">
        Colorway Presets
      </h4>
      <div className="flex gap-2 overflow-x-auto pb-2 -mx-1 px-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        {colorwayEntries.map(([key, colorway]) => (
          <button
            key={key}
            onClick={() => onApply(applyColorway(key, colorway))}
            className={cn(
              "shrink-0 w-[60px] flex flex-col items-center gap-1.5 p-1.5 rounded-xl transition-[border-color,transform,box-shadow] duration-150",
              "border focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/40",
              "hover:scale-[1.04] active:scale-[0.97]",
              activeColorway === key
                ? "border-accent/50 bg-accent/[0.06] shadow-[0_0_12px_rgba(232,89,12,0.12)]"
                : "border-white/[0.06] hover:border-white/[0.12] bg-white/[0.02]"
            )}
            title={colorway.name}
          >
            {/* 2x2 color grid */}
            <div className="grid grid-cols-2 gap-0.5 w-full aspect-square">
              <div
                className="rounded-tl-md"
                style={{ backgroundColor: colorway.alphas }}
              />
              <div
                className="rounded-tr-md"
                style={{ backgroundColor: colorway.modifiers }}
              />
              <div
                className="rounded-bl-md"
                style={{ backgroundColor: colorway.accents }}
              />
              <div
                className="rounded-br-md"
                style={{ backgroundColor: colorway.spacebar }}
              />
            </div>
            {/* Name */}
            <span className="text-[9px] font-medium text-text-secondary leading-tight text-center truncate w-full">
              {key.replace(/_/g, " ")}
            </span>
          </button>
        ))}
      </div>
    </div>
  );
}

// ─── Full Gallery (Presets Tab) ────────────────────────────────────

interface StudioPresetGalleryFullProps {
  activeColorway?: string;
  onApply: (update: Partial<KeyboardViewerConfig>) => void;
}

export function StudioPresetGalleryFull({ activeColorway, onApply }: StudioPresetGalleryFullProps) {
  const [search, setSearch] = useState("");

  const filtered = useMemo(() => {
    if (!search.trim()) return colorwayEntries;
    const q = search.toLowerCase();
    return colorwayEntries.filter(
      ([key, cw]) => key.toLowerCase().includes(q) || cw.name.toLowerCase().includes(q),
    );
  }, [search]);

  return (
    <div className="space-y-3">
      {/* Search */}
      <div className="relative">
        <svg
          className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-text-muted pointer-events-none"
          viewBox="0 0 16 16"
          fill="none"
          stroke="currentColor"
          strokeWidth={1.8}
        >
          <circle cx="7" cy="7" r="4.5" />
          <path d="M10.5 10.5L14 14" />
        </svg>
        <input
          type="text"
          placeholder="Search colorways..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full pl-8 pr-3 py-2 text-xs bg-white/[0.04] border border-white/[0.08] rounded-lg text-text-primary placeholder-text-muted focus:outline-none focus:border-accent/40 transition-colors duration-150"
        />
      </div>

      {/* Grid */}
      <div className="grid grid-cols-3 gap-2">
        {filtered.map(([key, colorway]) => (
          <button
            key={key}
            onClick={() => onApply(applyColorway(key, colorway))}
            className={cn(
              "flex flex-col items-center gap-2 p-2.5 rounded-xl transition-[border-color,transform,box-shadow] duration-150",
              "border focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/40",
              "hover:scale-[1.03] active:scale-[0.97]",
              activeColorway === key
                ? "border-accent/50 bg-accent/[0.08] shadow-[0_0_16px_rgba(232,89,12,0.15)]"
                : "border-white/[0.06] hover:border-white/[0.12] bg-white/[0.02]"
            )}
            title={colorway.name}
          >
            {/* 2x2 color swatch */}
            <div className="grid grid-cols-2 gap-0.5 w-full aspect-square rounded-lg overflow-hidden">
              <div style={{ backgroundColor: colorway.alphas }} />
              <div style={{ backgroundColor: colorway.modifiers }} />
              <div style={{ backgroundColor: colorway.accents }} />
              <div style={{ backgroundColor: colorway.spacebar }} />
            </div>
            {/* Name */}
            <span className={cn(
              "text-[10px] font-semibold leading-tight text-center truncate w-full",
              activeColorway === key ? "text-accent" : "text-text-secondary"
            )}>
              {colorway.name}
            </span>
          </button>
        ))}
      </div>

      {filtered.length === 0 && (
        <p className="text-center text-[11px] text-text-muted py-6">No colorways match your search</p>
      )}
    </div>
  );
}
