"use client";

import { useMutation } from "convex/react";
import { api } from "../../convex/_generated/api";
import type { Id } from "../../convex/_generated/dataModel";

export function useAffiliateClick() {
  const trackClick = useMutation(api.affiliateLinks.trackClick);

  function handleAffiliateClick(
    vendorLinkId: Id<"vendorLinks">,
    affiliateUrl: string,
    productName: string,
    vendor: string,
    referrerPage?: string
  ) {
    // Fire-and-forget: track the click without awaiting
    trackClick({
      vendorLinkId,
      productName,
      vendor,
      referrerPage,
    });
    // Open URL immediately
    window.open(affiliateUrl, "_blank", "noopener,noreferrer");
  }

  return { handleAffiliateClick };
}
