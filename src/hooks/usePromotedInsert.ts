import { useEffect, useRef } from "react";
import { useMutation } from "convex/react";
import { api } from "../../convex/_generated/api";

interface PromotedItem {
  _id: string;
  vendorName: string;
  productName: string;
  productType?: string;
  productUrl?: string;
  imageUrl?: string;
  priceUsd?: number;
  isPromoted: true;
}

export function usePromotedInsert<T extends { _id: string }>(
  items: T[] | null,
  promotedSponsorships: any[] | null | undefined,
  interval: number = 6
): (T | PromotedItem)[] | null {
  const recordImpression = useMutation(api.sponsorships.recordImpression);
  const impressionRecorded = useRef(new Set<string>());

  useEffect(() => {
    if (!promotedSponsorships) return;
    for (const s of promotedSponsorships) {
      if (!impressionRecorded.current.has(s._id)) {
        impressionRecorded.current.add(s._id);
        recordImpression({ id: s._id });
      }
    }
  }, [promotedSponsorships, recordImpression]);

  if (items === null) return null;
  if (!promotedSponsorships || promotedSponsorships.length === 0) return items;

  const merged: (T | PromotedItem)[] = [];
  let promoIdx = 0;

  for (let i = 0; i < items.length; i++) {
    // Insert a promoted item every `interval` positions
    if (i > 0 && i % interval === 0 && promoIdx < promotedSponsorships.length) {
      const s = promotedSponsorships[promoIdx];
      merged.push({
        _id: `promoted-${s._id}`,
        vendorName: s.vendorName,
        productName: s.productName,
        productType: s.productType,
        productUrl: s.productUrl,
        imageUrl: s.imageUrl,
        priceUsd: s.priceUsd,
        isPromoted: true,
      });
      promoIdx++;
    }
    merged.push(items[i]);
  }

  return merged;
}
