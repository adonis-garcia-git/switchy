"use client";

import { useQuery } from "convex/react";
import { api } from "../../convex/_generated/api";
import { Skeleton } from "@/components/ui/Skeleton";

interface DigestSection {
  title: string;
  icon: React.ReactNode;
  content: string | null;
  items?: Array<{ title: string; snippet?: string; url?: string }>;
}

export function WeeklyDigest() {
  const digest = useQuery(api.weeklyDigest.getLatest);

  // Don't render if no digest exists yet
  if (digest === undefined) {
    return (
      <section className="px-6 lg:px-8 py-16 lg:py-20">
        <div className="max-w-7xl mx-auto">
          <Skeleton className="h-8 w-64 mb-6" />
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Skeleton variant="card" />
            <Skeleton variant="card" />
          </div>
        </div>
      </section>
    );
  }

  if (digest === null) return null;

  const sections: DigestSection[] = [
    {
      title: "Trending This Week",
      icon: (
        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
        </svg>
      ),
      content: typeof digest.trending === "string" ? digest.trending : null,
    },
    {
      title: "Group Buy Updates",
      icon: (
        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
        </svg>
      ),
      content:
        typeof digest.groupBuyUpdates === "string"
          ? digest.groupBuyUpdates
          : null,
    },
    {
      title: "Price Drops",
      icon: (
        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      ),
      content: null,
      items: Array.isArray(digest.priceChanges)
        ? (
            digest.priceChanges as Array<{
              title: string;
              snippet?: string;
              url?: string;
            }>
          ).slice(0, 5)
        : [],
    },
  ];

  const hasSomeContent = sections.some(
    (s) => s.content || (s.items && s.items.length > 0)
  );
  if (!hasSomeContent) return null;

  return (
    <section className="px-6 lg:px-8 py-16 lg:py-20">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex items-center gap-6 mb-3">
          <p className="text-xs font-semibold text-accent uppercase tracking-[0.2em] font-mono shrink-0">
            Week of {digest.weekKey}
          </p>
          <div className="flex-1 h-px bg-border-subtle" />
        </div>
        <h2 className="text-3xl lg:text-4xl font-bold font-[family-name:var(--font-display)] tracking-tight mb-8">
          This Week in Keyboards
        </h2>

        {/* Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {sections.map((section) => {
            if (!section.content && (!section.items || section.items.length === 0))
              return null;

            return (
              <div
                key={section.title}
                className="rounded-xl border border-border-subtle bg-bg-surface p-5 shadow-surface"
              >
                <div className="flex items-center gap-2.5 mb-4">
                  <div className="w-8 h-8 rounded-lg bg-accent/10 flex items-center justify-center text-accent">
                    {section.icon}
                  </div>
                  <h3 className="text-sm font-semibold font-[family-name:var(--font-display)] text-text-primary">
                    {section.title}
                  </h3>
                </div>

                {section.content && (
                  <p className="text-sm text-text-secondary leading-[1.7] line-clamp-6">
                    {section.content}
                  </p>
                )}

                {section.items && section.items.length > 0 && (
                  <ul className="space-y-2">
                    {section.items.map((item, i) => (
                      <li key={i} className="text-sm">
                        {item.url ? (
                          <a
                            href={item.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-accent hover:text-accent-hover transition-colors duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/40 rounded"
                          >
                            {item.title}
                          </a>
                        ) : (
                          <span className="text-text-primary">{item.title}</span>
                        )}
                        {item.snippet && (
                          <p className="text-xs text-text-muted mt-0.5 line-clamp-2">
                            {item.snippet}
                          </p>
                        )}
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
