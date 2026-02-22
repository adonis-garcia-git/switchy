"use client";

import { cn, formatPriceWhole, daysUntil } from "@/lib/utils";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { GROUP_BUY_LISTING_STATUS_COLORS } from "@/lib/constants";
import type { GroupBuyListingStatus } from "@/lib/types";

interface ListingDetail {
  _id: string;
  name: string;
  slug: string;
  vendor: string;
  vendorUrl?: string;
  designer?: string;
  description?: string;
  productType: string;
  status: GroupBuyListingStatus;
  priceMin: number;
  priceMax?: number;
  startDate?: string;
  endDate?: string;
  estimatedShipDate?: string;
  imageUrl?: string;
  tags?: string[];
  trackingCount: number;
  isFeatured?: boolean;
}

interface GroupBuyListingDetailProps {
  listing: ListingDetail;
  isTracked?: boolean;
  onTrackThis?: () => void;
  onClose: () => void;
}

export function GroupBuyListingDetail({
  listing,
  isTracked,
  onTrackThis,
  onClose,
}: GroupBuyListingDetailProps) {
  const statusConfig = GROUP_BUY_LISTING_STATUS_COLORS[listing.status];
  const endingDays = listing.endDate ? daysUntil(listing.endDate) : null;
  const isEndingSoon = listing.status === "live" && endingDays !== null && endingDays >= 0 && endingDays <= 7;

  const formatDate = (d?: string) => {
    if (!d) return "TBD";
    return new Date(d).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="fixed inset-4 sm:inset-auto sm:top-1/2 sm:left-1/2 sm:-translate-x-1/2 sm:-translate-y-1/2 sm:w-full sm:max-w-2xl sm:max-h-[85vh] z-50 bg-bg-surface border border-border-default rounded-2xl shadow-floating overflow-hidden flex flex-col">
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-10 w-8 h-8 flex items-center justify-center rounded-lg bg-bg-elevated/80 backdrop-blur-sm hover:bg-bg-elevated text-text-muted hover:text-text-primary transition-colors duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/40 active:scale-[0.95]"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>

        <div className="overflow-y-auto flex-1">
          {/* Image */}
          {listing.imageUrl && (
            <div className="aspect-[16/9] overflow-hidden bg-bg-elevated relative">
              <img
                src={listing.imageUrl}
                alt={listing.name}
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />
              <div className="absolute bottom-4 left-4 flex flex-wrap gap-1.5">
                <span
                  className={cn(
                    "inline-flex items-center px-2.5 py-1 rounded-full text-[11px] font-semibold uppercase tracking-wider backdrop-blur-sm border",
                    statusConfig.bg,
                    statusConfig.text,
                    statusConfig.border
                  )}
                >
                  {statusConfig.label}
                </span>
                {isEndingSoon && (
                  <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-amber-500/15 text-amber-400 border border-amber-500/25 text-[11px] font-semibold uppercase tracking-wider backdrop-blur-sm">
                    Ending Soon
                  </span>
                )}
                {listing.isFeatured && (
                  <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-accent/15 text-accent border border-accent/25 text-[11px] font-semibold uppercase tracking-wider backdrop-blur-sm">
                    Featured
                  </span>
                )}
              </div>
            </div>
          )}

          <div className="p-6">
            {/* Header */}
            <div className="mb-4">
              <p className="text-xs uppercase tracking-wider text-text-muted mb-1">
                {listing.vendor}
                {listing.designer && (
                  <span className="text-text-muted/60"> · Designed by {listing.designer}</span>
                )}
              </p>
              <h2 className="text-xl font-bold text-text-primary font-[family-name:var(--font-outfit)] tracking-tight">
                {listing.name}
              </h2>
            </div>

            {/* Description */}
            {listing.description && (
              <p className="text-sm text-text-secondary leading-relaxed mb-5">
                {listing.description}
              </p>
            )}

            {/* Info grid */}
            <div className="grid grid-cols-2 gap-4 mb-5">
              <div className="bg-bg-elevated rounded-lg p-3">
                <p className="text-[10px] uppercase tracking-wider text-text-muted mb-1">Price</p>
                <p className="text-lg font-bold font-[family-name:var(--font-mono)] text-accent">
                  {formatPriceWhole(listing.priceMin)}
                  {listing.priceMax && listing.priceMax !== listing.priceMin && (
                    <span className="text-sm text-text-muted"> – {formatPriceWhole(listing.priceMax)}</span>
                  )}
                </p>
              </div>
              <div className="bg-bg-elevated rounded-lg p-3">
                <p className="text-[10px] uppercase tracking-wider text-text-muted mb-1">Type</p>
                <p className="text-sm font-semibold text-text-primary capitalize">{listing.productType}</p>
              </div>
              <div className="bg-bg-elevated rounded-lg p-3">
                <p className="text-[10px] uppercase tracking-wider text-text-muted mb-1">Start Date</p>
                <p className="text-sm font-medium text-text-primary">{formatDate(listing.startDate)}</p>
              </div>
              <div className="bg-bg-elevated rounded-lg p-3">
                <p className="text-[10px] uppercase tracking-wider text-text-muted mb-1">End Date</p>
                <p className={cn(
                  "text-sm font-medium",
                  isEndingSoon ? "text-amber-400" : "text-text-primary"
                )}>
                  {formatDate(listing.endDate)}
                  {isEndingSoon && endingDays !== null && (
                    <span className="text-[10px] ml-1">({endingDays}d left)</span>
                  )}
                </p>
              </div>
              {listing.estimatedShipDate && (
                <div className="bg-bg-elevated rounded-lg p-3 col-span-2">
                  <p className="text-[10px] uppercase tracking-wider text-text-muted mb-1">Estimated Ship Date</p>
                  <p className="text-sm font-medium text-text-primary">{formatDate(listing.estimatedShipDate)}</p>
                </div>
              )}
            </div>

            {/* Tags */}
            {listing.tags && listing.tags.length > 0 && (
              <div className="flex flex-wrap gap-1.5 mb-5">
                {listing.tags.map((tag) => (
                  <span
                    key={tag}
                    className="text-[11px] px-2 py-0.5 rounded-md bg-bg-elevated text-text-muted border border-border-subtle"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            )}

            {/* Tracking count */}
            <div className="flex items-center gap-2 text-sm text-text-muted mb-5">
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
              </svg>
              <span>{listing.trackingCount} people tracking this</span>
            </div>
          </div>
        </div>

        {/* Sticky footer */}
        <div className="border-t border-border-subtle p-4 flex items-center gap-3 bg-bg-surface">
          {listing.vendorUrl && (
            <a
              href={listing.vendorUrl}
              target="_blank"
              rel="noopener noreferrer"
              className={cn(
                "inline-flex items-center gap-1.5 text-sm font-semibold px-4 py-2.5 rounded-xl",
                "bg-bg-elevated text-text-primary border border-border-default",
                "hover:bg-bg-surface hover:border-border-accent",
                "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/40",
                "active:scale-[0.97]",
                "transition-[background-color,border-color,transform] duration-150"
              )}
            >
              Visit Vendor
              <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M7 17L17 7M17 7H7M17 7v10" />
              </svg>
            </a>
          )}

          {isTracked ? (
            <span className="inline-flex items-center gap-1.5 text-sm font-semibold px-4 py-2.5 rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 ml-auto">
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M16.704 4.153a.75.75 0 01.143 1.052l-8 10.5a.75.75 0 01-1.127.075l-4.5-4.5a.75.75 0 011.06-1.06l3.894 3.893 7.48-9.817a.75.75 0 011.05-.143z" clipRule="evenodd" />
              </svg>
              Already Tracking
            </span>
          ) : (
            <Button
              onClick={onTrackThis}
              className="ml-auto"
            >
              Track This
            </Button>
          )}
        </div>
      </div>
    </>
  );
}
