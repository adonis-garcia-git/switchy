"use client";

import { cn, formatPriceWhole } from "@/lib/utils";

const DIFFICULTY_COLORS: Record<string, string> = {
  "beginner-friendly": "text-green-400 bg-green-500/15 border-green-500/30",
  intermediate: "text-amber-400 bg-amber-500/15 border-amber-500/30",
  advanced: "text-red-400 bg-red-500/15 border-red-500/30",
};

interface BuildCardCompactProps {
  build: {
    _id: string;
    buildName: string;
    summary: string;
    estimatedTotal: number;
    buildDifficulty: string;
    imageUrl?: string;
    query?: string;
  };
  onClick: () => void;
}

export function BuildCardCompact({ build, onClick }: BuildCardCompactProps) {
  return (
    <button
      onClick={onClick}
      className={cn(
        "w-full text-left rounded-xl border border-border-subtle bg-bg-surface overflow-hidden",
        "shadow-surface group",
        "hover:border-border-accent hover:glow-accent",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/40",
        "active:scale-[0.98]",
        "transition-[border-color,box-shadow,transform] duration-200"
      )}
    >
      {/* Thumbnail */}
      <div className="aspect-[16/10] bg-bg-elevated relative overflow-hidden">
        {build.imageUrl ? (
          <img
            src={build.imageUrl}
            alt={build.buildName}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center relative">
            <img
              src="/images/build-card-default.webp"
              alt=""
              className="absolute inset-0 w-full h-full object-cover opacity-60"
              onError={(e) => {
                (e.target as HTMLImageElement).style.display = "none";
              }}
            />
            <span className="relative text-3xl text-text-muted/20 font-bold font-[family-name:var(--font-outfit)]">
              {build.buildName.charAt(0)}
            </span>
          </div>
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent" />
        {/* Price overlay */}
        <div className="absolute bottom-2 right-2 px-2 py-1 rounded-lg bg-black/60 backdrop-blur-sm">
          <span className="text-sm font-bold font-[family-name:var(--font-mono)] text-white">
            {formatPriceWhole(build.estimatedTotal)}
          </span>
        </div>
      </div>

      {/* Content */}
      <div className="p-4">
        <h3 className="font-semibold text-text-primary truncate group-hover:text-accent transition-colors duration-150 font-[family-name:var(--font-outfit)] mb-1">
          {build.buildName}
        </h3>
        <p className="text-xs text-text-secondary line-clamp-2 leading-relaxed mb-3">
          {build.summary}
        </p>
        <span
          className={cn(
            "inline-block px-2 py-0.5 rounded text-[10px] font-medium border",
            DIFFICULTY_COLORS[build.buildDifficulty] || DIFFICULTY_COLORS.intermediate
          )}
        >
          {build.buildDifficulty}
        </span>
      </div>
    </button>
  );
}
