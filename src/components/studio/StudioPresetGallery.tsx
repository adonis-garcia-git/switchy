"use client";

import { cn } from "@/lib/utils";
import { COLORWAYS } from "@/components/3d/colorways";
import type { KeycapColorway } from "@/components/3d/colorways";
import type { KeyboardViewerConfig } from "@/lib/keyboard3d";

interface StudioPresetGalleryProps {
  activeColorway?: string;
  onApply: (update: Partial<KeyboardViewerConfig>) => void;
}

const colorwayEntries = Object.entries(COLORWAYS);

export function StudioPresetGallery({ activeColorway, onApply }: StudioPresetGalleryProps) {
  const handleApply = (key: string, colorway: KeycapColorway) => {
    onApply({
      colorway: key,
      customColorway: colorway,
      keycapColor: colorway.alphas,
      keycapAccentColor: colorway.accents,
    });
  };

  return (
    <div>
      <h4 className="text-[10px] font-semibold text-text-muted uppercase tracking-wider mb-2 px-1">
        Colorway Presets
      </h4>
      <div className="flex gap-2 overflow-x-auto pb-2 -mx-1 px-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        {colorwayEntries.map(([key, colorway]) => (
          <button
            key={key}
            onClick={() => handleApply(key, colorway)}
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
            {/* 2×2 color grid */}
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
