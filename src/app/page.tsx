"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useQuery } from "convex/react";
import { useUser } from "@clerk/nextjs";
import { api } from "../../convex/_generated/api";
import { SwitchCard } from "@/components/SwitchCard";
import { SponsoredBadge } from "@/components/SponsoredBadge";
import { Card } from "@/components/ui/Card";
import { PLACEHOLDER_QUERIES } from "@/lib/constants";

const CATEGORY_CARDS = [
  {
    title: "Switch Explorer",
    desc: "Filter and compare 120+ switches by feel, sound, and force",
    href: "/switches",
    image: "https://placehold.co/600x800/181818/333333?text=Switches",
  },
  {
    title: "Keyboard Kits",
    desc: "Browse 40+ keyboard kits from budget to endgame",
    href: "/keyboards",
    image: "https://placehold.co/600x800/181818/333333?text=Keyboards",
  },
  {
    title: "AI Builder",
    desc: "Describe your dream board, answer a few questions, get a complete build",
    href: "/builder",
    image: "https://placehold.co/600x800/181818/333333?text=AI+Builder",
  },
  {
    title: "Glossary",
    desc: "Learn every term in the hobby — from actuation to zealios",
    href: "/glossary",
    image: "https://placehold.co/600x800/181818/333333?text=Glossary",
  },
];

const HOW_IT_WORKS = [
  {
    step: "01",
    title: "Describe",
    desc: "Tell us the sound, feel, and budget you want — or take the guided quiz.",
  },
  {
    step: "02",
    title: "Get a Build",
    desc: "Our AI recommends a complete, compatible build with real products and prices.",
  },
  {
    step: "03",
    title: "Build with Confidence",
    desc: "Save your build, share it, and find every part at the best vendors.",
  },
];

