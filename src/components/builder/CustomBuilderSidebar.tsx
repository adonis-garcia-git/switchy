"use client";

import { useMemo } from "react";
import { cn, formatPriceWhole } from "@/lib/utils";
import { Badge } from "@/components/ui/Badge";
import type { CustomBuildSelections, CustomBuilderStep, ComponentData } from "@/lib/types";

interface CustomBuilderSidebarProps {
  step: CustomBuilderStep;
  selections: CustomBuildSelections;
  onStepClick: (step: CustomBuilderStep) => void;
  switchCount: number;
}

const STEPS: { key: CustomBuilderStep; label: string; icon: string }[] = [
  { key: "keyboard", label: "Keyboard Kit", icon: "M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" },
  { key: "switches", label: "Switches", icon: "M13 10V3L4 14h7v7l9-11h-7z" },
  { key: "keycaps", label: "Keycaps", icon: "M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" },
  { key: "stabilizers", label: "Stabilizers", icon: "M4 6h16M4 10h16M4 14h16M4 18h16" },
  { key: "mods", label: "Mods", icon: "M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4" },
  { key: "customize", label: "Customize", icon: "M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zm0 0h12a2 2 0 002-2v-4a2 2 0 00-2-2h-2.343M11 7.343l1.657-1.657a2 2 0 012.828 0l2.829 2.829a2 2 0 010 2.828l-8.486 8.485" },
  { key: "review", label: "Review", icon: "M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" },
];

function isStepComplete(step: CustomBuilderStep, selections: CustomBuildSelections): boolean {
  switch (step) {
    case "keyboard": return !!selections.keyboard;
    case "switches": return !!selections.switches;
    case "keycaps": return !!selections.keycaps.profile && !!selections.keycaps.material;
    case "stabilizers": return !!selections.stabilizer;
    case "mods": return true; // always optional
    case "customize": return true; // always optional
    case "review": return false;
  }
}

function getStepSummary(step: CustomBuilderStep, selections: CustomBuildSelections, switchCount: number): string | null {
  switch (step) {
    case "keyboard":
      return selections.keyboard ? `${selections.keyboard.brand} ${selections.keyboard.name}` : null;
    case "switches":
      return selections.switches ? `${selections.switches.brand} ${selections.switches.name} (${switchCount}x)` : null;
    case "keycaps":
      if (selections.keycaps.setName) return selections.keycaps.setName;
      if (selections.keycaps.profile && selections.keycaps.material) return `${selections.keycaps.material} ${selections.keycaps.profile}`;
      return null;
    case "stabilizers":
      return selections.stabilizer ? selections.stabilizer.name : null;
    case "mods":
      return selections.mods.length > 0 ? `${selections.mods.length} mod${selections.mods.length !== 1 ? "s" : ""}` : null;
    case "customize": {
      const overrideCount = Object.keys(selections.perKeyOverrides || {}).length;
      return overrideCount > 0 ? `${overrideCount} key${overrideCount !== 1 ? "s" : ""} customized` : null;
    }
    default:
      return null;
  }
}

// Size -> switch count mapping
export function getSwitchCount(size: string): number {
  const sizeMap: Record<string, number> = {
    "60%": 61, "65%": 68, "75%": 84, "TKL": 87, "80%": 87,
    "Full-size": 104, "100%": 104, "96%": 99, "40%": 47,
  };
  return sizeMap[size] || 70;
}

