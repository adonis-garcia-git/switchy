"use client";

import { Suspense, useState, useMemo } from "react";
import { useSearchParams } from "next/navigation";
import { useQuery } from "convex/react";
import { api } from "../../../convex/_generated/api";
import { Input } from "@/components/ui/Input";
import { Tabs } from "@/components/ui/Tabs";
import { Skeleton } from "@/components/ui/Skeleton";

const CATEGORY_TABS = [
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
  switches: "bg-linear/10 text-linear",
  sound: "bg-purple-500/10 text-purple-400",
  keycaps: "bg-amber-500/10 text-amber-400",
  cases: "bg-blue-500/10 text-blue-400",
  mounting: "bg-emerald-500/10 text-emerald-400",
  mods: "bg-pink-500/10 text-pink-400",
  general: "bg-slate-500/10 text-slate-400",
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
      <div className="max-w-4xl mx-auto">
        <h1 className="text-2xl font-bold text-text-primary mb-2">Glossary</h1>
        <p className="text-text-muted mb-6">
          Everything you need to know about mechanical keyboards, explained simply.
          {sorted && ` ${sorted.length} terms.`}
        </p>

        <div className="space-y-4 mb-6">
          <Input
            placeholder="Search terms..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          <div className="overflow-x-auto">
            <Tabs tabs={CATEGORY_TABS} activeTab={category} onChange={setCategory} />
          </div>
        </div>

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
          <div className="space-y-3">
            {sorted.map((term: any) => (
              <div
                key={term._id}
                id={term.term.toLowerCase().replace(/\s+/g, "-")}
                className={`rounded-xl border p-5 transition-colors ${
                  highlightTerm?.toLowerCase() === term.term.toLowerCase()
                    ? "border-accent bg-accent/5"
                    : "border-border-subtle bg-bg-surface"
                }`}
              >
                <div className="flex items-start justify-between gap-3 mb-2">
                  <h3 className="font-semibold text-text-primary text-lg">{term.term}</h3>
                  <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${CATEGORY_COLORS[term.category] || CATEGORY_COLORS.general}`}>
                    {term.category}
                  </span>
                </div>
                <p className="text-sm text-text-secondary mb-3">{term.definition}</p>
                {term.relatedTerms && term.relatedTerms.length > 0 && (
                  <div className="flex flex-wrap gap-1.5">
                    <span className="text-xs text-text-muted">Related:</span>
                    {term.relatedTerms.map((rt: string) => (
                      <button
                        key={rt}
                        onClick={() => {
                          setSearch(rt);
                          setCategory("all");
                        }}
                        className="text-xs text-accent hover:text-accent-hover transition-colors"
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
  );
}

export default function GlossaryPage() {
  return (
    <Suspense fallback={<div className="p-6 lg:p-8"><div className="max-w-4xl mx-auto"><Skeleton variant="card" /></div></div>}>
      <GlossaryContent />
    </Suspense>
  );
}
