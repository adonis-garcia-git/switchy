"use client";

import { type ReactNode, useRef } from "react";
import Link from "next/link";

interface SimilarProductsProps {
  title: string;
  viewAllHref: string;
  children: ReactNode;
  isEmpty?: boolean;
}

export function SimilarProducts({ title, viewAllHref, children, isEmpty }: SimilarProductsProps) {
  const scrollRef = useRef<HTMLDivElement>(null);

  if (isEmpty) return null;

  const scroll = (direction: "left" | "right") => {
    if (!scrollRef.current) return;
    const amount = 320;
    scrollRef.current.scrollBy({
      left: direction === "left" ? -amount : amount,
      behavior: "smooth",
    });
  };

  return (
    <section className="mt-10">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-[family-name:var(--font-outfit)] font-semibold text-text-primary tracking-tight text-lg">
          {title}
        </h3>
        <div className="flex items-center gap-2">
          {/* Scroll controls */}
          <button
            onClick={() => scroll("left")}
            className="w-8 h-8 rounded-lg border border-border-subtle bg-bg-elevated flex items-center justify-center text-text-muted hover:text-text-primary hover:border-border-default transition-colors duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/40"
            aria-label="Scroll left"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          <button
            onClick={() => scroll("right")}
            className="w-8 h-8 rounded-lg border border-border-subtle bg-bg-elevated flex items-center justify-center text-text-muted hover:text-text-primary hover:border-border-default transition-colors duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/40"
            aria-label="Scroll right"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
            </svg>
          </button>
          <Link
            href={viewAllHref}
            className="text-sm text-accent hover:text-accent-hover font-medium transition-colors duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/40 rounded ml-1"
          >
            View All &rarr;
          </Link>
        </div>
      </div>

      <div
        ref={scrollRef}
        className="flex gap-4 overflow-x-auto pb-2 scrollbar-thin scrollbar-track-transparent scrollbar-thumb-border-subtle snap-x snap-mandatory"
        style={{ scrollbarWidth: "thin" }}
      >
        {children}
      </div>
    </section>
  );
}

/**
 * Wrapper for individual cards in the SimilarProducts horizontal scroll.
 * Sets a fixed width and snap alignment.
 */
export function SimilarProductItem({ children }: { children: ReactNode }) {
  return (
    <div className="w-[280px] shrink-0 snap-start">
      {children}
    </div>
  );
}
