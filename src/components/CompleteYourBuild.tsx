"use client";

import { useQuery } from "convex/react";
import { api } from "../../convex/_generated/api";
import Link from "next/link";
import { formatPriceWhole } from "@/lib/utils";

interface CompleteYourBuildProps {
  currentType: "switch" | "keyboard" | "keycaps" | "accessory";
  currentName: string;
  currentPrice: number;
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
    { table: "keyboards", category: "Keyboard", limit: 1 },
    { table: "keycaps", category: "Keycaps", limit: 1 },
    { table: "accessories", category: "Stabilizer", limit: 1 },
  ],
  keyboard: [
    { table: "switches", category: "Switch", limit: 1 },
    { table: "keycaps", category: "Keycaps", limit: 1 },
    { table: "accessories", category: "Stabilizer", limit: 1 },
  ],
  keycaps: [
    { table: "keyboards", category: "Keyboard", limit: 1 },
    { table: "switches", category: "Switch", limit: 1 },
  ],
  accessory: [
    { table: "keyboards", category: "Keyboard", limit: 1 },
  ],
};

export function CompleteYourBuild({ currentType, currentName, currentPrice }: CompleteYourBuildProps) {
  const config = CROSS_SELL_CONFIG[currentType] || [];

  const needsSwitches = config.some((c) => c.table === "switches");
  const needsKeyboards = config.some((c) => c.table === "keyboards");
  const needsKeycaps = config.some((c) => c.table === "keycaps");
  const needsAccessories = config.some((c) => c.table === "accessories");

  const switches = useQuery(api.switches.getRecommended, needsSwitches ? { limit: 1 } : "skip");
  const keyboards = useQuery(api.keyboards.getRecommended, needsKeyboards ? { limit: 1 } : "skip");
  const keycaps = useQuery(api.keycaps.getRecommended, needsKeycaps ? { limit: 1 } : "skip");
  const accessories = useQuery(
    api.accessories.getRecommended,
    needsAccessories ? { limit: 1, subcategory: "stabilizer" } : "skip"
  );

  const recommendations: RecommendedProduct[] = [];

  if (switches && switches.length > 0) {
    const s = switches[0];
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
  if (keyboards && keyboards.length > 0) {
    const k = keyboards[0];
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
  if (keycaps && keycaps.length > 0) {
    const kc = keycaps[0];
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
  if (accessories && accessories.length > 0) {
    const a = accessories[0];
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

  if (recommendations.length === 0) return null;

  const runningTotal = currentPrice + recommendations.reduce((sum, r) => sum + r.price, 0);

  return (
    <section className="mt-8">
      <div className="flex items-center gap-2 mb-4">
        <svg className="w-4.5 h-4.5 text-accent" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M11.42 15.17l-5.65-5.65a8 8 0 1111.4-1.06l-.19.19a2.12 2.12 0 01-3 0l-.71-.71" />
          <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 6a.5.5 0 11-1 0 .5.5 0 011 0zM16.5 12a.5.5 0 11-1 0 .5.5 0 011 0z" />
        </svg>
        <h3 className="font-[family-name:var(--font-outfit)] font-semibold text-text-primary tracking-tight">
          Complete Your Build
        </h3>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
        {recommendations.map((rec) => (
          <Link
            key={rec._id}
            href={rec.href}
            className="group flex items-center gap-3 rounded-xl border border-border-subtle bg-bg-surface p-3 hover:border-border-accent hover:glow-accent transition-[border-color,box-shadow] duration-200"
          >
            <div className="w-16 h-16 rounded-lg overflow-hidden bg-bg-elevated shrink-0 relative">
              <img
                src={rec.imageUrl}
                alt={rec.name}
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent" />
            </div>
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
              <p className="text-[10px] text-text-muted mt-0.5">View</p>
            </div>
          </Link>
        ))}
      </div>

      <div className="flex items-center justify-end gap-2 mt-3 pt-3 border-t border-border-subtle">
        <span className="text-xs text-text-muted">Estimated total</span>
        <span className="text-sm font-bold font-[family-name:var(--font-mono)] text-text-primary">
          ~{formatPriceWhole(runningTotal)}
        </span>
      </div>
    </section>
  );
}
