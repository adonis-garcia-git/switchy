"use client";

import Link from "next/link";
import { cn, formatPriceWhole, generatePurchaseUrl } from "@/lib/utils";
import { Badge } from "@/components/ui/Badge";
import { SponsoredBadge } from "@/components/SponsoredBadge";

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

export function KeyboardCard({ keyboard, sponsored }: { keyboard: KeyboardData; sponsored?: boolean }) {
  return (
    <Link href={`/keyboards/${keyboard._id}`} className="block group">
      <div className="relative rounded-xl border border-border-subtle bg-bg-surface p-5 shadow-surface hover:border-border-accent hover:glow-accent transition-[border-color,box-shadow] duration-200">
        {/* Sponsored badge */}
        {sponsored && (
          <div className="absolute top-3 left-3 z-10">
            <SponsoredBadge />
          </div>
        )}

        {/* Product image */}
        <div className="aspect-[16/10] rounded-lg overflow-hidden mb-4 bg-bg-elevated relative -mx-5 -mt-5 rounded-t-xl rounded-b-none">
          <img
            src={keyboard.imageUrl || `https://placehold.co/640x400/181818/525252?text=${encodeURIComponent(keyboard.name)}`}
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

        <div className="flex items-center gap-1.5 text-xs text-text-secondary mb-3">
          <span>{keyboard.mountingStyle}</span>
          <span className="text-text-muted/40">|</span>
          <span>{keyboard.plateMaterial}</span>
          <span className="text-text-muted/40">|</span>
          <span>{keyboard.caseMaterial}</span>
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
          <span className="text-lg font-bold font-[family-name:var(--font-mono)] text-accent">
            {formatPriceWhole(keyboard.priceUsd)}
          </span>
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
