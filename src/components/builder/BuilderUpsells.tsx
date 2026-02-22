"use client";

import { useQuery, useMutation } from "convex/react";
import { api } from "../../../convex/_generated/api";
import { useEffect, useRef } from "react";
import { cn, formatPriceWhole } from "@/lib/utils";
import { SponsoredBadge } from "@/components/SponsoredBadge";

interface BuilderUpsellsProps {
  currentComponents: {
    keyboardKit?: { name: string; price: number };
    switches?: { name: string; priceEach: number; quantity: number };
    keycaps?: { name: string; price: number };
    stabilizers?: { name: string; price: number };
  };
}

export function BuilderUpsells({ currentComponents }: BuilderUpsellsProps) {
  const sponsorships = useQuery(api.sponsorships.getActive, {
    placement: "build_recommendation",
  });
  const recordImpression = useMutation(api.sponsorships.recordImpression);
  const recordClick = useMutation(api.sponsorships.recordClick);
  const impressionRecorded = useRef(new Set<string>());

  useEffect(() => {
    if (!sponsorships) return;
    for (const s of sponsorships) {
      if (!impressionRecorded.current.has(s._id)) {
        impressionRecorded.current.add(s._id);
        recordImpression({ id: s._id });
      }
    }
  }, [sponsorships, recordImpression]);

  if (!sponsorships || sponsorships.length === 0) return null;

  const getUpgradeContext = (s: any): { from: string; currentPrice: number } | null => {
    if (s.productType === "switch" && currentComponents.switches) {
      return { from: currentComponents.switches.name, currentPrice: currentComponents.switches.priceEach * currentComponents.switches.quantity };
    }
    if (s.productType === "keyboard" && currentComponents.keyboardKit) {
      return { from: currentComponents.keyboardKit.name, currentPrice: currentComponents.keyboardKit.price };
    }
    if (s.productType === "keycaps" && currentComponents.keycaps) {
      return { from: currentComponents.keycaps.name, currentPrice: currentComponents.keycaps.price };
    }
    if (s.productType === "accessory" && currentComponents.stabilizers) {
      return { from: currentComponents.stabilizers.name, currentPrice: currentComponents.stabilizers.price };
    }
    return null;
  };

  const handleClick = (s: any) => {
    recordClick({ id: s._id });
    if (s.productUrl) {
      window.open(s.productUrl, "_blank", "noopener,noreferrer");
    }
  };

  return (
    <div>
      <h3 className="text-xs text-text-muted uppercase tracking-wider font-medium font-[family-name:var(--font-outfit)] mb-3 flex items-center gap-2">
        Upgrade Picks
        <span className="text-[9px] text-text-muted/60 normal-case tracking-normal font-normal">Sponsored</span>
      </h3>
      <div className="space-y-2">
        {sponsorships.slice(0, 3).map((s: any) => {
          const context = getUpgradeContext(s);
          const priceDelta = context && s.priceUsd ? s.priceUsd - context.currentPrice : null;

          return (
            <button
              key={s._id}
              onClick={() => handleClick(s)}
              className={cn(
                "flex items-center gap-4 w-full rounded-xl border-l-2 border-amber-500/30 border border-border-subtle bg-bg-surface p-3 text-left group",
                "hover:border-border-accent hover:glow-accent",
                "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/40",
                "active:scale-[0.99]",
                "transition-[border-color,box-shadow,transform] duration-200"
              )}
            >
              {s.imageUrl && (
                <div className="w-12 h-12 rounded-lg overflow-hidden bg-bg-elevated shrink-0 relative">
                  <img src={s.imageUrl} alt={s.productName} className="w-full h-full object-cover" />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent" />
                </div>
              )}
              <div className="min-w-0 flex-1">
                <p className="text-sm font-semibold text-text-primary truncate group-hover:text-accent transition-colors duration-150 font-[family-name:var(--font-outfit)]">
                  {s.productName}
                </p>
                {context && (
                  <p className="text-[11px] text-text-muted truncate">
                    Upgrade from {context.from}
                  </p>
                )}
              </div>
              <div className="flex items-center gap-3 shrink-0">
                {priceDelta != null && (
                  <span className={cn(
                    "text-xs font-[family-name:var(--font-mono)] font-semibold",
                    priceDelta > 0 ? "text-amber-400" : "text-green-400"
                  )}>
                    {priceDelta > 0 ? "+" : ""}{formatPriceWhole(priceDelta)}
                  </span>
                )}
                {s.priceUsd && (
                  <span className="text-sm font-bold font-[family-name:var(--font-mono)] text-accent">
                    {formatPriceWhole(s.priceUsd)}
                  </span>
                )}
                <svg className="w-4 h-4 text-text-muted group-hover:text-accent transition-colors duration-150 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M7 17L17 7M17 7H7M17 7v10" />
                </svg>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}
