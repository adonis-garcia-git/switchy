"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useQuery } from "convex/react";
import { api } from "../../convex/_generated/api";
import { Navigation } from "@/components/Navigation";
import { PLACEHOLDER_QUERIES } from "@/lib/constants";

export default function Home() {
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [placeholderIndex, setPlaceholderIndex] = useState(0);

  const switches = useQuery(api.switches.list, {});
  const switchCount = switches?.length ?? 0;

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

  return (
    <div className="min-h-screen">
      <Navigation />

      {/* Hero */}
      <main className="max-w-4xl mx-auto px-4 pt-20 pb-16">
        <div className="text-center mb-12">
          <h1 className="text-4xl sm:text-5xl font-bold tracking-tight mb-4">
            Build your dream{" "}
            <span className="text-accent">keyboard</span>
          </h1>
          <p className="text-lg text-text-secondary max-w-2xl mx-auto">
            Describe the sound and feel you want. Switchy&apos;s AI will recommend
            a complete, compatible build with specific products and prices.
          </p>
        </div>

        {/* Build Advisor Input */}
        <form onSubmit={handleSubmit} className="relative mb-16">
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

        {/* Quick Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-16">
          <div className="rounded-xl border border-border-subtle bg-bg-surface p-5 text-center">
            <p className="text-3xl font-bold font-mono text-accent">
              {switchCount}
            </p>
            <p className="text-sm text-text-muted mt-1">Switches in Database</p>
          </div>
          <div className="rounded-xl border border-border-subtle bg-bg-surface p-5 text-center">
            <p className="text-3xl font-bold font-mono text-accent">AI</p>
            <p className="text-sm text-text-muted mt-1">Powered Build Advisor</p>
          </div>
          <div className="rounded-xl border border-border-subtle bg-bg-surface p-5 text-center">
            <p className="text-3xl font-bold font-mono text-accent">25+</p>
            <p className="text-sm text-text-muted mt-1">Keyboard Kits</p>
          </div>
        </div>

        {/* Quick Links */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <button
            onClick={() => router.push("/switches")}
            className="group rounded-xl border border-border-subtle bg-bg-surface p-6 text-left hover:border-accent/30 transition-colors"
          >
            <h3 className="font-semibold text-text-primary group-hover:text-accent transition-colors mb-1">
              Switch Explorer
            </h3>
            <p className="text-sm text-text-muted">
              Browse, filter, and compare mechanical keyboard switches
            </p>
          </button>
          <button
            onClick={() => router.push("/group-buys")}
            className="group rounded-xl border border-border-subtle bg-bg-surface p-6 text-left hover:border-accent/30 transition-colors"
          >
            <h3 className="font-semibold text-text-primary group-hover:text-accent transition-colors mb-1">
              Group Buy Tracker
            </h3>
            <p className="text-sm text-text-muted">
              Track your pending keyboard orders and group buys
            </p>
          </button>
        </div>
      </main>
    </div>
  );
}
