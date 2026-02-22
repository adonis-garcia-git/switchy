"use client";

import { useState, useEffect } from "react";

const GENERATION_STEPS = [
  { message: "Analyzing your preferences...", icon: "🎯" },
  { message: "Selecting the perfect switches...", icon: "⚡" },
  { message: "Matching keyboard kits...", icon: "⌨️" },
  { message: "Choosing keycaps for your sound profile...", icon: "🎨" },
  { message: "Calculating the build...", icon: "🔧" },
  { message: "Fine-tuning recommendations...", icon: "✨" },
];

export function GeneratingState() {
  const [currentStep, setCurrentStep] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentStep((prev) => (prev + 1) % GENERATION_STEPS.length);
    }, 2200);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="flex flex-col items-center justify-center py-16 px-4">
      {/* Animated spinner */}
      <div className="relative w-20 h-20 mb-8">
        <div className="absolute inset-0 rounded-full border-2 border-border-subtle" />
        <div className="absolute inset-0 rounded-full border-2 border-transparent border-t-accent animate-spin" />
        <div className="absolute inset-2 rounded-full border-2 border-transparent border-b-accent/50 animate-spin [animation-direction:reverse] [animation-duration:1.5s]" />
        <div className="absolute inset-0 flex items-center justify-center text-2xl">
          {GENERATION_STEPS[currentStep].icon}
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

      {/* Step indicators */}
      <div className="flex items-center gap-1.5 mt-8">
        {GENERATION_STEPS.map((_, i) => (
          <div
            key={i}
            className={`h-1 rounded-full transition-[width,background-color] duration-500 ${
              i <= currentStep
                ? "w-6 bg-accent"
                : "w-2 bg-border-subtle"
            }`}
          />
        ))}
      </div>
    </div>
  );
}
