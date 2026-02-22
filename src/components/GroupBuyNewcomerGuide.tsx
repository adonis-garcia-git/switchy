"use client";

import { useState, useEffect } from "react";
import { cn } from "@/lib/utils";
import Link from "next/link";

const STORAGE_KEY = "switchy-gb-newcomer-dismissed";

export function GroupBuyNewcomerGuide() {
  const [dismissed, setDismissed] = useState(true); // default hidden to avoid flash

  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored !== "true") {
      setDismissed(false);
    }
  }, []);

  const handleDismiss = () => {
    setDismissed(true);
    localStorage.setItem(STORAGE_KEY, "true");
  };

  if (dismissed) return null;

  return (
    <div className="mb-6 rounded-xl border border-sky-500/20 bg-sky-500/5 p-4 relative">
      {/* Dismiss button */}
      <button
        onClick={handleDismiss}
        className="absolute top-3 right-3 w-6 h-6 flex items-center justify-center rounded-md hover:bg-sky-500/10 text-sky-400/60 hover:text-sky-400 transition-colors duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-500/40 active:scale-[0.95]"
        aria-label="Dismiss"
      >
        <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
        </svg>
      </button>

      <div className="flex items-start gap-3 pr-6">
        <div className="w-8 h-8 rounded-lg bg-sky-500/15 border border-sky-500/20 flex items-center justify-center shrink-0 mt-0.5">
          <svg className="w-4 h-4 text-sky-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 18v-5.25m0 0a6.01 6.01 0 001.5-.189m-1.5.189a6.01 6.01 0 01-1.5-.189m3.75 7.478a12.06 12.06 0 01-4.5 0m3.75 2.383a14.406 14.406 0 01-3 0M14.25 18v-.192c0-.983.658-1.823 1.508-2.316a7.5 7.5 0 10-7.517 0c.85.493 1.509 1.333 1.509 2.316V18" />
          </svg>
        </div>
        <div>
          <h3 className="text-sm font-semibold text-sky-400 font-[family-name:var(--font-outfit)] mb-1">
            New to Group Buys?
          </h3>
          <p className="text-xs text-text-secondary leading-relaxed mb-2">
            Group buys are community pre-orders for custom keyboard products. You pay upfront and typically wait 6–18 months for manufacturing and delivery. Prices are lower than aftermarket, but delays are common. Interest Checks (ICs) happen first to gauge demand before a buy goes live.
          </p>
          <Link
            href="/glossary"
            className={cn(
              "inline-flex items-center gap-1 text-[11px] font-semibold text-sky-400",
              "hover:text-sky-300 transition-colors duration-150",
              "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-500/40 rounded"
            )}
          >
            Learn more in the Glossary
            <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
            </svg>
          </Link>
        </div>
      </div>
    </div>
  );
}
