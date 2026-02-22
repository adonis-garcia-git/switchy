"use client";

import { useState, useEffect, useRef } from "react";
import type { KeyboardViewerConfig } from "@/lib/keyboard3d";

const GENERATION_STEPS = [
  {
    message: "Analyzing your preferences...",
    icon: "M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z", // target/clock
  },
  {
    message: "Selecting the perfect switches...",
    icon: "M13 10V3L4 14h7v7l9-11h-7z", // zap
  },
  {
    message: "Matching keyboard kits...",
    icon: "M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z", // keyboard
  },
  {
    message: "Choosing keycaps for your sound profile...",
    icon: "M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zm0 0h12a2 2 0 002-2v-4a2 2 0 00-2-2h-2.343M11 7.343l1.657-1.657a2 2 0 012.828 0l2.829 2.829a2 2 0 010 2.828l-8.486 8.485M7 17h.01", // palette
  },
  {
    message: "Calculating the build...",
    icon: "M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.066 2.573c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.573 1.066c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.066-2.573c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z", // wrench/cog
  },
  {
    message: "Fine-tuning recommendations...",
    icon: "M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z", // sparkles
  },
];

// Visual updates to cycle through during each generation step
const STEP_VIEWER_UPDATES: (Partial<KeyboardViewerConfig> | null)[] = [
  null, // Step 0: "Analyzing preferences" — no change
  { switchStemColor: "#c0392b", hasRGB: true, rgbMode: "reactive" }, // Step 1: switches
  { caseMaterial: "aluminum", caseFinish: "satin" }, // Step 2: keyboard kits
  { keycapProfile: "sa" }, // Step 3: keycaps
  { environment: "warehouse" }, // Step 4: calculating
  { cameraPreset: "hero" }, // Step 5: fine-tuning
];

interface GeneratingStateProps {
  onAbort?: () => void;
  onViewerUpdate?: (update: Partial<KeyboardViewerConfig>) => void;
}

export function GeneratingState({ onAbort, onViewerUpdate }: GeneratingStateProps) {
  const [currentStep, setCurrentStep] = useState(0);
  const [progress, setProgress] = useState(0);
  const [showAbort, setShowAbort] = useState(false);
  const startTimeRef = useRef(Date.now());

  // Deterministic progress: 0-85% over 15s (ease-out quadratic), creep to 90% over next 30s
  useEffect(() => {
    const animate = () => {
      const elapsed = (Date.now() - startTimeRef.current) / 1000;
      let pct: number;
      if (elapsed <= 15) {
        // Ease-out quadratic: fast start, slows down
        const t = elapsed / 15;
        pct = 85 * (1 - (1 - t) * (1 - t));
      } else {
        // Slow creep from 85 to 90 over the next 30s
        const extra = Math.min((elapsed - 15) / 30, 1);
        pct = 85 + 5 * extra;
      }
      setProgress(Math.min(pct, 90));
    };

    const interval = setInterval(animate, 50);
    return () => clearInterval(interval);
  }, []);

  // Stable ref for onViewerUpdate to avoid re-triggering cycle
  const viewerUpdateRef = useRef(onViewerUpdate);
  viewerUpdateRef.current = onViewerUpdate;

  // Cycle through steps
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentStep((prev) => (prev + 1) % GENERATION_STEPS.length);
    }, 2500);
    return () => clearInterval(interval);
  }, []);

  // Apply viewer updates when step changes (separate effect to avoid
  // updating parent state inside a state updater callback)
  useEffect(() => {
    const update = STEP_VIEWER_UPDATES[currentStep];
    if (update && viewerUpdateRef.current) {
      viewerUpdateRef.current(update);
    }
  }, [currentStep]);

  // Show abort after 20s
  useEffect(() => {
    const timer = setTimeout(() => setShowAbort(true), 20000);
    return () => clearTimeout(timer);
  }, []);

  return (
    <div className="flex flex-col items-center justify-center py-16 px-4">
      {/* Animated spinner with SVG icon */}
      <div className="relative w-20 h-20 mb-8">
        <div className="absolute inset-0 rounded-full border-2 border-border-subtle" />
        <div className="absolute inset-0 rounded-full border-2 border-transparent border-t-accent animate-spin" />
        <div className="absolute inset-2 rounded-full border-2 border-transparent border-b-accent/50 animate-spin [animation-direction:reverse] [animation-duration:1.5s]" />
        <div className="absolute inset-0 flex items-center justify-center">
          <svg
            className="w-6 h-6 text-accent transition-opacity duration-300"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            strokeWidth={1.5}
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d={GENERATION_STEPS[currentStep].icon}
            />
          </svg>
        </div>
      </div>

      {/* Progress message */}
      <div className="text-center space-y-2 min-h-[60px]">
        <p className="text-lg font-semibold text-text-primary font-[family-name:var(--font-outfit)] tracking-tight">
          Building your dream keyboard
        </p>
        <p className="text-sm text-text-secondary animate-pulse">
          {GENERATION_STEPS[currentStep].message}
        </p>
      </div>

      {/* Deterministic progress bar */}
      <div className="w-full max-w-xs mt-8">
        <div className="h-2 rounded-full bg-bg-elevated overflow-hidden">
          <div
            className="h-full rounded-full bg-gradient-to-r from-accent/70 to-accent transition-[width] duration-150 ease-out"
            style={{ width: `${progress}%` }}
          />
        </div>
        <p className="text-xs text-text-muted text-center mt-2 font-[family-name:var(--font-mono)]">
          {Math.round(progress)}%
        </p>
      </div>

      {/* Abort link */}
      {showAbort && onAbort && (
        <button
          onClick={onAbort}
          className="mt-6 text-xs text-text-muted hover:text-accent transition-colors duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/40 rounded"
        >
          Taking too long? Cancel
        </button>
      )}
    </div>
  );
}
