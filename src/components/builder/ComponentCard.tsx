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
}

const TYPE_LABELS: Record<string, string> = {
  keyboardKit: "Keyboard Kit",
  switches: "Switches",
  keycaps: "Keycaps",
  stabilizers: "Stabilizers",
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
}: ComponentCardProps) {
  const placeholderImg = imageUrl || `https://placehold.co/200x200/181818/E8590C?text=${encodeURIComponent(TYPE_LABELS[type] || type)}`;

  return (
    <div className="rounded-xl border border-border-subtle bg-bg-surface p-4 group hover:border-border-accent hover:glow-accent transition-[border-color,box-shadow] duration-200">
      <div className="flex gap-4">
        {/* Image */}
        <div className="w-20 h-20 rounded-lg bg-bg-elevated border border-border-subtle overflow-hidden shrink-0 relative">
          <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent z-10" />
          <img
            src={placeholderImg}
            alt={name}
            className="w-full h-full object-cover mix-blend-luminosity group-hover:mix-blend-normal transition-[mix-blend-mode] duration-300"
          />
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2 mb-1">
            <div className="min-w-0">
              <p className="text-[10px] text-text-muted uppercase tracking-wider font-medium flex items-center gap-1.5">
                <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
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
          <p className="text-xs text-text-secondary leading-relaxed line-clamp-2 mt-1">
            {reason}
          </p>
        </div>
      </div>

      {/* Buy button */}
      {productUrl ? (
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
      )}
    </div>
  );
}
