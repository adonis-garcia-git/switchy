"use client";

import { useState, useRef, useEffect } from "react";
import { useQuery } from "convex/react";
import { api } from "../../convex/_generated/api";
import { useAffiliateClick } from "@/hooks/useAffiliateClick";

interface PriceCompareDropdownProps {
  productName: string;
  referrerPage?: string;
}

export function PriceCompareDropdown({
  productName,
  referrerPage,
}: PriceCompareDropdownProps) {
  const [open, setOpen] = useState(false);
  const wrapperRef = useRef<HTMLDivElement>(null);
  const links = useQuery(api.vendorLinks.getByProduct, { productName });
  const { handleAffiliateClick } = useAffiliateClick();

  // Close popover on click outside
  useEffect(() => {
    if (!open) return;

    function handleMouseDown(e: MouseEvent) {
      if (
        wrapperRef.current &&
        !wrapperRef.current.contains(e.target as Node)
      ) {
        setOpen(false);
      }
    }

    document.addEventListener("mousedown", handleMouseDown);
    return () => document.removeEventListener("mousedown", handleMouseDown);
  }, [open]);

  // Don't render if 0 or 1 vendor
  if (!links || links.length <= 1) return null;

  // Sort: vendors with a price come first (cheapest first), vendors without price at the end
  const sorted = [...links].sort((a: any, b: any) => {
    const aPrice = a.price ?? Infinity;
    const bPrice = b.price ?? Infinity;
    return aPrice - bPrice;
  });

  // Find cheapest price to mark "Best Price"
  const cheapestPrice = sorted.find((l: any) => l.price != null)?.price ?? null;

  const handleRowClick = (link: any, e: React.MouseEvent) => {
    e.stopPropagation();
    e.preventDefault();
    if (link.affiliateUrl && link._id) {
      handleAffiliateClick(
        link._id,
        link.affiliateUrl,
        productName,
        link.vendor,
        referrerPage
      );
    } else {
      window.open(link.url, "_blank", "noopener,noreferrer");
    }
    setOpen(false);
  };

  const hasAnyAffiliate = sorted.some((l: any) => l.affiliateUrl);

  return (
    <div ref={wrapperRef} className="relative">
      {/* Trigger button */}
      <button
        onClick={(e) => {
          e.stopPropagation();
          setOpen((prev) => !prev);
        }}
        className="text-xs text-text-muted hover:text-accent transition-colors duration-150 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-accent focus-visible:text-accent rounded"
      >
        ({links.length} vendors)
      </button>

      {/* Popover */}
      {open && (
        <div className="absolute right-0 top-full z-20 mt-1 min-w-[220px] bg-bg-floating border border-border-default shadow-floating rounded-xl py-1">
          {sorted.map((link: any, i: number) => {
            const isCheapest =
              cheapestPrice !== null &&
              link.price != null &&
              link.price === cheapestPrice;

            return (
              <button
                key={link._id ?? i}
                onClick={(e) => handleRowClick(link, e)}
                className="flex items-center justify-between w-full px-3 py-2.5 hover:bg-bg-elevated transition-colors duration-150 cursor-pointer group text-left focus-visible:outline-none focus-visible:bg-bg-elevated"
              >
                {/* Left side: vendor name + badges */}
                <div className="flex items-center gap-1.5 min-w-0">
                  <span className="text-sm text-text-primary group-hover:text-accent transition-colors duration-150 truncate">
                    {link.vendor}
                  </span>
                  {link.affiliateUrl && (
                    <span className="text-[9px] text-text-muted shrink-0">
                      Partner
                    </span>
                  )}
                  {isCheapest && (
                    <span className="text-[9px] px-1.5 py-0.5 rounded-full bg-green-500/10 text-green-400 border border-green-500/20 font-semibold shrink-0">
                      Best Price
                    </span>
                  )}
                </div>

                {/* Right side: price + external link icon */}
                <div className="flex items-center gap-2 shrink-0 ml-3">
                  {link.price != null && (
                    <span className="text-xs font-[family-name:var(--font-mono)] text-text-secondary">
                      ${link.price.toFixed(2)}
                    </span>
                  )}
                  <svg
                    className="w-3.5 h-3.5 text-text-muted group-hover:text-accent transition-colors duration-150"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"
                    />
                  </svg>
                </div>
              </button>
            );
          })}

          {/* Affiliate disclosure footer */}
          {hasAnyAffiliate && (
            <p className="text-[9px] text-text-muted px-3 py-2 border-t border-border-subtle leading-relaxed">
              Some links are affiliate/partner links. We may earn a small
              commission at no extra cost to you.
            </p>
          )}
        </div>
      )}
    </div>
  );
}
