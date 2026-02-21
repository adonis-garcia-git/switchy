"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/Button";
import type { WizardFormData, WizardUseCase, WizardSoundPref, WizardBudget, WizardSize, WizardPriority } from "@/lib/types";

const STEPS = ["Use Case", "Sound", "Budget", "Size", "Priorities", "Review"];

const USE_CASES: { value: WizardUseCase; label: string; icon: string; desc: string }[] = [
  { value: "gaming", label: "Gaming", icon: "🎮", desc: "Fast response, smooth keypresses" },
  { value: "programming", label: "Programming", icon: "💻", desc: "Comfortable for long coding sessions" },
  { value: "office", label: "Office / Typing", icon: "📝", desc: "Quiet, professional, great for typing" },
  { value: "content-creation", label: "Content Creation", icon: "🎬", desc: "Macro support, versatile" },
  { value: "all-around", label: "All-Around", icon: "🌟", desc: "Best balance of everything" },
];

const SOUND_PREFS: { value: WizardSoundPref; label: string; desc: string }[] = [
  { value: "thocky", label: "Thocky", desc: "Deep, muted, satisfying bass" },
  { value: "clacky", label: "Clacky", desc: "Sharp, bright, crisp highs" },
  { value: "creamy", label: "Creamy", desc: "Smooth, buttery, refined" },
  { value: "poppy", label: "Poppy", desc: "Snappy, crisp, bouncy" },
  { value: "silent", label: "Silent", desc: "As quiet as possible" },
  { value: "no-preference", label: "No Preference", desc: "Let the AI decide" },
];

const BUDGETS: { value: WizardBudget; label: string; desc: string }[] = [
  { value: "under-100", label: "Under $100", desc: "Entry-level custom" },
  { value: "100-200", label: "$100 - $200", desc: "Sweet spot for beginners" },
  { value: "200-350", label: "$200 - $350", desc: "Mid-range enthusiast" },
  { value: "350-500", label: "$350 - $500", desc: "Premium build quality" },
  { value: "500-plus", label: "$500+", desc: "No compromises" },
];

const SIZES: { value: WizardSize; label: string; desc: string; visual: string }[] = [
  { value: "60", label: "60%", desc: "Compact, no arrows or F-row", visual: "▓▓▓▓▓▓▓▓▓▓" },
  { value: "65", label: "65%", desc: "Compact + arrow keys", visual: "▓▓▓▓▓▓▓▓▓▓▓" },
  { value: "75", label: "75%", desc: "Compact + F-row + arrows", visual: "▓▓▓▓▓▓▓▓▓▓▓▓" },
  { value: "tkl", label: "TKL", desc: "Full layout, no numpad", visual: "▓▓▓▓▓▓▓▓▓▓▓▓▓▓" },
  { value: "full", label: "Full Size", desc: "Everything included", visual: "▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓" },
];

const PRIORITIES: { value: WizardPriority; label: string }[] = [
  { value: "sound-quality", label: "Sound Quality" },
  { value: "typing-feel", label: "Typing Feel" },
  { value: "build-quality", label: "Build Quality" },
  { value: "wireless", label: "Wireless" },
  { value: "rgb", label: "RGB Lighting" },
  { value: "budget-friendly", label: "Budget-Friendly" },
  { value: "easy-build", label: "Easy to Build" },
];

function buildQueryFromWizard(data: WizardFormData): string {
  const parts: string[] = [];

  if (data.useCases.length > 0) {
    const uses = data.useCases.map(u => USE_CASES.find(c => c.value === u)?.label).filter(Boolean);
    parts.push(`I'll be using this keyboard for ${uses.join(" and ")}.`);
  }

  if (data.soundPreference && data.soundPreference !== "no-preference") {
    const sound = SOUND_PREFS.find(s => s.value === data.soundPreference);
    parts.push(`I want a ${sound?.label.toLowerCase()} sound profile.`);
  }

  if (data.budget) {
    const budget = BUDGETS.find(b => b.value === data.budget);
    parts.push(`My budget is ${budget?.label}.`);
  }

  if (data.size) {
    const size = SIZES.find(s => s.value === data.size);
    parts.push(`I prefer a ${size?.label} layout.`);
  }

  if (data.priorities.length > 0) {
    const prios = data.priorities.map(p => PRIORITIES.find(pr => pr.value === p)?.label).filter(Boolean);
    parts.push(`My top priorities are ${prios.join(" and ")}.`);
  }

  return parts.join(" ");
}

