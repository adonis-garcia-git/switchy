"use client";

import { useState, useMemo } from "react";
import { useQuery } from "convex/react";
import { api } from "../../../../convex/_generated/api";
import { SelectableItemCard } from "../SelectableItemCard";
import { FilterBar } from "../FilterBar";
import { Badge } from "@/components/ui/Badge";
import { cn, formatPriceWhole } from "@/lib/utils";
import type { KeyboardData } from "@/lib/types";

interface KeyboardKitPickerProps {
  selected: KeyboardData | null;
  onSelect: (keyboard: KeyboardData) => void;
}

export function KeyboardKitPicker({ selected, onSelect }: KeyboardKitPickerProps) {
  const keyboards = useQuery(api.keyboards.list, {}) as KeyboardData[] | undefined;
  const [search, setSearch] = useState("");
  const [sizeFilter, setSizeFilter] = useState("");
  const [hotSwapFilter, setHotSwapFilter] = useState(false);
  const [wirelessFilter, setWirelessFilter] = useState(false);

  const filtered = useMemo(() => {
    if (!keyboards) return [];
    return keyboards.filter((kb) => {
      if (search) {
        const q = search.toLowerCase();
        if (!kb.name.toLowerCase().includes(q) && !kb.brand.toLowerCase().includes(q)) return false;
      }
      if (sizeFilter && kb.size !== sizeFilter) return false;
      if (hotSwapFilter && !kb.hotSwap) return false;
      if (wirelessFilter && !kb.wireless) return false;
      return true;
    });
  }, [keyboards, search, sizeFilter, hotSwapFilter, wirelessFilter]);

  const sizes = useMemo(() => {
    if (!keyboards) return [];
    return [...new Set(keyboards.map((k) => k.size))].sort();
  }, [keyboards]);

  if (!keyboards) {
    return (
      <div className="space-y-4">
        <div className="h-10 bg-bg-elevated rounded-lg animate-pulse" />
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="h-36 bg-bg-elevated rounded-xl animate-pulse" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <FilterBar
        searchValue={search}
        onSearchChange={setSearch}
        searchPlaceholder="Search keyboard kits..."
        filters={[
          {
            label: "Size",
            chips: sizes.map((s) => ({ label: s, value: s, active: sizeFilter === s })),
            onChange: setSizeFilter,
          },
          {
            label: "Features",
            chips: [
              { label: "Hot-swap", value: "hotswap", active: hotSwapFilter },
              { label: "Wireless", value: "wireless", active: wirelessFilter },
            ],
            onChange: (v) => {
              if (v === "hotswap") setHotSwapFilter(!hotSwapFilter);
              if (v === "wireless") setWirelessFilter(!wirelessFilter);
              if (v === "") { setHotSwapFilter(false); setWirelessFilter(false); }
            },
          },
        ]}
      />

      <p className="text-xs text-text-muted">
        {filtered.length} kit{filtered.length !== 1 ? "s" : ""} found
      </p>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-h-[calc(100vh-22rem)] overflow-y-auto pr-1">
        {filtered.map((kb) => (
          <SelectableItemCard
            key={kb._id}
            selected={selected?._id === kb._id}
            onClick={() => onSelect(kb)}
          >
            <div className="pr-6">
              <div className="flex items-center gap-2 mb-1">
                <span className="text-[10px] text-text-muted uppercase tracking-wider font-medium">
                  {kb.brand}
                </span>
                <Badge size="sm">{kb.size}</Badge>
              </div>
              <h4 className="font-semibold text-sm text-text-primary font-[family-name:var(--font-outfit)] leading-tight mb-2">
                {kb.name}
              </h4>
              <div className="flex flex-wrap gap-1.5 mb-2">
                {kb.hotSwap && (
                  <span className="text-[10px] px-1.5 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                    Hot-swap
                  </span>
                )}
                {kb.wireless && (
                  <span className="text-[10px] px-1.5 py-0.5 rounded bg-blue-500/10 text-blue-400 border border-blue-500/20">
                    Wireless
                  </span>
                )}
                {kb.rgb && (
                  <span className="text-[10px] px-1.5 py-0.5 rounded bg-purple-500/10 text-purple-400 border border-purple-500/20">
                    RGB
                  </span>
                )}
                {kb.caseMaterial && (
                  <span className="text-[10px] px-1.5 py-0.5 rounded bg-bg-elevated text-text-muted border border-border-subtle">
                    {kb.caseMaterial}
                  </span>
                )}
              </div>
              <div className="flex items-baseline gap-1">
                <span className="text-base font-bold font-[family-name:var(--font-mono)] text-accent">
                  {formatPriceWhole(kb.priceUsd)}
                </span>
              </div>
            </div>
          </SelectableItemCard>
        ))}

        {filtered.length === 0 && (
          <div className="col-span-full text-center py-12 text-text-muted text-sm">
            No keyboards match your filters. Try broadening your search.
          </div>
        )}
      </div>
    </div>
  );
}
