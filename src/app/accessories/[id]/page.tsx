"use client";

import { useParams } from "next/navigation";
import Link from "next/link";
import { useQuery } from "convex/react";
import { api } from "../../../../convex/_generated/api";
import { Id } from "../../../../convex/_generated/dataModel";
import { Badge } from "@/components/ui/Badge";
import { Skeleton } from "@/components/ui/Skeleton";
import { cn, formatPriceWhole, generatePurchaseUrl } from "@/lib/utils";
import { ACCESSORY_SUBCATEGORIES } from "@/lib/constants";
import { CompleteYourBuild } from "@/components/CompleteYourBuild";
import { VendorPartnerSection } from "@/components/VendorPartnerSection";
import { Breadcrumb } from "@/components/detail/Breadcrumb";
import { BuildAdvisorCTA } from "@/components/detail/BuildAdvisorCTA";
import { SimilarProducts, SimilarProductItem } from "@/components/detail/SimilarProducts";
import { StockBadge } from "@/components/detail/StockBadge";
import { AccessoryCard } from "@/components/AccessoryCard";

const SUBCATEGORY_LABEL = Object.fromEntries(
  ACCESSORY_SUBCATEGORIES.map((s) => [s.value, s.label])
);

const SUBCATEGORY_CONTEXT: Record<string, string> = {
  stabilizer: "Essential for larger keys like spacebar, enter, and shift",
  spring: "Replacement springs to customize switch weight and feel",
  lube: "Used for switch and stabilizer lubing to reduce friction and improve sound",
  film: "Thin films placed between switch housing halves to reduce wobble",
  foam: "Dampening material for reducing case ping and hollowness",
  tool: "Specialized tools for keyboard building and maintenance",
  cable: "Custom USB cables for connecting your keyboard",
  deskmat: "Desk-sized mouse pads for aesthetics and comfort",
  "wrist-rest": "Ergonomic support for comfortable typing sessions",
  cover: "Protective covers and carrying cases for your keyboard",
  "keyboard-parts": "Replacement and upgrade parts for keyboard builds",
};

export default function AccessoryDetailPage() {
  const params = useParams();
  const accessory = useQuery(api.accessories.getById, {
    id: params.id as Id<"accessories">,
  });

  const similarAccessories = useQuery(
    api.accessories.list,
    accessory ? { subcategory: accessory.subcategory } : "skip"
  );

  if (accessory === undefined) {
    return (
      <div className="p-6 lg:p-8">
        <div className="max-w-4xl mx-auto">
          <Skeleton variant="card" className="h-96" />
        </div>
      </div>
    );
  }

  if (!accessory) {
    return (
      <div className="p-6 lg:p-8">
        <div className="max-w-4xl mx-auto text-center py-20">
          <p className="text-text-muted">Accessory not found.</p>
          <Link href="/accessories" className="text-accent hover:text-accent-hover text-sm mt-2 inline-block transition-colors duration-150">
            &larr; Back to accessories
          </Link>
        </div>
      </div>
    );
  }

  const specs = accessory.specs as Record<string, unknown> | undefined;
  const contextBlurb = SUBCATEGORY_CONTEXT[accessory.subcategory];

  const similar = (similarAccessories ?? [])
    .filter((a: { _id: string }) => a._id !== accessory._id)
    .slice(0, 6);

  return (
    <div className="p-6 lg:p-8">
      <div className="max-w-4xl mx-auto">
        <Breadcrumb
          items={[
            { label: "Home", href: "/" },
            { label: "Accessories", href: "/accessories" },
            { label: accessory.name },
          ]}
        />

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Image */}
          <div className="aspect-[4/3] rounded-xl overflow-hidden bg-bg-elevated relative">
            <img
              src={accessory.imageUrl}
              alt={accessory.name}
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent" />
          </div>

          {/* Details */}
          <div>
            <p className="text-xs uppercase tracking-wider text-text-muted mb-1">{accessory.brand}</p>
            <h1 className="text-2xl sm:text-3xl font-bold text-text-primary font-[family-name:var(--font-outfit)] tracking-tight mb-4">
              {accessory.name}
            </h1>

            <div className="flex items-center gap-2 mb-3">
              <Badge variant="info" size="md">
                {SUBCATEGORY_LABEL[accessory.subcategory] || accessory.subcategory}
              </Badge>
            </div>

            {contextBlurb && (
              <div className="flex items-start gap-2 mb-6">
                <svg
                  className="w-3.5 h-3.5 text-text-muted/60 mt-0.5 shrink-0"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={2}
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
                <p className="text-xs text-text-muted leading-relaxed">{contextBlurb}</p>
              </div>
            )}

            <div className="flex items-center gap-3 mb-6">
              <span className="text-3xl font-bold font-[family-name:var(--font-mono)] text-accent">
                {formatPriceWhole(accessory.priceUsd)}
              </span>
              <StockBadge inStock={accessory.inStock} />
            </div>

            {/* Specs grid (flexible) */}
            {specs && Object.keys(specs).length > 0 && (
              <div className="grid grid-cols-2 gap-3 mb-6">
                {Object.entries(specs).map(([key, value]) => (
                  <div key={key} className="rounded-lg bg-bg-elevated border border-border-subtle p-3">
                    <p className="text-[10px] uppercase tracking-wider text-text-muted mb-0.5">
                      {key.replace(/([A-Z])/g, " $1").replace(/^./, (s) => s.toUpperCase())}
                    </p>
                    <p className="text-sm font-semibold text-text-primary">{String(value)}</p>
                  </div>
                ))}
              </div>
            )}

            {accessory.notes && (
              <p className="text-sm text-text-secondary leading-relaxed mb-6">
                {accessory.notes}
              </p>
            )}

            {accessory.tags && accessory.tags.length > 0 && (
              <div className="flex flex-wrap gap-1.5 mb-6">
                {accessory.tags.map((tag: string) => (
                  <span key={tag} className="text-xs px-2 py-0.5 rounded bg-bg-elevated text-text-muted border border-border-subtle">
                    {tag}
                  </span>
                ))}
              </div>
            )}

            <button
              onClick={() =>
                window.open(accessory.productUrl || generatePurchaseUrl(accessory.brand, accessory.name, "keyboard"), "_blank", "noopener,noreferrer")
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

        {/* Similar Products */}
        <SimilarProducts
          title={`More ${SUBCATEGORY_LABEL[accessory.subcategory] || accessory.subcategory}`}
          viewAllHref={`/accessories?subcategory=${accessory.subcategory}`}
          isEmpty={similar.length === 0}
        >
          {similar.map((a: any) => (
            <SimilarProductItem key={a._id}>
              <AccessoryCard accessory={a} />
            </SimilarProductItem>
          ))}
        </SimilarProducts>

        {/* Complete Your Build cross-sell */}
        <CompleteYourBuild
          currentType="accessory"
          currentName={accessory.name}
          currentPrice={accessory.priceUsd}
        />

        {/* Build Advisor CTA */}
        <BuildAdvisorCTA
          brand={accessory.brand}
          name={accessory.name}
          productType="accessory"
        />

        {/* Enhanced vendor section */}
        <VendorPartnerSection
          productName={`${accessory.brand} ${accessory.name}`}
          referrerPage={`/accessories/${params.id}`}
        />
      </div>
    </div>
  );
}
