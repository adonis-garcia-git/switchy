"use client";

import { useState, useCallback, Suspense } from "react";
import { useAction } from "convex/react";
import { api } from "../../../convex/_generated/api";
import { Tabs } from "@/components/ui/Tabs";
import { Card } from "@/components/ui/Card";
import { Skeleton } from "@/components/ui/Skeleton";
import Link from "next/link";

interface LocalResult {
  type: "switch" | "keyboard" | "keycap";
  name: string;
  price?: number;
  imageUrl?: string;
  detailUrl: string;
  source: string;
}

interface ExternalResult {
  type: "external";
  name: string;
  snippet?: string;
  url?: string;
  source: string;
}

type SearchResults = {
  local: LocalResult[];
  external: ExternalResult[];
} | null;

function SearchContent() {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<SearchResults>(null);
  const [isSearching, setIsSearching] = useState(false);
  const [activeTab, setActiveTab] = useState("all");

  const universalSearch = useAction(api.niaSearchPublic.universalSearch);

  const handleSearch = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault();
      if (!query.trim() || isSearching) return;

      setIsSearching(true);
      try {
        const data = await universalSearch({ query: query.trim(), limit: 15 });
        setResults(data as SearchResults);
      } catch (err) {
        console.error("Search failed:", err);
      } finally {
        setIsSearching(false);
      }
    },
    [query, isSearching, universalSearch]
  );

  const localResults = results?.local ?? [];
  const externalResults = results?.external ?? [];
  const allCount = localResults.length + externalResults.length;

  const filteredLocal =
    activeTab === "all" || activeTab === "local" ? localResults : [];
  const filteredExternal =
    activeTab === "all" || activeTab === "external" ? externalResults : [];

  const tabs = [
    { label: `All (${allCount})`, value: "all" },
    { label: `Local (${localResults.length})`, value: "local" },
    { label: `External (${externalResults.length})`, value: "external" },
  ];

  return (
    <div className="min-h-screen px-6 lg:px-8 py-8 lg:py-12">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl lg:text-4xl font-bold font-[family-name:var(--font-display)] tracking-tight mb-2">
            Search Everything
          </h1>
          <p className="text-sm text-text-secondary">
            Search across our catalog and community sources powered by Nia
          </p>
        </div>

        {/* Search bar */}
        <form onSubmit={handleSearch} className="mb-8">
          <div className="relative">
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="e.g. gasket mount 65% under $200, thocky linear switches..."
              className="w-full px-4 py-3.5 pl-11 rounded-xl border border-border-default bg-bg-surface text-text-primary placeholder:text-text-muted text-sm focus:outline-none focus:ring-2 focus:ring-accent/40 focus:border-accent/40 transition-[border-color,box-shadow] duration-150"
            />
            <svg
              className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4.5 h-4.5 text-text-muted"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
              />
            </svg>
            <button
              type="submit"
              disabled={isSearching || !query.trim()}
              className="absolute right-2 top-1/2 -translate-y-1/2 px-4 py-1.5 rounded-lg bg-accent text-bg-primary text-sm font-semibold hover:bg-accent-hover active:scale-[0.97] disabled:opacity-50 disabled:cursor-not-allowed transition-[background-color,transform,opacity] duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/40"
            >
              {isSearching ? "Searching..." : "Search"}
            </button>
          </div>
        </form>

        {/* Results */}
        {results && (
          <>
            <Tabs
              tabs={tabs}
              activeTab={activeTab}
              onChange={setActiveTab}
              className="mb-6"
            />

            {allCount === 0 && (
              <div className="text-center py-16">
                <p className="text-text-muted text-sm">
                  No results found for &ldquo;{query}&rdquo;
                </p>
              </div>
            )}

            <div className="space-y-3">
              {/* Local results */}
              {filteredLocal.map((item, i) => (
                <Link key={`local-${i}`} href={item.detailUrl}>
                  <Card
                    variant="interactive"
                    className="p-4 flex items-center gap-4"
                  >
                    {item.imageUrl && (
                      <div className="w-14 h-14 rounded-lg overflow-hidden bg-bg-elevated shrink-0">
                        <img
                          src={item.imageUrl}
                          alt={item.name}
                          className="w-full h-full object-cover"
                        />
                      </div>
                    )}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-0.5">
                        <span className="inline-block px-1.5 py-0.5 text-[10px] font-bold uppercase tracking-wider rounded bg-accent/10 text-accent border border-accent/20">
                          {item.type}
                        </span>
                        <span className="text-[10px] text-text-muted font-mono uppercase tracking-wider">
                          In Catalog
                        </span>
                      </div>
                      <p className="text-sm font-semibold text-text-primary truncate">
                        {item.name}
                      </p>
                    </div>
                    {item.price != null && (
                      <p className="text-sm font-semibold text-text-primary shrink-0">
                        ${typeof item.price === "number" ? item.price.toFixed(2) : item.price}
                      </p>
                    )}
                  </Card>
                </Link>
              ))}

              {/* External results */}
              {filteredExternal.map((item, i) => (
                <a
                  key={`ext-${i}`}
                  href={item.url ?? "#"}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="block focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/40 rounded-xl"
                >
                  <Card
                    variant="interactive"
                    className="p-4"
                  >
                    <div className="flex items-center gap-2 mb-1">
                      <span className="inline-block px-1.5 py-0.5 text-[10px] font-bold uppercase tracking-wider rounded bg-bg-elevated text-text-muted border border-border-subtle">
                        External
                      </span>
                      <span className="text-[10px] text-text-muted font-mono truncate">
                        {item.source}
                      </span>
                    </div>
                    <p className="text-sm font-semibold text-text-primary mb-1">
                      {item.name}
                    </p>
                    {item.snippet && (
                      <p className="text-xs text-text-secondary leading-[1.6] line-clamp-2">
                        {item.snippet}
                      </p>
                    )}
                  </Card>
                </a>
              ))}
            </div>
          </>
        )}

        {/* Empty state */}
        {!results && !isSearching && (
          <div className="text-center py-20">
            <div className="w-16 h-16 rounded-2xl bg-accent/10 flex items-center justify-center mx-auto mb-5">
              <svg
                className="w-8 h-8 text-accent"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={1.5}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                />
              </svg>
            </div>
            <h3 className="text-lg font-semibold font-[family-name:var(--font-display)] text-text-primary mb-2">
              Search across everything
            </h3>
            <p className="text-sm text-text-muted max-w-md mx-auto leading-[1.7]">
              Search our product catalog, vendor listings, community reviews,
              and educational content all at once. Powered by Nia.
            </p>
          </div>
        )}

        {/* Loading skeleton */}
        {isSearching && (
          <div className="space-y-3">
            {[1, 2, 3, 4, 5].map((i) => (
              <Skeleton key={i} variant="card" className="h-20" />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default function SearchPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen px-6 lg:px-8 py-8 lg:py-12">
          <div className="max-w-4xl mx-auto">
            <Skeleton className="h-10 w-64 mb-8" />
            <Skeleton className="h-12 w-full mb-8" />
          </div>
        </div>
      }
    >
      <SearchContent />
    </Suspense>
  );
}