export default function WizardPage() {
  const router = useRouter();
  const [step, setStep] = useState(0);
  const [formData, setFormData] = useState<WizardFormData>({
    useCases: [],
    soundPreference: null,
    budget: null,
    size: null,
    priorities: [],
  });

  const canNext = () => {
    switch (step) {
      case 0: return formData.useCases.length > 0;
      case 1: return formData.soundPreference !== null;
      case 2: return formData.budget !== null;
      case 3: return formData.size !== null;
      case 4: return formData.priorities.length >= 1;
      default: return true;
    }
  };

  const toggleUseCase = (uc: WizardUseCase) => {
    setFormData(prev => ({
      ...prev,
      useCases: prev.useCases.includes(uc)
        ? prev.useCases.filter(u => u !== uc)
        : [...prev.useCases, uc],
    }));
  };

  const togglePriority = (p: WizardPriority) => {
    setFormData(prev => ({
      ...prev,
      priorities: prev.priorities.includes(p)
        ? prev.priorities.filter(pr => pr !== p)
        : prev.priorities.length < 3
          ? [...prev.priorities, p]
          : prev.priorities,
    }));
  };

  const handleGenerate = () => {
    const query = buildQueryFromWizard(formData);
    router.push(`/advisor?q=${encodeURIComponent(query)}`);
  };

  return (
    <div className="p-6 lg:p-8 max-w-2xl mx-auto">
      <h1 className="text-2xl font-bold text-text-primary mb-2">Build Wizard</h1>
      <p className="text-text-muted mb-8">Answer a few questions to get a personalized recommendation.</p>

      {/* Progress */}
      <div className="flex items-center gap-1 mb-8">
        {STEPS.map((s, i) => (
          <div key={s} className="flex-1">
            <div className={cn(
              "h-1.5 rounded-full transition-colors",
              i <= step ? "bg-accent" : "bg-bg-elevated"
            )} />
            <p className={cn(
              "text-[10px] mt-1 text-center",
              i === step ? "text-accent" : "text-text-muted"
            )}>{s}</p>
          </div>
        ))}
      </div>

      {/* Step Content */}
      <div className="min-h-[300px]">
        {step === 0 && (
          <div>
            <h2 className="text-lg font-semibold mb-4">What will you use this keyboard for?</h2>
            <p className="text-sm text-text-muted mb-4">Select one or more.</p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {USE_CASES.map((uc) => (
                <button
                  key={uc.value}
                  onClick={() => toggleUseCase(uc.value)}
                  className={cn(
                    "p-4 rounded-xl border text-left transition-all",
                    formData.useCases.includes(uc.value)
                      ? "border-accent bg-accent/10"
                      : "border-border-subtle bg-bg-surface hover:border-accent/30"
                  )}
                >
                  <span className="text-2xl block mb-1">{uc.icon}</span>
                  <p className="font-medium text-text-primary">{uc.label}</p>
                  <p className="text-xs text-text-muted mt-0.5">{uc.desc}</p>
                </button>
              ))}
            </div>
          </div>
        )}

        {step === 1 && (
          <div>
            <h2 className="text-lg font-semibold mb-4">What sound do you want?</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {SOUND_PREFS.map((sp) => (
                <button
                  key={sp.value}
                  onClick={() => setFormData(prev => ({ ...prev, soundPreference: sp.value }))}
                  className={cn(
                    "p-4 rounded-xl border text-left transition-all",
                    formData.soundPreference === sp.value
                      ? "border-accent bg-accent/10"
                      : "border-border-subtle bg-bg-surface hover:border-accent/30"
                  )}
                >
                  <p className="font-medium text-text-primary">{sp.label}</p>
                  <p className="text-xs text-text-muted mt-0.5">{sp.desc}</p>
                </button>
              ))}
            </div>
          </div>
        )}

        {step === 2 && (
          <div>
            <h2 className="text-lg font-semibold mb-4">What&apos;s your budget?</h2>
            <div className="space-y-2">
              {BUDGETS.map((b) => (
                <button
                  key={b.value}
                  onClick={() => setFormData(prev => ({ ...prev, budget: b.value }))}
                  className={cn(
                    "w-full p-4 rounded-xl border text-left transition-all flex items-center justify-between",
                    formData.budget === b.value
                      ? "border-accent bg-accent/10"
                      : "border-border-subtle bg-bg-surface hover:border-accent/30"
                  )}
                >
                  <div>
                    <p className="font-medium text-text-primary">{b.label}</p>
                    <p className="text-xs text-text-muted">{b.desc}</p>
                  </div>
                  <div className={cn(
                    "w-5 h-5 rounded-full border-2 flex items-center justify-center",
                    formData.budget === b.value ? "border-accent" : "border-text-muted/30"
                  )}>
                    {formData.budget === b.value && <div className="w-2.5 h-2.5 rounded-full bg-accent" />}
                  </div>
                </button>
              ))}
            </div>
          </div>
        )}

        {step === 3 && (
          <div>
            <h2 className="text-lg font-semibold mb-4">What size keyboard?</h2>
            <div className="space-y-2">
              {SIZES.map((s) => (
                <button
                  key={s.value}
                  onClick={() => setFormData(prev => ({ ...prev, size: s.value }))}
                  className={cn(
                    "w-full p-4 rounded-xl border text-left transition-all",
                    formData.size === s.value
                      ? "border-accent bg-accent/10"
                      : "border-border-subtle bg-bg-surface hover:border-accent/30"
                  )}
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium text-text-primary">{s.label}</p>
                      <p className="text-xs text-text-muted">{s.desc}</p>
                    </div>
                    <span className="font-mono text-xs text-accent">{s.visual}</span>
                  </div>
                </button>
              ))}
            </div>
          </div>
        )}

        {step === 4 && (
          <div>
            <h2 className="text-lg font-semibold mb-4">What matters most? (Pick up to 3)</h2>
            <div className="flex flex-wrap gap-2">
              {PRIORITIES.map((p) => (
                <button
                  key={p.value}
                  onClick={() => togglePriority(p.value)}
                  className={cn(
                    "px-4 py-2.5 rounded-full border text-sm font-medium transition-all",
                    formData.priorities.includes(p.value)
                      ? "border-accent bg-accent/10 text-accent"
                      : "border-border-subtle bg-bg-surface text-text-secondary hover:border-accent/30"
                  )}
                >
                  {p.label}
                </button>
              ))}
            </div>
          </div>
        )}

        {step === 5 && (
          <div>
            <h2 className="text-lg font-semibold mb-4">Review Your Preferences</h2>
            <div className="space-y-3 rounded-xl border border-border-default bg-bg-surface p-5">
              <div>
                <p className="text-xs text-text-muted uppercase tracking-wider">Use Case</p>
                <p className="text-text-primary">{formData.useCases.map(u => USE_CASES.find(c => c.value === u)?.label).join(", ")}</p>
              </div>
              <div>
                <p className="text-xs text-text-muted uppercase tracking-wider">Sound</p>
                <p className="text-text-primary">{SOUND_PREFS.find(s => s.value === formData.soundPreference)?.label || "—"}</p>
              </div>
              <div>
                <p className="text-xs text-text-muted uppercase tracking-wider">Budget</p>
                <p className="text-text-primary">{BUDGETS.find(b => b.value === formData.budget)?.label || "—"}</p>
              </div>
              <div>
                <p className="text-xs text-text-muted uppercase tracking-wider">Size</p>
                <p className="text-text-primary">{SIZES.find(s => s.value === formData.size)?.label || "—"}</p>
              </div>
              <div>
                <p className="text-xs text-text-muted uppercase tracking-wider">Priorities</p>
                <p className="text-text-primary">{formData.priorities.map(p => PRIORITIES.find(pr => pr.value === p)?.label).join(", ") || "—"}</p>
              </div>
            </div>

            <div className="mt-4 p-4 rounded-xl bg-accent/5 border border-accent/20">
              <p className="text-xs text-accent uppercase tracking-wider mb-1">Generated Query</p>
              <p className="text-sm text-text-secondary">{buildQueryFromWizard(formData)}</p>
            </div>
          </div>
        )}
      </div>

      {/* Navigation */}
      <div className="flex items-center justify-between mt-8 pt-6 border-t border-border-subtle">
        <Button
          variant="ghost"
          onClick={() => step > 0 ? setStep(step - 1) : router.push("/")}
        >
          {step === 0 ? "Cancel" : "Back"}
        </Button>

        {step < 5 ? (
          <Button onClick={() => setStep(step + 1)} disabled={!canNext()}>
            Next
          </Button>
        ) : (
          <Button onClick={handleGenerate}>
            Generate My Build
          </Button>
        )}
      </div>
    </div>
  );
}
