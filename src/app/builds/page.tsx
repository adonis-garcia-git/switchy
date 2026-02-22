"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import { useQuery } from "convex/react";
import { useUser, SignInButton } from "@clerk/nextjs";
import { api } from "../../../convex/_generated/api";
import { BuildCardCompact } from "@/components/BuildCardCompact";
import { BuildDetailModal } from "@/components/BuildDetailModal";
import { BuildStatsBar } from "@/components/BuildStatsBar";
import { SponsoredCarousel } from "@/components/SponsoredCarousel";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { Input } from "@/components/ui/Input";
import { Skeleton } from "@/components/ui/Skeleton";
import { cn } from "@/lib/utils";
import { POPULAR_BUILDS } from "@/data/popularBuilds";

const DIFFICULTY_COLORS: Record<string, string> = {
  "beginner-friendly": "text-green-400 bg-green-500/15 border-green-500/30",
  intermediate: "text-amber-400 bg-amber-500/15 border-amber-500/30",
  advanced: "text-red-400 bg-red-500/15 border-red-500/30",
};

type SortOption = "newest" | "oldest" | "price-high" | "price-low" | "name-az";

function PopularTemplatesGrid() {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {POPULAR_BUILDS.map((tmpl) => (
        <Link
          key={tmpl.id}
          href={`/advisor?q=${encodeURIComponent(tmpl.prompt)}`}
          className={cn(
            "rounded-xl border border-border-subtle bg-bg-surface p-5",
            "hover:border-border-accent hover:glow-accent",
            "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/40",
            "active:scale-[0.98]",
            "transition-[border-color,box-shadow,transform] duration-200 group"
          )}
        >
          <div className="flex items-center gap-2 mb-2">
            <span
              className={cn(
                "inline-block px-2 py-0.5 rounded text-[10px] font-semibold border",
                DIFFICULTY_COLORS[tmpl.difficulty] || DIFFICULTY_COLORS.intermediate
              )}
            >
              {tmpl.difficulty}
            </span>
            <span className="text-xs font-mono text-text-muted ml-auto">
              {tmpl.price}
            </span>
          </div>
          <h3 className="font-semibold text-text-primary font-[family-name:var(--font-outfit)] group-hover:text-accent transition-colors duration-150 mb-1">
            {tmpl.name}
          </h3>
          <p className="text-xs text-text-secondary leading-relaxed mb-3">
            {tmpl.tagline}
          </p>
          <div className="flex flex-wrap gap-1.5">
            {tmpl.keyComponents.map((tag) => (
              <span
                key={tag}
                className="px-2 py-0.5 rounded text-[10px] bg-bg-elevated text-text-muted border border-border-subtle"
              >
                {tag}
              </span>
            ))}
          </div>
        </Link>
      ))}
    </div>
  );
}

