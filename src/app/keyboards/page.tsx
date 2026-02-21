"use client";

import { useState } from "react";
import { useQuery } from "convex/react";
import { api } from "../../../convex/_generated/api";
import { KeyboardCard } from "@/components/KeyboardCard";
import { Input } from "@/components/ui/Input";
import { Tabs } from "@/components/ui/Tabs";
import { Skeleton } from "@/components/ui/Skeleton";

const SIZE_TABS = [
  { label: "All", value: "all" },
  { label: "60%", value: "60%" },
  { label: "65%", value: "65%" },
  { label: "75%", value: "75%" },
  { label: "TKL", value: "TKL" },
  { label: "Full", value: "full-size" },
];

export default function KeyboardsPage() {
  const [search, setSearch] = useState("");
  const [sizeFilter, setSizeFilter] = useState("all");
  const [hotSwapOnly, setHotSwapOnly] = useState(false);
  const [wirelessOnly, setWirelessOnly] = useState(false);
  const [sortBy, setSortBy] = useState("name");

  const keyboards = useQuery(api.keyboards.list, {
    size: sizeFilter === "all" ? undefined : sizeFilter,
    hotSwapOnly: hotSwapOnly || undefined,
    wirelessOnly: wirelessOnly || undefined,
  });
  const searchResults = useQuery(
    api.keyboards.search,
    search.trim() ? { query: search.trim() } : "skip"
  );

  const displayKeyboards = search.trim() ? searchResults : keyboards;

  const sorted = displayKeyboards
    ? [...displayKeyboards].sort((a: any, b: any) => {
        if (sortBy === "price-low") return a.priceUsd - b.priceUsd;
        if (sortBy === "price-high") return b.priceUsd - a.priceUsd;
        return a.name.localeCompare(b.name);
      })
    : null;

  return (
    <div className="p-6 lg:p-8">
      <div className="max-w-6xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold text-text-primary">Keyboard Explorer</h1>
            <p className="text-sm text-text-muted mt-1">
              {sorted ? `${sorted.length} keyboards` : "Loading..."}
            </p>
          </div>
        </div>

        {/* Search + Filters */}
        <div className="space-y-4 mb-6">
          <Input
            placeholder="Search keyboards..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />

          <div className="flex flex-wrap items-center gap-4">
            <Tabs tabs={SIZE_TABS} activeTab={sizeFilter} onChange={setSizeFilter} />

            <label className="flex items-center gap-2 text-sm text-text-secondary cursor-pointer">
              <input
                type="checkbox"
                checked={hotSwapOnly}
                onChange={(e) => setHotSwapOnly(e.target.checked)}
                className="rounded border-border-default bg-bg-elevated accent-accent"
              />
              Hot-swap only
            </label>

            <label className="flex items-center gap-2 text-sm text-text-secondary cursor-pointer">
              <input
                type="checkbox"
                checked={wirelessOnly}
                onChange={(e) => setWirelessOnly(e.target.checked)}
                className="rounded border-border-default bg-bg-elevated accent-accent"
              />
              Wireless only
            </label>

            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="bg-bg-elevated border border-border-default rounded-lg px-3 py-2 text-sm text-text-primary"
            >
              <option value="name">Sort: Name</option>
              <option value="price-low">Sort: Price (Low)</option>
              <option value="price-high">Sort: Price (High)</option>
            </select>
          </div>
        </div>

        {/* Grid */}
        {!sorted ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {Array.from({ length: 6 }).map((_, i) => (
              <Skeleton key={i} variant="card" />
            ))}
          </div>
        ) : sorted.length === 0 ? (
          <div className="text-center py-16">
            <p className="text-text-muted">No keyboards found matching your filters.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {sorted.map((kb: any) => (
              <KeyboardCard key={kb._id} keyboard={kb} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
