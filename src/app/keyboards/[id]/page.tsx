"use client";

import { useParams } from "next/navigation";
import Link from "next/link";
import { useQuery } from "convex/react";
import { api } from "../../../../convex/_generated/api";
import { Id } from "../../../../convex/_generated/dataModel";
import { Badge } from "@/components/ui/Badge";
import { Skeleton } from "@/components/ui/Skeleton";
import { PurchaseButton } from "@/components/PurchaseButton";
import { formatPriceWhole } from "@/lib/utils";
import { CompleteYourBuild } from "@/components/CompleteYourBuild";
import { VendorPartnerSection } from "@/components/VendorPartnerSection";
import { Breadcrumb } from "@/components/detail/Breadcrumb";
import { BuildAdvisorCTA } from "@/components/detail/BuildAdvisorCTA";
import { SimilarProducts, SimilarProductItem } from "@/components/detail/SimilarProducts";
import { StockBadge } from "@/components/detail/StockBadge";
import { QuickSpecBar } from "@/components/detail/QuickSpecBar";
import { KeyboardCard } from "@/components/KeyboardCard";

export default function KeyboardDetailPage() {
  const params = useParams();
  const keyboard = useQuery(api.keyboards.getById, {
    id: params.id as Id<"keyboards">,
  });

  // Fetch similar keyboards (same size) for the SimilarProducts section
  const similarRaw = useQuery(
    api.keyboards.list,
    keyboard ? { size: keyboard.size } : "skip"
  );

  const similarKeyboards = similarRaw
    ? similarRaw
        .filter((k: { _id: string }) => k._id !== keyboard?._id)
        .slice(0, 6)
    : [];

  if (keyboard === undefined) {
    return (
      <div className="min-h-screen">
        <div className="max-w-5xl mx-auto px-4 lg:px-8 py-8">
          <Skeleton variant="text" className="w-48 h-4 mb-6" />
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
            <Skeleton variant="card" className="aspect-[16/10]" />
            <div className="space-y-3">
              <Skeleton variant="text" className="w-24 h-3" />
              <Skeleton variant="text" className="w-64 h-8" />
              <Skeleton variant="text" className="w-32 h-7" />
              <Skeleton variant="text" className="w-40 h-10" />
            </div>
          </div>
          <div className="flex gap-2 mb-8">
            {Array.from({ length: 3 }).map((_, i) => (
              <Skeleton key={i} variant="text" className="w-28 h-10 rounded-xl" />
            ))}
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-px">
            {Array.from({ length: 8 }).map((_, i) => (
              <Skeleton key={i} variant="text" className="h-12" />
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (!keyboard) {
    return (
      <div className="min-h-screen">
        <div className="max-w-3xl mx-auto px-4 py-20 text-center">
          <p className="text-text-muted mb-2">Keyboard not found.</p>
          <Link
            href="/keyboards"
            className="text-accent text-sm hover:text-accent-hover transition-colors duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/40 rounded"
          >
            Back to Keyboards
          </Link>
        </div>
      </div>
    );
  }

  // Build full specs grid (surface ALL available data fields)
  const specs = [
    { label: "Size", value: keyboard.size },
    keyboard.mountingStyle && { label: "Mounting Style", value: keyboard.mountingStyle },
    keyboard.plateMaterial && { label: "Plate Material", value: keyboard.plateMaterial },
    { label: "Case Material", value: keyboard.caseMaterial },
    keyboard.connectivityType && { label: "Connectivity", value: keyboard.connectivityType },
    keyboard.batteryCapacity && { label: "Battery Capacity", value: keyboard.batteryCapacity },
    keyboard.weight && { label: "Weight", value: keyboard.weight },
    keyboard.pollingRate && { label: "Polling Rate", value: keyboard.pollingRate },
  ].filter(Boolean) as { label: string; value: string }[];

  // QuickSpecBar items (at-a-glance pills)
  const quickSpecs = [
    {
      icon: (
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6A2.25 2.25 0 016 3.75h2.25A2.25 2.25 0 0110.5 6v2.25a2.25 2.25 0 01-2.25 2.25H6a2.25 2.25 0 01-2.25-2.25V6zM3.75 15.75A2.25 2.25 0 016 13.5h2.25a2.25 2.25 0 012.25 2.25V18a2.25 2.25 0 01-2.25 2.25H6A2.25 2.25 0 013.75 18v-2.25zM13.5 6a2.25 2.25 0 012.25-2.25H18A2.25 2.25 0 0120.25 6v2.25A2.25 2.25 0 0118 10.5h-2.25a2.25 2.25 0 01-2.25-2.25V6zM13.5 15.75a2.25 2.25 0 012.25-2.25H18a2.25 2.25 0 012.25 2.25V18A2.25 2.25 0 0118 20.25h-2.25A2.25 2.25 0 0113.5 18v-2.25z" />
        </svg>
      ),
      label: "Size",
      value: keyboard.size,
    },
    ...(keyboard.mountingStyle
      ? [
          {
            icon: (
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9.594 3.94c.09-.542.56-.94 1.11-.94h2.593c.55 0 1.02.398 1.11.94l.213 1.281c.063.374.313.686.645.87.074.04.147.083.22.127.324.196.72.257 1.075.124l1.217-.456a1.125 1.125 0 011.37.49l1.296 2.247a1.125 1.125 0 01-.26 1.431l-1.003.827c-.293.24-.438.613-.431.992a6.759 6.759 0 010 .255c-.007.378.138.75.43.99l1.005.828c.424.35.534.954.26 1.43l-1.298 2.247a1.125 1.125 0 01-1.369.491l-1.217-.456c-.355-.133-.75-.072-1.076.124a6.57 6.57 0 01-.22.128c-.331.183-.581.495-.644.869l-.213 1.28c-.09.543-.56.941-1.11.941h-2.594c-.55 0-1.02-.398-1.11-.94l-.213-1.281c-.062-.374-.312-.686-.644-.87a6.52 6.52 0 01-.22-.127c-.325-.196-.72-.257-1.076-.124l-1.217.456a1.125 1.125 0 01-1.369-.49l-1.297-2.247a1.125 1.125 0 01.26-1.431l1.004-.827c.292-.24.437-.613.43-.992a6.932 6.932 0 010-.255c.007-.378-.138-.75-.43-.99l-1.004-.828a1.125 1.125 0 01-.26-1.43l1.297-2.247a1.125 1.125 0 011.37-.491l1.216.456c.356.133.751.072 1.076-.124.072-.044.146-.087.22-.128.332-.183.582-.495.644-.869l.214-1.281z" />
                <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
            ),
            label: "Mount",
            value: keyboard.mountingStyle,
          },
        ]
      : []),
    ...(keyboard.hotSwap
      ? [
          {
            icon: (
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 13.5l10.5-11.25L12 10.5h8.25L9.75 21.75 12 13.5H3.75z" />
              </svg>
            ),
            label: "Switches",
            value: "Hot-swap",
          },
        ]
      : []),
    ...(keyboard.wireless
      ? [
          {
            icon: (
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M8.288 15.038a5.25 5.25 0 017.424 0M5.106 11.856c3.807-3.808 9.98-3.808 13.788 0M1.924 8.674c5.565-5.565 14.587-5.565 20.152 0M12.53 18.22l-.53.53-.53-.53a.75.75 0 011.06 0z" />
              </svg>
            ),
            label: "Connectivity",
            value: "Wireless",
          },
        ]
      : []),
  ];

  return (
    <div className="min-h-screen">
      <main className="max-w-5xl mx-auto px-4 lg:px-8 py-8">
        {/* Breadcrumb */}
        <Breadcrumb
          items={[
            { label: "Home", href: "/" },
            { label: "Keyboards", href: "/keyboards" },
            { label: keyboard.name },
          ]}
        />

        {/* Two-column hero */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          {/* Image left */}
          {keyboard.imageUrl && (
            <div className="aspect-[16/10] rounded-2xl overflow-hidden bg-bg-elevated relative">
              <img
                src={keyboard.imageUrl}
                alt={`${keyboard.brand} ${keyboard.name}`}
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent" />
            </div>
          )}

          {/* Info right */}
          <div className="flex flex-col justify-center">
            <p className="text-xs uppercase tracking-wider text-text-muted font-medium mb-1">
              {keyboard.brand}
            </p>
            <h1 className="font-[family-name:var(--font-outfit)] text-3xl lg:text-4xl font-bold text-text-primary tracking-tight mb-3">
              {keyboard.name}
            </h1>
            <div className="flex items-center gap-3 mb-4">
              <p className="text-3xl font-bold font-[family-name:var(--font-mono)] text-accent">
                {formatPriceWhole(keyboard.priceUsd)}
              </p>
              <StockBadge inStock={keyboard.inStock} />
            </div>
            <div className="flex items-center gap-3">
              <PurchaseButton
                brand={keyboard.brand}
                name={keyboard.name}
                productUrl={keyboard.productUrl}
                type="keyboard"
                size="md"
              />
            </div>
          </div>
        </div>

        {/* QuickSpecBar */}
        <QuickSpecBar specs={quickSpecs} />

        {/* Full specs grid */}
        <div className="rounded-xl border border-border-default bg-bg-surface p-5 mb-6">
          <h2 className="font-[family-name:var(--font-outfit)] text-sm font-semibold text-text-secondary uppercase tracking-wider mb-4">
            Specifications
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-px bg-border-subtle rounded-lg overflow-hidden">
            {specs.map((spec, idx) => (
              <div
                key={spec.label}
                className="flex justify-between items-center py-3 px-4 bg-bg-primary/30"
              >
                <span className="text-xs text-text-muted uppercase tracking-wider">
                  {spec.label}
                </span>
                <span className="text-sm font-mono text-text-primary font-medium">
                  {spec.value}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Feature badges (6 total) */}
        <div className="rounded-xl border border-border-default bg-bg-surface p-5 mb-6">
          <h2 className="font-[family-name:var(--font-outfit)] text-sm font-semibold text-text-secondary uppercase tracking-wider mb-3">
            Features
          </h2>
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
            <Badge variant={keyboard.knob ? "success" : "default"} size="md">
              {keyboard.knob ? "Rotary Knob" : "No Knob"}
            </Badge>
            <Badge variant={keyboard.qmkVia ? "success" : "default"} size="md">
              {keyboard.qmkVia ? "QMK/VIA" : "No QMK/VIA"}
            </Badge>
            <Badge variant={keyboard.hallEffect ? "success" : "default"} size="md">
              {keyboard.hallEffect ? "Hall Effect" : "Mechanical"}
            </Badge>
          </div>
        </div>

        {/* Notes */}
        {keyboard.notes && (
          <div className="rounded-xl border border-border-default bg-bg-surface p-5 mb-6">
            <h2 className="font-[family-name:var(--font-outfit)] text-sm font-semibold text-text-secondary uppercase tracking-wider mb-3">
              Notes
            </h2>
            <p className="text-sm text-text-secondary leading-relaxed">
              {keyboard.notes}
            </p>
          </div>
        )}

        {/* Similar Products */}
        <SimilarProducts
          title={`More ${keyboard.size} Keyboards`}
          viewAllHref={`/keyboards?size=${encodeURIComponent(keyboard.size)}`}
          isEmpty={similarKeyboards.length === 0}
        >
          {similarKeyboards.map((k: any) => (
            <SimilarProductItem key={k._id}>
              <KeyboardCard keyboard={k} />
            </SimilarProductItem>
          ))}
        </SimilarProducts>

        {/* Complete Your Build cross-sell */}
        <CompleteYourBuild
          currentType="keyboard"
          currentName={keyboard.name}
          currentPrice={keyboard.priceUsd}
        />

        {/* Build Advisor CTA */}
        <BuildAdvisorCTA
          brand={keyboard.brand}
          name={keyboard.name}
          productType="keyboard"
        />

        {/* Enhanced vendor section */}
        <VendorPartnerSection
          productName={`${keyboard.brand} ${keyboard.name}`}
          referrerPage={`/keyboards/${params.id}`}
        />
      </main>
    </div>
  );
}
