"use client";

import { useMemo } from "react";
import { useQuery } from "convex/react";
import { api } from "../../../../convex/_generated/api";
import { SelectableItemCard } from "../SelectableItemCard";
import { Input } from "@/components/ui/Input";
import { cn } from "@/lib/utils";
import type { KeycapSelection, ComponentData } from "@/lib/types";

interface KeycapPickerProps {
  selection: KeycapSelection;
  onSelectProfile: (profile: string) => void;
  onSelectMaterial: (material: string) => void;
  onSetDetails: (setName: string, price: number) => void;
}

const PROFILE_DESCRIPTIONS: Record<string, string> = {
  Cherry: "Low-profile sculpted. The most popular profile. Clean sound, comfortable for long sessions.",
  SA: "Tall, spherical tops. Retro look with deep, thocky sound. Takes time to adjust to.",
  MT3: "Sculpted with scooped tops. Excellent finger-hug feel. Premium sound signature.",
  DSA: "Uniform, low-profile spherical. Same height on every row. Great for ortholinear boards.",
  KAT: "Medium height, smooth sculpt. Softer sound than Cherry. Nice balance of form and feel.",
};

const MATERIAL_DESCRIPTIONS: Record<string, string> = {
  PBT: "Textured, durable, resists shine. Deeper sound. Industry standard for premium sets.",
  ABS: "Smooth, develops shine over time. Higher-pitched, poppier sound. Easier to produce vivid colors.",
  POM: "Ultra-smooth, self-lubricating feel. Unique deep, muted sound. Rare and premium.",
};

export function KeycapPicker({
  selection,
  onSelectProfile,
  onSelectMaterial,
  onSetDetails,
}: KeycapPickerProps) {
  const components = useQuery(api.components.list, {}) as ComponentData[] | undefined;

  const profiles = useMemo(() => {
    if (!components) return [];
    return components.filter((c) => c.category === "keycapProfile");
  }, [components]);

  const materials = useMemo(() => {
    if (!components) return [];
    return components.filter((c) => c.category === "keycapMaterial");
  }, [components]);

  if (!components) {
    return (
      <div className="space-y-6">
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="h-20 bg-bg-elevated rounded-xl animate-pulse" />
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Profile selection */}
      <div>
        <h3 className="text-xs text-text-muted uppercase tracking-wider font-medium mb-3 font-[family-name:var(--font-outfit)]">
          Keycap Profile
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {(profiles.length > 0 ? profiles : Object.keys(PROFILE_DESCRIPTIONS).map(name => ({ name, category: "keycapProfile" as const, soundEffect: "", priceRange: "mid" as const, notes: "", compatibilityNotes: "" }))).map((profile) => (
            <SelectableItemCard
              key={profile.name}
              selected={selection.profile === profile.name}
              onClick={() => onSelectProfile(profile.name)}
            >
              <div className="pr-6">
                <h4 className="font-semibold text-sm text-text-primary font-[family-name:var(--font-outfit)] mb-1">
                  {profile.name}
                </h4>
                <p className="text-xs text-text-secondary leading-relaxed">
                  {PROFILE_DESCRIPTIONS[profile.name] || profile.soundEffect}
                </p>
              </div>
            </SelectableItemCard>
          ))}
        </div>
      </div>

      {/* Material selection */}
      <div>
        <h3 className="text-xs text-text-muted uppercase tracking-wider font-medium mb-3 font-[family-name:var(--font-outfit)]">
          Keycap Material
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {(materials.length > 0 ? materials : Object.keys(MATERIAL_DESCRIPTIONS).map(name => ({ name, category: "keycapMaterial" as const, soundEffect: "", priceRange: "mid" as const, notes: "", compatibilityNotes: "" }))).map((material) => (
            <SelectableItemCard
              key={material.name}
              selected={selection.material === material.name}
              onClick={() => onSelectMaterial(material.name)}
            >
              <div className="pr-6">
                <h4 className="font-semibold text-sm text-text-primary font-[family-name:var(--font-outfit)] mb-1">
                  {material.name}
                </h4>
                <p className="text-xs text-text-secondary leading-relaxed">
                  {MATERIAL_DESCRIPTIONS[material.name] || material.soundEffect}
                </p>
              </div>
            </SelectableItemCard>
          ))}
        </div>
      </div>

      {/* Set name & price */}
      <div>
        <h3 className="text-xs text-text-muted uppercase tracking-wider font-medium mb-3 font-[family-name:var(--font-outfit)]">
          Keycap Set Details
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label className="text-xs text-text-secondary mb-1.5 block">Set Name</label>
            <Input
              value={selection.setName}
              onChange={(e) => onSetDetails(e.target.value, selection.price)}
              placeholder="e.g. GMK Olivia, Drop MT3 White-on-Black"
              className="bg-bg-elevated/60"
            />
          </div>
          <div>
            <label className="text-xs text-text-secondary mb-1.5 block">Price (USD)</label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted text-sm">$</span>
              <Input
                type="number"
                min={0}
                step={1}
                value={selection.price || ""}
                onChange={(e) => onSetDetails(selection.setName, Number(e.target.value) || 0)}
                placeholder="0"
                className="pl-7 bg-bg-elevated/60"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
