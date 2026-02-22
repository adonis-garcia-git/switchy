"use client";

import { cn, formatPriceWhole } from "@/lib/utils";

const DIFFICULTY_BADGE_COLORS: Record<string, string> = {
  "beginner-friendly": "text-green-400 bg-green-500/15 border-green-500/30",
  intermediate: "text-amber-400 bg-amber-500/15 border-amber-500/30",
  advanced: "text-red-400 bg-red-500/15 border-red-500/30",
};

interface BuildStatsBarProps {
  builds: Array<{
    estimatedTotal?: number;
    isPublic?: boolean;
    buildDifficulty?: string;
  }>;
}

export function BuildStatsBar({ builds }: BuildStatsBarProps) {
  if (builds.length === 0) return null;

  const totalInvested = builds.reduce(
    (sum, b) => sum + (b.estimatedTotal || 0),
    0
  );
  const publicCount = builds.filter((b) => b.isPublic).length;

  // Compute mode of buildDifficulty
  const diffCounts: Record<string, number> = {};
  for (const b of builds) {
    const d = b.buildDifficulty || "intermediate";
    diffCounts[d] = (diffCounts[d] || 0) + 1;
  }
  const topDifficulty = Object.entries(diffCounts).sort(
    (a, b) => b[1] - a[1]
  )[0][0];

  const stats = [
    { label: "Total Builds", value: String(builds.length) },
    { label: "Total Invested", value: formatPriceWhole(totalInvested) },
    { label: "Public Builds", value: String(publicCount) },
    {
      label: "Most Common",
      value: topDifficulty,
      isBadge: true,
    },
  ];

  return (
    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
      {stats.map((stat) => (
        <div
          key={stat.label}
          className="rounded-xl bg-bg-surface border border-border-subtle px-4 py-3"
        >
          <p className="text-[10px] uppercase tracking-wider font-mono text-text-muted mb-1">
            {stat.label}
          </p>
          {stat.isBadge ? (
            <span
              className={cn(
                "inline-block px-2 py-0.5 rounded text-xs font-semibold border",
                DIFFICULTY_BADGE_COLORS[stat.value] ||
                  DIFFICULTY_BADGE_COLORS.intermediate
              )}
            >
              {stat.value}
            </span>
          ) : (
            <p className="text-xl font-bold font-mono text-text-primary">
              {stat.value}
            </p>
          )}
        </div>
      ))}
    </div>
  );
}
