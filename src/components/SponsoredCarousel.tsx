"use client";

import { useRef, useEffect } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "../../convex/_generated/api";
import { SponsoredBadge } from "./SponsoredBadge";
import { cn } from "@/lib/utils";
import Link from "next/link";

interface SponsoredCarouselProps {
  productType: "switch" | "keyboard" | "keycaps" | "accessory";
}

const TARGET_ITEMS = 5;

const PRODUCT_HREF_PREFIX: Record<string, string> = {
  switch: "/switches/",
  keyboard: "/keyboards/",
  keycaps: "/keycaps/",
  accessory: "/accessories/",
};

export function SponsoredCarousel({ productType }: SponsoredCarouselProps) {
  const sponsorships = useQuery(api.sponsorships.getActiveByType, {
    placement: "explorer_carousel",
    productType,
  });

  const recordImpression = useMutation(api.sponsorships.recordImpression);
  const recordClick = useMutation(api.sponsorships.recordClick);
  const scrollRef = useRef<HTMLDivElement>(null);
  const impressionsRecorded = useRef(false);

  // Query recommended products to fill the carousel when sponsorships are sparse
  const recSwitches = useQuery(
    api.switches.getRecommended,
    productType === "switch" ? { limit: TARGET_ITEMS + 2 } : "skip"
  );
  const recKeyboards = useQuery(
    api.keyboards.getRecommended,
    productType === "keyboard" ? { limit: TARGET_ITEMS + 2 } : "skip"
  );
  const recKeycaps = useQuery(
    api.keycaps.getRecommended,
    productType === "keycaps" ? { limit: TARGET_ITEMS + 2 } : "skip"
  );
  const recAccessories = useQuery(
    api.accessories.getRecommended,
    productType === "accessory" ? { limit: TARGET_ITEMS + 2 } : "skip"
  );

  useEffect(() => {
    if (!sponsorships || sponsorships.length === 0 || impressionsRecorded.current) return;
    impressionsRecorded.current = true;
    for (const s of sponsorships) {
      recordImpression({ id: s._id });
    }
  }, [sponsorships, recordImpression]);

  // Pick the recommended list for this product type
  const recommended = recSwitches || recKeyboards || recKeycaps || recAccessories || [];

  // Calculate how many fill items we need
  const sponsorCount = sponsorships?.length || 0;
  const fillCount = Math.max(0, TARGET_ITEMS - sponsorCount);

  // Deduplicate: exclude recommended items that match a sponsored product name
  const sponsoredNames = new Set(
    (sponsorships || []).map((s: any) => s.productName?.toLowerCase())
  );
  const filteredRecommended = recommended.filter(
    (r: any) => !sponsoredNames.has(r.name?.toLowerCase())
  );
  const fillItems = filteredRecommended.slice(0, fillCount);

  const hasSponsored = sponsorCount > 0;

  // Hide only if neither sponsorships nor recommended products are available
  if (sponsorCount === 0 && fillItems.length === 0) return null;

  const hrefPrefix = PRODUCT_HREF_PREFIX[productType];

  const totalItems = sponsorCount + fillItems.length;

  // Shared card classes — flex-1 so all cards share width equally
  const cardClasses = cn(
    "flex-1 min-w-0 flex items-center gap-2.5",
    "rounded-xl border border-border-subtle bg-bg-surface pl-2 pr-3 py-2",
    "hover:border-border-accent hover:glow-accent group",
    "transition-[border-color,box-shadow] duration-200",
    "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/40"
  );

  return (
    <section
      className={cn(
        "rounded-xl border mb-6 px-3.5 py-3",
        hasSponsored
          ? "border-amber-500/15 bg-gradient-to-r from-amber-500/[0.03] via-transparent to-amber-500/[0.03]"
          : "border-accent/15 bg-gradient-to-r from-accent/[0.03] via-transparent to-accent/[0.03]"
      )}
    >
      {/* Header row */}
      <div className="flex items-center gap-2 mb-2.5">
        {hasSponsored ? (
          <SponsoredBadge />
        ) : (
          <span className="text-[10px] font-bold uppercase tracking-wider text-accent">
            Featured
          </span>
        )}
      </div>

      {/* Horizontal strip — equal-width cards filling the row */}
      <div
        ref={scrollRef}
        className="flex gap-3"
      >
        {/* Sponsored items */}
        {(sponsorships || []).map((s: any) => (
          <a
            key={s._id}
            href={s.productUrl || "#"}
            target="_blank"
            rel="noopener noreferrer"
            onClick={() => recordClick({ id: s._id })}
            className={cardClasses}
          >
            <div className="w-14 h-14 rounded-lg overflow-hidden bg-bg-elevated shrink-0 relative">
              <img
                src={s.imageUrl}
                alt={s.productName}
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent" />
            </div>
            <div className="min-w-0">
              <p className="text-[10px] text-text-muted uppercase tracking-wider font-medium leading-none mb-1">
                {s.vendorName}
              </p>
              <p className="text-sm font-semibold text-text-primary truncate font-[family-name:var(--font-outfit)] group-hover:text-accent transition-colors duration-150">
                {s.productName}
              </p>
              {s.priceUsd != null && (
                <p className="font-[family-name:var(--font-mono)] text-sm text-accent font-semibold mt-1 leading-none">
                  ${s.priceUsd.toFixed(2)}
                </p>
              )}
            </div>
          </a>
        ))}

        {/* Fill items from recommended products */}
        {fillItems.map((item: any) => {
          const price =
            productType === "switch" ? item.pricePerSwitch : item.priceUsd;
          return (
            <Link key={item._id} href={`${hrefPrefix}${item._id}`} className={cardClasses}>
              {item.imageUrl && (
                <div className="w-14 h-14 rounded-lg overflow-hidden bg-bg-elevated shrink-0 relative">
                  <img
                    src={item.imageUrl}
                    alt={item.name}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent" />
                </div>
              )}
              <div className="min-w-0">
                <p className="text-[10px] text-text-muted uppercase tracking-wider font-medium leading-none mb-1">
                  {item.brand}
                </p>
                <p className="text-sm font-semibold text-text-primary truncate font-[family-name:var(--font-outfit)] group-hover:text-accent transition-colors duration-150">
                  {item.name}
                </p>
                {price != null && (
                  <p className="font-[family-name:var(--font-mono)] text-sm text-accent font-semibold mt-1 leading-none">
                    ${price.toFixed(2)}
                  </p>
                )}
              </div>
            </Link>
          );
        })}
      </div>
    </section>
  );
}
