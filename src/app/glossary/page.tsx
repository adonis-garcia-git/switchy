"use client";

import { Suspense, useState, useMemo } from "react";
import { useSearchParams } from "next/navigation";
import { useQuery } from "convex/react";
import { api } from "../../../convex/_generated/api";
import { Input } from "@/components/ui/Input";
import { Skeleton } from "@/components/ui/Skeleton";
import { cn } from "@/lib/utils";

const CATEGORIES = [
  { label: "All", value: "all" },
  { label: "Switches", value: "switches" },
  { label: "Sound", value: "sound" },
  { label: "Keycaps", value: "keycaps" },
  { label: "Cases", value: "cases" },
  { label: "Mounting", value: "mounting" },
  { label: "Mods", value: "mods" },
  { label: "General", value: "general" },
];

const CATEGORY_COLORS: Record<string, string> = {
  switches: "bg-linear/10 text-linear border-linear/20",
  sound: "bg-purple-500/10 text-purple-400 border-purple-500/20",
  keycaps: "bg-amber-500/10 text-amber-400 border-amber-500/20",
  cases: "bg-blue-500/10 text-blue-400 border-blue-500/20",
  mounting: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20",
  mods: "bg-pink-500/10 text-pink-400 border-pink-500/20",
  general: "bg-bg-elevated text-text-secondary border-border-default",
};

function GlossaryContent() {
  const searchParams = useSearchParams();
  const highlightTerm = searchParams.get("term");
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("all");

  const terms = useQuery(api.glossary.list, category === "all" ? {} : { category });

  const filtered = useMemo(() => {
    if (!terms) return null;
    if (!search.trim()) return terms;
    const q = search.toLowerCase();
    return terms.filter(
      (t: any) =>
        t.term.toLowerCase().includes(q) ||
        t.definition.toLowerCase().includes(q)
    );
  }, [terms, search]);

  const sorted = useMemo(() => {
    if (!filtered) return null;
    return [...filtered].sort((a: any, b: any) => a.term.localeCompare(b.term));
  }, [filtered]);

  return (
    <div className="p-6 lg:p-8">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-2xl sm:text-3xl font-bold text-text-primary font-[family-name:var(--font-outfit)] tracking-tight mb-2">
            Glossary
          </h1>
          <p className="text-text-secondary leading-relaxed">
            Everything you need to know about mechanical keyboards, explained simply.
            {sorted && (
              <span className="text-text-muted ml-1">
                {sorted.length} {sorted.length === 1 ? "term" : "terms"}
              </span>
            )}
          </p>
        </div>

        <div className="flex flex-col lg:flex-row gap-8">
          {/* Sidebar — categories (desktop) */}
          <aside className="hidden lg:block w-56 shrink-0">
            <nav className="sticky top-24 space-y-1">
              <p className="text-xs font-semibold text-text-muted uppercase tracking-wider mb-3 px-3">
                Categories
              </p>
              {CATEGORIES.map((cat) => (
                <button
                  key={cat.value}
                  onClick={() => setCategory(cat.value)}
                  className={cn(
                    "w-full text-left px-3 py-2 rounded-lg text-sm font-medium transition-[background-color,color] duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/40",
                    category === cat.value
                      ? "bg-accent-dim text-accent"
                      : "text-text-secondary hover:text-text-primary hover:bg-bg-elevated"
                  )}
                >
                  {cat.label}
                </button>
              ))}
            </nav>
          </aside>

          {/* Main content */}
          <div className="flex-1 min-w-0">
            {/* Search */}
            <div className="mb-6">
              <div className="relative">
                <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
                <Input
                  placeholder="Search terms..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>

            {/* Mobile category tabs */}
            <div className="lg:hidden overflow-x-auto mb-6 -mx-6 px-6">
              <div className="flex gap-1.5">
                {CATEGORIES.map((cat) => (
                  <button
                    key={cat.value}
                    onClick={() => setCategory(cat.value)}
                    className={cn(
                      "px-3 py-1.5 rounded-md text-xs font-semibold uppercase tracking-wider whitespace-nowrap transition-[background-color,color] duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/40",
                      category === cat.value
                        ? "bg-accent text-bg-primary shadow-[0_1px_6px_rgba(232,89,12,0.2)]"
                        : "bg-bg-surface text-text-secondary border border-border-default hover:text-text-primary"
                    )}
                  >
                    {cat.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Terms list */}
            {!sorted ? (
              <div className="space-y-3">
                {Array.from({ length: 8 }).map((_, i) => (
                  <Skeleton key={i} variant="text" className="h-20" />
                ))}
              </div>
            ) : sorted.length === 0 ? (
              <div className="text-center py-16">
                <p className="text-text-muted">No terms found.</p>
              </div>
            ) : (
              <div className="space-y-2">
                {sorted.map((term: any) => (
                  <div
                    key={term._id}
                    id={term.term.toLowerCase().replace(/\s+/g, "-")}
                    className={cn(
                      "rounded-xl border p-5 transition-[border-color,box-shadow] duration-200",
                      highlightTerm?.toLowerCase() === term.term.toLowerCase()
                        ? "border-border-accent bg-accent-dim/30 glow-accent"
                        : "border-border-subtle bg-bg-surface hover:border-border-accent"
                    )}
                  >
                    <div className="flex items-start justify-between gap-3 mb-2">
                      <h3 className="font-semibold text-text-primary text-base font-[family-name:var(--font-outfit)]">
                        {term.term}
                      </h3>
                      <span
                        className={cn(
                          "text-[10px] px-2 py-0.5 rounded-md font-semibold uppercase tracking-wider border shrink-0",
                          CATEGORY_COLORS[term.category] || CATEGORY_COLORS.general
                        )}
                      >
                        {term.category}
                      </span>
                    </div>
                    <p className="text-sm text-text-secondary leading-relaxed mb-3">
                      {term.definition}
                    </p>
                    {term.relatedTerms && term.relatedTerms.length > 0 && (
                      <div className="flex flex-wrap items-center gap-1.5">
                        <span className="text-xs text-text-muted">Related:</span>
                        {term.relatedTerms.map((rt: string) => (
                          <button
                            key={rt}
                            onClick={() => {
                              setSearch(rt);
                              setCategory("all");
                            }}
                            className="text-xs text-accent hover:text-accent-hover transition-colors duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/40 rounded px-1"
                          >
                            {rt}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default function GlossaryPage() {
  return (
    <Suspense fallback={<div className="p-6 lg:p-8"><div className="max-w-6xl mx-auto"><Skeleton variant="card" /></div></div>}>
      <GlossaryContent />
    </Suspense>
  );
}
