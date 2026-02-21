"use client";

import { useState } from "react";
import { useQuery, useMutation } from "convex/react";
import { useUser } from "@clerk/nextjs";
import { api } from "../../convex/_generated/api";
import { Modal } from "@/components/ui/Modal";
import { Button } from "@/components/ui/Button";
import { cn } from "@/lib/utils";

const EXP_LEVELS = [
  { value: "beginner", label: "Beginner", desc: "New to custom keyboards" },
  { value: "intermediate", label: "Intermediate", desc: "Built 1-2 keyboards before" },
  { value: "expert", label: "Expert", desc: "Experienced builder" },
] as const;

const SOUNDS = [
  { value: "thocky", label: "Thocky", desc: "Deep, muted" },
  { value: "clacky", label: "Clacky", desc: "Sharp, bright" },
  { value: "creamy", label: "Creamy", desc: "Smooth, buttery" },
  { value: "no-preference", label: "Not Sure", desc: "Help me decide" },
] as const;

const BUDGETS = [
  { value: { min: 0, max: 150 }, label: "Under $150" },
  { value: { min: 150, max: 300 }, label: "$150 - $300" },
  { value: { min: 300, max: 500 }, label: "$300 - $500" },
  { value: { min: 500, max: 1000 }, label: "$500+" },
] as const;

const STEP_LABELS = ["Experience", "Sound", "Budget"];

export function OnboardingModal() {
  const { isSignedIn } = useUser();
  const preferences = useQuery(api.userPreferences.get, isSignedIn ? {} : "skip");
  const savePrefs = useMutation(api.userPreferences.save);

  const [step, setStep] = useState(0);
  const [experienceLevel, setExperienceLevel] = useState<"beginner" | "intermediate" | "expert" | null>(null);
  const [preferredSound, setPreferredSound] = useState<string | null>(null);
  const [budgetRange, setBudgetRange] = useState<{ min: number; max: number } | null>(null);
  const [dismissed, setDismissed] = useState(false);

  const shouldShow = isSignedIn && preferences !== undefined && !preferences?.hasCompletedOnboarding && !dismissed;

  const handleSave = async () => {
    if (!experienceLevel) return;
    await savePrefs({
      experienceLevel,
      preferredSound: preferredSound === "no-preference" ? undefined : preferredSound || undefined,
      budgetRange: budgetRange || undefined,
    });
    setDismissed(true);
  };

  if (!shouldShow) return null;

  return (
    <Modal isOpen={true} onClose={() => setDismissed(true)} title="Welcome to Switchy" size="md">
      {/* Step indicators */}
      <div className="flex items-center gap-2 mb-6">
        {STEP_LABELS.map((label, i) => (
          <div key={label} className="flex-1">
            <div className={cn(
              "h-1 rounded-full transition-colors duration-200",
              i <= step ? "bg-accent" : "bg-bg-elevated"
            )} />
            <p className={cn(
              "text-[10px] mt-1.5 text-center font-medium",
              i === step ? "text-accent" : "text-text-muted"
            )}>{label}</p>
          </div>
        ))}
      </div>

      {step === 0 && (
        <div>
          <p className="text-sm text-text-secondary mb-4">What&apos;s your experience level with custom keyboards?</p>
          <div className="space-y-2">
            {EXP_LEVELS.map((level) => (
              <button
                key={level.value}
                onClick={() => setExperienceLevel(level.value)}
                className={cn(
                  "w-full p-4 rounded-xl border text-left transition-[border-color,background-color] duration-200 flex items-center gap-3",
                  experienceLevel === level.value
                    ? "border-accent bg-accent-dim"
                    : "border-border-subtle bg-bg-surface hover:border-border-accent",
                  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/40"
                )}
              >
                <div className={cn(
                  "w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0",
                  experienceLevel === level.value ? "border-accent" : "border-text-muted/30"
                )}>
                  {experienceLevel === level.value && <div className="w-2.5 h-2.5 rounded-full bg-accent" />}
                </div>
                <div>
                  <p className="font-medium text-text-primary text-sm">{level.label}</p>
                  <p className="text-xs text-text-muted">{level.desc}</p>
                </div>
              </button>
            ))}
          </div>
        </div>
      )}

      {step === 1 && (
        <div>
          <p className="text-sm text-text-secondary mb-4">What sound do you like?</p>
          <div className="grid grid-cols-2 gap-2">
            {SOUNDS.map((s) => (
              <button
                key={s.value}
                onClick={() => setPreferredSound(s.value)}
                className={cn(
                  "p-4 rounded-xl border text-left transition-[border-color,background-color] duration-200",
                  preferredSound === s.value
                    ? "border-accent bg-accent-dim"
                    : "border-border-subtle bg-bg-surface hover:border-border-accent",
                  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/40"
                )}
              >
                <p className="font-medium text-text-primary text-sm">{s.label}</p>
                <p className="text-xs text-text-muted mt-0.5">{s.desc}</p>
              </button>
            ))}
          </div>
        </div>
      )}

      {step === 2 && (
        <div>
          <p className="text-sm text-text-secondary mb-4">What&apos;s your budget range?</p>
          <div className="space-y-2">
            {BUDGETS.map((b) => (
              <button
                key={b.label}
                onClick={() => setBudgetRange({ min: b.value.min, max: b.value.max })}
                className={cn(
                  "w-full p-3.5 rounded-xl border text-left transition-[border-color,background-color] duration-200 flex items-center justify-between",
                  budgetRange?.min === b.value.min && budgetRange?.max === b.value.max
                    ? "border-accent bg-accent-dim"
                    : "border-border-subtle bg-bg-surface hover:border-border-accent",
                  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/40"
                )}
              >
                <p className="font-medium text-text-primary text-sm">{b.label}</p>
                <div className={cn(
                  "w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0",
                  budgetRange?.min === b.value.min && budgetRange?.max === b.value.max ? "border-accent" : "border-text-muted/30"
                )}>
                  {budgetRange?.min === b.value.min && budgetRange?.max === b.value.max && (
                    <div className="w-2.5 h-2.5 rounded-full bg-accent" />
                  )}
                </div>
              </button>
            ))}
          </div>
        </div>
      )}

      <div className="flex justify-between mt-6 pt-4 border-t border-border-subtle">
        <Button variant="ghost" onClick={() => setDismissed(true)}>Skip</Button>
        <div className="flex gap-2">
          {step > 0 && (
            <Button variant="secondary" onClick={() => setStep(step - 1)}>Back</Button>
          )}
          {step < 2 ? (
            <Button
              onClick={() => setStep(step + 1)}
              disabled={step === 0 && !experienceLevel}
            >
              Next
            </Button>
          ) : (
            <Button onClick={handleSave} disabled={!experienceLevel}>
              Done
            </Button>
          )}
        </div>
      </div>
    </Modal>
  );
}
