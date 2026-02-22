"use client";

import { useState } from "react";
import { SelectableItemCard } from "../SelectableItemCard";
import { Input } from "@/components/ui/Input";
import { cn } from "@/lib/utils";
import type { StabilizerSelection, StabilizerPreset } from "@/lib/types";

interface StabilizerPickerProps {
  selected: StabilizerSelection | null;
  onSelect: (stabilizer: StabilizerSelection) => void;
}

const STABILIZER_PRESETS: StabilizerPreset[] = [
  { name: "Durock V2 Screw-in", price: 18, type: "screw-in" },
  { name: "C3 Equalz V3", price: 22, type: "screw-in" },
  { name: "TX Stabilizers", price: 20, type: "screw-in" },
  { name: "Gateron Ink V2", price: 15, type: "screw-in" },
  { name: "Cherry Clip-in", price: 12, type: "clip-in" },
  { name: "Budget Plate-mount", price: 8, type: "plate-mount" },
];

const TYPE_BADGES: Record<string, { color: string; label: string }> = {
  "screw-in": { color: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20", label: "Screw-in" },
  "clip-in": { color: "bg-amber-500/10 text-amber-400 border-amber-500/20", label: "Clip-in" },
  "plate-mount": { color: "bg-blue-500/10 text-blue-400 border-blue-500/20", label: "Plate-mount" },
};

export function StabilizerPicker({ selected, onSelect }: StabilizerPickerProps) {
  const [customName, setCustomName] = useState("");
  const [customPrice, setCustomPrice] = useState<number>(0);
  const isCustomSelected = selected?.isCustom === true;

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-xs text-text-muted uppercase tracking-wider font-medium mb-3 font-[family-name:var(--font-outfit)]">
          Popular Stabilizers
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {STABILIZER_PRESETS.map((preset) => {
            const badge = TYPE_BADGES[preset.type];
            return (
              <SelectableItemCard
                key={preset.name}
                selected={!isCustomSelected && selected?.name === preset.name}
                onClick={() => onSelect({ name: preset.name, price: preset.price, isCustom: false })}
              >
                <div className="pr-6">
                  <div className="flex items-center gap-2 mb-1">
                    <span className={cn("text-[10px] px-1.5 py-0.5 rounded border font-medium", badge.color)}>
                      {badge.label}
                    </span>
                  </div>
                  <h4 className="font-semibold text-sm text-text-primary font-[family-name:var(--font-outfit)] mb-1">
                    {preset.name}
                  </h4>
                  <span className="text-sm font-bold font-[family-name:var(--font-mono)] text-accent">
                    ${preset.price}
                  </span>
                </div>
              </SelectableItemCard>
            );
          })}
        </div>
      </div>

      {/* Custom option */}
      <div>
        <h3 className="text-xs text-text-muted uppercase tracking-wider font-medium mb-3 font-[family-name:var(--font-outfit)]">
          Or Enter Custom
        </h3>
        <SelectableItemCard
          selected={isCustomSelected}
          onClick={() => {
            if (customName) {
              onSelect({ name: customName, price: customPrice, isCustom: true });
            }
          }}
        >
          <div className="pr-6 space-y-3">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs text-text-secondary mb-1 block">Stabilizer Name</label>
                <Input
                  value={customName}
                  onChange={(e) => {
                    setCustomName(e.target.value);
                    if (e.target.value) {
                      onSelect({ name: e.target.value, price: customPrice, isCustom: true });
                    }
                  }}
                  placeholder="e.g. Owlab Stabilizers"
                  className="bg-bg-elevated/60"
                  onClick={(e) => e.stopPropagation()}
                />
              </div>
              <div>
                <label className="text-xs text-text-secondary mb-1 block">Price (USD)</label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted text-sm">$</span>
                  <Input
                    type="number"
                    min={0}
                    value={customPrice || ""}
                    onChange={(e) => {
                      const p = Number(e.target.value) || 0;
                      setCustomPrice(p);
                      if (customName) {
                        onSelect({ name: customName, price: p, isCustom: true });
                      }
                    }}
                    placeholder="0"
                    className="pl-7 bg-bg-elevated/60"
                    onClick={(e) => e.stopPropagation()}
                  />
                </div>
              </div>
            </div>
          </div>
        </SelectableItemCard>
      </div>
    </div>
  );
}
