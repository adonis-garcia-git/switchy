"use client";

import { cn, formatPriceWhole, daysUntil } from "@/lib/utils";
import { Badge } from "@/components/ui/Badge";
import { GROUP_BUY_LISTING_STATUS_COLORS } from "@/lib/constants";
import type { GroupBuyListingStatus } from "@/lib/types";

interface GroupBuyListingCardProps {
  listing: {
    _id: string;
    name: string;
    vendor: string;
    designer?: string;
    productType: string;
    status: GroupBuyListingStatus;
    priceMin: number;
    priceMax?: number;
    endDate?: string;
    startDate?: string;
    imageUrl?: string;
    tags?: string[];
    trackingCount: number;
    isFeatured?: boolean;
    estimatedWaitMonths?: number;
    estimatedShipDate?: string;
  };
  isTracked?: boolean;
  onTrackThis?: () => void;
  onClick?: () => void;
}

export function GroupBuyListingCard({
  listing,
  isTracked,
  onTrackThis,
  onClick,
}: GroupBuyListingCardProps) {
  const statusConfig = GROUP_BUY_LISTING_STATUS_COLORS[listing.status];
  const endingDays = listing.endDate ? daysUntil(listing.endDate) : null;
  const startingDays = listing.startDate ? daysUntil(listing.startDate) : null;
  const isEndingSoon = (listing.status === "live" || listing.status === "ic") && endingDays !== null && endingDays >= 0 && endingDays <= 7;

  // Calculate wait months
  const waitMonths = listing.estimatedWaitMonths ?? (
    listing.estimatedShipDate
      ? Math.max(0, Math.round((new Date(listing.estimatedShipDate).getTime() - Date.now()) / (1000 * 60 * 60 * 24 * 30)))
      : null
  );

  const getDateLabel = () => {
    if (listing.status === "ic" && endingDays !== null) {
      if (endingDays < 0) return "IC Ended";
      if (endingDays === 0) return "IC ends today";
      if (endingDays === 1) return "IC ends tomorrow";
      return `IC ends in ${endingDays} days`;
    }
    if (listing.status === "live" && endingDays !== null) {
      if (endingDays < 0) return "Ended";
      if (endingDays === 0) return "Ends today";
      if (endingDays === 1) return "Ends tomorrow";
      return `Ends in ${endingDays} days`;
    }
    if (listing.status === "upcoming" && startingDays !== null) {
      if (startingDays <= 0) return "Starting soon";
      if (startingDays === 1) return "Starts tomorrow";
      return `Starts in ${startingDays} days`;
    }
    if (listing.status === "extras") return "Extras Available";
    if (listing.status === "ended") return "Ended";
    if (listing.status === "fulfilled") return "Fulfilled";
    if (listing.status === "shipped") return "Shipped";
    return null;
  };

  const dateLabel = getDateLabel();

  const trackButtonLabel = listing.status === "ic" ? "Follow IC" : "Track This";

  return (
    <div
      onClick={onClick}
      className="group relative rounded-xl border border-border-subtle bg-bg-surface shadow-surface hover:border-border-accent hover:glow-accent transition-[border-color,box-shadow] duration-200 cursor-pointer overflow-hidden"
    >
      {/* Image */}
      {listing.imageUrl && (
        <div className="aspect-[4/3] overflow-hidden bg-bg-elevated relative">
          <img
            src={listing.imageUrl}
            alt={listing.name}
            className="w-full h-full object-cover group-hover:scale-[1.03] transition-transform duration-300"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />

          {/* Floating badges on image */}
          <div className="absolute top-3 left-3 flex flex-wrap gap-1.5">
            {/* Status badge */}
            <span
              className={cn(
                "inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold uppercase tracking-wider backdrop-blur-sm border",
                statusConfig.bg,
                statusConfig.text,
                statusConfig.border
              )}
            >
              {statusConfig.label}
            </span>

            {isEndingSoon && (
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-amber-500/15 text-amber-400 border border-amber-500/25 text-[10px] font-semibold uppercase tracking-wider backdrop-blur-sm">
                <svg className="w-2.5 h-2.5" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M8.485 2.495c.673-1.167 2.357-1.167 3.03 0l6.28 10.875c.673 1.167-.17 2.625-1.516 2.625H3.72c-1.347 0-2.189-1.458-1.515-2.625L8.485 2.495zM10 5a.75.75 0 01.75.75v3.5a.75.75 0 01-1.5 0v-3.5A.75.75 0 0110 5zm0 9a1 1 0 100-2 1 1 0 000 2z" clipRule="evenodd" />
                </svg>
                Ending Soon
              </span>
            )}

            {listing.isFeatured && (
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-accent/15 text-accent border border-accent/25 text-[10px] font-semibold uppercase tracking-wider backdrop-blur-sm">
                <svg className="w-3 h-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
                  <path d="M12 12c2-2.96 0-7-1-8 0 3.038-1.773 4.741-3 6-1.226 1.26-2 3.24-2 5a6 6 0 1 0 12 0c0-1.532-1.056-3.94-2-5-1.786 3-2.791 3-4 2z" />
                </svg>
                Featured
              </span>
            )}
          </div>
        </div>
      )}

      {/* Content */}
      <div className="p-5">
        <div className="flex items-start justify-between mb-1.5">
          <div className="min-w-0 flex-1">
            <p className="text-[11px] uppercase tracking-wider text-text-muted mb-0.5">
              {listing.vendor}
              {listing.designer && (
                <span className="text-text-muted/60"> · {listing.designer}</span>
              )}
            </p>
            <h3 className="font-semibold text-text-primary group-hover:text-accent transition-colors duration-150 truncate font-[family-name:var(--font-outfit)]">
              {listing.name}
            </h3>
          </div>
        </div>

        {/* No-image status badge */}
        {!listing.imageUrl && (
          <div className="flex gap-1.5 mb-3">
            <span
              className={cn(
                "inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold uppercase tracking-wider border",
                statusConfig.bg,
                statusConfig.text,
                statusConfig.border
              )}
            >
              {statusConfig.label}
            </span>
          </div>
        )}

        {/* Tags */}
        {listing.tags && listing.tags.length > 0 && (
          <div className="flex flex-wrap gap-1 mb-3">
            {listing.tags.slice(0, 3).map((tag) => (
              <span
                key={tag}
                className="text-[11px] px-2 py-0.5 rounded bg-bg-elevated/80 text-text-secondary border border-border-default"
              >
                {tag}
              </span>
            ))}
          </div>
        )}

        {/* Price + Date + Wait */}
        <div className="flex items-end justify-between pt-3 border-t border-border-subtle">
          <div>
            <span className="text-lg font-bold font-[family-name:var(--font-mono)] text-accent">
              {formatPriceWhole(listing.priceMin)}
            </span>
            {listing.priceMax && listing.priceMax !== listing.priceMin && (
              <span className="text-sm text-text-muted font-[family-name:var(--font-mono)]">
                {" "}– {formatPriceWhole(listing.priceMax)}
              </span>
            )}
          </div>
          <div className="text-right space-y-0.5">
            {dateLabel && (
              <p className={cn(
                "text-xs font-medium",
                isEndingSoon ? "text-amber-400" : "text-text-muted"
              )}>
                {dateLabel}
              </p>
            )}
            {waitMonths !== null && waitMonths > 0 && listing.status !== "extras" && listing.status !== "fulfilled" && listing.status !== "shipped" && (
              <p className={cn(
                "text-[10px] font-semibold",
                waitMonths > 18 ? "text-red-400" : waitMonths > 12 ? "text-amber-400" : "text-text-muted"
              )}>
                ~{waitMonths} month wait
              </p>
            )}
          </div>
        </div>

        {/* Footer: tracking count + button */}
        <div className="flex items-center justify-between mt-3">
          <span className="text-[11px] text-text-muted flex items-center gap-1">
            <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              <path strokeLinecap="round" strokeLinejoin="round" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
            </svg>
            {listing.trackingCount} tracking
          </span>

          {isTracked ? (
            <span className="inline-flex items-center gap-1 text-xs font-semibold px-3 py-1.5 rounded-lg bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
              <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M16.704 4.153a.75.75 0 01.143 1.052l-8 10.5a.75.75 0 01-1.127.075l-4.5-4.5a.75.75 0 011.06-1.06l3.894 3.893 7.48-9.817a.75.75 0 011.05-.143z" clipRule="evenodd" />
              </svg>
              Tracking
            </span>
          ) : (
            <button
              onClick={(e) => {
                e.stopPropagation();
                onTrackThis?.();
              }}
              className={cn(
                "inline-flex items-center gap-1 text-xs font-bold px-3 py-1.5 rounded-lg",
                "bg-accent text-bg-primary shadow-accent-sm",
                "hover:bg-accent-hover",
                "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/40",
                "active:scale-[0.95]",
                "transition-[background-color,transform] duration-150",
                "font-[family-name:var(--font-outfit)]"
              )}
            >
              <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
              </svg>
              {trackButtonLabel}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
