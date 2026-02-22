"use client";

import { use } from "react";
import Link from "next/link";
import { useQuery } from "convex/react";
import { api } from "../../../../convex/_generated/api";
import { Id } from "../../../../convex/_generated/dataModel";
import { SoundProfile } from "@/components/SoundProfile";
import { VendorLinksSection } from "@/components/VendorLinks";
import { PurchaseButton } from "@/components/PurchaseButton";
import { Badge } from "@/components/ui/Badge";
import { cn, formatPrice } from "@/lib/utils";
import { CompleteYourBuild } from "@/components/CompleteYourBuild";
import { VendorPartnerSection } from "@/components/VendorPartnerSection";
import { Breadcrumb } from "@/components/detail/Breadcrumb";
import { BuildAdvisorCTA } from "@/components/detail/BuildAdvisorCTA";
import {
  SimilarProducts,
  SimilarProductItem,
} from "@/components/detail/SimilarProducts";
import { SwitchCard } from "@/components/SwitchCard";

/* ------------------------------------------------------------------ */
/*  Sub-component: resolves a single compared switch name via search  */
/* ------------------------------------------------------------------ */

function ComparedSwitchItem({ name }: { name: string }) {
  const results = useQuery(api.switches.search, { query: name });

  // Still loading
  if (results === undefined) {
    return (
      <div className="h-20 w-full rounded-lg bg-bg-elevated animate-pulse" />
    );
  }

  // Try to find an exact-ish match (case-insensitive name match first, else first result)
  const match =
    results.find(
      (s: any) => s.name.toLowerCase() === name.toLowerCase()
    ) ?? (results.length > 0 ? results[0] : null);

  if (!match) {
    // Fallback: plain text badge
    return (
      <span className="px-3 py-1.5 rounded-lg text-sm bg-bg-elevated text-text-secondary border border-border-subtle">
        {name}
      </span>
    );
  }

  return (
    <Link
      href={`/switches/${match._id}`}
      className="flex items-center gap-3 rounded-xl border border-border-subtle bg-bg-primary/30 p-3 hover:border-border-accent transition-[border-color] duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/40 group"
    >
      {match.imageUrl && (
        <div className="w-14 h-14 rounded-lg overflow-hidden bg-bg-elevated shrink-0 relative">
          <img
            src={match.imageUrl}
            alt={match.name}
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent" />
        </div>
      )}
      <div className="flex-1 min-w-0">
        <p className="text-sm font-semibold text-text-primary truncate group-hover:text-accent transition-colors duration-150">
          {match.name}
        </p>
        <div className="flex items-center gap-2 mt-0.5">
          <Badge
            variant={match.type as "linear" | "tactile" | "clicky"}
            size="sm"
          >
            {match.type}
          </Badge>
          <span className="text-xs font-mono text-accent font-medium">
            {formatPrice(match.pricePerSwitch)}
          </span>
        </div>
      </div>
      <svg
        className="w-4 h-4 text-text-muted shrink-0 group-hover:text-accent transition-colors duration-150"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
        strokeWidth={2}
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M9 5l7 7-7 7"
        />
      </svg>
    </Link>
  );
}

/* ------------------------------------------------------------------ */
/*  Sub-component: renders up to 4 compared switches                  */
/* ------------------------------------------------------------------ */

