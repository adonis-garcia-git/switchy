"use client";

import { useMemo, useRef } from "react";
import { useQuery } from "convex/react";
import { api } from "../../../convex/_generated/api";
import { ProductCarousel } from "./ProductCarousel";
import { ProductTile } from "./ProductTile";

interface NormalizedProduct {
  id: string;
  imageUrl: string;
  name: string;
  brand: string;
}

// Deterministic shuffle using a seed
function seededShuffle<T>(arr: T[], seed: number): T[] {
  const result = [...arr];
  let s = seed;
  for (let i = result.length - 1; i > 0; i--) {
    s = (s * 16807 + 0) % 2147483647;
    const j = s % (i + 1);
    [result[i], result[j]] = [result[j], result[i]];
  }
  return result;
}

export function SearchShowcase() {
  const seedRef = useRef(Math.floor(Math.random() * 2147483647));

  const switches = useQuery(api.switches.list, {});
  const keyboards = useQuery(api.keyboards.list, {});
  const keycaps = useQuery(api.keycaps.list, {});
  const accessories = useQuery(api.accessories.list, {});

  const isLoading =
    switches === undefined ||
    keyboards === undefined ||
    keycaps === undefined ||
    accessories === undefined;

  const { topRow, middleLeft, middleRight, bottomRow } = useMemo(() => {
    if (isLoading) {
      return { topRow: undefined, middleLeft: undefined, middleRight: undefined, bottomRow: undefined };
    }

    const pool: NormalizedProduct[] = [];

    for (const s of switches) {
      if (s.imageUrl) {
        pool.push({ id: s._id, imageUrl: s.imageUrl, name: s.name, brand: s.brand });
      }
    }
    for (const k of keyboards) {
      if (k.imageUrl) {
        pool.push({ id: k._id, imageUrl: k.imageUrl, name: k.name, brand: k.brand });
      }
    }
    for (const kc of keycaps) {
      if (kc.imageUrl) {
        pool.push({ id: kc._id, imageUrl: kc.imageUrl, name: kc.name, brand: kc.brand });
      }
    }
    for (const a of accessories) {
      if (a.imageUrl) {
        pool.push({ id: a._id, imageUrl: a.imageUrl, name: a.name, brand: a.brand });
      }
    }

    const shuffled = seededShuffle(pool, seedRef.current);

    // Split: ~20 top, 4 mid-left, 4 mid-right, ~20 bottom, rest unused
    const top = shuffled.slice(0, 20);
    const mLeft = shuffled.slice(20, 24);
    const mRight = shuffled.slice(24, 28);
    const bottom = shuffled.slice(28, 48);

    return {
      topRow: top.length > 0 ? top : undefined,
      middleLeft: mLeft,
      middleRight: mRight,
      bottomRow: bottom.length > 0 ? bottom : undefined,
    };
  }, [isLoading, switches, keyboards, keycaps, accessories]);

  return (
    <div className="relative flex flex-col justify-center min-h-[calc(100vh-4rem)] overflow-hidden">
      {/* Grain overlay */}
      <div className="grain absolute inset-0 z-[1] pointer-events-none" />

      {/* Radial spotlight behind center */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_50%_40%_at_50%_50%,var(--color-bg-elevated),transparent)] pointer-events-none" />

      {/* Top carousel */}
      <div className="opacity-50 mb-6 sm:mb-8">
        <ProductCarousel products={topRow} direction="right" />
      </div>

      {/* Middle row */}
      <div className="relative z-10 flex items-center justify-center gap-4 sm:gap-6 px-4 py-4 sm:py-6">
        {/* Left static tiles (hidden on mobile) */}
        <div className="hidden md:flex gap-4 opacity-35 [filter:saturate(0.7)]">
          {!isLoading && middleLeft
            ? middleLeft.map((p) => (
                <ProductTile key={p.id} imageUrl={p.imageUrl} name={p.name} brand={p.brand} />
              ))
            : Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="w-48 rounded-xl bg-bg-surface border border-border-subtle overflow-hidden">
                  <div className="aspect-[4/3] bg-bg-elevated animate-pulse" />
                  <div className="px-3 py-2.5 space-y-1.5">
                    <div className="h-2 w-12 bg-bg-elevated/80 rounded animate-pulse" />
                    <div className="h-3 w-24 bg-bg-elevated/80 rounded animate-pulse" />
                  </div>
                </div>
              ))}
        </div>

        {/* Center content */}
        <div className="flex-shrink-0 text-center px-6 sm:px-12 py-6">
          <div className="w-16 h-16 rounded-2xl bg-text-muted/10 border border-border-subtle flex items-center justify-center mx-auto mb-6">
            <svg
              className="w-8 h-8 text-text-muted/50"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={1.5}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
              />
            </svg>
          </div>
          <h1 className="text-2xl font-bold text-text-primary font-[family-name:var(--font-outfit)] tracking-tight mb-3">
            Search Unavailable
          </h1>
          <p className="text-sm text-text-secondary leading-relaxed max-w-sm mx-auto">
            This feature is powered by an external AI search API that&apos;s too
            expensive to leave running in demo mode. Sorry about that!
          </p>
          <p className="text-xs text-text-muted mt-4">
            Browse switches, keyboards, and keycaps directly from the nav instead.
          </p>
        </div>

        {/* Right static tiles (hidden on mobile) */}
        <div className="hidden md:flex gap-4 opacity-35 [filter:saturate(0.7)]">
          {!isLoading && middleRight
            ? middleRight.map((p) => (
                <ProductTile key={p.id} imageUrl={p.imageUrl} name={p.name} brand={p.brand} />
              ))
            : Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="w-48 rounded-xl bg-bg-surface border border-border-subtle overflow-hidden">
                  <div className="aspect-[4/3] bg-bg-elevated animate-pulse" />
                  <div className="px-3 py-2.5 space-y-1.5">
                    <div className="h-2 w-12 bg-bg-elevated/80 rounded animate-pulse" />
                    <div className="h-3 w-24 bg-bg-elevated/80 rounded animate-pulse" />
                  </div>
                </div>
              ))}
        </div>
      </div>

      {/* Bottom carousel */}
      <div className="opacity-50 mt-6 sm:mt-8">
        <ProductCarousel products={bottomRow} direction="left" />
      </div>
    </div>
  );
}
