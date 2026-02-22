"use client";

import { cn } from "@/lib/utils";

interface ResearchIndicatorProps {
  className?: string;
}

export function ResearchIndicator({ className }: ResearchIndicatorProps) {
  return (
    <div
      className={cn(
        "flex items-center gap-3 px-4 py-3 rounded-lg bg-accent/5 border border-accent/15",
        className
      )}
    >
      {/* Animated orbs */}
      <div className="relative flex items-center justify-center w-8 h-8">
        <span className="absolute w-3 h-3 rounded-full bg-accent/60 animate-ping" />
        <span className="relative w-2.5 h-2.5 rounded-full bg-accent" />
      </div>
      <div>
        <p className="text-sm font-semibold text-accent">
          Researching...
        </p>
        <p className="text-xs text-text-muted">
          Querying community reviews and vendor catalogs
        </p>
      </div>
    </div>
  );
}
