"use client";

import { use } from "react";
import Link from "next/link";
import { useQuery } from "convex/react";
import { api } from "../../../../convex/_generated/api";
import { Id } from "../../../../convex/_generated/dataModel";
import { SoundProfile } from "@/components/SoundProfile";
import { VendorLinksSection } from "@/components/VendorLinks";
import { SWITCH_TYPE_COLORS } from "@/lib/constants";
import { cn, formatPrice } from "@/lib/utils";

export default function SwitchDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const sw = useQuery(api.switches.getById, {
    id: id as Id<"switches">,
  });

  if (sw === undefined) {
    return (
      <div className="min-h-screen">
        <div className="flex items-center justify-center py-24">
          <div className="w-8 h-8 border-2 border-accent/30 border-t-accent rounded-full animate-spin" />
        </div>
      </div>
    );
  }

  if (!sw) {
    return (
      <div className="min-h-screen">
        <div className="max-w-3xl mx-auto px-4 py-16 text-center">
          <p className="text-text-muted">Switch not found</p>
          <Link href="/switches" className="text-accent text-sm mt-2 inline-block">
            Back to Switch Explorer
          </Link>
        </div>
      </div>
    );
  }

  const typeColors = SWITCH_TYPE_COLORS[sw.type as keyof typeof SWITCH_TYPE_COLORS];

  return (
    <div className="min-h-screen">
      <main className="max-w-3xl mx-auto px-4 py-8">
        <Link
          href="/switches"
          className="text-sm text-text-muted hover:text-accent transition-colors mb-6 inline-block"
        >
          ← Back to Switches
        </Link>

        <div className="rounded-xl border border-border-default bg-bg-surface p-6">
          {/* Header */}
          <div className="flex items-start justify-between mb-6">
            <div>
              <p className="text-sm text-text-muted">{sw.brand}</p>
              <h1 className="text-2xl font-bold text-text-primary">{sw.name}</h1>
            </div>
            <span
              className={cn(
                "px-3 py-1 rounded text-sm font-semibold uppercase border",
                typeColors.bg,
                typeColors.text,
                typeColors.border
              )}
            >
              {sw.type}
            </span>
          </div>

          {/* Price and Rating */}
          <div className="flex items-center gap-6 mb-6 pb-6 border-b border-border-subtle">
            <div>
              <p className="text-xs text-text-muted uppercase">Price per switch</p>
              <p className="text-xl font-bold font-mono text-accent">
                {formatPrice(sw.pricePerSwitch)}
              </p>
            </div>
            <div>
              <p className="text-xs text-text-muted uppercase">Community Rating</p>
              <p className="text-xl font-bold font-mono text-accent">
                {sw.communityRating.toFixed(1)}/5.0
              </p>
            </div>
          </div>

          {/* Sound Profile */}
          <div className="mb-6 pb-6 border-b border-border-subtle">
            <h2 className="text-sm font-semibold text-text-muted uppercase tracking-wider mb-3">
              Sound Profile
            </h2>
            <SoundProfile
              pitch={sw.soundPitch as "low" | "mid" | "high"}
              volume={sw.soundVolume as "quiet" | "medium" | "loud"}
              character={sw.soundCharacter}
            />
          </div>

          {/* Specs */}
          <div className="mb-6 pb-6 border-b border-border-subtle">
            <h2 className="text-sm font-semibold text-text-muted uppercase tracking-wider mb-3">
              Specifications
            </h2>
            <div className="grid grid-cols-2 gap-3">
              {[
                ["Actuation Force", `${sw.actuationForceG}g`],
                ["Bottom Out Force", `${sw.bottomOutForceG}g`],
                ["Actuation Point", `${sw.actuationMm}mm`],
                ["Total Travel", `${sw.totalTravelMm}mm`],
                ["Stem Material", sw.stemMaterial],
                ["Housing Material", sw.housingMaterial],
                ["Spring Type", sw.springType],
                ["Factory Lubed", sw.factoryLubed ? "Yes" : "No"],
                ["Long Pole", sw.longPole ? "Yes" : "No"],
              ].map(([label, value]) => (
                <div
                  key={label}
                  className="flex justify-between py-2 px-3 rounded bg-bg-primary/50"
                >
                  <span className="text-sm text-text-muted">{label}</span>
                  <span className="text-sm font-mono text-text-primary">
                    {value}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Popular For */}
          {sw.popularFor.length > 0 && (
            <div className="mb-6 pb-6 border-b border-border-subtle">
              <h2 className="text-sm font-semibold text-text-muted uppercase tracking-wider mb-3">
                Popular For
              </h2>
              <div className="flex flex-wrap gap-2">
                {sw.popularFor.map((tag: string) => (
                  <span
                    key={tag}
                    className="px-3 py-1 rounded-full text-sm bg-accent-dim/50 text-accent border border-accent/20"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Notes */}
          {sw.notes && (
            <div className="mb-6 pb-6 border-b border-border-subtle">
              <h2 className="text-sm font-semibold text-text-muted uppercase tracking-wider mb-3">
                Community Notes
              </h2>
              <p className="text-sm text-text-secondary">{sw.notes}</p>
            </div>
          )}

          {/* Where to Buy */}
          <div className="mb-6 pb-6 border-b border-border-subtle">
            <h2 className="text-sm font-semibold text-text-muted uppercase tracking-wider mb-3">
              Where to Buy
            </h2>
            <VendorLinksSection productName={sw.name} />
          </div>

          {/* Commonly Compared To */}
          {sw.commonlyComparedTo.length > 0 && (
            <div>
              <h2 className="text-sm font-semibold text-text-muted uppercase tracking-wider mb-3">
                Commonly Compared To
              </h2>
              <div className="flex flex-wrap gap-2">
                {sw.commonlyComparedTo.map((name: string) => (
                  <span
                    key={name}
                    className="px-3 py-1 rounded-full text-sm bg-bg-elevated text-text-secondary border border-border-subtle"
                  >
                    {name}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
