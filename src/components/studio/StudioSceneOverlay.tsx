"use client";

import { useState, useRef, useEffect } from "react";
import { cn } from "@/lib/utils";
import {
  StudioPillGroup,
  StudioSlider,
  StudioToggle,
  StudioColorPicker,
} from "./StudioControls";
import type { KeyboardViewerConfig } from "@/lib/keyboard3d";

// ─── Icons ─────────────────────────────────────────────────────────

const IconScene = () => (
  <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth={1.5} className="w-4 h-4">
    <circle cx="8" cy="6" r="3" />
    <path d="M2 13l3-4 2 2 3-3.5 4 5.5" />
  </svg>
);

const IconChevron = ({ open }: { open: boolean }) => (
  <svg
    className={cn("w-3.5 h-3.5 transition-transform duration-200", open && "rotate-180")}
    fill="none"
    viewBox="0 0 24 24"
    stroke="currentColor"
    strokeWidth={2}
  >
    <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
  </svg>
);

const IconClose = () => (
  <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth={1.8} className="w-3.5 h-3.5">
    <path d="M4 4l8 8M12 4l-8 8" strokeLinecap="round" />
  </svg>
);

// Camera preset icons — small visual indicators
const cameraIcons: Record<string, { label: string; icon: JSX.Element }> = {
  default: {
    label: "Default",
    icon: (
      <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth={1.4} className="w-full h-full">
        <rect x="3" y="5" width="14" height="10" rx="2" />
        <circle cx="10" cy="10" r="2.5" />
      </svg>
    ),
  },
  "top-down": {
    label: "Top",
    icon: (
      <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth={1.4} className="w-full h-full">
        <circle cx="10" cy="10" r="6" />
        <circle cx="10" cy="10" r="2" />
        <path d="M10 4v2M10 14v2M4 10h2M14 10h2" />
      </svg>
    ),
  },
  hero: {
    label: "Hero",
    icon: (
      <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth={1.4} className="w-full h-full">
        <path d="M3 14l7-8 7 8" />
        <path d="M6 14l4-5 4 5" />
      </svg>
    ),
  },
  side: {
    label: "Side",
    icon: (
      <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth={1.4} className="w-full h-full">
        <path d="M4 14V6h12v8" />
        <path d="M4 10h12" />
      </svg>
    ),
  },
  closeup: {
    label: "Close",
    icon: (
      <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth={1.4} className="w-full h-full">
        <circle cx="9" cy="9" r="5" />
        <path d="M13 13l4 4" strokeLinecap="round" />
      </svg>
    ),
  },
  freeform: {
    label: "Free",
    icon: (
      <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth={1.4} className="w-full h-full">
        <path d="M10 3v14M3 10h14" strokeLinecap="round" />
        <path d="M10 3l-2 2M10 3l2 2M10 17l-2-2M10 17l2-2M3 10l2-2M3 10l2 2M17 10l-2-2M17 10l-2 2" strokeLinecap="round" />
      </svg>
    ),
  },
};

// Environment quick icons
const envIcons: Record<string, string> = {
  studio: "S",
  city: "C",
  sunset: "Su",
  dawn: "D",
  apartment: "A",
  warehouse: "W",
};

// ─── Component ─────────────────────────────────────────────────────

interface StudioSceneOverlayProps {
  config: KeyboardViewerConfig;
  onUpdate: (update: Partial<KeyboardViewerConfig>) => void;
}

