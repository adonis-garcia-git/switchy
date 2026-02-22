"use client";

import { useQuery } from "convex/react";
import { api } from "../../convex/_generated/api";
import Link from "next/link";
import { cn, formatPriceWhole } from "@/lib/utils";

interface CompleteYourBuildProps {
  currentType: "switch" | "keyboard" | "keycaps" | "accessory";
  currentName: string;
  currentPrice: number;
  /** When true, uses single-column grid (for sidebar rendering) */
  compact?: boolean;
  className?: string;
}

interface RecommendedProduct {
  _id: string;
  name: string;
  brand: string;
  imageUrl?: string;
  price: number;
  category: string;
  href: string;
}

const CROSS_SELL_CONFIG: Record<string, { table: string; category: string; limit: number }[]> = {
  switch: [
    { table: "keyboards", category: "Keyboard", limit: 2 },
    { table: "keycaps", category: "Keycaps", limit: 2 },
    { table: "accessories", category: "Stabilizer", limit: 2 },
  ],
  keyboard: [
    { table: "switches", category: "Switch", limit: 2 },
    { table: "keycaps", category: "Keycaps", limit: 2 },
    { table: "accessories", category: "Stabilizer", limit: 2 },
  ],
  keycaps: [
    { table: "keyboards", category: "Keyboard", limit: 2 },
    { table: "switches", category: "Switch", limit: 2 },
  ],
  accessory: [
    { table: "keyboards", category: "Keyboard", limit: 2 },
  ],
};

export function CompleteYourBuild({ currentType, currentName, currentPrice, compact, className }: CompleteYourBuildProps) {
  const config = CROSS_SELL_CONFIG[currentType] || [];

  const needsSwitches = config.some((c) => c.table === "switches");
  const needsKeyboards = config.some((c) => c.table === "keyboards");
  const needsKeycaps = config.some((c) => c.table === "keycaps");
  const needsAccessories = config.some((c) => c.table === "accessories");

  const switches = useQuery(api.switches.getRecommended, needsSwitches ? { limit: 2 } : "skip");
  const keyboards = useQuery(api.keyboards.getRecommended, needsKeyboards ? { limit: 2 } : "skip");
  const keycaps = useQuery(api.keycaps.getRecommended, needsKeycaps ? { limit: 2 } : "skip");
  const accessories = useQuery(
    api.accessories.getRecommended,
    needsAccessories ? { limit: 2, subcategory: "stabilizer" } : "skip"
  );

  const recommendations: RecommendedProduct[] = [];

  if (switches) {
    for (const s of switches) {
      recommendations.push({
        _id: s._id,
        name: s.name,
        brand: s.brand,
        imageUrl: s.imageUrl,
        price: s.pricePerSwitch * 70,
        category: "Switch",
        href: `/switches/${s._id}`,
      });
    }
  }
  if (keyboards) {
    for (const k of keyboards) {
      recommendations.push({
        _id: k._id,
        name: k.name,
        brand: k.brand,
        imageUrl: k.imageUrl,
        price: k.priceUsd,
        category: "Keyboard",
        href: `/keyboards/${k._id}`,
      });
    }
  }
  if (keycaps) {
    for (const kc of keycaps) {
      recommendations.push({
        _id: kc._id,
        name: kc.name,
        brand: kc.brand,
        imageUrl: kc.imageUrl,
        price: kc.priceUsd,
        category: "Keycaps",
        href: `/keycaps/${kc._id}`,
      });
    }
  }
  if (accessories) {
    for (const a of accessories) {
      recommendations.push({
        _id: a._id,
        name: a.name,
        brand: a.brand,
        imageUrl: a.imageUrl,
        price: a.priceUsd,
        category: "Stabilizer",
        href: `/accessories/${a._id}`,
      });
    }
  }

  if (recommendations.length === 0) return null;

  const runningTotal = currentPrice + recommendations.reduce((sum, r) => sum + r.price, 0);

  return (
    <section className={cn("rounded-2xl border border-border-subtle bg-bg-surface/50 p-5 sm:p-6", className)}>
      <div className="flex items-center gap-2.5 mb-5">
        <div className="w-8 h-8 rounded-lg bg-accent/10 border border-accent/20 flex items-center justify-center shrink-0">
          <svg className="w-4 h-4 text-accent" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M11.42 15.17l-5.65-5.65a8 8 0 1111.4-1.06l-.19.19a2.12 2.12 0 01-3 0l-.71-.71" />
            <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 6a.5.5 0 11-1 0 .5.5 0 011 0zM16.5 12a.5.5 0 11-1 0 .5.5 0 011 0z" />
          </svg>
        </div>
        <h3 className="font-[family-name:var(--font-outfit)] font-semibold text-text-primary tracking-tight text-lg">
          Complete Your Build
        </h3>
      </div>

      <div className={cn("grid gap-3", compact ? "grid-cols-1" : "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3")}>
        {recommendations.map((rec) => (
          <Link
            key={rec._id}
            href={rec.href}
            className="group flex items-center gap-3 rounded-xl border border-border-subtle bg-bg-primary/40 p-3 hover:border-border-accent hover:glow-accent transition-[border-color,box-shadow] duration-200"
          >
            {rec.imageUrl && (
              <div className="w-14 h-14 rounded-lg overflow-hidden bg-bg-elevated shrink-0 relative">
                <img
                  src={rec.imageUrl}
                  alt={rec.name}
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent" />
              </div>
            )}
            <div className="min-w-0 flex-1">
              <span className="text-[10px] uppercase tracking-wider text-accent font-semibold">
                {rec.category}
              </span>
              <p className="text-sm font-semibold text-text-primary truncate group-hover:text-accent transition-colors duration-150 font-[family-name:var(--font-outfit)]">
                {rec.name}
              </p>
              <p className="text-[11px] text-text-muted">{rec.brand}</p>
            </div>
            <div className="text-right shrink-0">
              <span className="text-sm font-semibold font-[family-name:var(--font-mono)] text-accent">
                {formatPriceWhole(rec.price)}
              </span>
            </div>
          </Link>
        ))}
      </div>

      <div className="flex items-center justify-end gap-3 mt-4 pt-4 border-t border-border-subtle">
        <span className="text-sm text-text-muted">Estimated build total</span>
        <span className="text-lg font-bold font-[family-name:var(--font-mono)] text-accent">
          ~{formatPriceWhole(runningTotal)}
        </span>
      </div>
    </section>
  );
}
