"use client";

import { useState, useMemo } from "react";
import { useMutation } from "convex/react";
import { useUser } from "@clerk/nextjs";
import { api } from "../../../convex/_generated/api";
import { ComponentCard } from "./ComponentCard";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { cn, formatPriceWhole, formatPrice } from "@/lib/utils";
import {
  getRunningTotal,
  predictSoundProfile,
  predictDifficulty,
} from "./CustomBuilderSidebar";
import type { CustomBuildSelections, BuildData } from "@/lib/types";

interface CustomBuildReviewProps {
  selections: CustomBuildSelections;
  switchCount: number;
  onReset: () => void;
  onBack: () => void;
}

function assembleBuildData(
  selections: CustomBuildSelections,
  switchCount: number
): BuildData {
  const total = getRunningTotal(selections, switchCount);
  const sound = predictSoundProfile(selections);
  const difficulty = predictDifficulty(selections);

  const kbName = selections.keyboard
    ? `${selections.keyboard.brand} ${selections.keyboard.name}`
    : "No keyboard selected";

  const swName = selections.switches
    ? `${selections.switches.brand} ${selections.switches.name}`
    : "No switches selected";

  const keycapName =
    selections.keycaps.setName ||
    (selections.keycaps.profile && selections.keycaps.material
      ? `${selections.keycaps.material} ${selections.keycaps.profile}`
      : "No keycaps selected");

  const stabName = selections.stabilizer?.name || "No stabilizer selected";

  return {
    buildName: `Custom ${selections.keyboard?.size || ""} Build`.trim(),
    summary: `Hand-picked build with ${swName} switches in a ${kbName} kit, ${keycapName} keycaps.`,
    components: {
      keyboardKit: {
        name: kbName,
        price: selections.keyboard?.priceUsd || 0,
        reason: "Selected in custom builder",
      },
      switches: {
        name: swName,
        price: (selections.switches?.pricePerSwitch || 0) * switchCount,
        reason: "Selected in custom builder",
        quantity: switchCount,
        priceEach: selections.switches?.pricePerSwitch || 0,
      },
      keycaps: {
        name: keycapName,
        price: selections.keycaps.price,
        reason: "Selected in custom builder",
      },
      stabilizers: {
        name: stabName,
        price: selections.stabilizer?.price || 0,
        reason: "Selected in custom builder",
      },
    },
    recommendedMods: selections.mods.map((mod) => ({
      mod: mod.name,
      cost: 0,
      effect: mod.soundEffect,
      difficulty:
        mod.priceRange === "premium"
          ? ("hard" as const)
          : mod.priceRange === "mid"
            ? ("medium" as const)
            : ("easy" as const),
    })),
    estimatedTotal: total,
    soundProfileExpected:
      sound.primary !== "neutral"
        ? `${sound.primary.charAt(0).toUpperCase() + sound.primary.slice(1)} with ${sound.scores[1]?.label.toLowerCase() || "balanced"} undertones`
        : "Balanced",
    buildDifficulty: difficulty,
    notes: selections.mods.length > 0
      ? `Includes ${selections.mods.length} mod${selections.mods.length > 1 ? "s" : ""}: ${selections.mods.map((m) => m.name).join(", ")}.`
      : "No additional mods selected.",
  };
}