export default function Home() {
  const router = useRouter();
  const { isSignedIn } = useUser();
  const [query, setQuery] = useState("");
  const [placeholderIndex, setPlaceholderIndex] = useState(0);

  const switches = useQuery(api.switches.list, {});
  const keyboards = useQuery(api.keyboards.list, {});
  const builds = useQuery(api.savedBuilds.listByUser, isSignedIn ? {} : "skip");
  const sponsoredProducts = useQuery(api.sponsorships.getActive, { placement: "homepage_spotlight" });

  const switchCount = switches?.length ?? 0;
  const keyboardCount = keyboards?.length ?? 0;

  const topSwitches = switches
    ? [...switches].sort((a, b) => (b.communityRating ?? 0) - (a.communityRating ?? 0)).slice(0, 3)
    : [];

  const recentBuilds = builds?.slice(0, 3) ?? [];

  useEffect(() => {
    const interval = setInterval(() => {
      setPlaceholderIndex((i) => (i + 1) % PLACEHOLDER_QUERIES.length);
    }, 4000);
    return () => clearInterval(interval);
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim()) return;
    router.push(`/builder?q=${encodeURIComponent(query.trim())}`);
  };

  const quickStarts = [
    { label: "I'm a beginner", query: "I'm new to mechanical keyboards and want an easy first build under $200 that sounds good" },
    { label: "I want thock", query: "I want the deepest, most thocky sound possible, budget doesn't matter" },
    { label: "I'm a gamer", query: "Best low-latency gaming keyboard with fast linear switches, under $250" },
    { label: "Budget build", query: "Cheapest possible custom keyboard that still sounds decent, under $100" },
  ];

  return (
    <div className="min-h-screen">
      {/* ── Section 1: Editorial Hero ── */}
      <section className="relative min-h-[80vh] lg:min-h-screen flex flex-col justify-center hero-gradient">
        <div className="grain" />
        <div className="relative z-10 max-w-5xl mx-auto px-6 pt-12 pb-16 lg:pt-0 lg:pb-24">
          <h1 className="text-5xl sm:text-6xl lg:text-7xl font-bold font-[family-name:var(--font-display)] tracking-tight leading-[1.05] mb-6">
            Build Your{" "}
            <span className="text-accent">Perfect</span>
            <br />
            Board
          </h1>
          <p className="text-base sm:text-lg text-text-secondary max-w-xl leading-[1.7] mb-10">
            Describe the sound and feel you want. Switchy&apos;s AI recommends
            a complete, compatible build — specific products, real prices, one click.
          </p>

          {/* AI Textarea CTA */}
          <form onSubmit={handleSubmit} className="relative max-w-2xl mb-8">
            <div className="rounded-xl bg-bg-surface border border-border-default shadow-elevated overflow-hidden">
              <div className="border-l-4 border-accent">
                <textarea
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder={PLACEHOLDER_QUERIES[placeholderIndex]}
                  rows={3}
                  className="w-full bg-transparent px-5 py-4 text-base text-text-primary placeholder:text-text-muted/50 resize-none focus:outline-none"
                />
                <div className="flex items-center justify-end px-5 pb-4">
                  <button
                    type="submit"
                    disabled={!query.trim()}
                    className="px-5 py-2 rounded-lg bg-accent text-bg-primary font-semibold text-sm hover:bg-accent-hover active:scale-[0.97] transition-[background-color,transform] duration-150 disabled:opacity-30 disabled:cursor-not-allowed focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/40 focus-visible:ring-offset-2 focus-visible:ring-offset-bg-primary shadow-accent-sm"
                  >
                    Build My Board
                  </button>
                </div>
              </div>
            </div>
          </form>

          {/* Quick Start Personas */}
          <div className="flex flex-wrap gap-2 mb-12">
            {quickStarts.map((qs) => (
              <button
                key={qs.label}
                onClick={() => router.push(`/builder?q=${encodeURIComponent(qs.query)}`)}
                className="px-4 py-2 rounded-full border border-border-default bg-transparent text-sm text-text-secondary hover:text-accent hover:border-border-accent transition-[color,border-color] duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/40 active:scale-[0.97]"
              >
                {qs.label}
              </button>
            ))}
          </div>

          {/* Stats Row */}
          <div className="flex items-center gap-4 text-xs text-text-muted font-mono tracking-wider">
            <span>{switchCount}+ Switches</span>
            <span className="text-border-default">/</span>
            <span>{keyboardCount}+ Keyboards</span>
            <span className="text-border-default">/</span>
            <span>AI Powered</span>
          </div>
        </div>
      </section>

      {/* ── Section 2: Explore Category Cards ── */}
      <section className="px-6 lg:px-8 py-16 lg:py-24">
        <div className="max-w-6xl mx-auto">
          <p className="text-xs font-semibold text-accent uppercase tracking-[0.2em] mb-3 font-mono">
            The Collection
          </p>
          <h2 className="text-4xl lg:text-5xl font-bold font-[family-name:var(--font-display)] tracking-tight mb-10">
            Explore
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {CATEGORY_CARDS.map((card) => (
              <button
                key={card.title}
                onClick={() => router.push(card.href)}
                className="group relative aspect-[3/4] rounded-xl overflow-hidden border border-border-subtle bg-bg-surface text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/40"
              >
                {/* Background Image */}
                <img
                  src={card.image}
                  alt={card.title}
                  className="absolute inset-0 w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                />
                {/* Gradient overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-black/15 to-transparent" />
                <div className="absolute inset-0 bg-accent/5 mix-blend-multiply opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                {/* Content at bottom */}
                <div className="absolute bottom-0 left-0 right-0 p-5">
                  <h3 className="text-lg font-semibold text-text-primary font-[family-name:var(--font-display)] tracking-tight mb-1 group-hover:text-accent transition-colors duration-200">
                    {card.title}
                  </h3>
                  <p className="text-sm text-text-secondary/80 leading-relaxed">
                    {card.desc}
                  </p>
                </div>
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* ── Sponsored Section ── */}
      {sponsoredProducts && sponsoredProducts.length > 0 && (
        <section className="px-6 lg:px-8 py-12 lg:py-16 border-t border-border-subtle">
          <div className="max-w-6xl mx-auto">
            <div className="flex items-center gap-3 mb-6">
              <SponsoredBadge />
              <h2 className="text-xl font-semibold font-[family-name:var(--font-display)] tracking-tight text-text-primary">
                Featured
              </h2>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {sponsoredProducts.map((sp: any) => {
                // Try to find matching switch data for a richer card
                const matchedSwitch = switches?.find(
                  (sw) => sw.name === sp.productName || `${sw.brand} ${sw.name}` === sp.productName
                );
                if (matchedSwitch) {
                  return <SwitchCard key={sp._id} sw={matchedSwitch} sponsored />;
                }
                // Fallback: simple card
                return (
                  <div
                    key={sp._id}
                    className="relative rounded-xl border border-amber-500/20 bg-bg-surface p-5 shadow-surface"
                  >
                    <div className="absolute top-3 left-3 z-10">
                      <SponsoredBadge />
                    </div>
                    <div className="pt-6">
                      <p className="text-[10px] text-text-muted uppercase tracking-wider mb-1">
                        {sp.vendorName}
                      </p>
                      <h3 className="text-base font-semibold text-text-primary font-[family-name:var(--font-outfit)]">
                        {sp.productName}
                      </h3>
                      {sp.productType && (
                        <p className="text-xs text-text-secondary mt-1">{sp.productType}</p>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </section>
      )}

      {/* ── Section 3: Featured Switches ── */}
      {topSwitches.length > 0 && (
        <section className="bg-bg-surface border-t border-border-subtle">
          <div className="max-w-6xl mx-auto px-6 lg:px-8 py-16 lg:py-24">
            <div className="flex items-end justify-between mb-8">
              <div>
                <p className="text-xs font-semibold text-accent uppercase tracking-[0.2em] mb-3 font-mono">
                  Community Favorites
                </p>
                <h2 className="text-3xl lg:text-4xl font-bold font-[family-name:var(--font-display)] tracking-tight">
                  Top Rated Switches
                </h2>
              </div>
              <button
                onClick={() => router.push("/switches")}
                className="hidden sm:inline-flex items-center gap-1.5 text-sm text-accent hover:text-accent-hover transition-colors duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/40 rounded px-2 py-1"
              >
                View all
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                </svg>
              </button>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {topSwitches.map((sw) => (
                <SwitchCard key={sw._id} sw={sw} />
              ))}
            </div>
            <button
              onClick={() => router.push("/switches")}
              className="sm:hidden mt-6 text-sm text-accent hover:text-accent-hover transition-colors duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/40 rounded"
            >
              View all switches →
            </button>
          </div>
        </section>
      )}

      {/* ── Section 4: How It Works ── */}
      <section className="px-6 lg:px-8 py-16 lg:py-24">
        <div className="max-w-6xl mx-auto">
          <p className="text-xs font-semibold text-accent uppercase tracking-[0.2em] mb-3 font-mono">
            How It Works
          </p>
          <h2 className="text-3xl lg:text-4xl font-bold font-[family-name:var(--font-display)] tracking-tight mb-12">
            Three Steps to Your Build
          </h2>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-0">
            {HOW_IT_WORKS.map((item, i) => (
              <div
                key={item.step}
                className="relative p-8 lg:p-10"
              >
                {/* Vertical divider on desktop */}
                {i > 0 && (
                  <div className="hidden lg:block absolute left-0 top-8 bottom-8 w-px bg-border-subtle" />
                )}
                {/* Horizontal divider on mobile */}
                {i > 0 && (
                  <div className="lg:hidden absolute left-8 right-8 top-0 h-px bg-border-subtle" />
                )}
                <span className="block text-6xl font-bold font-[family-name:var(--font-display)] text-accent/20 leading-none mb-4">
                  {item.step}
                </span>
                <h3 className="text-xl font-semibold font-[family-name:var(--font-display)] tracking-tight text-text-primary mb-2">
                  {item.title}
                </h3>
                <p className="text-sm text-text-secondary leading-[1.7]">
                  {item.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Section 5: Recent Builds (authenticated) ── */}
      {isSignedIn && recentBuilds.length > 0 && (
        <section className="px-6 lg:px-8 py-12 lg:py-16">
          <div className="max-w-6xl mx-auto">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-semibold text-text-primary font-[family-name:var(--font-display)] tracking-tight">
                Your Recent Builds
              </h2>
              <button
                onClick={() => router.push("/builds")}
                className="text-sm text-accent hover:text-accent-hover transition-colors duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/40 rounded px-2 py-1"
              >
                View all →
              </button>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {recentBuilds.map((build: any) => (
                <Card key={build._id} variant="interactive" onClick={() => router.push("/builds")} className="p-5">
                  <h4 className="font-medium text-text-primary truncate">{build.buildName}</h4>
                  <p className="text-sm text-text-muted mt-1 line-clamp-2">{build.summary}</p>
                  <p className="text-sm font-mono text-accent mt-3">${build.estimatedTotal}</p>
                </Card>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ── Section 6: Bottom CTA Banner ── */}
      <section className="bg-bg-elevated relative overflow-hidden">
        <div className="grain" />
        <div className="absolute inset-0 bg-gradient-to-br from-accent/5 via-transparent to-transparent" />
        <div className="relative z-10 max-w-4xl mx-auto px-6 py-20 lg:py-28 text-center">
          <h2 className="text-4xl sm:text-5xl lg:text-6xl font-bold font-[family-name:var(--font-display)] tracking-tight mb-5">
            Ready to Build?
          </h2>
          <p className="text-base text-text-secondary max-w-lg mx-auto mb-10 leading-[1.7]">
            Start with the AI builder or dive into the glossary to learn every term in the hobby.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
            <button
              onClick={() => router.push("/builder")}
              className="px-6 py-3 rounded-lg bg-accent text-bg-primary font-semibold text-base hover:bg-accent-hover active:scale-[0.97] transition-[background-color,transform] duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/40 focus-visible:ring-offset-2 focus-visible:ring-offset-bg-elevated shadow-accent-sm"
            >
              Start Building
            </button>
            <button
              onClick={() => router.push("/glossary")}
              className="px-6 py-3 rounded-lg bg-transparent border border-border-default text-text-secondary font-semibold text-base hover:text-text-primary hover:border-border-accent transition-[color,border-color] duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/40 active:scale-[0.97]"
            >
              Browse the Glossary
            </button>
          </div>
        </div>
      </section>
    </div>
  );
}
