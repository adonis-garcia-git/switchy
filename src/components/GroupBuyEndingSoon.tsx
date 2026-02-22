"use client";

import { cn, daysUntil } from "@/lib/utils";

interface EndingSoonListing {
  _id: string;
  name: string;
  vendor: string;
  endDate?: string;
  imageUrl?: string;
}

interface GroupBuyEndingSoonProps {
  listings: EndingSoonListing[];
  trackedIds: Set<string>;
  onTrackThis?: (listing: EndingSoonListing) => void;
}

export function GroupBuyEndingSoon({ listings, trackedIds, onTrackThis }: GroupBuyEndingSoonProps) {
  if (!listings || listings.length === 0) return null;

  return (
    <div className="mb-6 rounded-xl border border-amber-500/20 bg-amber-500/5 p-4">
      <div className="flex items-center gap-2 mb-3">
        <svg className="w-4 h-4 text-amber-400" fill="currentColor" viewBox="0 0 20 20">
          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" />
        </svg>
        <h3 className="text-sm font-semibold text-amber-400 font-[family-name:var(--font-outfit)]">
          Ending Soon
        </h3>
      </div>
      <div className="flex gap-3 overflow-x-auto pb-1 -mx-1 px-1 scrollbar-none">
        {listings.map((listing) => {
          const days = listing.endDate ? daysUntil(listing.endDate) : null;
          const isTracked = trackedIds.has(listing._id);

          return (
            <div
              key={listing._id}
              className="flex-shrink-0 flex items-center gap-3 bg-bg-surface border border-border-subtle rounded-lg px-3.5 py-2.5 min-w-[220px] max-w-[280px]"
            >
              {listing.imageUrl && (
                <img
                  src={listing.imageUrl}
                  alt={listing.name}
                  className="w-10 h-10 rounded-lg object-cover border border-border-subtle shrink-0"
                />
              )}
              <div className="min-w-0 flex-1">
                <p className="text-sm font-medium text-text-primary truncate">{listing.name}</p>
                <div className="flex items-center gap-2 mt-0.5">
                  <p className="text-[11px] text-text-muted truncate">{listing.vendor}</p>
                  {days !== null && (
                    <span className={cn(
                      "text-[10px] font-bold uppercase tracking-wider whitespace-nowrap",
                      days <= 2 ? "text-red-400" : "text-amber-400"
                    )}>
                      {days === 0 ? "Today" : days === 1 ? "1 day" : `${days} days`}
                    </span>
                  )}
                </div>
              </div>
              {isTracked ? (
                <svg className="w-4 h-4 text-emerald-400 shrink-0" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M16.704 4.153a.75.75 0 01.143 1.052l-8 10.5a.75.75 0 01-1.127.075l-4.5-4.5a.75.75 0 011.06-1.06l3.894 3.893 7.48-9.817a.75.75 0 011.05-.143z" clipRule="evenodd" />
                </svg>
              ) : (
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onTrackThis?.(listing);
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
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
