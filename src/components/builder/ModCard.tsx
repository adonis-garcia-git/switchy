"use client";

import { cn } from "@/lib/utils";

interface ModCardProps {
  mod: string;
  cost: number;
  effect: string;
  difficulty: string;
  showLink?: boolean;
}

const DIFFICULTY_STYLES: Record<string, string> = {
  easy: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20",
  medium: "bg-amber-500/10 text-amber-400 border-amber-500/20",
  hard: "bg-red-500/10 text-red-400 border-red-500/20",
};

const MOD_ICONS: Record<string, string> = {
  easy: "M5 13l4 4L19 7",
  medium: "M12 6v6l4 2",
  hard: "M13 10V3L4 14h7v7l9-11h-7z",
};

export function ModCard({ mod, cost, effect, difficulty, showLink }: ModCardProps) {
  const diffStyle = DIFFICULTY_STYLES[difficulty] || DIFFICULTY_STYLES.medium;
  const iconPath = MOD_ICONS[difficulty] || MOD_ICONS.medium;

  const content = (
    <div
      className={cn(
        "flex flex-col gap-2 p-3 rounded-lg border text-sm h-full",
        "bg-bg-surface border-border-subtle",
        showLink && "group/mod hover:border-border-accent hover:bg-bg-elevated focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/40 active:scale-[0.98] transition-[border-color,background-color,transform] duration-150"
      )}
    >
      {/* Top row: icon + name + cost + difficulty */}
      <div className="flex items-center gap-2">
        <svg className="w-3.5 h-3.5 text-text-muted shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d={iconPath} />
        </svg>
        <span className={cn(
          "font-medium text-text-primary truncate flex-1",
          showLink && "group-hover/mod:text-accent transition-colors duration-150"
        )}>
          {mod}
        </span>
        {cost > 0 && (
          <span className="text-[10px] font-[family-name:var(--font-mono)] text-accent shrink-0">
            +${cost}
          </span>
        )}
        <span className={cn(
          "text-[10px] px-1.5 py-0.5 rounded border font-medium shrink-0",
          diffStyle
        )}>
          {difficulty}
        </span>
        {showLink && (
          <svg className="w-3 h-3 text-text-muted group-hover/mod:text-accent transition-colors duration-150 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
          </svg>
        )}
      </div>

      {/* Effect description */}
      {effect && (
        <p className="text-xs text-text-secondary leading-relaxed line-clamp-2 pl-5.5">
          {effect}
        </p>
      )}
    </div>
  );

  if (showLink) {
    return (
      <a
        href={`https://www.amazon.com/s?k=${encodeURIComponent(mod + " keyboard mod")}`}
        target="_blank"
        rel="noopener noreferrer"
        className="block"
      >
        {content}
      </a>
    );
  }

  return content;
}
