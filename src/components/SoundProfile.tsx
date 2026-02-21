"use client";

import { cn } from "@/lib/utils";

interface SoundProfileProps {
  pitch: "low" | "mid" | "high";
  volume: "quiet" | "medium" | "loud";
  character: string;
  compact?: boolean;
}

const PITCH_POSITIONS = { low: "16.6%", mid: "50%", high: "83.3%" };
const VOLUME_POSITIONS = { quiet: "16.6%", medium: "50%", loud: "83.3%" };

const CHARACTER_COLORS: Record<string, string> = {
  thocky: "bg-purple-500/20 text-purple-400 border-purple-500/30",
  clacky: "bg-amber-500/20 text-amber-400 border-amber-500/30",
  creamy: "bg-yellow-500/20 text-yellow-300 border-yellow-500/30",
  poppy: "bg-pink-500/20 text-pink-400 border-pink-500/30",
  muted: "bg-slate-500/20 text-slate-400 border-slate-500/30",
  crisp: "bg-cyan-500/20 text-cyan-400 border-cyan-500/30",
};

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
            "px-2 py-0.5 rounded-full text-xs font-medium border",
            CHARACTER_COLORS[character] || CHARACTER_COLORS.muted
          )}
        >
          {character}
        </span>
        <span className="text-xs text-text-muted">
          {pitch} pitch
        </span>
        <span className="text-xs text-text-muted">
          {volume}
        </span>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {/* Character badge */}
      <div className="flex items-center gap-2">
        <span className="text-xs text-text-muted uppercase tracking-wider">
          Sound
        </span>
        <span
          className={cn(
            "px-2.5 py-1 rounded-full text-xs font-semibold border",
            CHARACTER_COLORS[character] || CHARACTER_COLORS.muted
          )}
        >
          {character}
        </span>
      </div>

      {/* Pitch bar */}
      <div>
        <div className="flex justify-between mb-1">
          <span className="text-[10px] text-text-muted">Low</span>
          <span className="text-[10px] text-text-muted">Mid</span>
          <span className="text-[10px] text-text-muted">High</span>
        </div>
        <div className="relative h-2 bg-bg-elevated rounded-full overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-r from-indigo-600/30 via-purple-500/30 to-pink-500/30" />
          <div
            className="absolute top-0 w-3 h-2 bg-accent rounded-full shadow-lg shadow-accent/30"
            style={{ left: PITCH_POSITIONS[pitch], transform: "translateX(-50%)" }}
          />
        </div>
      </div>

      {/* Volume bar */}
      <div>
        <div className="flex justify-between mb-1">
          <span className="text-[10px] text-text-muted">Quiet</span>
          <span className="text-[10px] text-text-muted">Medium</span>
          <span className="text-[10px] text-text-muted">Loud</span>
        </div>
        <div className="relative h-2 bg-bg-elevated rounded-full overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-r from-green-600/30 via-yellow-500/30 to-red-500/30" />
          <div
            className="absolute top-0 w-3 h-2 bg-accent rounded-full shadow-lg shadow-accent/30"
            style={{
              left: VOLUME_POSITIONS[volume],
              transform: "translateX(-50%)",
            }}
          />
        </div>
      </div>
    </div>
  );
}
