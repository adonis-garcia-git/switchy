"use client";

import { useState, useMemo } from "react";
import { useQuery } from "convex/react";
import { api } from "../../../../convex/_generated/api";
import { SelectableItemCard } from "../SelectableItemCard";
import { FilterBar } from "../FilterBar";
import { Badge } from "@/components/ui/Badge";
import { Input } from "@/components/ui/Input";
import { cn, formatPriceWhole } from "@/lib/utils";
import type { KeycapSelection, KeycapData, ComponentData } from "@/lib/types";

interface KeycapPickerProps {
  selection: KeycapSelection;
  onSelectProfile: (profile: string) => void;
  onSelectMaterial: (material: string) => void;
  onSetDetails: (setName: string, price: number) => void;
  onSelectKeycapSet?: (keycap: KeycapData) => void;
}

const PROFILE_DESCRIPTIONS: Record<string, string> = {
  Cherry: "Low-profile sculpted. The most popular profile.",
  SA: "Tall, spherical tops. Retro look, deep thocky sound.",
  MT3: "Sculpted with scooped tops. Premium sound signature.",
  DSA: "Uniform, low-profile spherical. Great for ortho boards.",
  KAT: "Medium height, smooth sculpt. Softer sound than Cherry.",
};

const MATERIAL_DESCRIPTIONS: Record<string, string> = {
  PBT: "Textured, durable, resists shine. Deeper sound.",
  ABS: "Smooth, develops shine. Higher-pitched, poppier sound.",
  POM: "Ultra-smooth, self-lubricating. Deep muted sound.",
};

