"use client";

import { Suspense, useState, useMemo, useEffect, useRef, useCallback } from "react";
import { useSearchParams } from "next/navigation";
import { useQuery } from "convex/react";
import { api } from "../../../convex/_generated/api";
import { Input } from "@/components/ui/Input";
import { Skeleton } from "@/components/ui/Skeleton";
import { cn } from "@/lib/utils";
import { GlossaryChatbot } from "@/components/GlossaryChatbot";
import { GlossaryTermDetail } from "@/components/GlossaryTermDetail";
import {
  GLOSSARY_CATEGORY_COLORS,
  GLOSSARY_DIFFICULTY_COLORS,
} from "@/lib/constants";
import type { GlossaryChatbotHandle } from "@/components/GlossaryChatbot";

const CATEGORIES = [
  { label: "All", value: "all" },
  { label: "Switches", value: "switches" },
  { label: "Sound", value: "sound" },
  { label: "Keycaps", value: "keycaps" },
  { label: "Cases", value: "cases" },
  { label: "Mounting", value: "mounting" },
  { label: "Mods", value: "mods" },
  { label: "Layouts", value: "layouts" },
  { label: "General", value: "general" },
];

const ALPHABET = "ABCDEFGHIJKLMNOPQRSTUVWXYZ".split("");

const CATEGORY_BAR_COLORS: Record<string, string> = {
  switches: "#EF4444",
  sound: "#E8590C",
  keycaps: "#D97706",
  cases: "#C2410C",
  mounting: "#059669",
  mods: "#E11D48",
  layouts: "#7C3AED",
  general: "#525252",
};

