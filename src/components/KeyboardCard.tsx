"use client";

import Link from "next/link";
import { cn, formatPriceWhole, generatePurchaseUrl } from "@/lib/utils";
import { Badge } from "@/components/ui/Badge";
import { SponsoredBadge } from "@/components/SponsoredBadge";
import { PriceCompareDropdown } from "@/components/PriceCompareDropdown";

interface KeyboardData {
  _id: string;
  brand: string;
  name: string;
  size: string;
  mountingStyle: string;
  plateMaterial: string;
  caseMaterial: string;
  hotSwap: boolean;
  wireless: boolean;
  rgb: boolean;
  priceUsd: number;
  inStock: boolean;
  notes: string;
  productUrl?: string;
  imageUrl?: string;
}

interface KeyboardCardProps {
  keyboard: KeyboardData;
  sponsored?: boolean;
  compareMode?: boolean;
  isSelected?: boolean;
  onCompareToggle?: (id: string) => void;
  featured?: boolean;
}

export function KeyboardCard({ keyboard, sponsored, compareMode, isSelected, onCompareToggle, featured }: KeyboardCardProps) {
  return (
    <Link href={compareMode ? "#" : `/keyboards/${keyboard._id}`} className={cn("block group", compareMode && "cursor-default")} onClick={compareMode ? (e) => e.preventDefault() : undefined}>
      <div className={cn(
        "relative rounded-xl border bg-bg-surface p-5 shadow-surface",
        "transition-[border-color,box-shadow] duration-200",
        "hover:border-border-accent hover:glow-accent",
        isSelected
          ? "border-accent glow-accent-strong"
          : featured && !sponsored
            ? "border-emerald-500/40 glow-top-pick hover:border-emerald-500/60"
            : "border-border-subtle"
      )}>
        {/* Compare selection overlay */}
        {compareMode && (
          <>
            <button
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                onCompareToggle?.(keyboard._id);
              }}
              className="absolute inset-0 z-10 cursor-pointer rounded-xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/50 focus-visible:ring-offset-2 focus-visible:ring-offset-bg-primary"
              aria-label={isSelected ? `Deselect ${keyboard.name}` : `Select ${keyboard.name} for comparison`}
            />
            <div
              className={cn(
                "absolute top-3 right-3 z-20 w-7 h-7 rounded-full flex items-center justify-center pointer-events-none",
                "border-2 transition-[background-color,border-color,transform] duration-200",
                isSelected
                  ? "bg-accent border-accent scale-100"
                  : "border-text-muted/40 bg-bg-primary/70 backdrop-blur-sm scale-90"
              )}
            >
              {isSelected ? (
                <svg
                  className="w-4 h-4 text-bg-primary"
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
              ) : (
                <span className="w-2.5 h-2.5 rounded-full border-2 border-text-muted/30" />
              )}
            </div>
            {isSelected && (
              <div className="absolute inset-0 rounded-xl bg-accent/8 pointer-events-none z-[5]" />
            )}
          </>
        )}

        {/* Sponsored badge */}
        {sponsored && (
          <div className="absolute top-3 left-3 z-10">
            <SponsoredBadge />
          </div>
        )}

        {/* Featured / hot pick badge */}
        {featured && !sponsored && (
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
        <div className="aspect-[16/10] rounded-lg overflow-hidden mb-4 bg-bg-elevated relative -mx-5 -mt-5 rounded-t-xl rounded-b-none">
          <img
            src={keyboard.imageUrl}
            alt={keyboard.name}
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent" />
        </div>

        <div className="flex items-start justify-between mb-3">
          <div className="min-w-0">
            <p className="text-[11px] uppercase tracking-wider text-text-muted mb-0.5">
              {keyboard.brand}
            </p>
            <h3 className="font-semibold text-text-primary group-hover:text-accent transition-colors duration-150 truncate font-[family-name:var(--font-outfit)]">
              {keyboard.name}
            </h3>
          </div>
          <Badge variant="info" size="sm" className="ml-3 shrink-0">
            {keyboard.size}
          </Badge>
        </div>

        <div className="flex items-center gap-1.5 text-xs text-text-secondary mb-3 overflow-hidden">
          <span className="truncate">{keyboard.mountingStyle}</span>
          <span className="text-text-muted/40 shrink-0">|</span>
          <span className="truncate">{keyboard.plateMaterial}</span>
          <span className="text-text-muted/40 shrink-0">|</span>
          <span className="truncate">{keyboard.caseMaterial}</span>
        </div>

        <div className="flex items-center gap-1.5 mb-4">
          <Badge variant={keyboard.hotSwap ? "success" : "default"} size="sm">
            {keyboard.hotSwap ? "Hot-swap" : "Soldered"}
          </Badge>
          {keyboard.wireless && (
            <Badge variant="info" size="sm">Wireless</Badge>
          )}
          {keyboard.rgb && (
            <Badge variant="default" size="sm">RGB</Badge>
          )}
        </div>

        <div className="flex items-end justify-between pt-3 border-t border-border-subtle">
          <div className="flex items-center gap-2">
            <span className="text-lg font-bold font-[family-name:var(--font-mono)] text-accent">
              {formatPriceWhole(keyboard.priceUsd)}
            </span>
            <PriceCompareDropdown productName={`${keyboard.brand} ${keyboard.name}`} referrerPage="/keyboards" />
          </div>
          <button
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              window.open(keyboard.productUrl || generatePurchaseUrl(keyboard.brand, keyboard.name, "keyboard"), "_blank", "noopener,noreferrer");
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

        {keyboard.notes && (
          <p className="text-xs text-text-muted mt-3 line-clamp-2 leading-relaxed">
            {keyboard.notes}
          </p>
        )}
      </div>
    </Link>
  );
}
