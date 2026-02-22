"use client";

import { useRef, useEffect } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "../../convex/_generated/api";
import { SponsoredBadge } from "./SponsoredBadge";
import { cn } from "@/lib/utils";

interface SponsoredCarouselProps {
  productType: "switch" | "keyboard" | "keycaps" | "accessory";
}

export function SponsoredCarousel({ productType }: SponsoredCarouselProps) {
  const sponsorships = useQuery(api.sponsorships.getActiveByType, {
    placement: "explorer_carousel",
    productType,
  });

  const recordImpression = useMutation(api.sponsorships.recordImpression);
  const recordClick = useMutation(api.sponsorships.recordClick);
  const scrollRef = useRef<HTMLDivElement>(null);
  const impressionsRecorded = useRef(false);

  useEffect(() => {
    if (!sponsorships || sponsorships.length === 0 || impressionsRecorded.current) return;
    impressionsRecorded.current = true;
    for (const s of sponsorships) {
      recordImpression({ id: s._id });
    }
  }, [sponsorships, recordImpression]);

  if (!sponsorships || sponsorships.length === 0) return null;

  return (
    <section
      className={cn(
        "rounded-xl border border-amber-500/15 mb-6 px-3.5 py-3",
        "bg-gradient-to-r from-amber-500/[0.03] via-transparent to-amber-500/[0.03]"
      )}
    >
      {/* Header row with badge */}
      <div className="flex items-center gap-2 mb-2.5">
        <SponsoredBadge />
      </div>

      {/* Compact horizontal strip */}
      <div
        ref={scrollRef}
        className="flex gap-2.5 overflow-x-auto [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
      >
        {sponsorships.map((s: any) => (
          <a
            key={s._id}
            href={s.productUrl || "#"}
            target="_blank"
            rel="noopener noreferrer"
            onClick={() => recordClick({ id: s._id })}
            className={cn(
              "flex items-center gap-3 flex-shrink-0",
              "rounded-lg border border-border-subtle bg-bg-surface pl-1.5 pr-4 py-1.5",
              "hover:border-border-accent hover:glow-accent group",
              "transition-[border-color,box-shadow] duration-200",
              "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/40"
            )}
          >
            {/* Small square thumbnail */}
            <div className="w-14 h-14 rounded-lg overflow-hidden bg-bg-elevated shrink-0 relative">
              <img
                src={s.imageUrl}
                alt={s.productName}
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent" />
            </div>

            {/* Info */}
            <div className="min-w-0">
              <p className="text-[9px] text-text-muted uppercase tracking-wider font-medium leading-none mb-1">
                {s.vendorName}
              </p>
              <p className="text-xs font-semibold text-text-primary truncate max-w-[160px] font-[family-name:var(--font-outfit)] group-hover:text-accent transition-colors duration-150">
                {s.productName}
              </p>
              {s.priceUsd != null && (
                <p className="font-[family-name:var(--font-mono)] text-xs text-accent font-semibold mt-0.5 leading-none">
                  ${s.priceUsd.toFixed(2)}
                </p>
              )}
            </div>

            {/* Arrow */}
            <svg className="w-3.5 h-3.5 text-text-muted group-hover:text-accent shrink-0 transition-colors duration-150 ml-1" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M7 17L17 7M17 7H7M17 7v10" />
            </svg>
          </a>
        ))}
      </div>
    </section>
  );
}