export function StudioSceneOverlay({ config, onUpdate }: StudioSceneOverlayProps) {
  const [open, setOpen] = useState(false);
  const panelRef = useRef<HTMLDivElement>(null);

  // Close on click outside
  useEffect(() => {
    if (!open) return;
    function handleClick(e: MouseEvent) {
      if (panelRef.current && !panelRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, [open]);

  // Close on Escape
  useEffect(() => {
    if (!open) return;
    function handleKey(e: KeyboardEvent) {
      if (e.key === "Escape") setOpen(false);
    }
    document.addEventListener("keydown", handleKey);
    return () => document.removeEventListener("keydown", handleKey);
  }, [open]);

  const currentCamera = config.cameraPreset || "default";
  const currentEnv = config.environment || "studio";

  return (
    <div ref={panelRef} className="relative">
      {/* ── Collapsed: compact camera + environment quick-bar ── */}
      {!open && (
        <div className="flex items-center gap-1.5 animate-in fade-in duration-200">
          {/* Camera preset quick buttons */}
          <div className="flex items-center gap-0.5 bg-overlay backdrop-blur-xl border border-border-default rounded-xl p-1">
            {Object.entries(cameraIcons).map(([key, { label, icon }]) => (
              <button
                key={key}
                onClick={() => onUpdate({ cameraPreset: key as KeyboardViewerConfig["cameraPreset"] })}
                title={label}
                className={cn(
                  "w-7 h-7 flex items-center justify-center rounded-lg transition-[background-color,color,transform] duration-150",
                  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/40",
                  "active:scale-[0.92]",
                  currentCamera === key
                    ? "bg-accent/20 text-accent"
                    : "text-text-muted hover:text-text-primary hover:bg-bg-tint-strong"
                )}
              >
                <span className="w-3.5 h-3.5">{icon}</span>
              </button>
            ))}
          </div>

          {/* Expand button */}
          <button
            onClick={() => setOpen(true)}
            className={cn(
              "flex items-center gap-1.5 h-9 px-3 rounded-xl",
              "bg-overlay backdrop-blur-xl border border-border-default",
              "text-text-secondary hover:text-text-primary hover:bg-overlay-dense",
              "transition-[background-color,color] duration-150",
              "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/40",
            )}
            title="Scene settings"
          >
            <IconScene />
            <span className="text-[10px] font-semibold uppercase tracking-wider">{currentEnv}</span>
            <IconChevron open={false} />
          </button>
        </div>
      )}

      {/* ── Expanded: full scene controls panel ── */}
      {open && (
        <div
          className={cn(
            "w-[280px] rounded-2xl overflow-hidden",
            "bg-overlay-dense backdrop-blur-2xl",
            "border border-border-default",
            "studio-overlay-shadow",
            "animate-in fade-in slide-in-from-top-2 duration-200",
          )}
        >
          {/* Panel header */}
          <div className="flex items-center justify-between px-4 py-3 border-b border-border-subtle">
            <div className="flex items-center gap-2">
              <span className="text-accent/70"><IconScene /></span>
              <span className="text-xs font-semibold text-text-primary uppercase tracking-wider">Scene</span>
            </div>
            <button
              onClick={() => setOpen(false)}
              className={cn(
                "w-6 h-6 flex items-center justify-center rounded-lg",
                "text-text-muted hover:text-text-primary hover:bg-bg-tint-strong",
                "transition-[background-color,color] duration-150",
                "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/40",
              )}
            >
              <IconClose />
            </button>
          </div>

          {/* Panel body */}
          <div className="px-4 py-3.5 space-y-4 max-h-[60vh] overflow-y-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
            {/* Environment */}
            <StudioPillGroup
              label="Environment"
              value={currentEnv}
              options={[
                { value: "studio", label: "Studio" },
                { value: "city", label: "City" },
                { value: "sunset", label: "Sunset" },
                { value: "dawn", label: "Dawn" },
                { value: "apartment", label: "Apartment" },
                { value: "warehouse", label: "Warehouse" },
              ]}
              onChange={(v) => onUpdate({ environment: v as KeyboardViewerConfig["environment"] })}
            />

            {/* Camera */}
            <div>
              <label className="text-[10px] font-semibold text-text-muted uppercase tracking-wider mb-2 block">
                Camera
              </label>
              <div className="grid grid-cols-6 gap-1">
                {Object.entries(cameraIcons).map(([key, { label, icon }]) => (
                  <button
                    key={key}
                    onClick={() => onUpdate({ cameraPreset: key as KeyboardViewerConfig["cameraPreset"] })}
                    className={cn(
                      "flex flex-col items-center gap-1 py-1.5 rounded-lg transition-[background-color,color,border-color,transform] duration-150",
                      "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/40",
                      "active:scale-[0.94]",
                      "border",
                      currentCamera === key
                        ? "bg-accent/15 text-accent border-accent/30"
                        : "bg-bg-tint text-text-muted border-border-subtle hover:bg-bg-tint-strong hover:text-text-secondary"
                    )}
                  >
                    <span className="w-4 h-4">{icon}</span>
                    <span className="text-[8px] font-semibold uppercase tracking-wider leading-none">{label}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Typing Angle */}
            <StudioSlider
              label="Typing Angle"
              value={config.typingAngle ?? 6}
              min={0}
              max={12}
              step={1}
              onChange={(v) => onUpdate({ typingAngle: v })}
              formatValue={(v) => `${v}°`}
            />

            {/* Desk */}
            <StudioToggle
              label="Show Desk"
              value={config.showDesk ?? false}
              onChange={(v) => onUpdate({ showDesk: v })}
            />
            {config.showDesk && (
              <div className="space-y-3 pl-0.5">
                <StudioColorPicker
                  label="Desk Color"
                  value={config.deskColor || "#3d3d3d"}
                  onChange={(v) => onUpdate({ deskColor: v })}
                />
                <StudioPillGroup
                  label="Desk Material"
                  value={config.deskMaterial || "wood"}
                  options={[
                    { value: "wood", label: "Wood" },
                    { value: "marble", label: "Marble" },
                    { value: "leather", label: "Leather" },
                    { value: "concrete", label: "Concrete" },
                    { value: "fabric", label: "Fabric" },
                    { value: "metal", label: "Metal" },
                  ]}
                  onChange={(v) => onUpdate({ deskMaterial: v as KeyboardViewerConfig["deskMaterial"] })}
                />
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
