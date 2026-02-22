"use client";

import { useReducer, useMemo, useCallback, useEffect } from "react";
import { cn, formatPriceWhole } from "@/lib/utils";
import { CustomBuilderSidebar, getSwitchCount, getRunningTotal, predictSoundProfile } from "./CustomBuilderSidebar";
import { CustomBuildReview } from "./CustomBuildReview";
import { KeyboardKitPicker } from "./pickers/KeyboardKitPicker";
import { SwitchPicker } from "./pickers/SwitchPicker";
import { KeycapPicker } from "./pickers/KeycapPicker";
import { StabilizerPicker } from "./pickers/StabilizerPicker";
import { ModPicker } from "./pickers/ModPicker";
import { KeyboardCustomizer } from "./KeyboardCustomizer";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import type {
  CustomBuilderStep,
  CustomBuilderState,
  CustomBuilderAction,
  KeyboardData,
  SwitchData,
} from "@/lib/types";
import type { PerKeyOverrides } from "@/lib/keyCustomization";
import type { KeyboardViewerConfig } from "@/lib/keyboard3d";
import { parseKeyword, MATERIAL_KEYWORDS, MOUNTING_KEYWORDS } from "@/lib/keyboard3d";

const INITIAL_STATE: CustomBuilderState = {
  step: "keyboard",
  selections: {
    keyboard: null,
    switches: null,
    keycaps: { profile: null, material: null, setName: "", price: 0 },
    stabilizer: null,
    mods: [],
    perKeyOverrides: {},
  },
};

function reducer(state: CustomBuilderState, action: CustomBuilderAction): CustomBuilderState {
  switch (action.type) {
    case "SET_STEP":
      return { ...state, step: action.step };
    case "SELECT_KEYBOARD":
      return {
        ...state,
        selections: { ...state.selections, keyboard: action.keyboard },
      };
    case "SELECT_SWITCHES":
      return {
        ...state,
        selections: { ...state.selections, switches: action.switches },
      };
    case "SELECT_KEYCAP_PROFILE":
      return {
        ...state,
        selections: {
          ...state.selections,
          keycaps: { ...state.selections.keycaps, profile: action.profile },
        },
      };
    case "SELECT_KEYCAP_MATERIAL":
      return {
        ...state,
        selections: {
          ...state.selections,
          keycaps: { ...state.selections.keycaps, material: action.material },
        },
      };
    case "SET_KEYCAP_DETAILS":
      return {
        ...state,
        selections: {
          ...state.selections,
          keycaps: {
            ...state.selections.keycaps,
            setName: action.setName,
            price: action.price,
          },
        },
      };
    case "SET_STABILIZER":
      return {
        ...state,
        selections: { ...state.selections, stabilizer: action.stabilizer },
      };
    case "TOGGLE_MOD": {
      const existing = state.selections.mods.find((m) => m.name === action.mod.name);
      return {
        ...state,
        selections: {
          ...state.selections,
          mods: existing
            ? state.selections.mods.filter((m) => m.name !== action.mod.name)
            : [...state.selections.mods, action.mod],
        },
      };
    }
    case "SET_KEY_OVERRIDE":
      return {
        ...state,
        selections: {
          ...state.selections,
          perKeyOverrides: {
            ...state.selections.perKeyOverrides,
            [action.keyId]: { ...state.selections.perKeyOverrides[action.keyId], ...action.override },
          },
        },
      };
    case "SET_KEYS_OVERRIDE": {
      const next = { ...state.selections.perKeyOverrides };
      action.keyIds.forEach((id) => {
        next[id] = { ...next[id], ...action.override };
      });
      return { ...state, selections: { ...state.selections, perKeyOverrides: next } };
    }
    case "CLEAR_KEY_OVERRIDES": {
      if (!action.keyIds) {
        return { ...state, selections: { ...state.selections, perKeyOverrides: {} } };
      }
      const cleared = { ...state.selections.perKeyOverrides };
      action.keyIds.forEach((id) => delete cleared[id]);
      return { ...state, selections: { ...state.selections, perKeyOverrides: cleared } };
    }
    case "SET_PER_KEY_OVERRIDES":
      return {
        ...state,
        selections: { ...state.selections, perKeyOverrides: action.overrides },
      };
    case "RESET":
      return INITIAL_STATE;
    default:
      return state;
  }
}

const STEP_ORDER: CustomBuilderStep[] = [
  "keyboard",
  "switches",
  "keycaps",
  "stabilizers",
  "mods",
  "customize",
  "review",
];

