"use client";

import { useState } from "react";
import { useQuery } from "convex/react";
import { api } from "../../convex/_generated/api";
import { cn } from "@/lib/utils";

interface GroupBuyRecommendedSidebarProps {
  onTrackThis: (listing: any) => void;
  trackedProductTypes?: string[];
  trackedProductNames?: string[];
  mode: "desktop" | "mobile";
}

const TYPE_BADGE: Record<string, string> = {
  keyboard: "bg-blue-500/12 text-blue-400 border-blue-500/20",
  switches: "bg-amber-500/12 text-amber-400 border-amber-500/20",
  keycaps: "bg-emerald-500/12 text-emerald-400 border-emerald-500/20",
  accessories: "bg-purple-500/12 text-purple-400 border-purple-500/20",
};

const TYPE_LABEL: Record<string, string> = {
  keyboard: "Keyboard",
  switches: "Switches",
  keycaps: "Keycaps",
  accessories: "Accessory",
};

function RecommendationCard({
  listing,
  onTrack,
  compact,
}: {
  listing: any;
  onTrack: (listing: any) => void;
  compact?: boolean;
}) {
  if (compact) {
    // ── Mobile: wider horizontal card with bigger image ──
    return (
      <div className="min-w-[260px] max-w-[280px] flex-shrink-0 rounded-xl border border-border-subtle bg-bg-surface overflow-hidden hover:border-border-accent transition-[border-color] duration-200 group">
        {/* Image strip */}
        <div className="relative h-28 bg-bg-elevated overflow-hidden">
          {listing.imageUrl ? (
            <>
              <img
                src={listing.imageUrl}
                alt={listing.name}
                className="w-full h-full object-cover group-hover:scale-[1.03] transition-transform duration-300"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-black/10 to-transparent" />
            </>
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <svg className="w-8 h-8 text-text-muted/20" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 15.75l5.159-5.159a2.25 2.25 0 013.182 0l5.159 5.159m-1.5-1.5l1.409-1.409a2.25 2.25 0 013.182 0l2.909 2.909M3.75 21h16.5a2.25 2.25 0 002.25-2.25V6.75a2.25 2.25 0 00-2.25-2.25H3.75A2.25 2.25 0 001.5 6.75v10.5A2.25 2.25 0 003.75 21z" />
              </svg>
            </div>
          )}
          {/* Status pill over image */}
          <span className={cn(
            "absolute top-2 left-2 text-[9px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md backdrop-blur-sm",
            listing.status === "live"
              ? "bg-emerald-500/20 text-emerald-300 border border-emerald-400/20"
              : listing.status === "ic"
              ? "bg-sky-500/20 text-sky-300 border border-sky-400/20"
              : listing.status === "extras"
              ? "bg-teal-500/20 text-teal-300 border border-teal-400/20"
              : "bg-amber-500/20 text-amber-300 border border-amber-400/20"
          )}>
            {listing.status === "live" ? "Live" : listing.status === "ic" ? "IC" : listing.status === "extras" ? "Extras" : "Upcoming"}
          </span>
        </div>

        {/* Content */}
        <div className="p-3.5">
          <div className="flex items-center gap-1.5 mb-1">
            <span className="text-[10px] uppercase tracking-wider text-text-muted font-semibold truncate">
              {listing.vendor}
            </span>
            {listing.productType && (
              <span className={cn(
                "text-[8px] font-bold uppercase tracking-wider px-1.5 py-px rounded border",
                TYPE_BADGE[listing.productType] || "bg-bg-elevated text-text-muted border-border-default"
              )}>
                {TYPE_LABEL[listing.productType] || listing.productType}
              </span>
            )}
          </div>
          <p className="text-sm font-semibold text-text-primary truncate font-[family-name:var(--font-outfit)] mb-2.5">
            {listing.name}
          </p>
          <div className="flex items-center justify-between">
            <span className="text-sm font-bold font-[family-name:var(--font-mono)] text-accent">
              ${Math.round(listing.priceMin)}
            </span>
            <button
              onClick={(e) => {
                e.stopPropagation();
                onTrack(listing);
              }}
              className={cn(
                "text-[10px] font-bold uppercase tracking-wider px-3 py-1.5 rounded-lg",
                "bg-accent text-bg-primary",
                "hover:bg-accent-hover",
                "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/40",
                "active:scale-[0.95]",
                "transition-[background-color,transform] duration-150"
              )}
            >
              + Track
            </button>
          </div>
        </div>
      </div>
    );
  }

  // ── Desktop: vertical card with prominent image ──
  return (
    <div className="rounded-xl border border-border-subtle bg-bg-surface overflow-hidden hover:border-border-accent hover:shadow-[0_2px_16px_-4px_rgba(var(--accent-rgb,232,121,36),0.12)] transition-[border-color,box-shadow] duration-200 group">
      {/* Image area */}
      <div className="relative aspect-[16/9] bg-bg-elevated overflow-hidden">
        {listing.imageUrl ? (
          <>
            <img
              src={listing.imageUrl}
              alt={listing.name}
              className="w-full h-full object-cover group-hover:scale-[1.04] transition-transform duration-300"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-black/5 to-transparent" />
          </>
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <svg className="w-10 h-10 text-text-muted/15" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 15.75l5.159-5.159a2.25 2.25 0 013.182 0l5.159 5.159m-1.5-1.5l1.409-1.409a2.25 2.25 0 013.182 0l2.909 2.909M3.75 21h16.5a2.25 2.25 0 002.25-2.25V6.75a2.25 2.25 0 00-2.25-2.25H3.75A2.25 2.25 0 001.5 6.75v10.5A2.25 2.25 0 003.75 21z" />
            </svg>
          </div>
        )}
        {/* Status pill floating on image */}
        <span className={cn(
          "absolute top-2.5 left-2.5 text-[9px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md backdrop-blur-sm",
          listing.status === "live"
            ? "bg-emerald-500/25 text-emerald-300 border border-emerald-400/25"
            : listing.status === "ic"
            ? "bg-sky-500/25 text-sky-300 border border-sky-400/25"
            : listing.status === "extras"
            ? "bg-teal-500/25 text-teal-300 border border-teal-400/25"
            : "bg-amber-500/25 text-amber-300 border border-amber-400/25"
        )}>
          {listing.status === "live" ? "Live Now" : listing.status === "ic" ? "Interest Check" : listing.status === "extras" ? "Extras" : "Upcoming"}
        </span>
        {/* Tracking count badge */}
        {listing.trackingCount > 0 && (
          <span className="absolute top-2.5 right-2.5 text-[9px] font-semibold text-white/70 backdrop-blur-sm bg-black/30 px-1.5 py-0.5 rounded-md flex items-center gap-1">
            <svg className="w-2.5 h-2.5" fill="currentColor" viewBox="0 0 20 20">
              <path d="M10 12a2 2 0 100-4 2 2 0 000 4z" />
              <path fillRule="evenodd" d="M.458 10C1.732 5.943 5.522 3 10 3s8.268 2.943 9.542 7c-1.274 4.057-5.064 7-9.542 7S1.732 14.057.458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z" clipRule="evenodd" />
            </svg>
            {listing.trackingCount}
          </span>
        )}
      </div>

      {/* Card body */}
      <div className="p-4">
        <div className="flex items-center gap-2 mb-1.5">
          <span className="text-[10px] uppercase tracking-wider text-text-muted font-semibold truncate">
            {listing.vendor}
          </span>
          {listing.productType && (
            <span className={cn(
              "text-[8px] font-bold uppercase tracking-wider px-1.5 py-px rounded border shrink-0",
              TYPE_BADGE[listing.productType] || "bg-bg-elevated text-text-muted border-border-default"
            )}>
              {TYPE_LABEL[listing.productType] || listing.productType}
            </span>
          )}
        </div>
        <p className="text-[13px] font-semibold text-text-primary font-[family-name:var(--font-outfit)] leading-snug mb-3">
          {listing.name}
        </p>
        <div className="flex items-center justify-between">
          <div className="flex items-baseline gap-1">
            <span className="text-base font-bold font-[family-name:var(--font-mono)] text-accent">
              ${Math.round(listing.priceMin)}
            </span>
            {listing.priceMax && listing.priceMax > listing.priceMin && (
              <span className="text-[10px] text-text-muted font-[family-name:var(--font-mono)]">
                – ${Math.round(listing.priceMax)}
              </span>
            )}
          </div>
          <button
            onClick={(e) => {
              e.stopPropagation();
              onTrack(listing);
            }}
            className={cn(
              "text-[10px] font-bold uppercase tracking-wider px-3.5 py-1.5 rounded-lg",
              "bg-accent text-bg-primary",
              "hover:bg-accent-hover",
              "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/40",
              "active:scale-[0.95]",
              "transition-[background-color,transform] duration-150"
            )}
          >
            + Track
          </button>
        </div>
      </div>
    </div>
  );
}

