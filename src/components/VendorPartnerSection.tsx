"use client";

import { useQuery } from "convex/react";
import { api } from "../../convex/_generated/api";
import { useAffiliateClick } from "@/hooks/useAffiliateClick";
import { cn } from "@/lib/utils";

interface VendorPartnerSectionProps {
  productName: string;
  referrerPage?: string;
}

export function VendorPartnerSection({ productName, referrerPage }: VendorPartnerSectionProps) {
  const links = useQuery(api.vendorLinks.getByProduct, { productName });
  const { handleAffiliateClick } = useAffiliateClick();

  if (!links || links.length === 0) return null;

  // Sort by price (cheapest first), no-price at end
  const sorted = [...links].sort((a: any, b: any) => {
    if (a.price == null && b.price == null) return 0;
    if (a.price == null) return 1;
    if (b.price == null) return -1;
    return a.price - b.price;
  });

  const cheapestPrice = sorted.find((l: any) => l.price != null)?.price;

  const handleClick = (link: any, e: React.MouseEvent) => {
    e.preventDefault();
    if (link.affiliateUrl && link._id) {
      handleAffiliateClick(link._id, link.affiliateUrl, productName, link.vendor, referrerPage);
    } else {
      window.open(link.url, "_blank", "noopener,noreferrer");
    }
  };

  const hasAnyAffiliate = sorted.some((l: any) => l.affiliateUrl);

  return (
    <section className="mt-8">
      <h3 className="font-[family-name:var(--font-outfit)] font-semibold text-text-primary tracking-tight mb-4 flex items-center gap-2">
        <svg className="w-4 h-4 text-accent" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
        </svg>
        Where to Buy
      </h3>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
        {sorted.map((link: any, i: number) => {
          const isBestPrice = link.price != null && link.price === cheapestPrice;
          return (
            <button
              key={link._id || i}
              onClick={(e) => handleClick(link, e)}
              className={cn(
                "flex items-center justify-between rounded-xl border bg-bg-surface p-4 text-left group",
                "transition-[border-color,box-shadow] duration-200",
                "hover:border-border-accent hover:glow-accent",
                "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/40",
                "active:scale-[0.98]",
                isBestPrice ? "border-accent/30" : "border-border-subtle"
              )}
            >
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-semibold text-text-primary group-hover:text-accent transition-colors duration-150 font-[family-name:var(--font-outfit)]">
                    {link.vendor}
                  </span>
                  {link.hasAffiliate && (
                    <span className="text-[9px] px-1.5 py-0.5 rounded-full bg-accent/10 text-accent border border-accent/20 font-semibold uppercase tracking-wider">
                      Partner
                    </span>
                  )}
                </div>
                {isBestPrice && (
                  <span className="inline-flex items-center gap-1 mt-1 text-[10px] px-1.5 py-0.5 rounded-full bg-green-500/10 text-green-400 border border-green-500/20 font-semibold">
                    <svg className="w-2.5 h-2.5" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                    Best Price
                  </span>
                )}
              </div>
              <div className="flex items-center gap-3 shrink-0 ml-3">
                {link.price != null && (
                  <span className="text-lg font-bold font-[family-name:var(--font-mono)] text-accent">
                    ${link.price.toFixed(2)}
                  </span>
                )}
                <div className={cn(
                  "flex items-center justify-center w-9 h-9 rounded-lg",
                  "bg-accent text-bg-primary",
                  "group-hover:bg-accent-hover",
                  "transition-colors duration-150"
                )}>
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M7 17L17 7M17 7H7M17 7v10" />
                  </svg>
                </div>
              </div>
            </button>
          );
        })}
      </div>

      {hasAnyAffiliate && (
        <p className="text-[9px] text-text-muted mt-3 leading-relaxed">
          Some links are affiliate links. We may earn a commission at no extra cost to you.
        </p>
      )}
    </section>
  );
}
