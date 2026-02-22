"use client";

import { cn } from "@/lib/utils";

interface SoundProfileProps {
  pitch: "low" | "mid" | "high";
  volume: "quiet" | "medium" | "loud";
  character: string;
  compact?: boolean;
}

const PITCH_INDEX = { low: 0, mid: 1, high: 2 };
const VOLUME_INDEX = { quiet: 0, medium: 1, loud: 2 };

const CHARACTER_STYLES: Record<string, string> = {
  thocky: "bg-accent-dim text-accent border-border-accent",
  clacky: "bg-amber-500/10 text-amber-400 border-amber-500/20",
  creamy: "bg-yellow-500/10 text-yellow-300 border-yellow-500/20",
  poppy: "bg-pink-500/10 text-pink-400 border-pink-500/20",
  muted: "bg-bg-elevated text-text-secondary border-border-default",
  crisp: "bg-cyan-500/10 text-cyan-400 border-cyan-500/20",
};

function SegmentBar({
  labels,
  activeIndex,
}: {
  labels: string[];
  activeIndex: number;
}) {
  return (
    <div className="flex gap-1">
      {labels.map((label, i) => (
        <div key={label} className="flex-1 flex flex-col items-center gap-1">
          <div
            className={cn(
              "h-1.5 w-full rounded-full transition-colors duration-150",
              i === activeIndex
                ? "bg-accent shadow-[0_0_8px_rgba(118,185,0,0.3)]"
                : "bg-bg-elevated"
            )}
          />
          <span
            className={cn(
              "text-[10px] leading-none",
              i === activeIndex ? "text-accent font-medium" : "text-text-muted"
            )}
          >
            {label}
          </span>
        </div>
      ))}
    </div>
  );
}

export function SoundProfile({
  pitch,
  volume,
  character,
  compact,
}: SoundProfileProps) {
  if (compact) {
    return (
      <div className="flex items-center gap-1.5 flex-wrap">
        <span
          className={cn(
            "px-2 py-0.5 rounded-md text-[10px] font-semibold uppercase tracking-wider border",
            CHARACTER_STYLES[character] || CHARACTER_STYLES.muted
          )}
        >
          {character}
        </span>
        <span className="text-[10px] text-text-muted font-mono">
          {pitch} / {volume}
        </span>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Character badge */}
      <div className="flex items-center gap-3">
        <span className="text-xs text-text-muted uppercase tracking-wider">
          Character
        </span>
        <span
          className={cn(
            "px-2.5 py-1 rounded-md text-xs font-semibold uppercase tracking-wider border",
            CHARACTER_STYLES[character] || CHARACTER_STYLES.muted
          )}
        >
          {character}
        </span>
      </div>

      {/* Pitch */}
      <div className="space-y-1.5">
        <span className="text-xs text-text-muted uppercase tracking-wider">
          Pitch
        </span>
        <SegmentBar
          labels={["Low", "Mid", "High"]}
          activeIndex={PITCH_INDEX[pitch]}
        />
      </div>

      {/* Volume */}
      <div className="space-y-1.5">
        <span className="text-xs text-text-muted uppercase tracking-wider">
          Volume
        </span>
        <SegmentBar
          labels={["Quiet", "Medium", "Loud"]}
          activeIndex={VOLUME_INDEX[volume]}
        />
      </div>
    </div>
  );
}
