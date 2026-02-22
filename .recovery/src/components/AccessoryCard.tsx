"use client";

import Link from "next/link";
import { cn, formatPriceWhole, generatePurchaseUrl } from "@/lib/utils";
import { Badge } from "@/components/ui/Badge";
import { ACCESSORY_SUBCATEGORIES } from "@/lib/constants";
import { PriceCompareDropdown } from "@/components/PriceCompareDropdown";

interface AccessoryCardData {
  _id: string;
  brand: string;
  name: string;
  subcategory: string;
  priceUsd: number;
  inStock?: boolean;
  notes?: string;
  imageUrl?: string;
  productUrl?: string;
  tags?: string[];
}

const SUBCATEGORY_LABEL = Object.fromEntries(
  ACCESSORY_SUBCATEGORIES.map((s) => [s.value, s.label])
);

export function AccessoryCard({ accessory }: { accessory: AccessoryCardData }) {
  return (
    <Link href={`/accessories/${accessory._id}`} className="block group">
      <div className="relative rounded-xl border border-border-subtle bg-bg-surface p-5 shadow-surface hover:border-border-accent hover:glow-accent transition-[border-color,box-shadow] duration-200">
        {/* Product image */}
        <div className="aspect-[4/3] rounded-lg overflow-hidden mb-4 bg-bg-elevated relative -mx-5 -mt-5 rounded-t-xl rounded-b-none">
          <img
            src={accessory.imageUrl || `https://placehold.co/640x480/181818/525252?text=${encodeURIComponent(accessory.name)}`}
            alt={accessory.name}
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent" />
        </div>

        <div className="flex items-start justify-between mb-2">