// Sound profile prediction
export function predictSoundProfile(selections: CustomBuildSelections): {
  primary: string;
  scores: { label: string; score: number }[];
} {
  const scores: Record<string, number> = {
    thocky: 0, clacky: 0, creamy: 0, poppy: 0, muted: 0,
  };

  // Switch contribution (heaviest weight)
  if (selections.switches) {
    const sw = selections.switches;
    if (sw.soundCharacter) scores[sw.soundCharacter] = (scores[sw.soundCharacter] || 0) + 4;
    if (sw.type === "linear") { scores.creamy += 2; scores.thocky += 1; }
    if (sw.type === "tactile") { scores.thocky += 2; scores.poppy += 1; }
    if (sw.type === "clicky") { scores.clacky += 3; scores.poppy += 2; }
    if (sw.longPole) { scores.clacky += 2; scores.poppy += 1; }
    if (sw.soundPitch === "low") scores.thocky += 2;
    if (sw.soundPitch === "high") { scores.clacky += 1; scores.poppy += 1; }
  }

  // Keyboard kit contribution
  if (selections.keyboard) {
    const kb = selections.keyboard;
    const caseMat = kb.caseMaterial?.toLowerCase() || "";
    if (caseMat.includes("aluminum") || caseMat.includes("aluminium")) { scores.clacky += 1; scores.poppy += 1; }
    if (caseMat.includes("polycarbonate") || caseMat.includes("pc")) { scores.thocky += 2; scores.muted += 1; }
    if (caseMat.includes("plastic")) { scores.poppy += 1; }
    if (caseMat.includes("wood")) { scores.thocky += 2; scores.muted += 1; }

    const mount = kb.mountingStyle?.toLowerCase() || "";
    if (mount.includes("gasket")) { scores.thocky += 1; scores.muted += 1; }
    if (mount.includes("top")) scores.clacky += 1;
    if (mount.includes("tray")) { scores.poppy += 1; scores.clacky += 1; }
  }

  // Keycap contribution
  if (selections.keycaps.material) {
    const mat = selections.keycaps.material.toUpperCase();
    if (mat === "PBT") { scores.thocky += 1; scores.muted += 1; }
    if (mat === "ABS") { scores.clacky += 1; scores.poppy += 1; }
    if (mat === "POM") { scores.thocky += 2; scores.muted += 1; }
  }
  if (selections.keycaps.profile) {
    const prof = selections.keycaps.profile;
    if (prof === "SA" || prof === "MT3") scores.thocky += 2;
    if (prof === "Cherry") scores.clacky += 1;
    if (prof === "DSA") scores.poppy += 1;
  }

  // Mod contribution
  const modNames = selections.mods.map((m) => m.name.toLowerCase());
  if (modNames.some((n) => n.includes("foam"))) { scores.muted += 2; scores.thocky += 1; }
  if (modNames.some((n) => n.includes("tape"))) { scores.poppy += 1; scores.thocky += 1; }
  if (modNames.some((n) => n.includes("lube"))) { scores.creamy += 2; scores.muted += 1; }
  if (modNames.some((n) => n.includes("film"))) { scores.thocky += 1; }

  const entries = Object.entries(scores).sort((a, b) => b[1] - a[1]);
  const maxScore = Math.max(...entries.map(([, s]) => s), 1);

  return {
    primary: entries[0][1] > 0 ? entries[0][0] : "neutral",
    scores: entries.map(([label, score]) => ({
      label: label.charAt(0).toUpperCase() + label.slice(1),
      score: Math.round((score / maxScore) * 100),
    })),
  };
}

// Build difficulty
export function predictDifficulty(selections: CustomBuildSelections): "beginner-friendly" | "intermediate" | "advanced" {
  let difficulty = 0;
  if (selections.keyboard && !selections.keyboard.hotSwap) difficulty += 3;
  if (selections.mods.length >= 4) difficulty += 2;
  else if (selections.mods.length >= 2) difficulty += 1;
  if (selections.mods.some((m) => m.name.toLowerCase().includes("lube"))) difficulty += 2;
  if (selections.mods.some((m) => m.name.toLowerCase().includes("spring swap"))) difficulty += 1;

  if (difficulty >= 5) return "advanced";
  if (difficulty >= 2) return "intermediate";
  return "beginner-friendly";
}

