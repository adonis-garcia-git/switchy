"use client";

import { useState, useCallback } from "react";
import { cn } from "@/lib/utils";
import { KEYCAP_COLOR_PRESETS } from "@/lib/keyCustomization";
import type { PerKeyOverride } from "@/lib/keyCustomization";
import { ARTISAN_PRESETS } from "@/components/3d/artisanKeycaps";
import type { ArtisanPreset } from "@/components/3d/artisanKeycaps";

interface KeyCustomizationPanelProps {
  selectedCount: number;
  onApplyOverride: (override: PerKeyOverride) => void;
  onQuickAction: (action: "alphas" | "modifiers" | "functionRow" | "reset") => void;
  onRemoveArtisan: () => void;
  activeTab?: string;
  onTabChange?: (tab: string) => void;
}

export function KeyCustomizationPanel({
  selectedCount,
  onApplyOverride,
  onQuickAction,
  onRemoveArtisan,
  activeTab = "colors",
  onTabChange,
}: KeyCustomizationPanelProps) {
  const [customColor, setCustomColor] = useState("#E8590C");
  const [legendText, setLegendText] = useState("");
  const [legendColor, setLegendColor] = useState("#ffffff");

  const handleColorSelect = useCallback((hex: string) => {
    onApplyOverride({ color: hex });
  }, [onApplyOverride]);

  const handleCustomColorChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const hex = e.target.value;
    setCustomColor(hex);
    onApplyOverride({ color: hex });
  }, [onApplyOverride]);

  const handleLegendApply = useCallback(() => {
    onApplyOverride({ legendText, legendColor });
  }, [onApplyOverride, legendText, legendColor]);

  const handleArtisanApply = useCallback((preset: ArtisanPreset) => {
    onApplyOverride({
      artisan: preset.style,
      color: preset.primaryColor,
    });
  }, [onApplyOverride]);

  const tabs = [
    { value: "colors", label: "Colors" },
    { value: "artisans", label: "Artisans" },
    { value: "legends", label: "Legends" },
  ];

  return (
    <div className="flex flex-col h-full">
      {/* Tab bar */}
      <div className="flex gap-0.5 p-1 bg-bg-surface/60 border border-border-subtle/50 rounded-lg mb-4">
        {tabs.map((tab) => (
          <button
            key={tab.value}
            onClick={() => onTabChange?.(tab.value)}
            className={cn(
              "flex-1 px-3 py-1.5 text-xs font-semibold rounded-md transition-[background-color,color] duration-150",
              "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/40",
              activeTab === tab.value
                ? "bg-accent text-bg-primary shadow-[0_1px_6px_rgba(232,89,12,0.2)]"
                : "text-text-secondary hover:text-text-primary hover:bg-bg-elevated"
            )}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Selection indicator */}
      <div className="text-xs text-text-muted mb-3">
        {selectedCount > 0 ? (
          <span className="font-medium">
            <span className="text-accent">{selectedCount}</span> key{selectedCount !== 1 ? "s" : ""} selected
          </span>
        ) : (
          <span>Click keys on the 3D model to select them</span>
        )}
      </div>

      {/* Colors tab */}
      {activeTab === "colors" && (
        <div className="space-y-4 overflow-y-auto flex-1">
          {/* Color presets grid */}
          <div>
            <h4 className="text-xs font-semibold text-text-secondary mb-2 uppercase tracking-wider">Keycap Colors</h4>
            <div className="grid grid-cols-7 gap-1.5">
              {KEYCAP_COLOR_PRESETS.map((preset, idx) => (
                <button
                  key={preset.hex}
                  onClick={() => handleColorSelect(preset.hex)}
                  disabled={selectedCount === 0}
                  className={cn(
                    "w-full aspect-square rounded-lg border-2 transition-transform duration-150",
                    "hover:scale-110 active:scale-95",
                    "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/40",
                    "disabled:opacity-30 disabled:cursor-not-allowed disabled:hover:scale-100",
                    "border-transparent hover:border-white/30"
                  )}
                  style={{ backgroundColor: preset.hex }}
                  title={`${preset.name} (${idx + 1 <= 9 ? idx + 1 : ""})`}
                />
              ))}
            </div>
          </div>

          {/* Custom color */}
          <div>
            <h4 className="text-xs font-semibold text-text-secondary mb-2 uppercase tracking-wider">Custom Color</h4>
            <div className="flex items-center gap-2">
              <label className="relative w-10 h-10 rounded-lg overflow-hidden border border-border-subtle cursor-pointer group">
                <input
                  type="color"
                  value={customColor}
                  onChange={handleCustomColorChange}
                  disabled={selectedCount === 0}
                  className="absolute inset-0 w-full h-full cursor-pointer opacity-0"
                />
                <div className="w-full h-full" style={{ backgroundColor: customColor }} />
                <div className="absolute inset-0 bg-white/0 group-hover:bg-white/10 transition-colors duration-150" />
              </label>
              <input
                type="text"
                value={customColor}
                onChange={(e) => {
                  setCustomColor(e.target.value);
                  if (/^#[0-9a-fA-F]{6}$/.test(e.target.value)) {
                    onApplyOverride({ color: e.target.value });
                  }
                }}
                disabled={selectedCount === 0}
                className="flex-1 px-3 py-2 text-xs font-mono bg-bg-elevated border border-border-subtle rounded-lg text-text-primary placeholder-text-muted focus:outline-none focus:border-accent/50 disabled:opacity-30"
                placeholder="#E8590C"
                maxLength={7}
              />
            </div>
          </div>

          {/* Quick actions */}
          <div>
            <h4 className="text-xs font-semibold text-text-secondary mb-2 uppercase tracking-wider">Quick Actions</h4>
            <div className="grid grid-cols-2 gap-1.5">
              {[
                { action: "alphas" as const, label: "All Alphas" },
                { action: "modifiers" as const, label: "All Modifiers" },
                { action: "functionRow" as const, label: "Function Row" },
                { action: "reset" as const, label: "Reset to Default" },
              ].map(({ action, label }) => (
                <button
                  key={action}
                  onClick={() => onQuickAction(action)}
                  className={cn(
                    "px-3 py-2 text-xs font-medium rounded-lg transition-[background-color,color] duration-150",
                    "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/40",
                    action === "reset"
                      ? "bg-red-500/10 text-red-400 border border-red-500/20 hover:bg-red-500/20"
                      : "bg-bg-elevated text-text-secondary border border-border-subtle hover:border-border-accent hover:text-text-primary"
                  )}
                >
                  {label}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Artisans tab */}
      {activeTab === "artisans" && (
        <div className="space-y-4 overflow-y-auto flex-1">
          <p className="text-xs text-text-muted">
            Select a 1u key, then click an artisan to apply.
          </p>

          <div className="grid grid-cols-2 gap-2">
            {ARTISAN_PRESETS.map((preset) => (
              <button
                key={preset.name}
                onClick={() => handleArtisanApply(preset)}
                disabled={selectedCount === 0}
                className={cn(
                  "relative p-3 rounded-xl border border-border-subtle bg-bg-elevated",
                  "transition-[transform,border-color,box-shadow] duration-150",
                  "hover:border-accent/40 hover:shadow-[0_2px_12px_rgba(232,89,12,0.1)] hover:scale-[1.02]",
                  "active:scale-[0.98]",
                  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/40",
                  "disabled:opacity-30 disabled:cursor-not-allowed disabled:hover:scale-100 disabled:hover:border-border-subtle"
                )}
              >
                <div className="flex items-center gap-2 mb-1.5">
                  <div
                    className="w-5 h-5 rounded-md border border-white/10"
                    style={{ backgroundColor: preset.primaryColor }}
                  />
                  <div
                    className="w-5 h-5 rounded-md border border-white/10"
                    style={{ backgroundColor: preset.secondaryColor }}
                  />
                </div>
                <p className="text-xs font-semibold text-text-primary text-left">{preset.name}</p>
                <p className="text-[10px] text-text-muted text-left capitalize">{preset.style}</p>
              </button>
            ))}
          </div>

          {/* Remove artisan */}
          <button
            onClick={onRemoveArtisan}
            disabled={selectedCount === 0}
            className={cn(
              "w-full px-3 py-2 text-xs font-medium rounded-lg",
              "bg-red-500/10 text-red-400 border border-red-500/20 hover:bg-red-500/20",
              "transition-[background-color] duration-150",
              "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/40",
              "disabled:opacity-30 disabled:cursor-not-allowed"
            )}
          >
            Remove Artisan
          </button>
        </div>
      )}

      {/* Legends tab */}
      {activeTab === "legends" && (
        <div className="space-y-4 overflow-y-auto flex-1">
          <div>
            <h4 className="text-xs font-semibold text-text-secondary mb-2 uppercase tracking-wider">Legend Text</h4>
            <input
              type="text"
              value={legendText}
              onChange={(e) => setLegendText(e.target.value)}
              className="w-full px-3 py-2 text-sm bg-bg-elevated border border-border-subtle rounded-lg text-text-primary placeholder-text-muted focus:outline-none focus:border-accent/50"
              placeholder="Custom legend..."
              maxLength={4}
            />
          </div>

          <div>
            <h4 className="text-xs font-semibold text-text-secondary mb-2 uppercase tracking-wider">Legend Color</h4>
            <div className="flex items-center gap-2">
              <label className="relative w-8 h-8 rounded-lg overflow-hidden border border-border-subtle cursor-pointer">
                <input
                  type="color"
                  value={legendColor}
                  onChange={(e) => setLegendColor(e.target.value)}
                  className="absolute inset-0 w-full h-full cursor-pointer opacity-0"
                />
                <div className="w-full h-full" style={{ backgroundColor: legendColor }} />
              </label>
              <span className="text-xs font-mono text-text-muted">{legendColor}</span>
            </div>
          </div>

          <button
            onClick={handleLegendApply}
            disabled={selectedCount === 0 || !legendText}
            className={cn(
              "w-full px-4 py-2 text-sm font-semibold rounded-lg",
              "bg-accent text-bg-primary hover:bg-accent-hover",
              "transition-[background-color,transform] duration-150 active:scale-[0.97]",
              "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/40",
              "disabled:opacity-40 disabled:cursor-not-allowed"
            )}
          >
            Apply Legend
          </button>
        </div>
      )}
    </div>
  );
}
