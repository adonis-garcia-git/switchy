"use client";

import { useState } from "react";
import { useQuery } from "convex/react";
import { api } from "../../convex/_generated/api";
import { useAffiliateClick } from "@/hooks/useAffiliateClick";

interface VendorLinksSectionProps {
  productName: string;
  compact?: boolean;
  referrerPage?: string;
}

export function VendorLinksSection({ productName, compact = false, referrerPage }: VendorLinksSectionProps) {
  const [expanded, setExpanded] = useState(false);
  const links = useQuery(api.vendorLinks.getByProduct, { productName });
  const { handleAffiliateClick } = useAffiliateClick();

  if (!links || links.length === 0) return null;

  const handleLinkClick = (link: any, e: React.MouseEvent) => {
    e.stopPropagation();
    e.preventDefault();
    if (link.affiliateUrl && link._id) {
      handleAffiliateClick(link._id, link.affiliateUrl, productName, link.vendor, referrerPage);
    } else {
      window.open(link.url, "_blank", "noopener,noreferrer");
    }
  };

  if (compact) {
    return (
      <button
        onClick={(e) => handleLinkClick(links[0], e)}
        className="inline-flex items-center gap-1 text-xs text-accent hover:text-accent-hover transition-colors duration-150 focus-visible:outline-none focus-visible:text-accent-hover"
      >
        Buy
        <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
        </svg>
      </button>
    );
  }

  const hasAnyAffiliate = links.some((l: any) => l.affiliateUrl);

  return (
    <div className="mt-3">
      <button
        onClick={() => setExpanded(!expanded)}
        className="flex items-center gap-1.5 text-xs text-text-muted hover:text-text-primary transition-colors duration-150 focus-visible:outline-none focus-visible:text-text-primary"
      >
        <span>Where to Buy ({links.length})</span>
        <svg
          className={`w-3 h-3 transition-transform duration-200 ${expanded ? "rotate-180" : ""}`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>
      {expanded && (
        <>
          <div className="mt-2 space-y-px rounded-lg overflow-hidden border border-border-subtle">
            {links.map((link: any, i: number) => (
              <button
                key={i}
                onClick={(e) => handleLinkClick(link, e)}
                className="flex items-center justify-between w-full px-3 py-2.5 bg-bg-elevated hover:bg-bg-floating transition-colors duration-150 group text-left"
              >
                <div className="flex items-center gap-1.5">
                  <span className="text-sm text-text-primary group-hover:text-accent transition-colors duration-150">
                    {link.vendor}
                  </span>
                  {link.affiliateUrl && (
                    <span className="text-[9px] text-text-muted">Affiliate</span>
                  )}
                </div>
                <div className="flex items-center gap-2.5">
                  {link.price && (
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
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                  </svg>
                </div>
              </button>
            ))}
          </div>
          {hasAnyAffiliate && (
            <p className="text-[9px] text-text-muted mt-2 leading-relaxed">
              Some links are affiliate links. We may earn a commission at no extra cost to you.
            </p>
          )}
        </>
      )}
    </div>
  );
}