// Running total
export function getRunningTotal(selections: CustomBuildSelections, switchCount: number): number {
  let total = 0;
  if (selections.keyboard) total += selections.keyboard.priceUsd;
  if (selections.switches) total += selections.switches.pricePerSwitch * switchCount;
  total += selections.keycaps.price;
  if (selections.stabilizer) total += selections.stabilizer.price;
  return Math.round(total);
}

export function CustomBuilderSidebar({
  step,
  selections,
  onStepClick,
  switchCount,
}: CustomBuilderSidebarProps) {
  const total = useMemo(() => getRunningTotal(selections, switchCount), [selections, switchCount]);
  const soundProfile = useMemo(() => predictSoundProfile(selections), [selections]);
  const hasAnySelection = !!selections.keyboard || !!selections.switches || !!selections.keycaps.profile;

  return (
    <div className="space-y-6">
      {/* Step nav */}
      <div className="space-y-1">
        {STEPS.map((s, i) => {
          const isActive = step === s.key;
          const isComplete = isStepComplete(s.key, selections);
          const summary = getStepSummary(s.key, selections, switchCount);

          return (
            <button
              key={s.key}
              onClick={() => onStepClick(s.key)}
              className={cn(
                "w-full flex items-start gap-3 px-3 py-2.5 rounded-lg text-left transition-[background-color,border-color] duration-150",
                "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/40",
                isActive
                  ? "bg-accent/10 border border-accent/20"
                  : "border border-transparent hover:bg-bg-elevated/60"
              )}
            >
              {/* Step number / check */}
              <div className={cn(
                "w-6 h-6 rounded-full flex items-center justify-center shrink-0 text-[10px] font-bold mt-0.5",
                isComplete && !isActive
                  ? "bg-emerald-500/20 text-emerald-400"
                  : isActive
                    ? "bg-accent text-bg-primary"
                    : "bg-bg-elevated text-text-muted border border-border-subtle"
              )}>
                {isComplete && !isActive ? (
                  <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                  </svg>
                ) : (
                  i + 1
                )}
              </div>
              <div className="min-w-0 flex-1">
                <span className={cn(
                  "text-xs font-semibold block",
                  isActive ? "text-accent" : "text-text-primary"
                )}>
                  {s.label}
                </span>
                {summary && (
                  <span className="text-[10px] text-text-muted truncate block mt-0.5">
                    {summary}
                  </span>
                )}
              </div>
            </button>
          );
        })}
      </div>

      {/* Divider */}
      <div className="h-px bg-border-subtle" />

      {/* Running total */}
      <div className="px-3">
        <div className="flex items-baseline justify-between mb-1">
          <span className="text-[10px] uppercase tracking-wider text-text-muted font-medium">Running Total</span>
        </div>
        <p className="text-2xl font-bold font-[family-name:var(--font-mono)] text-accent tracking-tight">
          {formatPriceWhole(total)}
        </p>
      </div>

      {/* Sound prediction */}
      {hasAnySelection && (
        <>
          <div className="h-px bg-border-subtle" />
          <div className="px-3 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-[10px] uppercase tracking-wider text-text-muted font-medium">Sound Profile</span>
              {soundProfile.primary !== "neutral" && (
                <Badge variant="info" size="sm">{soundProfile.primary}</Badge>
              )}
            </div>
            <div className="space-y-1.5">
              {soundProfile.scores.slice(0, 4).map(({ label, score }) => (
                <div key={label} className="flex items-center gap-2">
                  <span className="text-[10px] text-text-muted w-12 shrink-0">{label}</span>
                  <div className="flex-1 h-1.5 bg-bg-elevated rounded-full overflow-hidden">
                    <div
                      className="h-full bg-accent/60 rounded-full transition-[width] duration-300"
                      style={{ width: `${score}%` }}
                    />
                  </div>
                  <span className="text-[10px] text-text-muted font-[family-name:var(--font-mono)] w-6 text-right">
                    {score}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
