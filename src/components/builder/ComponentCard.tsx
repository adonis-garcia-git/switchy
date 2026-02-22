"use client";

import Link from "next/link";
import { cn, formatPrice, formatPriceWhole } from "@/lib/utils";

interface ComponentCardProps {
  type: "keyboardKit" | "switches" | "keycaps" | "stabilizers";
  name: string;
  price: number;
  reason: string;
  quantity?: number;
  priceEach?: number;
  imageUrl?: string;
  productUrl?: string;
  detailUrl?: string;
  compact?: boolean;
}

const TYPE_LABELS: Record<string, string> = {
  keyboardKit: "Keyboard Kit",
  switches: "Switches",
  keycaps: "Keycaps",
  stabilizers: "Stabilizers",
};

const TYPE_COLORS: Record<string, { border: string; icon: string }> = {
  keyboardKit: { border: "border-l-blue-400", icon: "text-blue-400" },
  switches: { border: "border-l-amber-400", icon: "text-amber-400" },
  keycaps: { border: "border-l-purple-400", icon: "text-purple-400" },
  stabilizers: { border: "border-l-emerald-400", icon: "text-emerald-400" },
};

const TYPE_ICONS: Record<string, string> = {
  keyboardKit: "M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z",
  switches: "M13 10V3L4 14h7v7l9-11h-7z",
  keycaps: "M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4",
  stabilizers: "M4 6h16M4 10h16M4 14h16M4 18h16",
};

export function ComponentCard({
  type,
  name,
  price,
  reason,
  quantity,
  priceEach,
  imageUrl,
  productUrl,
  detailUrl,
  compact = false,
}: ComponentCardProps) {
  const displayImg = imageUrl;

  return (
    <div className={cn(
      "rounded-xl border border-border-subtle bg-bg-surface group hover:border-border-accent hover:glow-accent transition-[border-color,box-shadow] duration-200 border-l-2",
      compact ? "p-3" : "p-4",
      TYPE_COLORS[type]?.border || "border-l-text-muted"
    )}>
      <div className={cn("flex", compact ? "gap-3" : "gap-4")}>
        {/* Image */}
        {displayImg ? (
          <div className={cn(
            "rounded-lg bg-bg-elevated border border-border-subtle overflow-hidden shrink-0 relative",
            compact ? "w-14 h-14" : "w-20 h-20"
          )}>
            <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent z-10" />
            <img
              src={displayImg}
              alt={name}
              className="w-full h-full object-cover mix-blend-luminosity group-hover:mix-blend-normal transition-[mix-blend-mode] duration-300"
            />
          </div>
        ) : (
          <div className={cn(
            "rounded-lg bg-bg-elevated border border-border-subtle overflow-hidden shrink-0 flex items-center justify-center",
            compact ? "w-14 h-14" : "w-20 h-20"
          )}>
            <svg className={cn(compact ? "w-5 h-5" : "w-8 h-8", "text-text-muted/30")} fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d={TYPE_ICONS[type] || TYPE_ICONS.stabilizers} />
            </svg>
          </div>
        )}

        {/* Content */}
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2 mb-1">
            <div className="min-w-0">
              <p className="text-[10px] text-text-muted uppercase tracking-wider font-medium flex items-center gap-1.5">
                <svg className={cn("w-3 h-3", TYPE_COLORS[type]?.icon)} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={TYPE_ICONS[type] || TYPE_ICONS.stabilizers} />
                </svg>
                {TYPE_LABELS[type] || type}
              </p>
              {detailUrl ? (
                <Link
                  href={detailUrl}
                  className="font-semibold text-sm text-text-primary font-[family-name:var(--font-outfit)] truncate block hover:text-accent transition-colors duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/40 rounded"
                >
                  {name}
                </Link>
              ) : (
                <h4 className="font-semibold text-sm text-text-primary font-[family-name:var(--font-outfit)] truncate">
                  {name}
                </h4>
              )}
            </div>
            <div className="text-right shrink-0">
              <p className="text-sm font-bold font-[family-name:var(--font-mono)] text-accent">
                {formatPriceWhole(price)}
              </p>
              {quantity && priceEach && (
                <p className="text-[10px] text-text-muted font-mono">
                  {quantity}x {formatPrice(priceEach)}
                </p>
              )}
            </div>
          </div>
          <p className={cn(
            "text-xs text-text-secondary leading-relaxed mt-1",
            compact ? "line-clamp-1" : "line-clamp-2"
          )}>
            {reason}
          </p>
        </div>
      </div>

      {/* Buy button — hidden in compact mode */}
      {!compact && (productUrl ? (
        <a
          href={productUrl}
          target="_blank"
          rel="noopener noreferrer"
          onClick={(e) => e.stopPropagation()}
          className={cn(
            "mt-3 flex items-center justify-center gap-1.5 w-full px-3 py-2 rounded-lg text-xs font-semibold",
            "bg-accent/10 text-accent border border-accent/20",
            "hover:bg-accent/20 hover:border-accent/30",
            "transition-[background-color,border-color] duration-150",
            "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/40",
            "active:scale-[0.98]"
          )}
        >
          Buy
          <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
          </svg>
        </a>
      ) : (
        <a
          href={`https://www.amazon.com/s?k=${encodeURIComponent(name)}`}
          target="_blank"
          rel="noopener noreferrer"
          onClick={(e) => e.stopPropagation()}
          className={cn(
            "mt-3 flex items-center justify-center gap-1.5 w-full px-3 py-2 rounded-lg text-xs font-semibold",
            "bg-bg-elevated text-text-secondary border border-border-subtle",
            "hover:text-accent hover:border-border-accent",
            "transition-[color,border-color] duration-150",
            "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/40",
            "active:scale-[0.98]"
          )}
        >
          Find on Amazon
          <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
          </svg>
        </a>
      ))}
    </div>
  );
}
