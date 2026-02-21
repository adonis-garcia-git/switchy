"use client";

import { useState } from "react";
import { useQuery } from "convex/react";
import { api } from "../../convex/_generated/api";

interface VendorLinksSectionProps {
  productName: string;
  compact?: boolean;
}

export function VendorLinksSection({ productName, compact = false }: VendorLinksSectionProps) {
  const [expanded, setExpanded] = useState(false);
  const links = useQuery(api.vendorLinks.getByProduct, { productName });

  if (!links || links.length === 0) return null;

  if (compact) {
    return (
      <a
        href={links[0].url}
        target="_blank"
        rel="noopener noreferrer"
        className="inline-flex items-center gap-1 text-xs text-accent hover:text-accent-hover transition-colors duration-150 focus-visible:outline-none focus-visible:text-accent-hover"
        onClick={(e) => e.stopPropagation()}
      >
        Buy
        <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
        </svg>
      </a>
    );
  }

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
        <div className="mt-2 space-y-px rounded-lg overflow-hidden border border-border-subtle">
          {links.map((link: any, i: number) => (
            <a
              key={i}
              href={link.url}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-between px-3 py-2.5 bg-bg-elevated hover:bg-bg-floating transition-colors duration-150 group"
              onClick={(e) => e.stopPropagation()}
            >
              <span className="text-sm text-text-primary group-hover:text-accent transition-colors duration-150">
                {link.vendor}
              </span>
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
            </a>
          ))}
        </div>
      )}
    </div>
  );
}
