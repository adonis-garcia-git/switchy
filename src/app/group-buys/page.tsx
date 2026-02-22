"use client";

import { useState, useCallback, Suspense } from "react";
import { useQuery } from "convex/react";
import { useUser, SignInButton } from "@clerk/nextjs";
import { api } from "../../../convex/_generated/api";
import { Tabs } from "@/components/ui/Tabs";
import { GroupBuyDiscover } from "@/components/GroupBuyDiscover";
import { GroupBuyTracker, TrackerPrefillData } from "@/components/GroupBuyTracker";
import { GroupBuyRecommendedSidebar } from "@/components/GroupBuyRecommendedSidebar";
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
  const [trackedProductTypes, setTrackedProductTypes] = useState<string[]>([]);
  const [trackedProductNames, setTrackedProductNames] = useState<string[]>([]);

  const trackedListingIds = useQuery(
    api.groupBuys.getTrackedListingIds,
    isSignedIn ? {} : "skip"
  ) ?? [];

  const handleTrackThis = (listing: any) => {
    if (!isSignedIn) {
      return;
    }

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

  const handleTrackedDataChange = useCallback((types: string[], names: string[]) => {
    setTrackedProductTypes(types);
    setTrackedProductNames(names);
  }, []);

  return (
    <div className="flex flex-col h-[calc(100vh-4rem)]">
      {/* Header strip */}
      <div className="flex-shrink-0 border-b border-border-subtle bg-bg-surface/60 backdrop-blur-sm">
        <div className="px-4 lg:px-8 py-3 flex items-center justify-between">
          <div className="flex items-center gap-5">
            <h1 className="text-xl font-bold font-[family-name:var(--font-outfit)] tracking-tight text-text-primary">
              Group Buys
            </h1>
            <Tabs
              tabs={TABS}
              activeTab={activeTab}
              onChange={setActiveTab}
            />
          </div>
          <div className="hidden sm:flex items-center gap-2 text-[11px] text-text-muted">
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-bg-elevated border border-border-subtle">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
              Live Updates
            </span>
          </div>
        </div>
      </div>

      {/* Tab content — fills remaining height */}
      <div className="flex-1 min-h-0 overflow-hidden">
        {activeTab === "discover" && (
          <GroupBuyDiscover
            onTrackThis={handleTrackThis}
            trackedListingIds={trackedListingIds}
          />
        )}

        {activeTab === "tracker" && (
          <div className="flex h-full">
            <main className="flex-1 min-w-0 overflow-y-auto px-4 lg:px-8 py-6">
              {isSignedIn ? (
                <>
                  <GroupBuyTracker
                    prefillData={prefillData}
                    onClearPrefill={handleClearPrefill}
                    onSwitchToDiscover={() => setActiveTab("discover")}
                    onTrackedDataChange={handleTrackedDataChange}
                  />
                  {/* Mobile recommendations strip */}
                  <div className="lg:hidden">
                    <GroupBuyRecommendedSidebar
                      mode="mobile"
                      onTrackThis={handleTrackThis}
                      trackedProductTypes={trackedProductTypes}
                      trackedProductNames={trackedProductNames}
                    />
                  </div>
                </>
              ) : (
                <div className="text-center py-24">
                  <div className="max-w-sm mx-auto">
                    <div className="w-16 h-16 rounded-2xl bg-bg-elevated border border-border-subtle flex items-center justify-center mx-auto mb-5">
                      <svg className="w-7 h-7 text-text-muted/50" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 10.5V6.75a4.5 4.5 0 10-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 002.25-2.25v-6.75a2.25 2.25 0 00-2.25-2.25H6.75a2.25 2.25 0 00-2.25 2.25v6.75a2.25 2.25 0 002.25 2.25z" />
                      </svg>
                    </div>
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
            </main>
            {/* Desktop sidebar */}
            {isSignedIn && (
              <aside className="hidden lg:block w-80 flex-shrink-0 border-l border-border-subtle overflow-y-auto p-5">
                <GroupBuyRecommendedSidebar
                  mode="desktop"
                  onTrackThis={handleTrackThis}
                  trackedProductTypes={trackedProductTypes}
                  trackedProductNames={trackedProductNames}
                />
              </aside>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

function GroupBuysLoading() {
  return (
    <div className="flex flex-col h-[calc(100vh-4rem)]">
      <div className="flex-shrink-0 border-b border-border-subtle bg-bg-surface/60 backdrop-blur-sm">
        <div className="px-4 lg:px-8 py-3 flex items-center gap-5">
          <div className="h-6 w-28 bg-bg-elevated rounded animate-pulse" />
          <div className="h-10 w-56 bg-bg-elevated rounded-lg animate-pulse" />
        </div>
      </div>
      <div className="flex-1 flex min-h-0">
        <aside className="hidden lg:block w-64 flex-shrink-0 border-r border-border-subtle p-5 space-y-4">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="h-5 bg-bg-elevated rounded animate-pulse" style={{ width: `${60 + Math.random() * 30}%` }} />
          ))}
        </aside>
        <div className="flex-1 p-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4 gap-4">
            {Array.from({ length: 8 }).map((_, i) => (
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
