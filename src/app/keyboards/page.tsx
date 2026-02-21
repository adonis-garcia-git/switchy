"use client";

import { useState } from "react";
import { useQuery } from "convex/react";
import { api } from "../../../convex/_generated/api";
import { KeyboardCard } from "@/components/KeyboardCard";
import { Input } from "@/components/ui/Input";
import { Tabs } from "@/components/ui/Tabs";
import { Skeleton } from "@/components/ui/Skeleton";
import { Badge } from "@/components/ui/Badge";

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
        {/* Header */}
        <div className="flex items-center gap-3 mb-8">
          <h1 className="text-2xl font-bold text-text-primary font-[family-name:var(--font-outfit)] tracking-tight">
            Keyboard Explorer
          </h1>
          <Badge variant="info" size="md">
            {sorted ? sorted.length : "..."}
          </Badge>
        </div>

        {/* Search + Filters */}
        <div className="space-y-4 mb-8">
          <Input
            placeholder="Search keyboards by name, brand, or feature..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />

          <div className="flex flex-wrap items-center gap-4">
            <Tabs tabs={SIZE_TABS} activeTab={sizeFilter} onChange={setSizeFilter} />

            <label className="flex items-center gap-2 text-sm text-text-secondary cursor-pointer select-none group">
              <input
                type="checkbox"
                checked={hotSwapOnly}
                onChange={(e) => setHotSwapOnly(e.target.checked)}
                className="w-4 h-4 rounded border-border-default bg-bg-surface accent-accent cursor-pointer"
              />
              <span className="group-hover:text-text-primary transition-colors duration-150">
                Hot-swap only
              </span>
            </label>

            <label className="flex items-center gap-2 text-sm text-text-secondary cursor-pointer select-none group">
              <input
                type="checkbox"
                checked={wirelessOnly}
                onChange={(e) => setWirelessOnly(e.target.checked)}
                className="w-4 h-4 rounded border-border-default bg-bg-surface accent-accent cursor-pointer"
              />
              <span className="group-hover:text-text-primary transition-colors duration-150">
                Wireless only
              </span>
            </label>

            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="bg-bg-surface border border-border-default rounded-lg px-3 py-2 text-sm text-text-primary cursor-pointer hover:border-border-accent focus:border-border-accent focus:outline-none transition-[border-color] duration-150"
            >
              <option value="name">Sort: Name</option>
              <option value="price-low">Sort: Price (Low)</option>
              <option value="price-high">Sort: Price (High)</option>
            </select>
          </div>
        </div>

        {/* Grid */}
        {!sorted ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {Array.from({ length: 6 }).map((_, i) => (
              <Skeleton key={i} variant="card" className="h-56" />
            ))}
          </div>
        ) : sorted.length === 0 ? (
          <div className="text-center py-20">
            <p className="text-text-muted text-sm">No keyboards found matching your filters.</p>
            <p className="text-text-muted/60 text-xs mt-1">Try adjusting your search or filter criteria.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {sorted.map((kb: any) => (
              <KeyboardCard key={kb._id} keyboard={kb} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
