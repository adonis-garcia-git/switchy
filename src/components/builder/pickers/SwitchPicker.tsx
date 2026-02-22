"use client";

import { useState, useMemo } from "react";
import { useQuery } from "convex/react";
import { api } from "../../../../convex/_generated/api";
import { SelectableItemCard } from "../SelectableItemCard";
import { FilterBar } from "../FilterBar";
import { Badge } from "@/components/ui/Badge";
import { cn, formatPrice } from "@/lib/utils";
import type { SwitchData } from "@/lib/types";

interface SwitchPickerProps {
  selected: SwitchData | null;
  onSelect: (sw: SwitchData) => void;
  switchCount: number;
}

export function SwitchPicker({ selected, onSelect, switchCount }: SwitchPickerProps) {
  const switches = useQuery(api.switches.list, {}) as SwitchData[] | undefined;
  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState("");
  const [soundFilter, setSoundFilter] = useState("");

  const filtered = useMemo(() => {
    if (!switches) return [];
    return switches.filter((sw) => {
      if (search) {
        const q = search.toLowerCase();
        if (!sw.name.toLowerCase().includes(q) && !sw.brand.toLowerCase().includes(q)) return false;
      }
      if (typeFilter && sw.type !== typeFilter) return false;
      if (soundFilter && sw.soundCharacter !== soundFilter) return false;
      return true;
    });
  }, [switches, search, typeFilter, soundFilter]);

  if (!switches) {
    return (
      <div className="space-y-4">
        <div className="h-10 bg-bg-elevated rounded-lg animate-pulse" />
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="h-32 bg-bg-elevated rounded-xl animate-pulse" />
          ))}
        </div>
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
          You need <span className="text-accent font-semibold">{switchCount} switches</span> for your keyboard.
          Price shown is per switch.
        </p>
      </div>

      <FilterBar
        searchValue={search}
        onSearchChange={setSearch}
        searchPlaceholder="Search switches..."
        filters={[
          {
            label: "Type",
            chips: [
              { label: "Linear", value: "linear", active: typeFilter === "linear" },
              { label: "Tactile", value: "tactile", active: typeFilter === "tactile" },
              { label: "Clicky", value: "clicky", active: typeFilter === "clicky" },
            ],
            onChange: setTypeFilter,
          },
          {
            label: "Sound",
            chips: ["thocky", "clacky", "creamy", "poppy", "muted", "crisp"].map((s) => ({
              label: s.charAt(0).toUpperCase() + s.slice(1),
              value: s,
              active: soundFilter === s,
            })),
            onChange: setSoundFilter,
          },
        ]}
      />

      <p className="text-xs text-text-muted">
        {filtered.length} switch{filtered.length !== 1 ? "es" : ""} found
      </p>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {filtered.map((sw) => {
          const totalPrice = sw.pricePerSwitch * switchCount;
          return (
            <SelectableItemCard
              key={sw._id}
              selected={selected?._id === sw._id}
              onClick={() => onSelect(sw)}
              imageUrl={sw.imageUrl}
              imageAlt={`${sw.brand} ${sw.name}`}
            >
              <div className="pr-6">
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-[10px] text-text-muted uppercase tracking-wider font-medium">
                    {sw.brand}
                  </span>
                  <Badge
                    variant={sw.type as "linear" | "tactile" | "clicky"}
                    size="sm"
                  >
                    {sw.type}
                  </Badge>
                </div>
                <h4 className="font-semibold text-sm text-text-primary font-[family-name:var(--font-outfit)] leading-tight mb-1.5">
                  {sw.name}
                </h4>
                <div className="flex items-center gap-3 text-[11px] text-text-muted mb-2">
                  <span>{sw.actuationForceG}g</span>
                  {sw.soundCharacter && (
                    <>
                      <span className="w-0.5 h-0.5 rounded-full bg-text-muted" />
                      <span className="capitalize">{sw.soundCharacter}</span>
                    </>
                  )}
                  {sw.factoryLubed && (
                    <>
                      <span className="w-0.5 h-0.5 rounded-full bg-text-muted" />
                      <span>Factory lubed</span>
                    </>
                  )}
                </div>
                <div className="flex items-baseline gap-2">
                  <span className="text-base font-bold font-[family-name:var(--font-mono)] text-accent">
                    {formatPrice(totalPrice)}
                  </span>
                  <span className="text-[10px] text-text-muted font-[family-name:var(--font-mono)]">
                    {switchCount}x {formatPrice(sw.pricePerSwitch)}
                  </span>
                </div>
              </div>
            </SelectableItemCard>
          );
        })}

        {filtered.length === 0 && (
          <div className="col-span-full text-center py-12 text-text-muted text-sm">
            No switches match your filters. Try broadening your search.
          </div>
        )}
      </div>
    </div>
  );
}