export function CustomBuildReview({
  selections,
  switchCount,
  onReset,
  onBack,
}: CustomBuildReviewProps) {
  const { isSignedIn } = useUser();
  const saveBuild = useMutation(api.savedBuilds.save);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [copied, setCopied] = useState(false);

  const build = useMemo(
    () => assembleBuildData(selections, switchCount),
    [selections, switchCount]
  );

  const soundProfile = useMemo(() => predictSoundProfile(selections), [selections]);
  const difficulty = predictDifficulty(selections);

  const handleSave = async () => {
    if (!isSignedIn) return;
    setSaving(true);
    try {
      await saveBuild({
        query: "Custom build",
        buildName: build.buildName,
        summary: build.summary,
        components: build.components,
        recommendedMods: build.recommendedMods,
        estimatedTotal: build.estimatedTotal,
        soundProfileExpected: build.soundProfileExpected,
        buildDifficulty: build.buildDifficulty,
        notes: build.notes,
      });
      setSaved(true);
    } catch (err) {
      console.error("Failed to save build:", err);
    } finally {
      setSaving(false);
    }
  };

  const handleCopy = async () => {
    const text = `${build.buildName}\n${build.summary}\n\nComponents:\n- Keyboard: ${build.components.keyboardKit.name} (${formatPriceWhole(build.components.keyboardKit.price)})\n- Switches: ${build.components.switches.name} (${build.components.switches.quantity}x @ ${formatPrice(build.components.switches.priceEach)})\n- Keycaps: ${build.components.keycaps.name} (${formatPriceWhole(build.components.keycaps.price)})\n- Stabilizers: ${build.components.stabilizers.name} (${formatPriceWhole(build.components.stabilizers.price)})\n\nTotal: ${formatPriceWhole(build.estimatedTotal)}\nSound: ${build.soundProfileExpected}\nDifficulty: ${build.buildDifficulty}`;
    await navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const isIncomplete = !selections.keyboard || !selections.switches;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-xl font-bold text-text-primary font-[family-name:var(--font-outfit)] tracking-tight mb-1">
          Build Review
        </h2>
        <p className="text-sm text-text-secondary">{build.summary}</p>
      </div>

      {/* Incomplete warning */}
      {isIncomplete && (
        <div className="flex items-center gap-3 px-4 py-3 rounded-xl bg-amber-500/10 border border-amber-500/20">
          <svg className="w-5 h-5 text-amber-400 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
          <p className="text-sm text-amber-300">
            Some required components are missing. Go back to complete your selections.
          </p>
        </div>
      )}

      {/* Stats row */}
      <div className="flex items-center gap-3 flex-wrap">
        <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-accent-dim border border-accent/20">
          <span className="text-xs text-text-muted">Total</span>
          <span className="text-lg font-bold font-[family-name:var(--font-mono)] text-accent">
            {formatPriceWhole(build.estimatedTotal)}
          </span>
        </div>
        <Badge
          variant={
            difficulty === "beginner-friendly"
              ? "success"
              : difficulty === "intermediate"
                ? "warning"
                : "default"
          }
          size="md"
        >
          {difficulty}
        </Badge>
        {soundProfile.primary !== "neutral" && (
          <div className="px-3 py-1.5 rounded-full bg-bg-elevated border border-border-subtle text-xs text-text-secondary capitalize">
            {soundProfile.primary}
          </div>
        )}
      </div>

      {/* Component cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <ComponentCard
          type="keyboardKit"
          name={build.components.keyboardKit.name}
          price={build.components.keyboardKit.price}
          reason={
            selections.keyboard
              ? `${selections.keyboard.size} / ${selections.keyboard.caseMaterial}${selections.keyboard.hotSwap ? " / Hot-swap" : ""}`
              : "Not selected"
          }
          imageUrl={selections.keyboard?.imageUrl}
        />
        <ComponentCard
          type="switches"
          name={build.components.switches.name}
          price={build.components.switches.price}
          reason={
            selections.switches
              ? `${selections.switches.type} / ${selections.switches.actuationForceG}g / ${selections.switches.soundCharacter || "standard"}`
              : "Not selected"
          }
          quantity={build.components.switches.quantity}
          priceEach={build.components.switches.priceEach}
          imageUrl={selections.switches?.imageUrl}
        />
        <ComponentCard
          type="keycaps"
          name={build.components.keycaps.name}
          price={build.components.keycaps.price}
          reason={
            selections.keycaps.profile
              ? `${selections.keycaps.profile} profile / ${selections.keycaps.material || "unspecified"}`
              : "Not selected"
          }
          imageUrl={selections.keycaps.keycapImageUrl}
        />
        <ComponentCard
          type="stabilizers"
          name={build.components.stabilizers.name}
          price={build.components.stabilizers.price}
          reason={
            selections.stabilizer
              ? selections.stabilizer.isCustom
                ? "Custom selection"
                : "Popular preset"
              : "Not selected"
          }
        />
      </div>

      {/* Mods */}
      {build.recommendedMods.length > 0 && (
        <div>
          <h3 className="text-xs text-text-muted uppercase tracking-wider font-medium font-[family-name:var(--font-outfit)] mb-3">
            Selected Mods
          </h3>
          <div className="flex flex-wrap gap-2">
            {build.recommendedMods.map((mod, i) => (
              <div
                key={i}
                className="flex items-center gap-2 px-3 py-2 rounded-lg border bg-bg-surface border-border-subtle text-sm"
              >
                <span className="text-text-primary font-medium">{mod.mod}</span>
                <span
                  className={cn(
                    "text-[10px] px-1.5 py-0.5 rounded font-medium",
                    mod.difficulty === "easy"
                      ? "bg-emerald-500/10 text-emerald-400"
                      : mod.difficulty === "medium"
                        ? "bg-amber-500/10 text-amber-400"
                        : "bg-red-500/10 text-red-400"
                  )}
                >
                  {mod.difficulty}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Sound profile bars */}
      {soundProfile.primary !== "neutral" && (
        <div className="p-4 rounded-xl bg-bg-elevated border border-border-subtle">
          <p className="text-xs text-text-muted uppercase tracking-wider font-medium mb-3 font-[family-name:var(--font-outfit)]">
            Predicted Sound Signature
          </p>
          <div className="space-y-2">
            {soundProfile.scores.map(({ label, score }) => (
              <div key={label} className="flex items-center gap-3">
                <span className="text-xs text-text-secondary w-16 shrink-0">{label}</span>
                <div className="flex-1 h-2 bg-bg-primary rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-accent/40 to-accent rounded-full transition-[width] duration-300"
                    style={{ width: `${score}%` }}
                  />
                </div>
                <span className="text-xs text-text-muted font-[family-name:var(--font-mono)] w-8 text-right">
                  {score}%
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Actions */}
      <div className="flex items-center gap-3 flex-wrap pt-2">
        {isSignedIn && (
          <Button
            onClick={handleSave}
            disabled={saving || saved || isIncomplete}
            loading={saving}
            variant={saved ? "secondary" : "primary"}
          >
            {saved ? (
              <>
                <svg className="w-4 h-4 mr-1.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                Saved
              </>
            ) : (
              <>
                <svg className="w-4 h-4 mr-1.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" />
                </svg>
                Save Build
              </>
            )}
          </Button>
        )}
        <Button variant="secondary" onClick={handleCopy}>
          {copied ? "Copied!" : "Copy"}
        </Button>
        <Button variant="ghost" onClick={onBack}>
          Back to Mods
        </Button>
        <Button variant="ghost" onClick={onReset}>
          Start Over
        </Button>
      </div>
    </div>
  );
}