const STEP_TITLES: Record<CustomBuilderStep, { title: string; subtitle: string }> = {
  keyboard: {
    title: "Choose Your Keyboard Kit",
    subtitle: "Select the foundation of your build — the case, PCB, and plate.",
  },
  switches: {
    title: "Pick Your Switches",
    subtitle: "The heart of the typing feel. Choose your preferred switch type.",
  },
  keycaps: {
    title: "Select Keycaps",
    subtitle: "Define the look and feel with your preferred profile and material.",
  },
  stabilizers: {
    title: "Choose Stabilizers",
    subtitle: "Keep your larger keys smooth and rattle-free.",
  },
  mods: {
    title: "Add Modifications",
    subtitle: "Fine-tune your sound and feel with optional mods. (Optional)",
  },
  customize: {
    title: "Customize Keycaps",
    subtitle: "Click individual keys to change colors, add artisans, and personalize your layout. (Optional)",
  },
  review: {
    title: "Review Your Build",
    subtitle: "Check everything looks good, then save or share.",
  },
};

interface CustomBuilderProps {
  onViewerUpdate?: (config: Partial<KeyboardViewerConfig>) => void;
  viewerConfig?: KeyboardViewerConfig;
  onCustomizerPropsChange?: (props: any | null) => void;
}

export function CustomBuilder({ onViewerUpdate, viewerConfig, onCustomizerPropsChange }: CustomBuilderProps) {
  const [state, dispatch] = useReducer(reducer, INITIAL_STATE);
  const { step, selections } = state;

  const switchCount = useMemo(
    () => (selections.keyboard ? getSwitchCount(selections.keyboard.size) : 70),
    [selections.keyboard]
  );

  const total = useMemo(
    () => getRunningTotal(selections, switchCount),
    [selections, switchCount]
  );

  const soundProfile = useMemo(
    () => predictSoundProfile(selections),
    [selections]
  );

  const currentStepIndex = STEP_ORDER.indexOf(step);
  const stepInfo = STEP_TITLES[step];

  const goNext = useCallback(() => {
    const nextIndex = currentStepIndex + 1;
    if (nextIndex < STEP_ORDER.length) {
      // Clear customizer props when leaving the customize step
      if (step === "customize") onCustomizerPropsChange?.(null);
      dispatch({ type: "SET_STEP", step: STEP_ORDER[nextIndex] });
    }
  }, [currentStepIndex, step, onCustomizerPropsChange]);

  const goPrev = useCallback(() => {
    const prevIndex = currentStepIndex - 1;
    if (prevIndex >= 0) {
      // Clear customizer props when leaving the customize step
      if (step === "customize") onCustomizerPropsChange?.(null);
      dispatch({ type: "SET_STEP", step: STEP_ORDER[prevIndex] });
    }
  }, [currentStepIndex, step, onCustomizerPropsChange]);

  // Update 3D viewer when keyboard is selected
  const handleKeyboardSelect = useCallback(
    (kb: KeyboardData) => {
      dispatch({ type: "SELECT_KEYBOARD", keyboard: kb });
      if (onViewerUpdate) {
        const sizeMap: Record<string, "60" | "65" | "75" | "tkl" | "full"> = {
          "60%": "60", "65%": "65", "75%": "75", "TKL": "tkl", "80%": "tkl",
          "Full-size": "full", "100%": "full", "1800": "full", "96%": "full",
        };
        const update: Partial<KeyboardViewerConfig> = {
          size: sizeMap[kb.size] || "65",
          hasRGB: kb.rgb,
          caseMaterial: parseKeyword(kb.caseMaterial, MATERIAL_KEYWORDS) || "aluminum",
          connectionType: kb.wireless ? "wireless" : "wired",
        };
        if (kb.mountingStyle) {
          update.mountingStyle = parseKeyword(kb.mountingStyle, MOUNTING_KEYWORDS);
        }
        if (kb.plateMaterial) {
          update.plateColor = kb.plateMaterial.toLowerCase().includes("brass") ? "#b5a642" : "#8a8a8a";
        }
        onViewerUpdate(update);
      }
    },
    [onViewerUpdate]
  );

  const handleSwitchSelect = useCallback(
    (sw: SwitchData) => {
      dispatch({ type: "SELECT_SWITCHES", switches: sw });
      if (onViewerUpdate) {
        const SWITCH_TYPE_COLORS: Record<string, string> = {
          linear: "#c0392b",
          tactile: "#8B4513",
          clicky: "#2980b9",
        };
        onViewerUpdate({
          switchStemColor: SWITCH_TYPE_COLORS[sw.type] || "#c0392b",
          hasRGB: true,
          rgbMode: "reactive",
        });
      }
    },
    [onViewerUpdate]
  );

  // Can advance?
  // Handle per-key overrides from customizer
  const handleOverridesChange = useCallback(
    (overrides: PerKeyOverrides) => {
      dispatch({ type: "SET_PER_KEY_OVERRIDES", overrides });
      if (onViewerUpdate) {
        onViewerUpdate({ perKeyOverrides: overrides });
      }
    },
    [onViewerUpdate]
  );

  // ── Sync keycap profile & material to 3D viewer ──
  useEffect(() => {
    const updates: Partial<KeyboardViewerConfig> = {};
    if (selections.keycaps.profile) {
      const profileMap: Record<string, KeyboardViewerConfig["keycapProfile"]> = {
        Cherry: "cherry", SA: "sa", DSA: "dsa", MT3: "mt3",
        OEM: "oem", KAT: "kat", XDA: "xda",
      };
      updates.keycapProfile = profileMap[selections.keycaps.profile] || "cherry";
    }
    if (selections.keycaps.material) {
      const matMap: Record<string, KeyboardViewerConfig["keycapMaterial"]> = {
        PBT: "pbt", ABS: "abs", POM: "pom",
      };
      updates.keycapMaterial = matMap[selections.keycaps.material] || "pbt";
    }
    if (Object.keys(updates).length > 0) {
      onViewerUpdate?.(updates);
    }
  }, [selections.keycaps.profile, selections.keycaps.material, onViewerUpdate]);

  // ── Stabilizer selection → brass plate tint for premium stabs ──
  useEffect(() => {
    if (selections.stabilizer?.isCustom) {
      onViewerUpdate?.({ plateColor: "#b5a642" });
    }
  }, [selections.stabilizer, onViewerUpdate]);

  // ── Mod selection → warm environment for sound mods ──
  useEffect(() => {
    const hasSoundMods = selections.mods.some(m =>
      m.name.toLowerCase().includes("foam") || m.name.toLowerCase().includes("tape")
    );
    if (hasSoundMods) {
      onViewerUpdate?.({ environment: "apartment" });
    }
  }, [selections.mods, onViewerUpdate]);

  const canAdvance = useMemo(() => {
    switch (step) {
      case "keyboard": return !!selections.keyboard;
      case "switches": return !!selections.switches;
      case "keycaps": return !!selections.keycaps.profile && !!selections.keycaps.material;
      case "stabilizers": return !!selections.stabilizer;
      case "mods": return true;
      case "customize": return true;
      case "review": return false;
    }
  }, [step, selections]);

  return (
    <div className="w-full max-w-6xl mx-auto">
      <div className="flex gap-6">
        {/* Sidebar - desktop only */}
        <div className="hidden lg:block w-[260px] shrink-0">
          <div className="sticky top-20 p-4 rounded-2xl bg-bg-surface/80 backdrop-blur-md border border-border-subtle/50 shadow-surface">
            <CustomBuilderSidebar
              step={step}
              selections={selections}
              onStepClick={(s) => {
                if (step === "customize" && s !== "customize") onCustomizerPropsChange?.(null);
                dispatch({ type: "SET_STEP", step: s });
              }}
              switchCount={switchCount}
            />
          </div>
        </div>

        {/* Main content */}
        <div className="flex-1 min-w-0">
          {/* Mobile step indicator */}
          <div className="lg:hidden mb-4">
            <div className="flex items-center gap-1.5 mb-3 overflow-x-auto pb-1">
              {STEP_ORDER.map((s, i) => (
                <button
                  key={s}
                  onClick={() => {
                    if (step === "customize" && s !== "customize") onCustomizerPropsChange?.(null);
                    dispatch({ type: "SET_STEP", step: s });
                  }}
                  className={cn(
                    "w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold shrink-0 transition-[background-color,color] duration-150",
                    "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/40",
                    step === s
                      ? "bg-accent text-bg-primary"
                      : i < currentStepIndex
                        ? "bg-emerald-500/20 text-emerald-400"
                        : "bg-bg-elevated text-text-muted border border-border-subtle"
                  )}
                >
                  {i < currentStepIndex ? (
                    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                    </svg>
                  ) : (
                    i + 1
                  )}
                </button>
              ))}
            </div>
          </div>

          {/* Step header */}
          {step !== "review" && (
            <div className="mb-6">
              <h2 className="text-xl sm:text-2xl font-bold text-text-primary font-[family-name:var(--font-outfit)] tracking-tight">
                {stepInfo.title}
              </h2>
              <p className="text-sm text-text-secondary mt-1">{stepInfo.subtitle}</p>
            </div>
          )}

          {/* Picker content */}
          <div className="pb-28 lg:pb-8">
            {step === "keyboard" && (
              <KeyboardKitPicker
                selected={selections.keyboard}
                onSelect={handleKeyboardSelect}
              />
            )}
            {step === "switches" && (
              <SwitchPicker
                selected={selections.switches}
                onSelect={handleSwitchSelect}
                switchCount={switchCount}
              />
            )}
            {step === "keycaps" && (
              <KeycapPicker
                selection={selections.keycaps}
                onSelectProfile={(p) => dispatch({ type: "SELECT_KEYCAP_PROFILE", profile: p })}
                onSelectMaterial={(m) => dispatch({ type: "SELECT_KEYCAP_MATERIAL", material: m })}
                onSetDetails={(n, p) => dispatch({ type: "SET_KEYCAP_DETAILS", setName: n, price: p })}
              />
            )}
            {step === "stabilizers" && (
              <StabilizerPicker
                selected={selections.stabilizer}
                onSelect={(s) => dispatch({ type: "SET_STABILIZER", stabilizer: s })}
              />
            )}
            {step === "mods" && (
              <ModPicker
                selected={selections.mods}
                onToggle={(m) => dispatch({ type: "TOGGLE_MOD", mod: m })}
              />
            )}
            {step === "customize" && viewerConfig && (
              <div className={cn(onCustomizerPropsChange ? "" : "min-h-[500px]")}>
                <KeyboardCustomizer
                  viewerConfig={viewerConfig}
                  onOverridesChange={handleOverridesChange}
                  externalViewer={!!onCustomizerPropsChange}
                  onInteractivePropsChange={onCustomizerPropsChange}
                />
              </div>
            )}
            {step === "review" && (
              <CustomBuildReview
                selections={selections}
                switchCount={switchCount}
                onReset={() => dispatch({ type: "RESET" })}
                onBack={goPrev}
              />
            )}
          </div>
        </div>
      </div>

      {/* Mobile bottom bar */}
      {step !== "review" && (
        <div className="fixed bottom-0 left-0 right-0 lg:hidden z-30">
          <div className="bg-bg-surface/95 backdrop-blur-md border-t border-border-subtle px-4 py-3">
            <div className="flex items-center justify-between max-w-lg mx-auto">
              <div className="flex items-center gap-3">
                <span className="text-lg font-bold font-[family-name:var(--font-mono)] text-accent">
                  {formatPriceWhole(total)}
                </span>
                {soundProfile.primary !== "neutral" && (
                  <Badge variant="info" size="sm">
                    {soundProfile.primary}
                  </Badge>
                )}
              </div>
              <div className="flex items-center gap-2">
                {currentStepIndex > 0 && (
                  <Button variant="ghost" size="sm" onClick={goPrev}>
                    Back
                  </Button>
                )}
                <Button
                  size="sm"
                  onClick={goNext}
                  disabled={!canAdvance && step !== "mods" && step !== "customize"}
                >
                  {step === "mods"
                    ? (selections.mods.length === 0 ? "Skip" : "Customize")
                    : step === "customize"
                      ? (Object.keys(selections.perKeyOverrides).length === 0 ? "Skip" : "Review")
                      : "Next"}
                  <svg className="w-3.5 h-3.5 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Desktop nav buttons */}
      {step !== "review" && (
        <div className="hidden lg:flex items-center justify-between mt-4 pt-4 border-t border-border-subtle/30">
          <div>
            {currentStepIndex > 0 && (
              <Button variant="ghost" onClick={goPrev}>
                <svg className="w-4 h-4 mr-1.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
                Back
              </Button>
            )}
          </div>
          <Button onClick={goNext} disabled={!canAdvance && step !== "mods" && step !== "customize"}>
            {step === "mods"
              ? (selections.mods.length === 0 ? "Skip to Customize" : "Customize Keycaps")
              : step === "customize"
                ? (Object.keys(selections.perKeyOverrides).length === 0 ? "Skip to Review" : "Review Build")
                : "Continue"}
            <svg className="w-4 h-4 ml-1.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </Button>
        </div>
      )}
    </div>
  );
}
