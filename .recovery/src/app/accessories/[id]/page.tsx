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

const SUBCATEGORY_LABEL = Object.fromEntries(
  ACCESSORY_SUBCATEGORIES.map((s) => [s.value, s.label])
);

export default function AccessoryDetailPage() {
  const params = useParams();
  const accessory = useQuery(api.accessories.getById, {
    id: params.id as Id<"accessories">,
  });

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

  return (
    <div className="p-6 lg:p-8">
      <div className="max-w-4xl mx-auto">
        <Link
          href="/accessories"
          className="inline-flex items-center gap-1 text-sm text-text-muted hover:text-accent transition-colors duration-150 mb-6 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/40 rounded"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
          </svg>
          Back to accessories
        </Link>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Image */}
          <div className="aspect-[4/3] rounded-xl overflow-hidden bg-bg-elevated relative">
            <img
              src={accessory.imageUrl || `https://placehold.co/800x600/181818/525252?text=${encodeURIComponent(accessory.name)}`}
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

            <div className="flex items-center gap-2 mb-6">
              <Badge variant="info" size="md">
                {SUBCATEGORY_LABEL[accessory.subcategory] || accessory.subcategory}
              </Badge>
            </div>

            <div className="text-3xl font-bold font-[family-name:var(--font-mono)] text-accent mb-6">
              {formatPriceWhole(accessory.priceUsd)}
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
      </div>
    </div>
  );
}