function CategoryBreakdown({
  terms,
  onCategoryClick,
}: {
  terms: any[] | undefined;
  onCategoryClick: (category: string) => void;
}) {
  const counts = useMemo(() => {
    if (!terms) return null;
    const map: Record<string, number> = {};
    for (const t of terms) {
      map[t.category] = (map[t.category] || 0) + 1;
    }
    return Object.entries(map)
      .sort((a, b) => b[1] - a[1]);
  }, [terms]);

  if (!counts || counts.length === 0) return null;

  const maxCount = counts[0][1];

  return (
    <div className="rounded-xl border border-border-subtle bg-bg-surface p-4 shrink-0">
      <p className="text-[11px] uppercase tracking-wider text-text-muted font-semibold mb-3">
        Category Breakdown
      </p>
      <div className="grid grid-cols-2 gap-x-3 gap-y-2">
        {counts.map(([cat, count]) => (
          <button
            key={cat}
            onClick={() => onCategoryClick(cat)}
            className="group text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/40 rounded-md"
          >
            <div className="flex items-center justify-between mb-0.5">
              <span className="text-[11px] font-medium text-text-secondary group-hover:text-text-primary transition-colors duration-150 capitalize">
                {cat}
              </span>
              <span className="text-[10px] font-mono text-text-muted">
                {count}
              </span>
            </div>
            <div className="w-full h-1.5 bg-bg-elevated rounded-full overflow-hidden">
              <div
                className="h-full rounded-full transition-[width] duration-300 group-hover:opacity-80"
                style={{
                  width: `${(count / maxCount) * 100}%`,
                  backgroundColor: CATEGORY_BAR_COLORS[cat] || "#525252",
                }}
              />
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}

function GlossaryContent() {
  const searchParams = useSearchParams();
  const highlightTerm = searchParams.get("term");
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("all");
  const [difficultyFilter, setDifficultyFilter] = useState<string | null>(null);
  const [exploredTerms, setExploredTerms] = useState<Set<string>>(new Set());
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [selectedTerm, setSelectedTerm] = useState<any>(null);
  const sectionRefs = useRef<Record<string, HTMLDivElement | null>>({});
  const chatbotRef = useRef<GlossaryChatbotHandle>(null);

  const terms = useQuery(api.glossary.list, category === "all" ? {} : { category });
  // Always fetch all terms for category breakdown counts
  const allTerms = useQuery(api.glossary.list, {});
  const termOfDay = useQuery(api.glossary.getTermOfDay, {});

  // Load explored terms from localStorage
  useEffect(() => {
    try {
      const stored = localStorage.getItem("switchy_explored_terms");
      if (stored) setExploredTerms(new Set(JSON.parse(stored)));
    } catch {}
  }, []);

  // Track explored terms
  const markExplored = useCallback((termId: string) => {
    setExploredTerms((prev) => {
      const next = new Set(prev);
      next.add(termId);
      try {
        localStorage.setItem("switchy_explored_terms", JSON.stringify([...next]));
      } catch {}
      return next;
    });
  }, []);

  const filtered = useMemo(() => {
    if (!terms) return null;
    let result = terms as any[];
    if (search.trim()) {
      const q = search.toLowerCase();
      result = result.filter(
        (t) =>
          t.term.toLowerCase().includes(q) ||
          t.definition.toLowerCase().includes(q)
      );
    }
    if (difficultyFilter) {
      result = result.filter((t) => t.difficulty === difficultyFilter);
    }
    return result;
  }, [terms, search, difficultyFilter]);

  const sorted = useMemo(() => {
    if (!filtered) return null;
    return [...filtered].sort((a: any, b: any) => a.term.localeCompare(b.term));
  }, [filtered]);

  // Group terms by first letter
  const grouped = useMemo(() => {
    if (!sorted) return null;
    const groups: Record<string, any[]> = {};
    for (const term of sorted) {
      const letter = term.term[0].toUpperCase();
      if (!groups[letter]) groups[letter] = [];
      groups[letter].push(term);
    }
    return groups;
  }, [sorted]);

  const activeLetters = useMemo(() => {
    if (!grouped) return new Set<string>();
    return new Set(Object.keys(grouped));
  }, [grouped]);

  const scrollToLetter = (letter: string) => {
    const el = sectionRefs.current[letter];
    if (el) {
      el.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  };

  const handleCopyLink = async (termName: string, termId: string) => {
    const url = `${window.location.origin}/glossary?term=${encodeURIComponent(termName)}`;
    try {
      await navigator.clipboard.writeText(url);
      setCopiedId(termId);
      setTimeout(() => setCopiedId(null), 2000);
    } catch {}
  };

  const handleTermClick = (term: any) => {
    markExplored(term._id);
    setSelectedTerm(term);
  };

  const totalTerms = allTerms?.length ?? 0;
  const exploredCount = allTerms
    ? (allTerms as any[]).filter((t: any) => exploredTerms.has(t._id)).length
    : 0;

  return (
    <div className="min-h-screen">
      <div className="flex">
        {/* ── Left Sidebar: Categories + Difficulty ── */}
        <aside className="hidden lg:block w-64 flex-shrink-0 border-r border-border-subtle">
          <div className="sticky top-16 h-[calc(100vh-4rem)] overflow-y-auto p-5">
            <p className="text-xs font-semibold text-text-muted uppercase tracking-wider mb-3 px-3">
              Categories
            </p>
            <nav className="space-y-1">
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

            <div className="pt-4 mt-4 border-t border-border-subtle">
              <p className="text-xs font-semibold text-text-muted uppercase tracking-wider mb-3 px-3">
                Difficulty
              </p>
              <nav className="space-y-1">
                <button
                  onClick={() => setDifficultyFilter(null)}
                  className={cn(
                    "w-full text-left px-3 py-2 rounded-lg text-sm font-medium transition-[background-color,color] duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/40",
                    difficultyFilter === null
                      ? "bg-accent-dim text-accent"
                      : "text-text-secondary hover:text-text-primary hover:bg-bg-elevated"
                  )}
                >
                  All Levels
                </button>
                {(["beginner", "intermediate", "advanced"] as const).map((d) => (
                  <button
                    key={d}
                    onClick={() => setDifficultyFilter(difficultyFilter === d ? null : d)}
                    className={cn(
                      "w-full text-left px-3 py-2 rounded-lg text-sm font-medium transition-[background-color,color] duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/40",
                      difficultyFilter === d
                        ? "bg-accent-dim text-accent"
                        : "text-text-secondary hover:text-text-primary hover:bg-bg-elevated"
                    )}
                  >
                    <span className="flex items-center gap-2">
                      <span className={cn("w-2 h-2 rounded-full", GLOSSARY_DIFFICULTY_COLORS[d].bg, "border")} />
                      {d.charAt(0).toUpperCase() + d.slice(1)}
                    </span>
                  </button>
                ))}
              </nav>
            </div>
          </div>
        </aside>

        {/* ── Main Content ── */}
        <main className="flex-1 min-w-0 px-6 lg:px-8 py-6">
          {/* Mobile/Tablet: Term of Day + Chatbot (shown when right sidebar hidden) */}
          <div className="xl:hidden space-y-4 mb-6">
            {termOfDay && (
              <div className="rounded-xl border-2 border-accent/30 bg-accent/5 p-4 relative overflow-hidden">
                <div className="absolute top-0 right-0 w-24 h-24 bg-accent/5 rounded-full -translate-y-1/2 translate-x-1/2" />
                <p className="text-[10px] uppercase tracking-wider text-accent font-semibold mb-1.5">
                  Term of the Day
                </p>
                <h3 className="text-base font-bold text-text-primary font-[family-name:var(--font-outfit)] mb-1">
                  {termOfDay.term}
                  {termOfDay.pronunciation && (
                    <span className="ml-2 text-sm font-normal text-text-muted italic">
                      {termOfDay.pronunciation}
                    </span>
                  )}
                </h3>
                <p className="text-sm text-text-secondary leading-relaxed">
                  {termOfDay.definition}
                </p>
              </div>
            )}
            <GlossaryChatbot ref={chatbotRef} />
          </div>

          {/* Header */}
          <div className="mb-6">
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

          {/* Progress bar */}
          {totalTerms > 0 && (
            <div className="mb-6 rounded-lg bg-bg-surface border border-border-subtle p-3">
              <div className="flex items-center justify-between mb-1.5">
                <span className="text-xs text-text-muted">
                  You&apos;ve explored {exploredCount} of {totalTerms} terms
                </span>
                <span className="text-xs font-mono text-accent">
                  {totalTerms > 0 ? Math.round((exploredCount / totalTerms) * 100) : 0}%
                </span>
              </div>
              <div className="w-full h-1.5 bg-bg-elevated rounded-full overflow-hidden">
                <div
                  className="h-full bg-accent rounded-full transition-[width] duration-300"
                  style={{ width: `${totalTerms > 0 ? (exploredCount / totalTerms) * 100 : 0}%` }}
                />
              </div>
            </div>
          )}

          {/* A-Z Quick Jump Bar */}
          {grouped && (
            <div className="mb-6 flex flex-wrap gap-1">
              {ALPHABET.map((letter) => (
                <button
                  key={letter}
                  onClick={() => scrollToLetter(letter)}
                  disabled={!activeLetters.has(letter)}
                  className={cn(
                    "w-8 h-8 rounded-md text-xs font-semibold transition-colors duration-150",
                    "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/40",
                    activeLetters.has(letter)
                      ? "bg-bg-surface border border-border-subtle text-text-primary hover:bg-accent-dim hover:text-accent hover:border-accent/20 active:scale-[0.95]"
                      : "bg-bg-elevated/50 text-text-muted/30 cursor-not-allowed"
                  )}
                >
                  {letter}
                </button>
              ))}
            </div>
          )}

          {/* Search */}
          <div className="mb-6">
            <div className="relative">
              <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              <Input
                placeholder="Search terms and definitions..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>

          {/* Mobile category + difficulty tabs */}
          <div className="lg:hidden overflow-x-auto mb-4 -mx-6 px-6">
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

          <div className="lg:hidden overflow-x-auto mb-6 -mx-6 px-6">
            <div className="flex gap-1.5">
              <button
                onClick={() => setDifficultyFilter(null)}
                className={cn(
                  "px-3 py-1.5 rounded-md text-xs font-semibold whitespace-nowrap transition-[background-color,color] duration-150",
                  !difficultyFilter ? "bg-accent-dim text-accent" : "bg-bg-surface text-text-secondary border border-border-default"
                )}
              >
                All Levels
              </button>
              {(["beginner", "intermediate", "advanced"] as const).map((d) => (
                <button
                  key={d}
                  onClick={() => setDifficultyFilter(difficultyFilter === d ? null : d)}
                  className={cn(
                    "px-3 py-1.5 rounded-md text-xs font-semibold whitespace-nowrap transition-[background-color,color] duration-150",
                    difficultyFilter === d ? "bg-accent-dim text-accent" : "bg-bg-surface text-text-secondary border border-border-default"
                  )}
                >
                  {d.charAt(0).toUpperCase() + d.slice(1)}
                </button>
              ))}
            </div>
          </div>

          {/* Terms list grouped by letter */}
          {!grouped ? (
            <div className="space-y-3">
              {Array.from({ length: 8 }).map((_, i) => (
                <Skeleton key={i} variant="text" className="h-20" />
              ))}
            </div>
          ) : Object.keys(grouped).length === 0 ? (
            <div className="text-center py-16">
              <p className="text-text-muted">No terms found.</p>
            </div>
          ) : (
            <div className="space-y-6">
              {Object.entries(grouped).map(([letter, letterTerms]) => (
                <div
                  key={letter}
                  ref={(el) => { sectionRefs.current[letter] = el; }}
                >
                  <div className="sticky top-16 z-10 bg-bg-primary/95 backdrop-blur-sm py-2 mb-2 border-b border-border-subtle">
                    <h2 className="text-lg font-bold text-accent font-[family-name:var(--font-outfit)]">
                      {letter}
                    </h2>
                  </div>
                  <div className="space-y-2">
                    {letterTerms.map((term: any) => (
                      <div
                        key={term._id}
                        id={term.term.toLowerCase().replace(/\s+/g, "-")}
                        onClick={() => handleTermClick(term)}
                        className={cn(
                          "group rounded-xl border p-5 transition-[border-color,box-shadow] duration-200 cursor-pointer",
                          highlightTerm?.toLowerCase() === term.term.toLowerCase()
                            ? "border-border-accent bg-accent-dim/30 glow-accent"
                            : "border-border-subtle bg-bg-surface hover:border-accent/40"
                        )}
                      >
                        <div className="flex items-start justify-between gap-3 mb-2">
                          <div className="flex items-center gap-2 flex-wrap">
                            <h3 className="font-semibold text-text-primary text-base font-[family-name:var(--font-outfit)]">
                              {term.term}
                            </h3>
                            {term.pronunciation && (
                              <span className="text-xs text-text-muted italic">{term.pronunciation}</span>
                            )}
                          </div>
                          <div className="flex items-center gap-1.5 shrink-0">
                            {term.difficulty && (
                              <span
                                className={cn(
                                  "text-[10px] px-2 py-0.5 rounded-md font-semibold uppercase tracking-wider border",
                                  GLOSSARY_DIFFICULTY_COLORS[term.difficulty]?.bg,
                                  GLOSSARY_DIFFICULTY_COLORS[term.difficulty]?.text
                                )}
                              >
                                {term.difficulty}
                              </span>
                            )}
                            <span
                              className={cn(
                                "text-[10px] px-2 py-0.5 rounded-md font-semibold uppercase tracking-wider border shrink-0",
                                GLOSSARY_CATEGORY_COLORS[term.category] || GLOSSARY_CATEGORY_COLORS.general
                              )}
                            >
                              {term.category}
                            </span>
                            {/* Arrow icon on hover */}
                            <svg
                              className="w-4 h-4 text-text-muted opacity-0 group-hover:opacity-100 transition-opacity duration-150 shrink-0"
                              fill="none"
                              viewBox="0 0 24 24"
                              stroke="currentColor"
                              strokeWidth={2}
                            >
                              <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                            </svg>
                          </div>
                        </div>

                        <p className="text-sm text-text-secondary leading-relaxed mb-2">
                          {term.definition}
                        </p>

                        {term.example && (
                          <p className="text-xs text-text-muted italic border-l-2 border-border-subtle pl-3 mb-3">
                            {term.example}
                          </p>
                        )}

                        <div className="flex items-center justify-between">
                          {term.relatedTerms && term.relatedTerms.length > 0 && (
                            <div className="flex flex-wrap items-center gap-1.5">
                              <span className="text-xs text-text-muted">Related:</span>
                              {term.relatedTerms.map((rt: string) => (
                                <button
                                  key={rt}
                                  onClick={(e) => {
                                    e.stopPropagation();
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

                          {/* Copy link button */}
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleCopyLink(term.term, term._id);
                            }}
                            className="text-xs text-text-muted hover:text-accent transition-colors duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/40 rounded px-1.5 py-0.5 ml-auto shrink-0"
                            title="Copy link to term"
                          >
                            {copiedId === term._id ? (
                              <span className="text-emerald-400">Copied!</span>
                            ) : (
                              <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                <path strokeLinecap="round" strokeLinejoin="round" d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
                              </svg>
                            )}
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}
        </main>

        {/* ── Right Sidebar: Term of Day + Chatbot + Category Breakdown ── */}
        <aside className="hidden xl:block w-[400px] flex-shrink-0 border-l border-border-subtle">
          <div className="sticky top-16 h-[calc(100vh-4rem)] overflow-y-auto p-5 flex flex-col gap-5">
            {/* Term of the Day — compact */}
            {termOfDay && (
              <div className="rounded-xl border-2 border-accent/30 bg-accent/5 p-4 relative overflow-hidden shrink-0">
                <p className="text-[10px] uppercase tracking-wider text-accent font-semibold mb-1.5">
                  Term of the Day
                </p>
                <h3 className="text-base font-bold text-text-primary font-[family-name:var(--font-outfit)] mb-1">
                  {termOfDay.term}
                  {termOfDay.pronunciation && (
                    <span className="ml-2 text-xs font-normal text-text-muted italic">
                      {termOfDay.pronunciation}
                    </span>
                  )}
                </h3>
                <p className="text-[13px] text-text-secondary leading-relaxed line-clamp-3">
                  {termOfDay.definition}
                </p>
              </div>
            )}

            {/* Ask Switchy chatbot — fills remaining space */}
            <div className="flex-1 min-h-[240px]">
              <GlossaryChatbot ref={chatbotRef} />
            </div>

            {/* Category Breakdown */}
            <CategoryBreakdown
              terms={allTerms as any[] | undefined}
              onCategoryClick={(cat) => setCategory(cat)}
            />
          </div>
        </aside>
      </div>

      {/* Term Detail Modal */}
      <GlossaryTermDetail
        term={selectedTerm}
        isOpen={!!selectedTerm}
        onClose={() => setSelectedTerm(null)}
        onSelectRelated={(name) => {
          const all = terms as any[] | undefined;
          const found = all?.find((t: any) => t.term === name);
          if (found) {
            setSelectedTerm(found);
          } else {
            setSelectedTerm(null);
            setSearch(name);
            setCategory("all");
          }
        }}
        onAskAbout={(termName) => {
          setSelectedTerm(null);
          chatbotRef.current?.askQuestion(`What is ${termName}?`);
        }}
      />
    </div>
  );
}

export default function GlossaryPage() {
  return (
    <Suspense fallback={<div className="min-h-screen"><div className="flex"><Skeleton variant="card" /></div></div>}>
      <GlossaryContent />
    </Suspense>
  );
}
