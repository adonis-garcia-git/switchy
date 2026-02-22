"use client";

import { useState } from "react";
import { cn } from "@/lib/utils";
import { ColorPicker } from "./ColorPicker";
import type { BuilderQuestion } from "@/lib/types";

interface QuestionCardProps {
  question: BuilderQuestion;
  onAnswer: (value: string | string[] | number) => void;
  isActive: boolean;
}

export function QuestionCard({ question, onAnswer, isActive }: QuestionCardProps) {
  const [selectedSingle, setSelectedSingle] = useState<string | null>(null);
  const [selectedMulti, setSelectedMulti] = useState<string[]>([]);
  const [sliderValue, setSliderValue] = useState<number>(
    question.sliderConfig ? Math.round((question.sliderConfig.min + question.sliderConfig.max) / 2) : 0
  );

  if (!isActive) return null;

  const handleSingleSelect = (id: string) => {
    setSelectedSingle(id);
    // Auto-advance after a brief delay for visual feedback
    setTimeout(() => onAnswer(id), 600);
  };

  const handleMultiToggle = (id: string) => {
    setSelectedMulti((prev) =>
      prev.includes(id) ? prev.filter((v) => v !== id) : [...prev, id]
    );
  };

  const handleMultiConfirm = () => {
    if (selectedMulti.length > 0) onAnswer(selectedMulti);
  };

  const handleSliderConfirm = () => {
    onAnswer(sliderValue);
  };

  return (
    <div className="w-full">
      {/* Question header */}
      <div className="mb-6">
        <h2 className="text-2xl sm:text-3xl font-bold text-text-primary font-[family-name:var(--font-outfit)] tracking-tight leading-tight">
          {question.question}
        </h2>
        {question.subtitle && (
          <p className="text-sm text-text-secondary mt-2 leading-relaxed">
            {question.subtitle}
          </p>
        )}
      </div>

      {/* Single choice */}
      {question.type === "single-choice" && question.options && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {question.options.map((option) => (
            <button
              key={option.id}
              onClick={() => handleSingleSelect(option.id)}
              className={cn(
                "p-5 rounded-xl border text-left transition-[border-color,background-color,transform] duration-200",
                "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/40",
                "active:scale-[0.97]",
                selectedSingle === option.id
                  ? "border-accent bg-accent-dim scale-[0.98]"
                  : "border-border-subtle bg-bg-surface hover:border-border-accent hover:bg-bg-elevated/50"
              )}
            >
              <div className="flex items-center gap-3 mb-1.5">
                <div className={cn(
                  "w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0 transition-[border-color] duration-200",
                  selectedSingle === option.id ? "border-accent" : "border-text-muted/30"
                )}>
                  {selectedSingle === option.id && (
                    <div className="w-2.5 h-2.5 rounded-full bg-accent" />
                  )}
                </div>
                <p className="font-semibold text-text-primary text-sm font-[family-name:var(--font-outfit)]">
                  {option.label}
                </p>
              </div>
              {option.description && (
                <p className="text-xs text-text-muted ml-8 leading-relaxed">
                  {option.description}
                </p>
              )}
            </button>
          ))}
        </div>
      )}

      {/* Multi choice */}
      {question.type === "multi-choice" && question.options && (
        <div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 mb-4">
            {question.options.map((option) => (
              <button
                key={option.id}
                onClick={() => handleMultiToggle(option.id)}
                className={cn(
                  "p-5 rounded-xl border text-left transition-[border-color,background-color] duration-200",
                  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/40",
                  "active:scale-[0.97]",
                  selectedMulti.includes(option.id)
                    ? "border-accent bg-accent-dim"
                    : "border-border-subtle bg-bg-surface hover:border-border-accent"
                )}
              >
                <div className="flex items-center gap-3 mb-1.5">
                  <div className={cn(
                    "w-5 h-5 rounded border-2 flex items-center justify-center shrink-0 transition-[border-color,background-color] duration-200",
                    selectedMulti.includes(option.id) ? "border-accent bg-accent" : "border-text-muted/30"
                  )}>
                    {selectedMulti.includes(option.id) && (
                      <svg className="w-3 h-3 text-bg-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={3}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                      </svg>
                    )}
                  </div>
                  <p className="font-semibold text-text-primary text-sm font-[family-name:var(--font-outfit)]">
                    {option.label}
                  </p>
                </div>
                {option.description && (
                  <p className="text-xs text-text-muted ml-8 leading-relaxed">
                    {option.description}
                  </p>
                )}
              </button>
            ))}
          </div>
          <button
            onClick={handleMultiConfirm}
            disabled={selectedMulti.length === 0}
            className={cn(
              "px-6 py-2.5 rounded-xl font-semibold text-sm transition-[background-color,opacity] duration-200",
              "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/40",
              "active:scale-[0.97]",
              selectedMulti.length > 0
                ? "bg-accent text-bg-primary hover:bg-accent-hover"
                : "bg-bg-elevated text-text-muted cursor-not-allowed"
            )}
          >
            Continue ({selectedMulti.length} selected)
          </button>
        </div>
      )}

      {/* Color picker */}
      {question.type === "color-picker" && question.options && (
        <ColorPicker
          options={question.options}
          selected={selectedSingle}
          onSelect={handleSingleSelect}
        />
      )}

      {/* Slider */}
      {question.type === "slider" && question.sliderConfig && (() => {
        const { min, max, step, unit, labels } = question.sliderConfig;
        const range = max - min;
        const fillPercent = ((sliderValue - min) / range) * 100;

        // Find the active tier label based on current value
        const activeTier = labels
          ?.slice()
          .reverse()
          .find((l) => sliderValue >= l.value);

        return (
          <div className="space-y-5">
            {/* Value display */}
            <div className="flex flex-col items-center gap-1.5">
              <span className="text-4xl font-bold font-[family-name:var(--font-mono)] text-accent tabular-nums tracking-tight">
                {unit}{sliderValue}
              </span>
              {activeTier && (
                <span className="text-xs font-medium text-text-secondary uppercase tracking-wider">
                  {activeTier.label}
                </span>
              )}
            </div>

            {/* Track + slider */}
            <div className="relative px-1">
              {/* Custom filled track behind the native input */}
              <div className="absolute top-1/2 left-1 right-1 -translate-y-1/2 h-2 rounded-full bg-bg-elevated pointer-events-none">
                <div
                  className="h-full rounded-full bg-gradient-to-r from-accent/70 to-accent transition-[width] duration-75"
                  style={{ width: `${fillPercent}%` }}
                />
              </div>
              <input
                type="range"
                min={min}
                max={max}
                step={step}
                value={sliderValue}
                onChange={(e) => setSliderValue(Number(e.target.value))}
                className="relative w-full h-2 rounded-full appearance-none bg-transparent cursor-pointer z-[1] [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-6 [&::-webkit-slider-thumb]:h-6 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-accent [&::-webkit-slider-thumb]:border-2 [&::-webkit-slider-thumb]:border-bg-primary [&::-webkit-slider-thumb]:shadow-[0_0_12px_rgba(232,89,12,0.4)] [&::-webkit-slider-thumb]:cursor-pointer"
              />

              {/* Labels positioned at their actual values along the track */}
              {labels && labels.length > 0 && (
                <div className="relative w-full mt-4 h-8">
                  {labels.map((label) => {
                    const pct = ((label.value - min) / range) * 100;
                    return (
                      <div
                        key={label.value}
                        className="absolute flex flex-col items-center -translate-x-1/2"
                        style={{ left: `${pct}%` }}
                      >
                        <span className="text-[10px] text-text-muted font-[family-name:var(--font-mono)] whitespace-nowrap">
                          {unit}{label.value}
                        </span>
                        <span className="text-[10px] text-text-muted whitespace-nowrap">
                          {label.label}
                        </span>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Min / max range indicators */}
            <div className="flex justify-between px-1 -mt-2">
              <span className="text-[10px] text-text-muted/50 font-[family-name:var(--font-mono)]">{unit}{min}</span>
              <span className="text-[10px] text-text-muted/50 font-[family-name:var(--font-mono)]">{unit}{max}</span>
            </div>

            <div className="text-center pt-1">
              <button
                onClick={handleSliderConfirm}
                className="px-6 py-2.5 rounded-xl font-semibold text-sm bg-accent text-bg-primary hover:bg-accent-hover transition-[background-color] duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/40 active:scale-[0.97]"
              >
                Continue
              </button>
            </div>
          </div>
        );
      })()}
    </div>
  );
}
