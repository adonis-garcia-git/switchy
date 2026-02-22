"use client";

import { useState, Suspense } from "react";
import { useQuery } from "convex/react";
import { useUser, SignInButton } from "@clerk/nextjs";
import { api } from "../../../convex/_generated/api";
import { Tabs } from "@/components/ui/Tabs";
import { GroupBuyDiscover } from "@/components/GroupBuyDiscover";
import { GroupBuyTracker, TrackerPrefillData } from "@/components/GroupBuyTracker";
import { Button } from "@/components/ui/Button";

type ProductType = "keyboard" | "switches" | "keycaps" | "accessories";

const TABS = [
  { label: "Discover", value: "discover" },
  { label: "My Tracker", value: "tracker" },
];

function GroupBuysContent() {
  const { isSignedIn } = useUser();
  const [activeTab, setActiveTab] = useState("discover");
  const [prefillData, setPrefillData] = useState<TrackerPrefillData | null>(null);

  const trackedListingIds = useQuery(
    api.groupBuys.getTrackedListingIds,
    isSignedIn ? {} : "skip"
  ) ?? [];

  const handleTrackThis = (listing: any) => {
    if (!isSignedIn) {
      // Clerk will handle the auth modal via SignInButton wrapper
      return;
    }

    // Map listing status to a reasonable tracker productType
    const productType = listing.productType as ProductType;

    setPrefillData({
      listingId: listing._id,
      productName: listing.name,
      vendor: listing.vendor,
      cost: listing.priceMin,
      productType,
      estimatedShipDate: listing.estimatedShipDate || listing.endDate || undefined,
      imageUrl: listing.imageUrl || undefined,
    });

    setActiveTab("tracker");
  };

  const handleClearPrefill = () => {
    setPrefillData(null);
  };

  return (
    <div className="min-h-screen">
      <main className="max-w-[1400px] mx-auto">
        {/* Header */}
        <div className="px-4 lg:px-8 pt-6 pb-4">
          <div className="flex items-center justify-between mb-4">
            <h1 className="text-2xl font-bold font-[family-name:var(--font-outfit)] tracking-tight text-text-primary">
              Group Buys
            </h1>
          </div>
          <Tabs
            tabs={TABS}
            activeTab={activeTab}
            onChange={setActiveTab}
          />
        </div>

        {/* Tab content */}
        {activeTab === "discover" && (
          <GroupBuyDiscover
            onTrackThis={handleTrackThis}
            trackedListingIds={trackedListingIds}
          />
        )}

        {activeTab === "tracker" && (
          <div className="max-w-5xl mx-auto px-4 pb-8">
            {isSignedIn ? (
              <GroupBuyTracker
                prefillData={prefillData}
                onClearPrefill={handleClearPrefill}
              />
            ) : (
              <div className="text-center py-16">
                <div className="max-w-sm mx-auto">
                  <svg className="w-12 h-12 text-text-muted/40 mx-auto mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 10.5V6.75a4.5 4.5 0 10-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 002.25-2.25v-6.75a2.25 2.25 0 00-2.25-2.25H6.75a2.25 2.25 0 00-2.25 2.25v6.75a2.25 2.25 0 002.25 2.25z" />
                  </svg>
                  <h2 className="text-lg font-semibold text-text-primary mb-2 font-[family-name:var(--font-outfit)]">
                    Sign in to track group buys
                  </h2>
                  <p className="text-sm text-text-secondary mb-6 leading-relaxed">
                    Track your pending group buy orders, see spending stats, and get delivery estimates.
                  </p>
                  <SignInButton mode="modal">
                    <Button>Sign In</Button>
                  </SignInButton>
                </div>
              </div>
            )}
          </div>
        )}
      </main>
    </div>
  );
}

function GroupBuysLoading() {
  return (
    <div className="min-h-screen">
      <div className="max-w-[1400px] mx-auto px-4 lg:px-8 pt-6">
        <div className="h-8 w-48 bg-bg-elevated rounded animate-pulse mb-4" />
        <div className="h-10 w-64 bg-bg-elevated rounded animate-pulse mb-6" />
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="rounded-xl border border-border-subtle bg-bg-surface overflow-hidden animate-pulse">
              <div className="aspect-[4/3] bg-bg-elevated" />
              <div className="p-5">
                <div className="h-3 w-20 bg-bg-elevated rounded mb-2" />
                <div className="h-4 w-40 bg-bg-elevated rounded mb-3" />
                <div className="h-px bg-border-subtle mb-3" />
                <div className="h-5 w-16 bg-bg-elevated rounded" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default function GroupBuysPage() {
  return (
    <Suspense fallback={<GroupBuysLoading />}>
      <GroupBuysContent />
    </Suspense>
  );
}
