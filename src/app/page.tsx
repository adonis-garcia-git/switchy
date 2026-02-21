"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useQuery } from "convex/react";
import { useUser } from "@clerk/nextjs";
import { api } from "../../convex/_generated/api";
import { SwitchCard } from "@/components/SwitchCard";
import { Card } from "@/components/ui/Card";
import { PLACEHOLDER_QUERIES } from "@/lib/constants";

export default function Home() {
  const router = useRouter();
  const { isSignedIn } = useUser();
  const [query, setQuery] = useState("");
  const [placeholderIndex, setPlaceholderIndex] = useState(0);

  const switches = useQuery(api.switches.list, {});
  const keyboards = useQuery(api.keyboards.list, {});
  const builds = useQuery(api.savedBuilds.listByUser, isSignedIn ? {} : "skip");

  const switchCount = switches?.length ?? 0;
  const keyboardCount = keyboards?.length ?? 0;

  // Get top-rated switches
  const topSwitches = switches
    ? [...switches].sort((a, b) => b.communityRating - a.communityRating).slice(0, 6)
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
    router.push(`/advisor?q=${encodeURIComponent(query.trim())}`);
  };

  const quickStarts = [
    { label: "I'm a beginner", query: "I'm new to mechanical keyboards and want an easy first build under $200 that sounds good", emoji: "🌱" },
    { label: "I want thock", query: "I want the deepest, most thocky sound possible, budget doesn't matter", emoji: "🔊" },
    { label: "I'm a gamer", query: "Best low-latency gaming keyboard with fast linear switches, under $250", emoji: "🎮" },
    { label: "Budget build", query: "Cheapest possible custom keyboard that still sounds decent, under $100", emoji: "💰" },
  ];

  return (
    <div className="min-h-screen p-6 lg:p-8">
      {/* Hero */}
      <div className="max-w-4xl mx-auto text-center mb-12 pt-4 lg:pt-8">
        <h1 className="text-4xl sm:text-5xl font-bold tracking-tight mb-4">
          Build your dream <span className="text-accent">keyboard</span>
        </h1>
        <p className="text-lg text-text-secondary max-w-2xl mx-auto mb-8">
          Describe the sound and feel you want. Switchy&apos;s AI will recommend a complete, compatible build with specific products and prices.
        </p>

        <form onSubmit={handleSubmit} className="relative max-w-2xl mx-auto mb-6">
          <textarea
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder={PLACEHOLDER_QUERIES[placeholderIndex]}
            rows={3}
            className="w-full bg-bg-surface border border-border-default rounded-xl px-5 py-4 text-lg text-text-primary placeholder:text-text-muted/50 resize-none focus:border-accent/50 transition-colors"
          />
          <button
            type="submit"
            disabled={!query.trim()}
            className="absolute bottom-4 right-4 px-5 py-2 rounded-lg bg-accent text-bg-primary font-semibold text-sm hover:bg-accent-hover transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
          >
            Build My Board
          </button>
        </form>

        {/* Quick Start Personas */}
        <div className="flex flex-wrap justify-center gap-2">
          {quickStarts.map((qs) => (
            <button
              key={qs.label}
              onClick={() => router.push(`/advisor?q=${encodeURIComponent(qs.query)}`)}
              className="px-4 py-2 rounded-full bg-bg-surface border border-border-subtle text-sm text-text-secondary hover:text-accent hover:border-accent/30 transition-colors"
            >
              <span className="mr-1.5">{qs.emoji}</span>
              {qs.label}
            </button>
          ))}
        </div>
      </div>

      {/* Stats */}
      <div className="max-w-4xl mx-auto grid grid-cols-2 sm:grid-cols-4 gap-3 mb-12">
        <div className="rounded-xl border border-border-subtle bg-bg-surface p-4 text-center">
          <p className="text-2xl font-bold font-mono text-accent">{switchCount}</p>
          <p className="text-xs text-text-muted mt-1">Switches</p>
        </div>
        <div className="rounded-xl border border-border-subtle bg-bg-surface p-4 text-center">
          <p className="text-2xl font-bold font-mono text-accent">{keyboardCount}</p>
          <p className="text-xs text-text-muted mt-1">Keyboards</p>
        </div>
        <div className="rounded-xl border border-border-subtle bg-bg-surface p-4 text-center">
          <p className="text-2xl font-bold font-mono text-accent">AI</p>
          <p className="text-xs text-text-muted mt-1">Powered</p>
        </div>
        <div className="rounded-xl border border-border-subtle bg-bg-surface p-4 text-center">
          <p className="text-2xl font-bold font-mono text-accent">34</p>
          <p className="text-xs text-text-muted mt-1">Components</p>
        </div>
      </div>

      {/* Trending Switches */}
      {topSwitches.length > 0 && (
        <div className="max-w-6xl mx-auto mb-12">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold text-text-primary">Top Rated Switches</h2>
            <button
              onClick={() => router.push("/switches")}
              className="text-sm text-accent hover:text-accent-hover transition-colors"
            >
              View all →
            </button>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {topSwitches.map((sw) => (
              <SwitchCard key={sw._id} sw={sw} />
            ))}
          </div>
        </div>
      )}

      {/* Quick Actions */}
      <div className="max-w-4xl mx-auto grid grid-cols-1 sm:grid-cols-3 gap-4 mb-12">
        <Card variant="interactive" onClick={() => router.push("/wizard")} className="p-6">
          <span className="text-2xl mb-2 block">🧙</span>
          <h3 className="font-semibold text-text-primary mb-1">Take the Quiz</h3>
          <p className="text-sm text-text-muted">Answer a few questions and get a personalized build recommendation.</p>
        </Card>
        <Card variant="interactive" onClick={() => router.push("/switches")} className="p-6">
          <span className="text-2xl mb-2 block">🔘</span>
          <h3 className="font-semibold text-text-primary mb-1">Explore Switches</h3>
          <p className="text-sm text-text-muted">Browse, filter, and compare 85+ mechanical switches.</p>
        </Card>
        <Card variant="interactive" onClick={() => router.push("/keyboards")} className="p-6">
          <span className="text-2xl mb-2 block">⌨️</span>
          <h3 className="font-semibold text-text-primary mb-1">Browse Keyboards</h3>
          <p className="text-sm text-text-muted">Find the perfect keyboard kit for your custom build.</p>
        </Card>
      </div>

      {/* Recent Builds (signed in only) */}
      {isSignedIn && recentBuilds.length > 0 && (
        <div className="max-w-4xl mx-auto mb-12">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold text-text-primary">Your Recent Builds</h2>
            <button
              onClick={() => router.push("/builds")}
              className="text-sm text-accent hover:text-accent-hover transition-colors"
            >
              View all →
            </button>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {recentBuilds.map((build: any) => (
              <Card key={build._id} variant="interactive" onClick={() => router.push("/builds")} className="p-4">
                <h4 className="font-medium text-text-primary truncate">{build.buildName}</h4>
                <p className="text-sm text-text-muted mt-1 line-clamp-2">{build.summary}</p>
                <p className="text-sm font-mono text-accent mt-2">${build.estimatedTotal}</p>
              </Card>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