export function KeycapPicker({
  selection,
  onSelectProfile,
  onSelectMaterial,
  onSetDetails,
  onSelectKeycapSet,
}: KeycapPickerProps) {
  const keycaps = useQuery(api.keycaps.list, {}) as KeycapData[] | undefined;
  const components = useQuery(api.components.list, {}) as ComponentData[] | undefined;
  const [search, setSearch] = useState("");
  const [profileFilter, setProfileFilter] = useState("");
  const [materialFilter, setMaterialFilter] = useState("");
  const [showCustom, setShowCustom] = useState(false);

  const profiles = useMemo(() => {
    if (!components) return [];
    return components.filter((c) => c.category === "keycapProfile");
  }, [components]);

  const materials = useMemo(() => {
    if (!components) return [];
    return components.filter((c) => c.category === "keycapMaterial");
  }, [components]);

  const availableProfiles = useMemo(() => {
    if (!keycaps) return [];
    return [...new Set(keycaps.map((k) => k.profile))].sort();
  }, [keycaps]);

  const availableMaterials = useMemo(() => {
    if (!keycaps) return [];
    return [...new Set(keycaps.map((k) => k.material))].sort();
  }, [keycaps]);

  const filtered = useMemo(() => {
    if (!keycaps) return [];
    return keycaps.filter((kc) => {
      if (search) {
        const q = search.toLowerCase();
        if (!kc.name.toLowerCase().includes(q) && !kc.brand.toLowerCase().includes(q)) return false;
      }
      if (profileFilter && kc.profile !== profileFilter) return false;
      if (materialFilter && kc.material !== materialFilter) return false;
      return true;
    });
  }, [keycaps, search, profileFilter, materialFilter]);

  const handleSelectSet = (kc: KeycapData) => {
    if (onSelectKeycapSet) {
      onSelectKeycapSet(kc);
    } else {
      // Fallback: populate through existing actions
      onSelectProfile(kc.profile);
      onSelectMaterial(kc.material);
      onSetDetails(kc.name, kc.priceUsd);
    }
    setShowCustom(false);
  };

  const handleSwitchToCustom = () => {
    setShowCustom(!showCustom);
    if (!showCustom) {
      // Clear set-based selection when switching to custom
      if (onSelectKeycapSet && selection.keycapSetId) {
        onSelectProfile(selection.profile || "");
        onSelectMaterial(selection.material || "");
        onSetDetails(selection.setName, selection.price);
      }
    }
  };

  const isSetSelected = (kc: KeycapData) => {
    if (selection.keycapSetId) return selection.keycapSetId === kc._id;
    return selection.setName === kc.name && selection.price === kc.priceUsd;
  };

  if (!keycaps || !components) {
    return (
      <div className="space-y-4">
        <div className="h-10 bg-bg-elevated rounded-lg animate-pulse" />
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="h-28 bg-bg-elevated rounded-xl animate-pulse flex gap-3.5 p-4">
              <div className="w-20 h-20 rounded-lg bg-bg-surface/50 shrink-0" />
              <div className="flex-1 space-y-2">
                <div className="h-3 bg-bg-surface/50 rounded w-1/3" />
                <div className="h-4 bg-bg-surface/50 rounded w-2/3" />
                <div className="h-3 bg-bg-surface/50 rounded w-1/2" />
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Keycap Sets Grid */}
      <div>
        <FilterBar
          searchValue={search}
          onSearchChange={setSearch}
          searchPlaceholder="Search keycap sets..."
          filters={[
            {
              label: "Profile",
              chips: availableProfiles.map((p) => ({
                label: p,
                value: p,
                active: profileFilter === p,
              })),
              onChange: setProfileFilter,
            },
            {
              label: "Material",
              chips: availableMaterials.map((m) => ({
                label: m,
                value: m,
                active: materialFilter === m,
              })),
              onChange: setMaterialFilter,
            },
          ]}
        />

        <p className="text-xs text-text-muted mt-3 mb-3">
          {filtered.length} keycap set{filtered.length !== 1 ? "s" : ""} found
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {filtered.map((kc) => (
            <SelectableItemCard
              key={kc._id}
              selected={isSetSelected(kc)}
              onClick={() => handleSelectSet(kc)}
              imageUrl={kc.imageUrl}
              imageAlt={`${kc.brand} ${kc.name}`}
            >
              <div className="pr-6">
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-[10px] text-text-muted uppercase tracking-wider font-medium">
                    {kc.brand}
                  </span>
                </div>
                <h4 className="font-semibold text-sm text-text-primary font-[family-name:var(--font-outfit)] leading-tight mb-1.5">
                  {kc.name}
                </h4>
                <div className="flex flex-wrap gap-1.5 mb-2">
                  <span className="text-[10px] px-1.5 py-0.5 rounded bg-bg-elevated text-text-muted border border-border-subtle">
                    {kc.profile}
                  </span>
                  <span className="text-[10px] px-1.5 py-0.5 rounded bg-bg-elevated text-text-muted border border-border-subtle">
                    {kc.material}
                  </span>
                  {kc.legendType && (
                    <span className="text-[10px] px-1.5 py-0.5 rounded bg-bg-elevated text-text-muted border border-border-subtle">
                      {kc.legendType}
                    </span>
                  )}
                </div>
                <div className="flex items-baseline gap-1">
                  <span className="text-base font-bold font-[family-name:var(--font-mono)] text-accent">
                    {formatPriceWhole(kc.priceUsd)}
                  </span>
                </div>
              </div>
            </SelectableItemCard>
          ))}

          {filtered.length === 0 && (
            <div className="col-span-full text-center py-12 text-text-muted text-sm">
              No keycap sets match your filters. Try broadening your search.
            </div>
          )}
        </div>
      </div>

      {/* Custom Keycaps Section */}
      <div className="border border-border-subtle rounded-xl overflow-hidden">
        <button
          type="button"
          onClick={handleSwitchToCustom}
          className={cn(
            "w-full flex items-center justify-between px-4 py-3 text-left transition-[background-color] duration-150",
            "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/40 focus-visible:ring-inset",
            showCustom ? "bg-bg-elevated" : "bg-bg-surface hover:bg-bg-elevated/60"
          )}
        >
          <div className="flex items-center gap-2">
            <svg className="w-4 h-4 text-text-muted" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4" />
            </svg>
            <span className="text-sm font-semibold text-text-primary font-[family-name:var(--font-outfit)]">
              Custom Keycaps
            </span>
            <span className="text-xs text-text-muted">
              (set not in our database)
            </span>
          </div>
          <svg
            className={cn(
              "w-4 h-4 text-text-muted transition-transform duration-200",
              showCustom && "rotate-180"
            )}
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </button>

        {showCustom && (
          <div className="px-4 py-4 space-y-6 border-t border-border-subtle bg-bg-surface">
            {/* Profile selection */}
            <div>
              <h3 className="text-xs text-text-muted uppercase tracking-wider font-medium mb-3 font-[family-name:var(--font-outfit)]">
                Keycap Profile
              </h3>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                {(profiles.length > 0
                  ? profiles
                  : Object.keys(PROFILE_DESCRIPTIONS).map((name) => ({
                      name,
                      category: "keycapProfile" as const,
                      soundEffect: "",
                      priceRange: "mid" as const,
                      notes: "",
                      compatibilityNotes: "",
                    }))
                ).map((profile) => (
                  <SelectableItemCard
                    key={profile.name}
                    selected={!selection.keycapSetId && selection.profile === profile.name}
                    onClick={() => {
                      onSelectProfile(profile.name);
                      // Clear keycap set selection when choosing custom
                      if (onSelectKeycapSet && selection.keycapSetId) {
                        onSetDetails("", 0);
                      }
                    }}
                  >
                    <div className="pr-6">
                      <h4 className="font-semibold text-sm text-text-primary font-[family-name:var(--font-outfit)] mb-0.5">
                        {profile.name}
                      </h4>
                      <p className="text-[10px] text-text-secondary leading-relaxed">
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
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                {(materials.length > 0
                  ? materials
                  : Object.keys(MATERIAL_DESCRIPTIONS).map((name) => ({
                      name,
                      category: "keycapMaterial" as const,
                      soundEffect: "",
                      priceRange: "mid" as const,
                      notes: "",
                      compatibilityNotes: "",
                    }))
                ).map((material) => (
                  <SelectableItemCard
                    key={material.name}
                    selected={!selection.keycapSetId && selection.material === material.name}
                    onClick={() => {
                      onSelectMaterial(material.name);
                      if (onSelectKeycapSet && selection.keycapSetId) {
                        onSetDetails("", 0);
                      }
                    }}
                  >
                    <div className="pr-6">
                      <h4 className="font-semibold text-sm text-text-primary font-[family-name:var(--font-outfit)] mb-0.5">
                        {material.name}
                      </h4>
                      <p className="text-[10px] text-text-secondary leading-relaxed">
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
                Set Details
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="text-xs text-text-secondary mb-1.5 block">Set Name</label>
                  <Input
                    value={selection.keycapSetId ? "" : selection.setName}
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
                      value={selection.keycapSetId ? "" : (selection.price || "")}
                      onChange={(e) => onSetDetails(selection.setName, Number(e.target.value) || 0)}
                      placeholder="0"
                      className="pl-7 bg-bg-elevated/60"
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