function LoadingSkeleton() {
  return (
    <div className="space-y-6">
      {/* Stats skeleton */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {Array.from({ length: 4 }).map((_, i) => (
          <Skeleton key={i} variant="card" className="h-[72px] rounded-xl" />
        ))}
      </div>
      {/* Action bar skeleton */}
      <div className="flex gap-3">
        <Skeleton className="h-10 flex-1 rounded-lg" />
        <Skeleton className="h-10 w-40 rounded-lg" />
      </div>
      {/* Grid skeleton */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {Array.from({ length: 8 }).map((_, i) => (
          <Skeleton key={i} variant="card" className="h-64 rounded-xl" />
        ))}
      </div>
    </div>
  );
}

export default function BuildsPage() {
  const { isSignedIn } = useUser();
  const builds = useQuery(api.savedBuilds.listByUser, {});

  const [search, setSearch] = useState("");
  const [sort, setSort] = useState<SortOption>("newest");
  const [selectedBuild, setSelectedBuild] = useState<any>(null);

  const filteredBuilds = useMemo(() => {
    if (!builds) return [];
    let result = [...builds];

    // Search filter
    if (search.trim()) {
      const q = search.toLowerCase();
      result = result.filter(
        (b: any) =>
          b.buildName?.toLowerCase().includes(q) ||
          b.summary?.toLowerCase().includes(q) ||
          b.query?.toLowerCase().includes(q)
      );
    }

    // Sort
    result.sort((a: any, b: any) => {
      switch (sort) {
        case "newest":
          return (b._creationTime || 0) - (a._creationTime || 0);
        case "oldest":
          return (a._creationTime || 0) - (b._creationTime || 0);
        case "price-high":
          return (b.estimatedTotal || 0) - (a.estimatedTotal || 0);
        case "price-low":
          return (a.estimatedTotal || 0) - (b.estimatedTotal || 0);
        case "name-az":
          return (a.buildName || "").localeCompare(b.buildName || "");
        default:
          return 0;
      }
    });

    return result;
  }, [builds, search, sort]);

  // ── Sign-in gate ──
  if (!isSignedIn) {
    return (
      <div className="p-6 lg:p-8">
        <div className="max-w-7xl mx-auto space-y-10">
          <div className="max-w-lg mx-auto py-16 text-center">
            <div className="rounded-xl border border-border-default bg-bg-surface shadow-surface p-8">
              <div className="w-14 h-14 rounded-2xl bg-accent/10 border border-accent/20 flex items-center justify-center mx-auto mb-5">
                <svg className="w-7 h-7 text-accent" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                </svg>
              </div>
              <h1 className="text-2xl font-bold text-text-primary font-[family-name:var(--font-outfit)] tracking-tight mb-3">
                My Builds
              </h1>
              <p className="text-sm text-text-muted mb-6 leading-relaxed">
                Sign in to save and view your build recommendations.
              </p>
              <SignInButton mode="modal">
                <Button>Sign In</Button>
              </SignInButton>
            </div>
          </div>

          {/* Preview templates for unauthenticated users */}
          <div>
            <div className="flex items-center gap-3 mb-5">
              <h2 className="text-lg font-semibold text-text-primary font-[family-name:var(--font-outfit)]">
                Popular Build Templates
              </h2>
              <div className="flex-1 h-px bg-border-subtle" />
            </div>
            <PopularTemplatesGrid />
          </div>
        </div>
      </div>
    );
  }

  // ── Loading state ──
  if (builds === undefined) {
    return (
      <div className="p-6 lg:p-8">
        <div className="max-w-7xl mx-auto px-0 lg:px-0">
          <div className="flex items-center justify-between mb-6">
            <Skeleton className="h-8 w-40" />
            <Skeleton className="h-9 w-28 rounded-lg" />
          </div>
          <LoadingSkeleton />
        </div>
      </div>
    );
  }

  // ── Empty state ──
  if (builds.length === 0) {
    return (
      <div className="p-6 lg:p-8">
        <div className="max-w-7xl mx-auto space-y-10">
          {/* Header */}
          <div className="flex items-center justify-between">
            <h1 className="text-2xl font-bold text-text-primary font-[family-name:var(--font-outfit)] tracking-tight">
              My Builds
            </h1>
            <Link href="/advisor">
              <Button size="sm">
                <svg className="w-4 h-4 mr-1.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
                New Build
              </Button>
            </Link>
          </div>

          {/* Empty hero */}
          <div className="text-center py-16 rounded-xl border border-border-subtle bg-bg-surface/50">
            <div className="w-16 h-16 rounded-2xl bg-bg-elevated border border-border-subtle flex items-center justify-center mx-auto mb-5">
              <svg className="w-8 h-8 text-text-muted/40" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
            </div>
            <h2 className="text-xl font-bold text-text-primary font-[family-name:var(--font-outfit)] tracking-tight mb-2">
              Your build collection is empty
            </h2>
            <p className="text-sm text-text-muted max-w-md mx-auto mb-6 leading-relaxed">
              Chat with the AI advisor to generate your first custom keyboard build, or start from one of the templates below.
            </p>
            <Link href="/advisor">
              <Button>
                <svg className="w-4 h-4 mr-1.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
                Start Your First Build
              </Button>
            </Link>
          </div>

          {/* Popular templates */}
          <div>
            <div className="flex items-center gap-3 mb-5">
              <h2 className="text-lg font-semibold text-text-primary font-[family-name:var(--font-outfit)]">
                Need Inspiration?
              </h2>
              <div className="flex-1 h-px bg-border-subtle" />
            </div>
            <PopularTemplatesGrid />
          </div>

          <SponsoredCarousel productType="keyboard" />
        </div>
      </div>
    );
  }

  // ── Main builds dashboard ──
  return (
    <div className="p-6 lg:p-8">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header row */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-bold text-text-primary font-[family-name:var(--font-outfit)] tracking-tight">
              My Builds
            </h1>
            <Badge variant="info" size="sm">
              {builds.length}
            </Badge>
          </div>
          <Link href="/advisor">
            <Button size="sm">
              <svg className="w-4 h-4 mr-1.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              New Build
            </Button>
          </Link>
        </div>

        {/* Stats bar */}
        <BuildStatsBar builds={builds as any[]} />

        {/* Action bar: search + sort */}
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <svg
              className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted pointer-events-none"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <Input
              placeholder="Search builds..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-10"
            />
          </div>
          <select
            value={sort}
            onChange={(e) => setSort(e.target.value as SortOption)}
            className="bg-bg-surface border border-border-default rounded-lg px-4 py-2.5 text-sm text-text-primary focus:border-border-accent focus:outline-none transition-[border-color] duration-150 cursor-pointer"
          >
            <option value="newest">Newest</option>
            <option value="oldest">Oldest</option>
            <option value="price-high">Price: High → Low</option>
            <option value="price-low">Price: Low → High</option>
            <option value="name-az">Name A–Z</option>
          </select>
        </div>

        {/* Build grid */}
        {filteredBuilds.length === 0 ? (
          <div className="text-center py-16 rounded-xl border border-border-subtle bg-bg-surface/50">
            <p className="text-text-muted mb-1">No builds match &ldquo;{search}&rdquo;</p>
            <p className="text-sm text-text-muted/60">Try a different search term.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {filteredBuilds.map((build: any) => (
              <BuildCardCompact
                key={build._id}
                build={build}
                onClick={() => setSelectedBuild(build)}
              />
            ))}
          </div>
        )}

        {/* Popular templates */}
        <div className="pt-4">
          <div className="flex items-center gap-3 mb-5">
            <h2 className="text-lg font-semibold text-text-primary font-[family-name:var(--font-outfit)]">
              Need Inspiration?
            </h2>
            <div className="flex-1 h-px bg-border-subtle" />
          </div>
          <PopularTemplatesGrid />
        </div>

        {/* Sponsored section */}
        <SponsoredCarousel productType="keyboard" />

        {/* Detail modal */}
        {selectedBuild && (
          <BuildDetailModal
            build={selectedBuild}
            isOpen={!!selectedBuild}
            onClose={() => setSelectedBuild(null)}
          />
        )}
      </div>
    </div>
  );
}