function SkeletonCard({ compact }: { compact?: boolean }) {
  if (compact) {
    return (
      <div className="min-w-[260px] max-w-[280px] flex-shrink-0 rounded-xl border border-border-subtle bg-bg-surface overflow-hidden animate-pulse">
        <div className="h-28 bg-bg-elevated" />
        <div className="p-3.5 space-y-2">
          <div className="h-2.5 w-20 bg-bg-elevated rounded" />
          <div className="h-3.5 w-36 bg-bg-elevated rounded" />
          <div className="flex items-center justify-between pt-1">
            <div className="h-4 w-12 bg-bg-elevated rounded" />
            <div className="h-7 w-16 bg-bg-elevated rounded-lg" />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="rounded-xl border border-border-subtle bg-bg-surface overflow-hidden animate-pulse">
      <div className="aspect-[16/9] bg-bg-elevated" />
      <div className="p-4 space-y-2">
        <div className="h-2.5 w-20 bg-bg-elevated rounded" />
        <div className="h-3.5 w-full bg-bg-elevated rounded" />
        <div className="flex items-center justify-between pt-1.5">
          <div className="h-5 w-14 bg-bg-elevated rounded" />
          <div className="h-7 w-18 bg-bg-elevated rounded-lg" />
        </div>
      </div>
    </div>
  );
}

export function GroupBuyRecommendedSidebar({
  onTrackThis,
  trackedProductTypes,
  trackedProductNames,
  mode,
}: GroupBuyRecommendedSidebarProps) {
  const [showAll, setShowAll] = useState(false);
  const recommendations = useQuery(api.groupBuyListings.getRecommendations, {
    productTypes: trackedProductTypes as any,
    excludeNames: trackedProductNames,
    limit: 10,
  });

  const isLoading = recommendations === undefined;

  if (!isLoading && recommendations.length === 0) return null;

  const displayCount = showAll ? 10 : 4;
  const visibleItems = isLoading ? [] : recommendations.slice(0, displayCount);
  const hasMore = !isLoading && recommendations.length > 4;

  const headerEl = (
    <div className="flex items-center gap-2.5 mb-4">
      <div className="w-7 h-7 rounded-lg bg-accent/10 border border-accent/15 flex items-center justify-center">
        <svg className="w-3.5 h-3.5 text-accent" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09zM18.259 8.715L18 9.75l-.259-1.035a3.375 3.375 0 00-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 002.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 002.455 2.456L21.75 6l-1.036.259a3.375 3.375 0 00-2.455 2.456z" />
        </svg>
      </div>
      <div>
        <h3 className="text-sm font-semibold text-text-primary font-[family-name:var(--font-outfit)] tracking-tight leading-none">
          Recommended for You
        </h3>
        <p className="text-[10px] text-text-muted mt-0.5">Based on your tracked items</p>
      </div>
    </div>
  );

  if (mode === "desktop") {
    return (
      <div className="sticky top-6">
        {headerEl}

        <div className="space-y-3.5 max-h-[calc(100vh-180px)] overflow-y-auto scrollbar-none pr-0.5">
          {isLoading ? (
            Array.from({ length: 3 }).map((_, i) => <SkeletonCard key={i} />)
          ) : (
            visibleItems.map((listing: any) => (
              <RecommendationCard
                key={listing._id}
                listing={listing}
                onTrack={onTrackThis}
              />
            ))
          )}
        </div>

        {hasMore && (
          <button
            onClick={() => setShowAll(!showAll)}
            className={cn(
              "w-full mt-3 text-xs font-semibold text-text-muted py-2.5 rounded-lg border border-border-subtle",
              "hover:text-accent hover:border-border-accent hover:bg-accent-dim/30",
              "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/40",
              "transition-[color,background-color,border-color] duration-150"
            )}
          >
            {showAll ? "Show less" : `Show ${recommendations!.length - 4} more`}
          </button>
        )}
      </div>
    );
  }

  // mode === "mobile"
  return (
    <div className="mt-8 mb-4">
      {headerEl}
      <div className="flex gap-4 overflow-x-auto pb-3 scrollbar-none -mx-1 px-1">
        {isLoading ? (
          Array.from({ length: 3 }).map((_, i) => <SkeletonCard key={i} compact />)
        ) : (
          visibleItems.map((listing: any) => (
            <RecommendationCard
              key={listing._id}
              listing={listing}
              onTrack={onTrackThis}
              compact
            />
          ))
        )}
      </div>
    </div>
  );
}
