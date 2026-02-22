"use client";

import { cn } from "@/lib/utils";

interface UsageCounterProps {
  compact?: boolean;
  buildsUsed: number;
  buildsLimit: number;
}

export function UsageCounter({ compact, buildsUsed, buildsLimit }: UsageCounterProps) {
  const remaining = Math.max(0, buildsLimit - buildsUsed);

  if (compact) {
    return (
      <div className="flex items-center gap-1.5">
        <div className="flex items-center gap-0.5">
          {Array.from({ length: buildsLimit }).map((_, i) => (
            <div
              key={i}
              className={cn(
                "w-1.5 h-1.5 rounded-full",
                i < buildsUsed ? "bg-text-muted/40" : "bg-accent"
              )}
            />
          ))}
        </div>
        <span className="text-[10px] text-text-muted font-[family-name:var(--font-mono)]">
          {remaining} left
        </span>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-2">
      <div className="flex items-center gap-1">
        {Array.from({ length: buildsLimit }).map((_, i) => (
          <div
            key={i}
            className={cn(
              "w-2 h-2 rounded-full",
              i < buildsUsed ? "bg-text-muted/40" : "bg-accent"
            )}
          />
        ))}
      </div>
      <span className="text-xs text-text-secondary">
        {remaining} of {buildsLimit} builds left
      </span>
    </div>
  );
}
