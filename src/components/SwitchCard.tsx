"use client";

import Link from "next/link";
import { SWITCH_TYPE_COLORS } from "@/lib/constants";
import { cn, formatPrice } from "@/lib/utils";
import { SoundProfile } from "./SoundProfile";
import { Id } from "../../convex/_generated/dataModel";

interface SwitchData {
  _id: Id<"switches">;
  brand: string;
  name: string;
  type: "linear" | "tactile" | "clicky";
  actuationForceG: number;
  soundPitch: "low" | "mid" | "high";
  soundCharacter: string;
  soundVolume: "quiet" | "medium" | "loud";
  pricePerSwitch: number;
  communityRating: number;
  popularFor: string[];
}

interface SwitchCardProps {
  sw: SwitchData;
  compareMode?: boolean;
  isSelected?: boolean;
  onCompareToggle?: (id: Id<"switches">) => void;
}

function StarRating({ rating }: { rating: number }) {
  return (
    <div className="flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map((star) => (
        <svg
          key={star}
          className={cn(
            "w-3.5 h-3.5",
            star <= Math.round(rating) ? "text-warning" : "text-text-muted/30"
          )}
          fill="currentColor"
          viewBox="0 0 20 20"
        >
          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
        </svg>
      ))}
      <span className="text-xs text-text-muted ml-1 font-mono">
        {rating.toFixed(1)}
      </span>
    </div>
  );
}

export function SwitchCard({
  sw,
  compareMode,
  isSelected,
  onCompareToggle,
}: SwitchCardProps) {
  const typeColors = SWITCH_TYPE_COLORS[sw.type];

  return (
    <div
      className={cn(
        "relative rounded-lg border bg-bg-surface p-4 transition-all hover:border-border-default/60 hover:bg-bg-elevated/50 group",
        isSelected
          ? "border-accent ring-1 ring-accent/30"
          : "border-border-subtle"
      )}
    >
      {compareMode && (
        <button
          onClick={(e) => {
            e.preventDefault();
            onCompareToggle?.(sw._id);
          }}
          className={cn(
            "absolute top-3 right-3 w-5 h-5 rounded border-2 flex items-center justify-center transition-colors",
            isSelected
              ? "bg-accent border-accent"
              : "border-text-muted/40 hover:border-accent"
          )}
        >
          {isSelected && (
            <svg
              className="w-3 h-3 text-bg-primary"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={3}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M5 13l4 4L19 7"
              />
            </svg>
          )}
        </button>
      )}

      <Link href={`/switches/${sw._id}`} className="block">
        <div className="flex items-start justify-between mb-3">
          <div>
            <p className="text-xs text-text-muted">{sw.brand}</p>
            <h3 className="font-semibold text-text-primary group-hover:text-accent transition-colors">
              {sw.name}
            </h3>
          </div>
          <span
            className={cn(
              "px-2 py-0.5 rounded text-xs font-semibold uppercase tracking-wider border",
              typeColors.bg,
              typeColors.text,
              typeColors.border
            )}
          >
            {sw.type}
          </span>
        </div>

        <div className="space-y-3">
          <div className="flex items-center justify-between text-sm">
            <span className="text-text-secondary">
              <span className="font-mono text-text-primary">
                {sw.actuationForceG}g
              </span>{" "}
              actuation
            </span>
            <span className="font-mono text-accent font-semibold">
              {formatPrice(sw.pricePerSwitch)}
            </span>
          </div>

          <SoundProfile
            pitch={sw.soundPitch}
            volume={sw.soundVolume}
            character={sw.soundCharacter}
            compact
          />

          <StarRating rating={sw.communityRating} />

          {sw.popularFor.length > 0 && (
            <div className="flex flex-wrap gap-1">
              {sw.popularFor.slice(0, 3).map((tag) => (
                <span
                  key={tag}
                  className="text-[10px] px-1.5 py-0.5 rounded bg-bg-elevated text-text-muted"
                >
                  {tag}
                </span>
              ))}
            </div>
          )}
        </div>
      </Link>
    </div>
  );
}
