"use client";

import { useState } from "react";
import { useQuery } from "convex/react";
import { api } from "../../convex/_generated/api";
import { cn } from "@/lib/utils";

interface GroupBuyRecommendedSidebarProps {
  onTrackThis: (listing: any) => void;
}

function RecommendationCard({
  listing,
  onTrack,
  compact,
}: {
  listing: any;
  onTrack: (listing: any) => void;
  compact?: boolean;
}) {
  const imgSize = compact ? "w-10 h-10" : "w-12 h-12";

  return (
    <div
      className={cn(
        "flex items-center gap-3 rounded-xl border border-border-subtle bg-bg-surface p-3",
        "hover:border-border-accent transition-[border-color,box-shadow] duration-200",
        compact && "min-w-[220px] flex-shrink-0"
      )}
    >
      {listing.imageUrl ? (
        <div className={cn(imgSize, "rounded-lg overflow-hidden bg-bg-elevated shrink-0 relative")}>
          <img
            src={listing.imageUrl}
            alt={listing.name}
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent" />
        </div>
      ) : (
        <div className={cn(imgSize, "rounded-lg bg-bg-elevated shrink-0 flex items-center justify-center")}>
          <svg className="w-5 h-5 text-text-muted/30" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 15.75l5.159-5.159a2.25 2.25 0 013.182 0l5.159 5.159m-1.5-1.5l1.409-1.409a2.25 2.25 0 013.182 0l2.909 2.909M3.75 21h16.5a2.25 2.25 0 002.25-2.25V6.75a2.25 2.25 0 00-2.25-2.25H3.75A2.25 2.25 0 001.5 6.75v10.5A2.25 2.25 0 003.75 21z" />
          </svg>
        </div>
      )}
      <div className="min-w-0 flex-1">
        <span className="text-[10px] uppercase tracking-wider text-text-muted font-semibold">
          {listing.vendor}
        </span>
        <p className="text-sm font-semibold text-text-primary truncate font-[family-name:var(--font-outfit)]">
          {listing.name}
        </p>
        <div className="flex items-center gap-1.5 mt-0.5">
          <span className="text-xs font-[family-name:var(--font-mono)] text-accent">
            ${Math.round(listing.priceMin)}
          </span>
          <span className="text-[10px] text-text-muted">&middot;</span>
          <span className={cn(
            "text-[10px] font-semibold uppercase tracking-wider",
            listing.status === "live" ? "text-emerald-400" : "text-amber-400"
          )}>
            {listing.status === "live" ? "Live" : "Upcoming"}
          </span>
        </div>
      </div>
      <button
        onClick={(e) => {
          e.stopPropagation();
          onTrack(listing);
        }}
        className={cn(
          "shrink-0 text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-md",
          "bg-accent text-bg-primary",
          "hover:bg-accent-hover",
          "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/40",
          "active:scale-[0.95]",
          "transition-[background-color,transform] duration-150"
        )}
      >
        Track
      </button>
    </div>
  );
}

function SkeletonCard({ compact }: { compact?: boolean }) {
  return (
    <div className={cn(
      "flex items-center gap-3 rounded-xl border border-border-subtle bg-bg-surface p-3 animate-pulse",
      compact && "min-w-[220px] flex-shrink-0"
    )}>
      <div className={cn(compact ? "w-10 h-10" : "w-12 h-12", "rounded-lg bg-bg-elevated shrink-0")} />
      <div className="min-w-0 flex-1 space-y-1.5">
        <div className="h-2.5 w-14 bg-bg-elevated rounded" />
        <div className="h-3.5 w-28 bg-bg-elevated rounded" />
        <div className="h-2.5 w-16 bg-bg-elevated rounded" />
      </div>
      <div className="h-6 w-12 bg-bg-elevated rounded-md shrink-0" />
    </div>
  );
}

export function GroupBuyRecommendedSidebar({ onTrackThis }: GroupBuyRecommendedSidebarProps) {
  const [showAll, setShowAll] = useState(false);
  const recommendations = useQuery(api.groupBuyListings.getRecommendations, { limit: 10 });

  // Loading state
  const isLoading = recommendations === undefined;

  // No listings at all — don't render
  if (!isLoading && recommendations.length === 0) return null;

  const displayCount = showAll ? 10 : 6;
  const visibleItems = isLoading ? [] : recommendations.slice(0, displayCount);
  const hasMore = !isLoading && recommendations.length > 6;

  const headerText = "Recommended for You";

  return (
    <>
      {/* Desktop sidebar */}
      <aside className="hidden lg:block w-80 flex-shrink-0">
        <div className="sticky top-6">
          <div className="flex items-center gap-2 mb-3">
            <svg className="w-4 h-4 text-accent" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09zM18.259 8.715L18 9.75l-.259-1.035a3.375 3.375 0 00-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 002.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 002.455 2.456L21.75 6l-1.036.259a3.375 3.375 0 00-2.455 2.456z" />
            </svg>
            <h3 className="text-sm font-semibold text-text-primary font-[family-name:var(--font-outfit)] tracking-tight">
              {headerText}
            </h3>
          </div>

          <div className="space-y-2.5 max-h-[calc(100vh-160px)] overflow-y-auto scrollbar-none pr-0.5">
            {isLoading ? (
              Array.from({ length: 4 }).map((_, i) => <SkeletonCard key={i} />)
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
                "w-full mt-2.5 text-xs font-semibold text-text-muted py-2 rounded-lg",
                "hover:text-accent hover:bg-accent-dim/50",
                "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/40",
                "transition-[color,background-color] duration-150"
              )}
            >
              {showAll ? "Show less" : `Show ${recommendations.length - 6} more`}
            </button>
          )}
        </div>
      </aside>

      {/* Mobile horizontal scroll */}
      <div className="block lg:hidden mt-6">
        <div className="flex items-center gap-2 mb-3">
          <svg className="w-4 h-4 text-accent" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09zM18.259 8.715L18 9.75l-.259-1.035a3.375 3.375 0 00-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 002.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 002.455 2.456L21.75 6l-1.036.259a3.375 3.375 0 00-2.455 2.456z" />
          </svg>
          <h3 className="text-sm font-semibold text-text-primary font-[family-name:var(--font-outfit)] tracking-tight">
            {headerText}
          </h3>
        </div>
        <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-none -mx-1 px-1">
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
    </>
  );
}
