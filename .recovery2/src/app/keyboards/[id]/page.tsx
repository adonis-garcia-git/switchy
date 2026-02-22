"use client";

import { useParams, useRouter } from "next/navigation";
import { useQuery } from "convex/react";
import { api } from "../../../../convex/_generated/api";
import { Id } from "../../../../convex/_generated/dataModel";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Skeleton } from "@/components/ui/Skeleton";
import { PurchaseButton } from "@/components/PurchaseButton";
import { formatPriceWhole } from "@/lib/utils";
import { CompleteYourBuild } from "@/components/CompleteYourBuild";
import { VendorPartnerSection } from "@/components/VendorPartnerSection";

export default function KeyboardDetailPage() {
  const params = useParams();
  const router = useRouter();
  const keyboard = useQuery(api.keyboards.getById, {
    id: params.id as Id<"keyboards">,
  });

  if (keyboard === undefined) {
    return (
      <div className="p-6 lg:p-8 max-w-4xl mx-auto space-y-4">
        <Skeleton variant="text" className="w-32 h-4" />
        <Skeleton variant="text" className="w-64 h-8" />
        <Skeleton variant="card" className="h-80" />
      </div>
    );
  }

  if (!keyboard) {
    return (
      <div className="p-6 lg:p-8 max-w-4xl mx-auto text-center py-20">
        <p className="text-text-muted mb-4">Keyboard not found.</p>
        <Button variant="ghost" onClick={() => router.push("/keyboards")}>
          Back to Keyboards
        </Button>
      </div>
    );
  }

  const specs = [
    { label: "Size", value: keyboard.size },
    { label: "Mounting Style", value: keyboard.mountingStyle },
    { label: "Plate Material", value: keyboard.plateMaterial },
    { label: "Case Material", value: keyboard.caseMaterial },
  ];

  return (
    <div className="p-6 lg:p-8 max-w-4xl mx-auto">
      <button
        onClick={() => router.push("/keyboards")}
        className="text-sm text-text-muted hover:text-accent mb-8 inline-flex items-center gap-1.5 transition-colors duration-150 focus-visible:outline-none focus-visible:text-accent"
      >
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
        </svg>
        Back to Keyboards
      </button>

      <div className="rounded-xl border border-border-default bg-bg-surface shadow-surface overflow-hidden">
        {/* Header */}
        <div className="p-6 lg:p-8 border-b border-border-subtle">
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="text-xs uppercase tracking-wider text-text-muted mb-1">
                {keyboard.brand}
              </p>
              <h1 className="text-2xl lg:text-3xl font-bold text-text-primary font-[family-name:var(--font-outfit)] tracking-tight">
                {keyboard.name}
              </h1>
            </div>
            <div className="text-right shrink-0">
              <p className="text-3xl font-bold font-[family-name:var(--font-mono)] text-accent">
                {formatPriceWhole(keyboard.priceUsd)}
              </p>
              <div className="mt-2">
                <PurchaseButton
                  brand={keyboard.brand}
                  name={keyboard.name}
                  productUrl={keyboard.productUrl}
                  type="keyboard"
                  size="sm"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Product image */}
        {keyboard.imageUrl && (
          <div className="p-6 lg:p-8 pt-0">
            <div className="aspect-[16/10] rounded-xl overflow-hidden bg-bg-elevated relative max-w-lg">
              <img src={keyboard.imageUrl} alt={`${keyboard.brand} ${keyboard.name}`} className="w-full h-full object-cover" />
              <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent" />
            </div>
          </div>
        )}

        {/* Specs Grid */}
        <div className="p-6 lg:p-8">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-px bg-border-subtle rounded-lg overflow-hidden mb-6">
            {specs.map((spec) => (
              <div key={spec.label} className="bg-bg-surface p-4 flex items-center justify-between">
                <span className="text-sm text-text-muted">{spec.label}</span>
                <span className="text-sm text-text-primary font-medium">{spec.value}</span>
              </div>
            ))}
          </div>

          {/* Features */}
          <div className="mb-6">
            <p className="text-xs uppercase tracking-wider text-text-muted mb-3">Features</p>
            <div className="flex flex-wrap gap-2">
              <Badge variant={keyboard.hotSwap ? "success" : "default"} size="md">
                {keyboard.hotSwap ? "Hot-swap" : "Soldered"}
              </Badge>
              <Badge variant={keyboard.wireless ? "info" : "default"} size="md">
                {keyboard.wireless ? "Wireless" : "Wired Only"}
              </Badge>
              <Badge variant={keyboard.rgb ? "info" : "default"} size="md">
                {keyboard.rgb ? "RGB" : "No RGB"}
              </Badge>
            </div>
          </div>

          {/* Notes */}
          {keyboard.notes && (
            <div className="mb-6 p-4 rounded-lg bg-bg-elevated border border-border-subtle">
              <p className="text-xs uppercase tracking-wider text-text-muted mb-2">Notes</p>
              <p className="text-sm text-text-secondary leading-relaxed">{keyboard.notes}</p>
            </div>
          )}

          <PurchaseButton
            brand={keyboard.brand}
            name={keyboard.name}
            productUrl={keyboard.productUrl}
            type="keyboard"
            size="md"
            className="w-full justify-center mb-3"
          />

          <Button
            variant="secondary"
            onClick={() => router.push(`/builder?q=${encodeURIComponent(`Build a custom keyboard using the ${keyboard.brand} ${keyboard.name} as the base kit`)}`)}
          >
            Use in Build Advisor
          </Button>
        </div>
      </div>

      {/* Complete Your Build cross-sell */}
      <CompleteYourBuild
        currentType="keyboard"
        currentName={keyboard.name}
        currentPrice={keyboard.priceUsd}
      />

      {/* Enhanced vendor section */}
      <VendorPartnerSection
        productName={`${keyboard.brand} ${keyboard.name}`}
        referrerPage={`/keyboards/${params.id}`}
      />
    </div>
  );
}
