"use client";

import { QuestionCard } from "./QuestionCard";
import type { BuilderQuestion, BuilderAnswer } from "@/lib/types";
import type { KeyboardViewerConfig } from "@/lib/keyboard3d";

const TOPIC_LABELS: Record<string, string> = {
  size: "Size",
  switch_type: "Switches",
  sound: "Sound",
  sound_profile: "Sound",
  budget: "Budget",
  colors: "Colors",
  keycap_color: "Keycaps",
  layout: "Layout",
  features: "Features",
  use_case: "Use Case",
  wireless: "Wireless",
  rgb: "RGB",
  mods: "Mods",
};

function getTopicLabel(questionId: string): string {
  return TOPIC_LABELS[questionId] || questionId.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
}

interface QuestionFlowProps {
  questions: BuilderQuestion[];
  currentIndex: number;
  answers: BuilderAnswer[];
  onAnswer: (questionId: string, value: string | string[] | number) => void;
  onViewerUpdate?: (update: Partial<KeyboardViewerConfig>) => void;
  onBack?: () => void;
  onJumpToQuestion?: (index: number) => void;
}

export function QuestionFlow({
  questions,
  currentIndex,
  answers,
  onAnswer,
  onViewerUpdate,
  onBack,
  onJumpToQuestion,
}: QuestionFlowProps) {
  const handleAnswer = (questionId: string, value: string | string[] | number) => {
    if (onViewerUpdate) {
      const question = questions.find((q) => q.id === questionId);

      if (question) {
        // ── Slider (budget) — map numeric value to tiered viewer updates ──
        if (question.type === "slider" && typeof value === "number" && questionId === "budget") {
          const budgetUpdate: Partial<KeyboardViewerConfig> =
            value <= 150 ? { caseMaterial: "plastic", caseFinish: "matte" }
            : value <= 250 ? { caseMaterial: "aluminum", caseFinish: "matte" }
            : value <= 400 ? { caseMaterial: "aluminum", caseFinish: "satin" }
            : { caseMaterial: "aluminum", caseFinish: "glossy" };
          onViewerUpdate(budgetUpdate);
        }
        // ── Color-picker — extract color from option ──
        else if (question.type === "color-picker" && typeof value === "string") {
          const colorOption = question.options?.find((o) => o.id === value);
          if (colorOption?.color) {
            if (questionId === "keycap_color") {
              onViewerUpdate({ keycapColor: colorOption.color });
            } else {
              // Default: case color (covers "colors" question and any future color pickers)
              onViewerUpdate({ caseColor: colorOption.color });
            }
          }
        }
        // ── Single-choice / multi-choice — generic viewerUpdate from option or question ──
        else if (typeof value === "string") {
          const selectedOption = question.options?.find((o) => o.id === value);

          // Size question: pass value directly as size
          if (questionId === "size") {
            onViewerUpdate({
              ...(question.viewerUpdate || {}),
              size: value as KeyboardViewerConfig["size"],
            });
          }
          // Option-level viewerUpdate takes priority
          else if (selectedOption?.viewerUpdate) {
            onViewerUpdate(selectedOption.viewerUpdate);
          }
          // Fall back to question-level viewerUpdate
          else if (question.viewerUpdate && Object.keys(question.viewerUpdate).length > 0) {
            onViewerUpdate(question.viewerUpdate);
          }
        }
      }
    }

    onAnswer(questionId, value);
  };

  return (
    <div className="w-full max-w-3xl mx-auto backdrop-blur-sm bg-bg-primary/35 rounded-2xl p-6">
      {/* Topic breadcrumbs */}
      <div className="flex items-center gap-1 mb-4 overflow-x-auto pb-1">
        {questions.map((q, i) => (
          <div key={q.id} className="flex items-center shrink-0">
            {i > 0 && (
              <svg className="w-3 h-3 text-text-muted/30 mx-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            )}
            <span
              className={`text-[10px] font-medium tracking-wider uppercase transition-colors duration-200 ${
                i === currentIndex
                  ? "text-accent"
                  : i < currentIndex
                    ? "text-text-secondary"
                    : "text-text-muted/40"
              }`}
            >
              {getTopicLabel(q.id)}
            </span>
          </div>
        ))}
      </div>

      {/* Progress bars */}
      <div className="flex items-center gap-2 mb-6">
        {questions.map((q, i) => (
          <div key={q.id} className="flex-1 flex items-center gap-2">
            <div
              className={`h-2 flex-1 rounded-full transition-[background-color] duration-300 ${
                i <= currentIndex
                  ? "bg-gradient-to-r from-accent/70 to-accent"
                  : "bg-bg-elevated"
              }`}
            />
          </div>
        ))}
      </div>

      {/* Back button */}
      {currentIndex > 0 && onBack && (
        <button
          onClick={onBack}
          className="flex items-center gap-1.5 text-sm text-text-secondary hover:text-accent transition-colors duration-150 mb-4 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/40 rounded active:scale-[0.97]"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          Back
        </button>
      )}

      {/* Active question */}
      {questions.map((question, i) => (
        <div
          key={question.id}
          className={`transition-opacity duration-300 ${
            i === currentIndex ? "opacity-100" : "opacity-0 absolute pointer-events-none"
          }`}
        >
          <QuestionCard
            question={question}
            onAnswer={(value) => handleAnswer(question.id, value)}
            isActive={i === currentIndex}
          />
        </div>
      ))}

      {/* Previous answers summary - clickable pills */}
      {answers.length > 0 && (
        <div className="mt-8 pt-6 border-t border-border-subtle">
          <p className="text-[10px] text-text-muted uppercase tracking-wider font-medium mb-3">Your choices</p>
          <div className="flex flex-wrap gap-2">
            {answers.map((answer, answerIndex) => {
              const q = questions.find((qu) => qu.id === answer.questionId);
              const displayValue = Array.isArray(answer.value)
                ? answer.value.map(v => q?.options?.find(o => o.id === v)?.label || v).join(", ")
                : typeof answer.value === "number"
                  ? `${q?.sliderConfig?.unit || "$"}${answer.value}`
                  : q?.options?.find(o => o.id === answer.value)?.label || String(answer.value);

              return (
                <button
                  key={answer.questionId}
                  onClick={() => onJumpToQuestion?.(answerIndex)}
                  className="px-3 py-1 rounded-full text-xs font-medium bg-accent-dim text-accent border border-accent/20 hover:bg-accent/20 hover:border-accent/40 transition-[background-color,border-color] duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/40 active:scale-[0.97] cursor-pointer"
                >
                  {displayValue}
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
