"use client";

import Link from "next/link";
import { cn, formatPriceWhole, generatePurchaseUrl } from "@/lib/utils";
import { Badge } from "@/components/ui/Badge";
import { PriceCompareDropdown } from "@/components/PriceCompareDropdown";

interface KeycapCardData {
  _id: string;
  brand: string;
  name: string;
  profile: string;
  material: string;
  legendType?: string;
  numKeys?: number;
  priceUsd: number;
  inStock?: boolean;
  notes?: string;
  imageUrl?: string;
  productUrl?: string;
  tags?: string[];
}

export function KeycapCard({ keycap, featured }: { keycap: KeycapCardData; featured?: boolean }) {
  return (
    <Link href={`/keycaps/${keycap._id}`} className="block group">
      <div className={cn(
        "relative rounded-xl border bg-bg-surface p-5 shadow-surface",
        "transition-[border-color,box-shadow] duration-200",
        "hover:border-border-accent hover:glow-accent",
        featured
          ? "border-emerald-500/40 glow-top-pick hover:border-emerald-500/60"
          : "border-border-subtle"
      )}>
        {/* Featured / hot pick badge */}
        {featured && (
          <div className="absolute top-3 left-3 z-10">
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 text-[10px] font-semibold uppercase tracking-wider backdrop-blur-sm">
              <svg className="w-3 h-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
                <path d="M12 12c2-2.96 0-7-1-8 0 3.038-1.773 4.741-3 6-1.226 1.26-2 3.24-2 5a6 6 0 1 0 12 0c0-1.532-1.056-3.94-2-5-1.786 3-2.791 3-4 2z" />
              </svg>
              Top Pick
            </span>
          </div>
        )}

        {/* Product image */}
        <div className="aspect-[4/3] rounded-lg overflow-hidden mb-4 bg-bg-elevated relative -mx-5 -mt-5 rounded-t-xl rounded-b-none">
          <img
            src={keycap.imageUrl}
            alt={keycap.name}
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent" />
        </div>

        <div className="flex items-start justify-between mb-2">
          <div className="min-w-0">
            <p className="text-[11px] uppercase tracking-wider text-text-muted mb-0.5">
              {keycap.brand}
            </p>
            <h3 className="font-semibold text-text-primary group-hover:text-accent transition-colors duration-150 truncate font-[family-name:var(--font-outfit)]">
              {keycap.name}
            </h3>
          </div>
        </div>

        <div className="flex items-center gap-1.5 mb-3">
          <Badge variant="info" size="sm">{keycap.profile}</Badge>
          <Badge variant="default" size="sm">{keycap.material}</Badge>
          {keycap.legendType && (
            <Badge variant="default" size="sm">{keycap.legendType}</Badge>
          )}
        </div>

        {keycap.tags && keycap.tags.length > 0 && (
          <div className="flex flex-wrap gap-1 mb-3">
            {keycap.tags.slice(0, 3).map((tag) => (
              <span
                key={tag}
                className="text-[10px] px-1.5 py-0.5 rounded bg-bg-elevated text-text-muted border border-border-subtle"
              >
                {tag}
              </span>
            ))}
          </div>
        )}

        <div className="flex items-end justify-between pt-3 border-t border-border-subtle">
          <div className="flex items-center gap-2">
            <span className="text-lg font-bold font-[family-name:var(--font-mono)] text-accent">
              {formatPriceWhole(keycap.priceUsd)}
            </span>
            <PriceCompareDropdown productName={`${keycap.brand} ${keycap.name}`} referrerPage="/keycaps" />
          </div>
          <button
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              window.open(keycap.productUrl || generatePurchaseUrl(keycap.brand, keycap.name, "keyboard"), "_blank", "noopener,noreferrer");
            }}
            className={cn(
              "inline-flex items-center gap-1 text-sm font-bold px-4 py-2 rounded-xl",
              "bg-accent text-bg-primary shadow-accent-sm",
              "hover:bg-accent-hover",
              "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/40",
              "active:scale-[0.95]",
              "transition-[background-color,transform] duration-150",
              "font-[family-name:var(--font-outfit)]"
            )}
          >
            Buy
            <svg className="w-3 h-3 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M7 17L17 7M17 7H7M17 7v10" />
            </svg>
          </button>
        </div>

        {keycap.notes && (
          <p className="text-xs text-text-muted mt-3 line-clamp-2 leading-relaxed">
            {keycap.notes}
          </p>
        )}
      </div>
    </Link>
  );
}
