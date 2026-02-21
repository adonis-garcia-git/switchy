"use client";

import Link from "next/link";
import { SWITCH_TYPE_COLORS } from "@/lib/constants";
import { cn, formatPrice } from "@/lib/utils";
import { SoundProfile } from "./SoundProfile";
import { Badge } from "./ui/Badge";
import { Id } from "../../convex/_generated/dataModel";

interface SwitchData {
  _id: Id<"switches">;
  brand: string;
  name: string;
  type: "linear" | "tactile" | "clicky";
  actuationForceG: number;
  soundPitch?: "low" | "mid" | "high";
  soundCharacter?: string;
  soundVolume?: "quiet" | "medium" | "loud";
  pricePerSwitch: number;
  communityRating?: number;
  popularFor?: string[];
}

interface SwitchCardProps {
  sw: SwitchData;
  compareMode?: boolean;
  isSelected?: boolean;
  onCompareToggle?: (id: Id<"switches">) => void;
}

function StarRating({ rating }: { rating: number }) {
  return (
    <div className="flex items-center gap-1">
      <div className="flex items-center gap-px">
        {[1, 2, 3, 4, 5].map((star) => (
          <svg
            key={star}
            className={cn(
              "w-3 h-3",
              star <= Math.round(rating) ? "text-accent" : "text-text-muted/20"
            )}
            fill="currentColor"
            viewBox="0 0 20 20"
          >
            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
          </svg>
        ))}
      </div>
      <span className="text-[10px] text-text-muted font-mono">
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
  return (
    <div
      className={cn(
        "relative rounded-xl border bg-bg-surface p-4 group",
        "transition-[border-color,box-shadow] duration-200",
        "hover:border-border-accent hover:glow-accent",
        isSelected
          ? "border-accent glow-accent-strong"
          : "border-border-subtle"
      )}
    >
      {/* Compare checkbox */}
      {compareMode && (
        <button
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            onCompareToggle?.(sw._id);
          }}
          className={cn(
            "absolute top-3 right-3 z-10 w-5 h-5 rounded flex items-center justify-center",
            "border-2 transition-colors duration-150",
            "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/40",
            "active:scale-[0.9]",
            isSelected
              ? "bg-accent border-accent"
              : "border-text-muted/30 hover:border-accent/60 bg-bg-primary/50"
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
        {/* Header: brand + type badge */}
        <div className="flex items-start justify-between mb-3">
          <div className="min-w-0 flex-1 pr-2">
            <p className="text-[10px] text-text-muted uppercase tracking-wider font-medium">
              {sw.brand}
            </p>
            <h3 className="font-[family-name:var(--font-outfit)] font-semibold text-text-primary truncate group-hover:text-accent transition-colors duration-150">
              {sw.name}
            </h3>
          </div>
          <Badge variant={sw.type} size="sm">
            {sw.type}
          </Badge>
        </div>

        {/* Divider */}
        <div className="h-px bg-border-subtle mb-3" />

        {/* Specs row */}
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-3">
            <div className="text-xs">
              <span className="text-text-muted">Force </span>
              <span className="font-mono text-text-primary font-medium">
                {sw.actuationForceG}g
              </span>
            </div>
          </div>
          <span className="font-mono text-sm text-accent font-semibold">
            {formatPrice(sw.pricePerSwitch)}
          </span>
        </div>

        {/* Sound profile */}
        {sw.soundPitch && sw.soundVolume && sw.soundCharacter && (
          <div className="mb-3">
            <SoundProfile
              pitch={sw.soundPitch}
              volume={sw.soundVolume}
              character={sw.soundCharacter}
              compact
            />
          </div>
        )}

        {/* Rating */}
        {sw.communityRating != null && (
          <div className="mb-3">
            <StarRating rating={sw.communityRating} />
          </div>
        )}

        {/* Tags */}
        {sw.popularFor && sw.popularFor.length > 0 && (
          <div className="flex flex-wrap gap-1">
            {sw.popularFor.slice(0, 3).map((tag) => (
              <span
                key={tag}
                className="text-[10px] px-1.5 py-0.5 rounded bg-bg-elevated text-text-muted border border-border-subtle"
              >
                {tag}
              </span>
            ))}
          </div>
        )}
      </Link>
    </div>
  );
}
