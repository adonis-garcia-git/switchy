"use client";

import { PromotedBadge } from "./PromotedBadge";
import { cn, formatPriceWhole } from "@/lib/utils";
import { useMutation } from "convex/react";
import { api } from "../../convex/_generated/api";

interface PromotedProductCardProps {
  sponsorshipId: string;
  vendorName: string;
  productName: string;
  productUrl?: string;
  imageUrl?: string;
  priceUsd?: number;
}

export function PromotedProductCard({
  sponsorshipId,
  vendorName,
  productName,
  productUrl,
  imageUrl,
  priceUsd,
}: PromotedProductCardProps) {
  const recordClick = useMutation(api.sponsorships.recordClick);

  const handleClick = () => {
    recordClick({ id: sponsorshipId as any });
    if (productUrl) {
      window.open(productUrl, "_blank", "noopener,noreferrer");
    }
  };

  return (
    <div
      onClick={handleClick}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") handleClick(); }}
      className={cn(
        "relative rounded-xl border border-dashed border-border-default bg-bg-surface p-5 shadow-surface cursor-pointer group",
        "hover:border-accent/40 transition-[border-color,box-shadow] duration-200",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/40"
      )}
    >
      {/* Promoted badge */}
      <div className="absolute top-3 right-3 z-10">
        <PromotedBadge />
      </div>

      {/* Product image */}
      <div className="aspect-[4/3] rounded-lg overflow-hidden mb-4 bg-bg-elevated relative -mx-5 -mt-5 rounded-t-xl rounded-b-none">
        <img
          src={imageUrl}
          alt={productName}
          className="w-full h-full object-cover group-hover:scale-[1.03] transition-transform duration-300"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent" />
      </div>

      {/* Info */}
      <p className="text-[10px] uppercase tracking-wider text-text-muted mb-0.5">
        {vendorName}
      </p>
      <h3 className="text-sm font-semibold text-text-primary font-[family-name:var(--font-outfit)] tracking-tight mb-2 line-clamp-2 group-hover:text-accent transition-colors duration-150">
        {productName}
      </h3>

      {priceUsd != null && (
        <p className="text-base font-bold font-[family-name:var(--font-mono)] text-accent">
          {formatPriceWhole(priceUsd)}
        </p>
      )}

      {productUrl && (
        <div className="mt-3 flex items-center gap-1 text-xs text-text-muted group-hover:text-accent transition-colors duration-150">
          <span>View deal</span>
          <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M7 17L17 7M17 7H7M17 7v10" />
          </svg>
        </div>
      )}
    </div>
  );
}
