"use client";

import { useEffect, useCallback } from "react";
import { cn } from "@/lib/utils";
import {
  GLOSSARY_CATEGORY_COLORS,
  GLOSSARY_DIFFICULTY_COLORS,
} from "@/lib/constants";
import type { GlossaryTerm } from "@/lib/types";

interface GlossaryTermDetailProps {
  term: GlossaryTerm | null;
  isOpen: boolean;
  onClose: () => void;
  onSelectRelated: (termName: string) => void;
  onAskAbout: (termName: string) => void;
}

export function GlossaryTermDetail({
  term,
  isOpen,
  onClose,
  onSelectRelated,
  onAskAbout,
}: GlossaryTermDetailProps) {
  const handleEscape = useCallback(
    (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    },
    [onClose]
  );

  useEffect(() => {
    if (isOpen) {
      document.addEventListener("keydown", handleEscape);
      document.body.style.overflow = "hidden";
    }
    return () => {
      document.removeEventListener("keydown", handleEscape);
      document.body.style.overflow = "";
    };
  }, [isOpen, handleEscape]);

  if (!isOpen || !term) return null;

  const categoryColor =
    GLOSSARY_CATEGORY_COLORS[term.category] ||
    GLOSSARY_CATEGORY_COLORS.general;
  const difficultyColor = term.difficulty
    ? GLOSSARY_DIFFICULTY_COLORS[term.difficulty]
    : null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/70 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Panel */}
      <div
        className={cn(
          "relative bg-bg-surface border border-border-default rounded-2xl shadow-floating",
          "w-full max-w-3xl max-h-[90vh] overflow-y-auto",
          "animate-[chat-widget-in_200ms_cubic-bezier(0.175,0.885,0.32,1.075)]"
        )}
      >
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-3 right-3 z-10 w-8 h-8 rounded-lg bg-black/40 backdrop-blur-sm flex items-center justify-center text-white/70 hover:text-white hover:bg-black/60 transition-colors duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/40"
        >
          <svg
            className="w-4 h-4"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2}
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M6 18L18 6M6 6l12 12"
            />
          </svg>
        </button>

        {/* Image Hero */}
        {term.imageUrl && (
          <div className="relative aspect-[16/9] w-full overflow-hidden rounded-t-2xl">
            <img
              src={term.imageUrl}
              alt={term.term}
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent" />

            {/* Badges overlaid on image */}
            <div className="absolute top-4 left-4 flex items-center gap-2">
              <span
                className={cn(
                  "text-[10px] px-2.5 py-1 rounded-md font-semibold uppercase tracking-wider border backdrop-blur-sm",
                  categoryColor
                )}
              >
                {term.category}
              </span>
            </div>
            {difficultyColor && (
              <div className="absolute top-4 right-12">
                <span
                  className={cn(
                    "text-[10px] px-2.5 py-1 rounded-md font-semibold uppercase tracking-wider border backdrop-blur-sm",
                    difficultyColor.bg,
                    difficultyColor.text
                  )}
                >
                  {term.difficulty}
                </span>
              </div>
            )}
          </div>
        )}

        {/* Content Area */}
        <div className="p-6">
          {/* Badges (shown when no image) */}
          {!term.imageUrl && (
            <div className="flex items-center gap-2 mb-4">
              <span
                className={cn(
                  "text-[10px] px-2.5 py-1 rounded-md font-semibold uppercase tracking-wider border",
                  categoryColor
                )}
              >
                {term.category}
              </span>
              {difficultyColor && (
                <span
                  className={cn(
                    "text-[10px] px-2.5 py-1 rounded-md font-semibold uppercase tracking-wider border",
                    difficultyColor.bg,
                    difficultyColor.text
                  )}
                >
                  {term.difficulty}
                </span>
              )}
            </div>
          )}

          {/* Term name + pronunciation */}
          <h2 className="text-2xl font-bold text-text-primary font-[family-name:var(--font-outfit)] tracking-tight mb-1">
            {term.term}
          </h2>
          {term.pronunciation && (
            <p className="text-sm text-text-muted italic mb-4">
              {term.pronunciation}
            </p>
          )}
          {!term.pronunciation && <div className="mb-4" />}

          {/* Definition */}
          <p className="text-sm text-text-secondary leading-[1.7] mb-5">
            {term.definition}
          </p>

          {/* Example */}
          {term.example && (
            <div className="border-l-2 border-accent/30 pl-4 mb-5">
              <p className="text-xs text-text-muted italic leading-relaxed">
                &ldquo;{term.example}&rdquo;
              </p>
            </div>
          )}

          {/* Related Terms */}
          {term.relatedTerms && term.relatedTerms.length > 0 && (
            <div className="mb-6">
              <p className="text-xs text-text-muted font-semibold uppercase tracking-wider mb-2">
                Related Terms
              </p>
              <div className="flex flex-wrap gap-2">
                {term.relatedTerms.map((rt) => (
                  <button
                    key={rt}
                    onClick={() => onSelectRelated(rt)}
                    className={cn(
                      "text-xs px-3 py-1.5 rounded-lg border transition-[background-color,border-color,color] duration-150",
                      "bg-accent/5 border-accent/20 text-accent",
                      "hover:bg-accent/15 hover:border-accent/30",
                      "active:scale-[0.97]",
                      "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/40"
                    )}
                  >
                    {rt}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Ask Switchy CTA */}
          <button
            onClick={() => onAskAbout(term.term)}
            className={cn(
              "w-full flex items-center justify-center gap-2 px-4 py-3 rounded-xl",
              "bg-accent/10 border border-accent/20 text-accent",
              "text-sm font-semibold",
              "transition-[background-color,border-color,transform] duration-150",
              "hover:bg-accent/20 hover:border-accent/30",
              "active:scale-[0.98]",
              "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/40"
            )}
          >
            <svg
              className="w-4 h-4"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M8.625 12a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0H8.25m4.125 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0H12m4.125 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0h-.375M21 12c0 4.556-4.03 8.25-9 8.25a9.764 9.764 0 01-2.555-.337A5.972 5.972 0 015.41 20.97a5.969 5.969 0 01-.474-.065 4.48 4.48 0 00.978-2.025c.09-.457-.133-.901-.467-1.226C3.93 16.178 3 14.189 3 12c0-4.556 4.03-8.25 9-8.25s9 3.694 9 8.25z"
              />
            </svg>
            Ask Switchy about &ldquo;{term.term}&rdquo;
          </button>
        </div>
      </div>
    </div>
  );
}
