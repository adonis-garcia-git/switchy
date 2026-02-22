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
  switches: "bg-linear/70",
  sound: "bg-accent/70",
  keycaps: "bg-amber-500/70",
  cases: "bg-orange-400/70",
  mounting: "bg-emerald-400/70",
  mods: "bg-rose-400/70",
  layouts: "bg-violet-400/70",
  general: "bg-zinc-400/70",
};

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
  const termOfDay = useQuery(api.glossary.getTermOfDay, {});
  const allTerms = useQuery(api.glossary.list, {});

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

  // Per-category exploration stats (always computed from full term list)
  const categoryStats = useMemo(() => {
    if (!allTerms) return null;
    const stats: Record<string, { total: number; explored: number }> = {};
    for (const t of allTerms as any[]) {
      if (!stats[t.category]) stats[t.category] = { total: 0, explored: 0 };
      stats[t.category].total++;
      if (exploredTerms.has(t._id)) stats[t.category].explored++;
    }
    return stats;
  }, [allTerms, exploredTerms]);

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

  const handleRandomTerm = () => {
    if (!allTerms) return;
    const all = allTerms as any[];
    const unexplored = all.filter((t) => !exploredTerms.has(t._id));
    const pool = unexplored.length > 0 ? unexplored : all;
    const random = pool[Math.floor(Math.random() * pool.length)];
    if (random) handleTermClick(random);
  };

  const totalTerms = terms?.length ?? 0;
  const exploredCount = terms
    ? (terms as any[]).filter((t: any) => exploredTerms.has(t._id)).length
    : 0;
  const globalTotal = allTerms?.length ?? 0;
  const globalExplored = allTerms
    ? (allTerms as any[]).filter((t: any) => exploredTerms.has(t._id)).length
    : 0;

  return (
    <div className="px-4 py-6 lg:px-5 lg:py-6">
      {/* Mobile-only: Term of the Day + Ask Switchy stacked above content */}
      <div className="lg:hidden space-y-4 mb-6">
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

      {/* Full-width 3-column layout: filters | terms | widgets */}
      <div className="grid grid-cols-1 lg:grid-cols-[200px_1fr_400px] gap-6">
        {/* Left column: Filter sidebar */}
        <aside className="hidden lg:block">
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

            <div className="pt-4 mt-4 border-t border-border-subtle">
              <p className="text-xs font-semibold text-text-muted uppercase tracking-wider mb-3 px-3">
                Difficulty
              </p>
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
            </div>
          </nav>
        </aside>

        {/* Center column: Main glossary content */}
        <div className="min-w-0">
          {/* Header */}
          <div className="mb-5">
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
            <div className="mb-5 rounded-lg bg-bg-surface border border-border-subtle p-3">
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
            <div className="mb-5 flex flex-wrap gap-1">
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
          <div className="mb-5">
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
          <div className="lg:hidden overflow-x-auto mb-4 -mx-4 px-4">
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

          <div className="lg:hidden overflow-x-auto mb-5 -mx-4 px-4">
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
        </div>

        {/* Right column: Widgets sidebar */}
        <aside className="hidden lg:flex lg:flex-col">
          <div className="sticky top-24 flex flex-col gap-4 max-h-[calc(100vh-7rem)] overflow-y-auto overscroll-contain scrollbar-thin pr-1">
            {/* Term of the Day */}
            {termOfDay && (
              <div className="rounded-xl border-2 border-accent/30 bg-accent/5 p-5 relative overflow-hidden shrink-0">
                <div className="absolute top-0 right-0 w-40 h-40 bg-accent/5 rounded-full -translate-y-1/2 translate-x-1/2" />
                <p className="text-[11px] uppercase tracking-wider text-accent font-semibold mb-2">
                  Term of the Day
                </p>
                <h3 className="text-lg font-bold text-text-primary font-[family-name:var(--font-outfit)] mb-1.5">
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
                {termOfDay.example && (
                  <p className="text-sm text-text-muted mt-2 italic border-l-2 border-accent/30 pl-4">
                    {termOfDay.example}
                  </p>
                )}
              </div>
            )}

            {/* Ask Switchy chatbot */}
            <div className="shrink-0">
              <GlossaryChatbot ref={chatbotRef} />
            </div>

            {/* Knowledge Map — per-category exploration progress */}
            <div className="rounded-xl border border-border-subtle bg-bg-surface p-5 shrink-0">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 rounded-md bg-accent/15 border border-accent/25 flex items-center justify-center">
                    <svg className="w-3.5 h-3.5 text-accent" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
                    </svg>
                  </div>
                  <p className="text-xs font-semibold text-text-primary font-[family-name:var(--font-outfit)]">
                    Knowledge Map
                  </p>
                </div>
                <span className="text-xs font-mono text-accent">
                  {globalExplored}/{globalTotal}
                </span>
              </div>

              <div className="space-y-2.5">
                {CATEGORIES.filter((c) => c.value !== "all").map((cat) => {
                  const stats = categoryStats?.[cat.value];
                  const catTotal = stats?.total ?? 0;
                  const catExplored = stats?.explored ?? 0;
                  const pct = catTotal > 0 ? (catExplored / catTotal) * 100 : 0;
                  return (
                    <div key={cat.value}>
                      <div className="flex items-center justify-between mb-1">
                        <button
                          onClick={() => setCategory(cat.value)}
                          className="text-[11px] text-text-secondary hover:text-accent transition-colors duration-150"
                        >
                          {cat.label}
                        </button>
                        <span className="text-[10px] text-text-muted font-mono tabular-nums">
                          {catExplored}/{catTotal}
                        </span>
                      </div>
                      <div className="h-1.5 bg-bg-elevated rounded-full overflow-hidden">
                        <div
                          className={cn("h-full rounded-full transition-[width] duration-300", CATEGORY_BAR_COLORS[cat.value] || "bg-accent/70")}
                          style={{ width: `${pct}%` }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Discover Random Term button */}
              <button
                onClick={handleRandomTerm}
                disabled={!allTerms || allTerms.length === 0}
                className={cn(
                  "w-full mt-5 flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg text-xs font-semibold",
                  "transition-[background-color,transform,box-shadow] duration-150",
                  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/40",
                  "bg-accent/10 text-accent border border-accent/20 hover:bg-accent/20 hover:border-accent/30 active:scale-[0.97]",
                  "disabled:opacity-40 disabled:cursor-not-allowed"
                )}
              >
                <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 12c0-1.232-.046-2.453-.138-3.662a4.006 4.006 0 00-3.7-3.7 48.678 48.678 0 00-7.324 0 4.006 4.006 0 00-3.7 3.7c-.017.22-.032.441-.046.662M19.5 12l3-3m-3 3l-3-3m-12 3c0 1.232.046 2.453.138 3.662a4.006 4.006 0 003.7 3.7 48.656 48.656 0 007.324 0 4.006 4.006 0 003.7-3.7c.017-.22.032-.441.046-.662M4.5 12l3 3m-3-3l-3 3" />
                </svg>
                Discover Random Term
              </button>
            </div>
          </div>
        </aside>
      </div>

      {/* Term Detail Modal */}
      <GlossaryTermDetail
        term={selectedTerm}
        isOpen={!!selectedTerm}
        onClose={() => setSelectedTerm(null)}
        onSelectRelated={(name) => {
          const allTermsList = terms as any[] | undefined;
          const found = allTermsList?.find((t: any) => t.term === name);
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
    <Suspense fallback={<div className="px-4 py-6 lg:px-5"><Skeleton variant="card" /></div>}>
      <GlossaryContent />
    </Suspense>
  );
}
