"use client";

import { QuestionCard } from "./QuestionCard";
import type { BuilderQuestion, BuilderAnswer } from "@/lib/types";
import type { KeyboardViewerConfig } from "@/lib/keyboard3d";

interface QuestionFlowProps {
  questions: BuilderQuestion[];
  currentIndex: number;
  answers: BuilderAnswer[];
  onAnswer: (questionId: string, value: string | string[] | number) => void;
  onViewerUpdate?: (update: Partial<KeyboardViewerConfig>) => void;
}

export function QuestionFlow({
  questions,
  currentIndex,
  answers,
  onAnswer,
  onViewerUpdate,
}: QuestionFlowProps) {
  const handleAnswer = (questionId: string, value: string | string[] | number) => {
    const question = questions.find((q) => q.id === questionId);

    if (question?.viewerUpdate && onViewerUpdate && typeof value === "string") {
      switch (questionId) {
        case "size":
          onViewerUpdate({ size: value as KeyboardViewerConfig["size"] });
          break;
        case "colors": {
          const caseOpt = question.options?.find((o) => o.id === value);
          if (caseOpt?.color) onViewerUpdate({ caseColor: caseOpt.color });
          break;
        }
        case "keycap_color": {
          const kcOpt = question.options?.find((o) => o.id === value);
          if (kcOpt?.color) onViewerUpdate({ keycapColor: kcOpt.color });
          break;
        }
        case "keycap_accent_color": {
          if (value === "same") {
            // Use the keycap color from the previous answer
            const kcAnswer = answers.find((a) => a.questionId === "keycap_color");
            if (kcAnswer && typeof kcAnswer.value === "string") {
              const kcQuestion = questions.find((q) => q.id === "keycap_color");
              const kcColor = kcQuestion?.options?.find((o) => o.id === kcAnswer.value)?.color;
              if (kcColor) onViewerUpdate({ keycapAccentColor: kcColor });
            }
          } else {
            const accentOpt = question.options?.find((o) => o.id === value);
            if (accentOpt?.color) onViewerUpdate({ keycapAccentColor: accentOpt.color });
          }
          break;
        }
        case "keycap_material": {
          if (value !== "no-preference") {
            onViewerUpdate({ keycapMaterial: value as KeyboardViewerConfig["keycapMaterial"] });
          }
          break;
        }
      }
    }

    onAnswer(questionId, value);
  };

  return (
    <div className="w-full max-w-3xl mx-auto backdrop-blur-md bg-bg-primary/50 rounded-3xl p-8 border border-border-subtle/30">
      {/* Progress */}
      <div className="flex items-center gap-2 mb-8">
        {questions.map((q, i) => (
          <div key={q.id} className="flex-1 flex items-center gap-2">
            <div
              className={`h-1 flex-1 rounded-full transition-[background-color] duration-300 ${
                i < currentIndex
                  ? "bg-accent"
                  : i === currentIndex
                    ? "bg-accent"
                    : "bg-bg-elevated"
              }`}
            />
          </div>
        ))}
      </div>

      {/* Question counter */}
      <p className="text-xs text-text-muted uppercase tracking-wider font-medium font-[family-name:var(--font-outfit)] mb-4">
        Question {currentIndex + 1} of {questions.length}
      </p>

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

      {/* Previous answers summary */}
      {answers.length > 0 && (
        <div className="mt-8 pt-6 border-t border-border-subtle">
          <p className="text-[10px] text-text-muted uppercase tracking-wider font-medium mb-3">Your choices</p>
          <div className="flex flex-wrap gap-2">
            {answers.map((answer) => {
              const q = questions.find((qu) => qu.id === answer.questionId);
              const displayValue = Array.isArray(answer.value)
                ? answer.value.map(v => q?.options?.find(o => o.id === v)?.label || v).join(", ")
                : typeof answer.value === "number"
                  ? `${q?.sliderConfig?.unit || "$"}${answer.value}`
                  : q?.options?.find(o => o.id === answer.value)?.label || String(answer.value);

              return (
                <span
                  key={answer.questionId}
                  className="px-3 py-1 rounded-full text-xs font-medium bg-accent-dim text-accent border border-accent/20"
                >
                  {displayValue}
                </span>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