function ComparedSwitches({
  names,
}: {
  names: string[];
}) {
  // Limit to 4 to keep hook count deterministic
  const limited = names.slice(0, 4);

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
      {limited.map((name) => (
        <ComparedSwitchItem key={name} name={name} />
      ))}
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Main page component                                                */
/* ------------------------------------------------------------------ */

export default function SwitchDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const sw = useQuery(api.switches.getById, {
    id: id as Id<"switches">,
  });

  // Query similar switches by type (always called, will filter client-side)
  const similarRaw = useQuery(
    api.switches.list,
    sw ? { type: sw.type as "linear" | "tactile" | "clicky" } : "skip"
  );

  const similarSwitches = similarRaw
    ? similarRaw
        .filter((s: any) => s._id !== id)
        .slice(0, 6)
    : [];

  if (sw === undefined) {
    return (
      <div className="min-h-screen">
        <div className="max-w-5xl mx-auto px-4 lg:px-8 py-8">
          {/* Skeleton */}
          <div className="h-4 w-32 bg-bg-elevated rounded mb-6 animate-pulse" />
          <div className="flex items-start justify-between mb-6">
            <div>
              <div className="h-3 w-20 bg-bg-elevated rounded mb-2 animate-pulse" />
              <div className="h-7 w-48 bg-bg-elevated rounded animate-pulse" />
            </div>
            <div className="h-6 w-16 bg-bg-elevated rounded animate-pulse" />
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 space-y-4">
              {Array.from({ length: 4 }).map((_, i) => (
                <div
                  key={i}
                  className="h-12 bg-bg-surface rounded-lg animate-pulse"
                />
              ))}
            </div>
            <div className="h-48 bg-bg-surface rounded-xl animate-pulse" />
          </div>
        </div>
      </div>
    );
  }

  if (!sw) {
    return (
      <div className="min-h-screen">
        <div className="max-w-3xl mx-auto px-4 py-20 text-center">
          <p className="text-text-muted mb-2">Switch not found</p>
          <Link
            href="/switches"
            className="text-accent text-sm hover:text-accent-hover transition-colors duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/40 rounded"
          >
            Back to Switch Explorer
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      <main className="max-w-5xl mx-auto px-4 lg:px-8 py-8">
        {/* Breadcrumb */}
        <Breadcrumb
          items={[
            { label: "Home", href: "/" },
            { label: "Switches", href: "/switches" },
            { label: sw.name },
          ]}
        />

        {/* Header */}
        <div className="flex items-start justify-between mb-6">
          <div>
            <p className="text-xs text-text-muted uppercase tracking-wider font-medium mb-1">
              {sw.brand}
            </p>
            <h1 className="font-[family-name:var(--font-outfit)] text-3xl font-bold text-text-primary tracking-tight">
              {sw.name}
            </h1>
          </div>
          <Badge
            variant={sw.type as "linear" | "tactile" | "clicky"}
            size="md"
          >
            {sw.type}
          </Badge>
        </div>

        {/* Product image hero */}
        {sw.imageUrl && (
          <div className="mb-6 max-w-md mx-auto">
            <div className="aspect-[4/3] rounded-2xl overflow-hidden bg-bg-elevated relative">
              <img
                src={sw.imageUrl}
                alt={`${sw.brand} ${sw.name}`}
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent" />
            </div>
          </div>
        )}

        {/* 2-column layout: main content + sticky sidebar */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main content area — all sections visible */}
          <div className="lg:col-span-2 space-y-6">
            {/* Specifications */}
            <div className="rounded-xl border border-border-default bg-bg-surface p-5">
              <h2 className="font-[family-name:var(--font-outfit)] text-sm font-semibold text-text-secondary uppercase tracking-wider mb-4">
                Specifications
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-px bg-border-subtle rounded-lg overflow-hidden">
                {(
                  [
                    ["Actuation Force", `${sw.actuationForceG}g`],
                    sw.bottomOutForceG != null && [
                      "Bottom Out Force",
                      `${sw.bottomOutForceG}g`,
                    ],
                    ["Actuation Point", `${sw.actuationMm}mm`],
                    ["Total Travel", `${sw.totalTravelMm}mm`],
                    sw.stemMaterial && ["Stem Material", sw.stemMaterial],
                    sw.housingMaterial && [
                      "Housing Material",
                      sw.housingMaterial,
                    ],
                    sw.springType && ["Spring Type", sw.springType],
                    sw.factoryLubed != null && [
                      "Factory Lubed",
                      sw.factoryLubed ? "Yes" : "No",
                    ],
                    sw.longPole != null && [
                      "Long Pole",
                      sw.longPole ? "Yes" : "No",
                    ],
                  ].filter(Boolean) as [string, string][]
                ).map(([label, value], idx) => (
                  <div
                    key={label}
                    className={cn(
                      "flex justify-between items-center py-3 px-4",
                      idx % 2 === 0 ? "bg-bg-surface" : "bg-bg-surface",
                      "bg-bg-primary/30"
                    )}
                  >
                    <span className="text-xs text-text-muted uppercase tracking-wider">
                      {label}
                    </span>
                    <span className="text-sm font-mono text-text-primary font-medium">
                      {value}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Sound Profile */}
            <div className="rounded-xl border border-border-default bg-bg-surface p-5">
              <h2 className="font-[family-name:var(--font-outfit)] text-sm font-semibold text-text-secondary uppercase tracking-wider mb-6">
                Sound Profile
              </h2>
              {sw.soundPitch && sw.soundVolume && sw.soundCharacter ? (
                <SoundProfile
                  pitch={sw.soundPitch as "low" | "mid" | "high"}
                  volume={sw.soundVolume as "quiet" | "medium" | "loud"}
                  character={sw.soundCharacter}
                />
              ) : (
                <p className="text-sm text-text-muted">
                  Sound profile data not available for this switch.
                </p>
              )}
            </div>

            {/* Popular For */}
            {sw.popularFor && sw.popularFor.length > 0 && (
              <div className="rounded-xl border border-border-default bg-bg-surface p-5">
                <h2 className="font-[family-name:var(--font-outfit)] text-sm font-semibold text-text-secondary uppercase tracking-wider mb-3">
                  Popular For
                </h2>
                <div className="flex flex-wrap gap-2">
                  {sw.popularFor.map((tag: string) => (
                    <span
                      key={tag}
                      className="px-3 py-1.5 rounded-lg text-sm bg-accent-dim/40 text-accent border border-border-accent font-medium"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Community Notes */}
            {sw.notes && (
              <div className="rounded-xl border border-border-default bg-bg-surface p-5">
                <h2 className="font-[family-name:var(--font-outfit)] text-sm font-semibold text-text-secondary uppercase tracking-wider mb-3">
                  Community Notes
                </h2>
                <p className="text-sm text-text-secondary leading-relaxed">
                  {sw.notes}
                </p>
              </div>
            )}

            {/* Commonly Compared To — upgraded with search-backed mini cards */}
            {sw.commonlyComparedTo && sw.commonlyComparedTo.length > 0 && (
              <div className="rounded-xl border border-border-default bg-bg-surface p-5">
                <h2 className="font-[family-name:var(--font-outfit)] text-sm font-semibold text-text-secondary uppercase tracking-wider mb-3">
                  Commonly Compared To
                </h2>
                <ComparedSwitches names={sw.commonlyComparedTo} />
              </div>
            )}

            {/* Where to Buy */}
            <div className="rounded-xl border border-border-default bg-bg-surface p-5">
              <h2 className="font-[family-name:var(--font-outfit)] text-sm font-semibold text-text-secondary uppercase tracking-wider mb-4">
                Where to Buy
              </h2>
              <VendorLinksSection productName={sw.name} />
            </div>
          </div>

          {/* Sidebar: quick stats */}
          <div className="lg:col-span-1">
            <div className="sticky top-24 space-y-4">
              <div className="rounded-xl border border-border-default bg-bg-surface p-5 space-y-5">
                {/* Price */}
                <div>
                  <p className="text-[10px] text-text-muted uppercase tracking-wider mb-1">
                    Price per switch
                  </p>
                  <p className="text-2xl font-bold font-mono text-accent">
                    {formatPrice(sw.pricePerSwitch)}
                  </p>
                </div>

                {sw.communityRating != null && (
                  <>
                    <div className="h-px bg-border-subtle" />

                    {/* Rating */}
                    <div>
                      <p className="text-[10px] text-text-muted uppercase tracking-wider mb-1">
                        Community Rating
                      </p>
                      <div className="flex items-center gap-2">
                        <p className="text-2xl font-bold font-mono text-text-primary">
                          {sw.communityRating.toFixed(1)}
                        </p>
                        <span className="text-sm text-text-muted">/5.0</span>
                      </div>
                      <div className="flex items-center gap-px mt-1">
                        {[1, 2, 3, 4, 5].map((star) => (
                          <svg
                            key={star}
                            className={cn(
                              "w-4 h-4",
                              star <= Math.round(sw.communityRating!)
                                ? "text-accent"
                                : "text-text-muted/20"
                            )}
                            fill="currentColor"
                            viewBox="0 0 20 20"
                          >
                            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                          </svg>
                        ))}
                      </div>
                    </div>
                  </>
                )}

                <div className="h-px bg-border-subtle" />

                {/* Force */}
                <div>
                  <p className="text-[10px] text-text-muted uppercase tracking-wider mb-1">
                    Actuation Force
                  </p>
                  <p className="text-lg font-bold font-mono text-text-primary">
                    {sw.actuationForceG}g
                  </p>
                </div>

                {sw.soundPitch && sw.soundVolume && sw.soundCharacter && (
                  <>
                    <div className="h-px bg-border-subtle" />

                    {/* Sound */}
                    <div>
                      <p className="text-[10px] text-text-muted uppercase tracking-wider mb-1.5">
                        Sound Character
                      </p>
                      <SoundProfile
                        pitch={sw.soundPitch as "low" | "mid" | "high"}
                        volume={
                          sw.soundVolume as "quiet" | "medium" | "loud"
                        }
                        character={sw.soundCharacter}
                        compact
                      />
                    </div>
                  </>
                )}
              </div>

              {/* Buy — primary CTA */}
              <PurchaseButton
                brand={sw.brand}
                name={sw.name}
                productUrl={sw.productUrl}
                type="switch"
                size="md"
                className="w-full justify-center"
              />
            </div>
          </div>
        </div>

        {/* ---- Full-width sections below the main grid ---- */}

        {/* Similar Switches */}
        <SimilarProducts
          title={`More ${sw.type} Switches`}
          viewAllHref={`/switches?type=${sw.type}`}
          isEmpty={similarSwitches.length === 0}
        >
          {similarSwitches.map((s: any) => (
            <SimilarProductItem key={s._id}>
              <SwitchCard sw={s} />
            </SimilarProductItem>
          ))}
        </SimilarProducts>

        {/* Complete Your Build cross-sell */}
        <CompleteYourBuild
          currentType="switch"
          currentName={sw.name}
          currentPrice={sw.pricePerSwitch * 70}
        />

        {/* Build Advisor CTA */}
        <BuildAdvisorCTA
          brand={sw.brand}
          name={sw.name}
          productType="switch"
        />

        {/* Enhanced vendor section */}
        <VendorPartnerSection
          productName={`${sw.brand} ${sw.name}`}
          referrerPage={`/switches/${id}`}
        />
      </main>
    </div>
  );
}
