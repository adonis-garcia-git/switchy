"use client";

import { useParams } from "next/navigation";
import Link from "next/link";
import { useQuery } from "convex/react";
import { api } from "../../../../convex/_generated/api";
import { Id } from "../../../../convex/_generated/dataModel";
import { Badge } from "@/components/ui/Badge";
import { Skeleton } from "@/components/ui/Skeleton";
import { cn, formatPriceWhole, generatePurchaseUrl } from "@/lib/utils";
import { CompleteYourBuild } from "@/components/CompleteYourBuild";
import { VendorPartnerSection } from "@/components/VendorPartnerSection";
import { Breadcrumb } from "@/components/detail/Breadcrumb";
import { BuildAdvisorCTA } from "@/components/detail/BuildAdvisorCTA";
import { SimilarProducts, SimilarProductItem } from "@/components/detail/SimilarProducts";
import { StockBadge } from "@/components/detail/StockBadge";
import { QuickSpecBar } from "@/components/detail/QuickSpecBar";
import { KeycapCard } from "@/components/KeycapCard";

export default function KeycapDetailPage() {
  const params = useParams();
  const keycap = useQuery(api.keycaps.getById, {
    id: params.id as Id<"keycaps">,
  });

  const similarKeycaps = useQuery(api.keycaps.list, keycap ? { profile: keycap.profile } : "skip");

  const filteredSimilar = similarKeycaps
    ?.filter((k) => k._id !== keycap?._id)
    .slice(0, 6);

  if (keycap === undefined) {
    return (
      <div className="p-6 lg:p-8">
        <div className="max-w-4xl mx-auto">
          <Skeleton variant="card" className="h-96" />
        </div>
      </div>
    );
  }

  if (!keycap) {
    return (
      <div className="p-6 lg:p-8">
        <div className="max-w-4xl mx-auto text-center py-20">
          <p className="text-text-muted">Keycap set not found.</p>
          <Link href="/keycaps" className="text-accent hover:text-accent-hover text-sm mt-2 inline-block transition-colors duration-150">
            &larr; Back to keycaps
          </Link>
        </div>
      </div>
    );
  }

  const quickSpecs = [
    {
      icon: (
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 9h16.5m-16.5 6.75h16.5M6 12h.008M9.75 12h.008M13.5 12h.008M17.25 12h.008" />
        </svg>
      ),
      label: "Profile",
      value: keycap.profile,
    },
    {
      icon: (
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M21 7.5l-2.25-1.313M21 7.5v2.25m0-2.25l-2.25 1.313M3 7.5l2.25-1.313M3 7.5l2.25 1.313M3 7.5v2.25m9 3l2.25-1.313M12 12.75l-2.25-1.313M12 12.75V15m0 6.75l2.25-1.313M12 21.75V19.5m0 2.25l-2.25-1.313m0-16.875L12 2.25l2.25 1.313M21 14.25v2.25l-2.25 1.313m-13.5 0L3 16.5v-2.25" />
        </svg>
      ),
      label: "Material",
      value: keycap.material,
    },
    ...(keycap.legendType
      ? [
          {
            icon: (
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M7.5 8.25h9m-9 3H12m-9.75 1.51c0 1.6 1.123 2.994 2.707 3.227 1.087.16 2.185.283 3.293.369V21l4.076-4.076a1.526 1.526 0 011.037-.443 48.282 48.282 0 005.68-.494c1.584-.233 2.707-1.626 2.707-3.228V6.741c0-1.602-1.123-2.995-2.707-3.228A48.394 48.394 0 0012 3c-2.392 0-4.744.175-7.043.513C3.373 3.746 2.25 5.14 2.25 6.741v6.018z" />
              </svg>
            ),
            label: "Legend",
            value: keycap.legendType,
          },
        ]
      : []),
    ...(keycap.numKeys
      ? [
          {
            icon: (
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6A2.25 2.25 0 016 3.75h2.25A2.25 2.25 0 0110.5 6v2.25a2.25 2.25 0 01-2.25 2.25H6a2.25 2.25 0 01-2.25-2.25V6zM3.75 15.75A2.25 2.25 0 016 13.5h2.25a2.25 2.25 0 012.25 2.25V18a2.25 2.25 0 01-2.25 2.25H6A2.25 2.25 0 013.75 18v-2.25zM13.5 6a2.25 2.25 0 012.25-2.25H18A2.25 2.25 0 0120.25 6v2.25A2.25 2.25 0 0118 10.5h-2.25a2.25 2.25 0 01-2.25-2.25V6zM13.5 15.75a2.25 2.25 0 012.25-2.25H18a2.25 2.25 0 012.25 2.25V18A2.25 2.25 0 0118 20.25h-2.25A2.25 2.25 0 0113.5 18v-2.25z" />
              </svg>
            ),
            label: "Keys",
            value: `${keycap.numKeys}`,
          },
        ]
      : []),
  ];

  return (
    <div className="p-6 lg:p-8">
      <div className="max-w-4xl mx-auto">
        {/* Breadcrumb */}
        <Breadcrumb
          items={[
            { label: "Home", href: "/" },
            { label: "Keycaps", href: "/keycaps" },
            { label: keycap.name },
          ]}
        />

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Image */}
          <div className="aspect-[4/3] rounded-xl overflow-hidden bg-bg-elevated relative">
            <img
              src={keycap.imageUrl}
              alt={keycap.name}
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent" />
          </div>

          {/* Details */}
          <div>
            <p className="text-xs uppercase tracking-wider text-text-muted mb-1">{keycap.brand}</p>
            <h1 className="text-2xl sm:text-3xl font-bold text-text-primary font-[family-name:var(--font-outfit)] tracking-tight mb-4">
              {keycap.name}
            </h1>

            <div className="flex items-center gap-2 mb-6">
              <Badge variant="info" size="md">{keycap.profile}</Badge>
              <Badge variant="default" size="md">{keycap.material}</Badge>
              {keycap.legendType && <Badge variant="default" size="md">{keycap.legendType}</Badge>}
            </div>

            {/* QuickSpecBar */}
            <QuickSpecBar specs={quickSpecs} />

            {/* Price + Stock */}
            <div className="flex items-center gap-3 mb-6">
              <div className="text-3xl font-bold font-[family-name:var(--font-mono)] text-accent">
                {formatPriceWhole(keycap.priceUsd)}
              </div>
              <StockBadge inStock={keycap.inStock} />
            </div>

            {/* Specs grid */}
            <div className="grid grid-cols-2 gap-3 mb-6">
              {keycap.numKeys && (
                <div className="rounded-lg bg-bg-elevated border border-border-subtle p-3">
                  <p className="text-[10px] uppercase tracking-wider text-text-muted mb-0.5">Keys</p>
                  <p className="text-sm font-semibold text-text-primary">{keycap.numKeys}</p>
                </div>
              )}
              {keycap.compatibility && (
                <div className="rounded-lg bg-bg-elevated border border-border-subtle p-3">
                  <p className="text-[10px] uppercase tracking-wider text-text-muted mb-0.5">Compatibility</p>
                  {keycap.compatibility === "MX" ? (
                    <p className="text-sm font-semibold text-emerald-400 flex items-center gap-1.5">
                      <svg className="w-4 h-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                      </svg>
                      Works with all MX-style switches
                    </p>
                  ) : (
                    <p className="text-sm font-semibold text-text-primary">{keycap.compatibility}</p>
                  )}
                </div>
              )}
              {keycap.manufacturer && (
                <div className="rounded-lg bg-bg-elevated border border-border-subtle p-3">
                  <p className="text-[10px] uppercase tracking-wider text-text-muted mb-0.5">Manufacturer</p>
                  <p className="text-sm font-semibold text-text-primary">{keycap.manufacturer}</p>
                </div>
              )}
              <div className="rounded-lg bg-bg-elevated border border-border-subtle p-3">
                <p className="text-[10px] uppercase tracking-wider text-text-muted mb-0.5">Profile</p>
                <p className="text-sm font-semibold text-text-primary">{keycap.profile}</p>
              </div>
              <div className="rounded-lg bg-bg-elevated border border-border-subtle p-3">
                <p className="text-[10px] uppercase tracking-wider text-text-muted mb-0.5">Material</p>
                <p className="text-sm font-semibold text-text-primary">{keycap.material}</p>
              </div>
              {keycap.legendType && (
                <div className="rounded-lg bg-bg-elevated border border-border-subtle p-3">
                  <p className="text-[10px] uppercase tracking-wider text-text-muted mb-0.5">Legend Type</p>
                  <p className="text-sm font-semibold text-text-primary">{keycap.legendType}</p>
                </div>
              )}
            </div>

            {keycap.notes && (
              <p className="text-sm text-text-secondary leading-relaxed mb-6">
                {keycap.notes}
              </p>
            )}

            {keycap.tags && keycap.tags.length > 0 && (
              <div className="flex flex-wrap gap-1.5 mb-6">
                {keycap.tags.map((tag: string) => (
                  <span key={tag} className="text-xs px-2 py-0.5 rounded bg-bg-elevated text-text-muted border border-border-subtle">
                    {tag}
                  </span>
                ))}
              </div>
            )}

            {/* Buy button */}
            <button
              onClick={() =>
                window.open(keycap.productUrl || generatePurchaseUrl(keycap.brand, keycap.name, "keyboard"), "_blank", "noopener,noreferrer")
              }
              className={cn(
                "inline-flex items-center gap-2 text-sm font-bold px-6 py-3 rounded-xl w-full justify-center",
                "bg-accent text-bg-primary shadow-accent-sm",
                "hover:bg-accent-hover",
                "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/40",
                "active:scale-[0.97]",
                "transition-[background-color,transform] duration-150",
                "font-[family-name:var(--font-outfit)]"
              )}
            >
              Buy Now
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M7 17L17 7M17 7H7M17 7v10" />
              </svg>
            </button>
          </div>
        </div>

        {/* Similar Keycaps */}
        <SimilarProducts
          title="Similar Keycap Sets"
          viewAllHref="/keycaps"
          isEmpty={!filteredSimilar || filteredSimilar.length === 0}
        >
          {filteredSimilar?.map((k) => (
            <SimilarProductItem key={k._id}>
              <KeycapCard keycap={k} />
            </SimilarProductItem>
          ))}
        </SimilarProducts>

        {/* Complete Your Build cross-sell */}
        <CompleteYourBuild
          currentType="keycaps"
          currentName={keycap.name}
          currentPrice={keycap.priceUsd}
        />

        {/* Build Advisor CTA */}
        <BuildAdvisorCTA
          brand={keycap.brand}
          name={keycap.name}
          productType="keycap set"
        />

        {/* Enhanced vendor section */}
        <VendorPartnerSection
          productName={`${keycap.brand} ${keycap.name}`}
          referrerPage={`/keycaps/${params.id}`}
        />
      </div>
    </div>
  );
}
