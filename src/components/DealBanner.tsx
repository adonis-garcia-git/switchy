"use client";

import { useState, useEffect } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "../../convex/_generated/api";

interface DealBannerProps {
  productType: "switch" | "keyboard" | "keycaps" | "accessory";
}

export function DealBanner({ productType }: DealBannerProps) {
  const deals = useQuery(api.sponsorships.getActiveByType, {
    placement: "deal_banner",
    productType,
  });

  const recordImpression = useMutation(api.sponsorships.recordImpression);
  const recordClick = useMutation(api.sponsorships.recordClick);

  const [dismissedIds, setDismissedIds] = useState<Set<string>>(new Set());
  const [hydrated, setHydrated] = useState(false);

  // On mount, read dismissed deal IDs from localStorage
  useEffect(() => {
    if (!deals) return;
    const dismissed = new Set<string>();
    for (const deal of deals) {
      const key = `dismissed_deal_${deal._id}`;
      if (localStorage.getItem(key) === "true") {
        dismissed.add(deal._id as string);
      }
    }
    setDismissedIds(dismissed);
    setHydrated(true);
  }, [deals]);

  // Determine the first visible (non-dismissed) deal
  const visibleDeal =
    hydrated && deals
      ? deals.find((d) => !dismissedIds.has(d._id as string))
      : null;

  // Record impression when a visible deal is rendered
  useEffect(() => {
    if (!visibleDeal) return;
    recordImpression({ id: visibleDeal._id });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [visibleDeal?._id]);

  if (!deals || deals.length === 0) return null;
  if (!hydrated) return null;
  if (!visibleDeal) return null;

  const handleDismiss = () => {
    const key = `dismissed_deal_${visibleDeal._id}`;
    localStorage.setItem(key, "true");
    setDismissedIds((prev) => new Set([...prev, visibleDeal._id as string]));
  };

  const handleShopNow = async () => {
    await recordClick({ id: visibleDeal._id });
    if (visibleDeal.productUrl) {
      window.open(visibleDeal.productUrl, "_blank", "noopener,noreferrer");
    }
  };

  return (
    <div className="mb-4 bg-gradient-to-r from-accent/10 via-accent/5 to-accent/10 border border-accent/20 rounded-lg px-4 py-3">
      <div className="flex items-center gap-3">
        {/* Flame / Tag icon */}
        <div className="flex-shrink-0 text-accent">
          <svg
            width="18"
            height="18"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden="true"
          >
            <path d="M12 12c2-2.96 0-7-1-8 0 3.038-1.773 4.741-3 6-1.226 1.26-2 3.24-2 5a6 6 0 1 0 12 0c0-1.532-1.056-3.94-2-5-1.786 3-2.791 3-4 2z" />
          </svg>
        </div>

        {/* Deal text */}
        <div className="flex-1 min-w-0">
          <span className="text-sm text-text-primary font-medium">
            {visibleDeal.productName}
          </span>
          <span className="text-sm text-text-muted ml-1.5">
            by {visibleDeal.vendorName}
          </span>
        </div>

        {/* Shop Now CTA */}
        <button
          type="button"
          onClick={handleShopNow}
          className="flex-shrink-0 inline-flex items-center gap-1 text-accent hover:text-accent-hover font-semibold text-sm transition-colors duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/40 rounded"
        >
          Shop Now
          <svg
            width="14"
            height="14"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden="true"
          >
            <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
            <polyline points="15 3 21 3 21 9" />
            <line x1="10" y1="14" x2="21" y2="3" />
          </svg>
        </button>

        {/* Dismiss button */}
        <button
          type="button"
          onClick={handleDismiss}
          aria-label="Dismiss deal"
          className="flex-shrink-0 p-1 rounded text-text-muted hover:text-text-primary transition-colors duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/40"
        >
          <svg
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden="true"
          >
            <line x1="18" y1="6" x2="6" y2="18" />
            <line x1="6" y1="6" x2="18" y2="18" />
          </svg>
        </button>
      </div>
    </div>
  );
}
