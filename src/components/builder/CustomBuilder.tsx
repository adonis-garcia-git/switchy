"use client";

import { useReducer, useMemo, useCallback } from "react";
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
import { checkCompatibility } from "@/lib/compatibilityCheck";
import type {
  CustomBuilderStep,
  CustomBuilderState,
  CustomBuilderAction,
  KeyboardData,
  SwitchData,
} from "@/lib/types";
import type { PerKeyOverrides } from "@/lib/keyCustomization";
import type { KeyboardViewerConfig } from "@/lib/keyboard3d";

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
}

export function CustomBuilder({ onViewerUpdate, viewerConfig }: CustomBuilderProps) {
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

  const compatWarnings = useMemo(
    () => checkCompatibility(selections),
    [selections]
  );

  const currentStepIndex = STEP_ORDER.indexOf(step);
  const stepInfo = STEP_TITLES[step];

  const goNext = useCallback(() => {
    const nextIndex = currentStepIndex + 1;
    if (nextIndex < STEP_ORDER.length) {
      dispatch({ type: "SET_STEP", step: STEP_ORDER[nextIndex] });
    }
  }, [currentStepIndex]);

  const goPrev = useCallback(() => {
    const prevIndex = currentStepIndex - 1;
    if (prevIndex >= 0) {
      dispatch({ type: "SET_STEP", step: STEP_ORDER[prevIndex] });
    }
  }, [currentStepIndex]);

  // Update 3D viewer when keyboard is selected
  const handleKeyboardSelect = useCallback(
    (kb: KeyboardData) => {
      dispatch({ type: "SELECT_KEYBOARD", keyboard: kb });
      if (onViewerUpdate) {
        const sizeMap: Record<string, "60" | "65" | "75" | "tkl" | "full"> = {
          "60%": "60", "65%": "65", "75%": "75", "TKL": "tkl", "80%": "tkl",
          "Full-size": "full", "100%": "full",
        };
        onViewerUpdate({
          size: sizeMap[kb.size] || "65",
          hasRGB: kb.rgb,
        });
      }
    },
    [onViewerUpdate]
  );

  const handleSwitchSelect = useCallback(
    (sw: SwitchData) => {
      dispatch({ type: "SELECT_SWITCHES", switches: sw });
    },
    []
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
              onStepClick={(s) => dispatch({ type: "SET_STEP", step: s })}
              switchCount={switchCount}
            />
          </div>
        </div>

        {/* Main content */}
        <div className="flex-1 min-w-0">
          {/* Mobile step indicator — pill strip */}
          <div className="lg:hidden mb-4">
            <div className="flex items-center gap-2 overflow-x-auto pb-2 snap-x snap-mandatory [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
              {STEP_ORDER.map((s, i) => {
                const isActive = step === s;
                const isCompleted = i < currentStepIndex;
                const abbreviations: Record<string, string> = {
                  keyboard: "KB", switches: "SW", keycaps: "KC",
                  stabilizers: "Stab", mods: "Mods", customize: "Paint", review: "Review",
                };
                const icons: Record<string, string> = {
                  keyboard: "M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z",
                  switches: "M13 10V3L4 14h7v7l9-11h-7z",
                  keycaps: "M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4",
                  stabilizers: "M4 6h16M4 10h16M4 14h16M4 18h16",
                  mods: "M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4",
                  customize: "M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zm0 0h12a2 2 0 002-2v-4a2 2 0 00-2-2h-2.343M11 7.343l1.657-1.657a2 2 0 012.828 0l2.829 2.829a2 2 0 010 2.828l-8.486 8.485",
                  review: "M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z",
                };

                return (
                  <button
                    key={s}
                    onClick={() => dispatch({ type: "SET_STEP", step: s })}
                    className={cn(
                      "flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium shrink-0 snap-start",
                      "transition-[background-color,color,border-color] duration-150",
                      "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/40",
                      isActive
                        ? "bg-accent text-white"
                        : isCompleted
                          ? "bg-emerald-500/15 text-emerald-400 border border-emerald-500/20"
                          : "bg-bg-elevated text-text-muted border border-border-subtle"
                    )}
                  >
                    {isCompleted ? (
                      <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                      </svg>
                    ) : (
                      <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={icons[s]} />
                      </svg>
                    )}
                    {abbreviations[s]}
                  </button>
                );
              })}
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
              <div className="min-h-[500px]">
                <KeyboardCustomizer
                  viewerConfig={viewerConfig}
                  onOverridesChange={handleOverridesChange}
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

      {/* Compatibility warnings */}
      {compatWarnings.length > 0 && step !== "review" && (
        <div className="mt-4 space-y-2">
          {compatWarnings.map((w, i) => (
            <div
              key={i}
              className={cn(
                "flex items-start gap-2.5 px-4 py-3 rounded-xl text-sm",
                w.severity === "warning"
                  ? "bg-amber-500/10 border border-amber-500/20 text-amber-200"
                  : "bg-blue-500/10 border border-blue-500/20 text-blue-200"
              )}
            >
              <svg
                className={cn(
                  "w-4 h-4 mt-0.5 shrink-0",
                  w.severity === "warning" ? "text-amber-400" : "text-blue-400"
                )}
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                {w.severity === "warning" ? (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.34 16.5c-.77.833.192 2.5 1.732 2.5z" />
                ) : (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                )}
              </svg>
              <span>{w.message}</span>
            </div>
          ))}
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
              ? (selections.mods.length === 0 ? "Skip \u2014 No Mods" : "Customize Keycaps")
              : step === "customize"
                ? (Object.keys(selections.perKeyOverrides).length === 0 ? "Skip \u2014 No Customization" : "Review Build")
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
