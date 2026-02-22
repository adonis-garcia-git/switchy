"use client";

import { cn } from "@/lib/utils";

interface PaginationProps {
  page: number;
  totalPages: number;
  totalItems: number;
  rangeStart: number;
  rangeEnd: number;
  onPageChange: (page: number) => void;
  noun?: string;
}

function getVisiblePages(current: number, total: number): (number | "ellipsis")[] {
  if (total <= 7) return Array.from({ length: total }, (_, i) => i + 1);

  const pages: (number | "ellipsis")[] = [1];

  if (current <= 3) {
    pages.push(2, 3, 4, "ellipsis", total);
  } else if (current >= total - 2) {
    pages.push("ellipsis", total - 3, total - 2, total - 1, total);
  } else {
    pages.push("ellipsis", current - 1, current, current + 1, "ellipsis", total);
  }

  return pages;
}

export function Pagination({
  page,
  totalPages,
  totalItems,
  rangeStart,
  rangeEnd,
  onPageChange,
  noun = "items",
}: PaginationProps) {
  if (totalPages <= 1) return null;

  const visiblePages = getVisiblePages(page, totalPages);

  return (
    <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mt-8 pt-6 border-t border-border-subtle">
      {/* Range indicator */}
      <p className="text-xs text-text-muted tabular-nums order-2 sm:order-1">
        Showing{" "}
        <span className="text-text-secondary font-medium">{rangeStart}&ndash;{rangeEnd}</span>
        {" "}of{" "}
        <span className="text-text-secondary font-medium">{totalItems}</span>
        {" "}{noun}
      </p>

      {/* Page controls */}
      <nav className="flex items-center gap-1 order-1 sm:order-2" aria-label="Pagination">
        {/* Prev */}
        <button
          onClick={() => onPageChange(page - 1)}
          disabled={page === 1}
          aria-label="Previous page"
          className={cn(
            "w-8 h-8 flex items-center justify-center rounded-lg text-text-secondary transition-colors duration-150",
            "hover:text-text-primary hover:bg-bg-elevated",
            "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/40",
            "active:scale-[0.95]",
            "disabled:opacity-30 disabled:cursor-not-allowed disabled:hover:bg-transparent disabled:hover:text-text-secondary disabled:active:scale-100"
          )}
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
          </svg>
        </button>

        {/* Page numbers */}
        {visiblePages.map((p, i) =>
          p === "ellipsis" ? (
            <span
              key={`ellipsis-${i}`}
              className="w-8 h-8 flex items-center justify-center text-text-muted text-xs select-none"
            >
              &hellip;
            </span>
          ) : (
            <button
              key={p}
              onClick={() => onPageChange(p)}
              aria-label={`Page ${p}`}
              aria-current={p === page ? "page" : undefined}
              className={cn(
                "w-8 h-8 flex items-center justify-center rounded-lg text-xs font-medium tabular-nums transition-colors duration-150",
                "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/40",
                "active:scale-[0.95]",
                p === page
                  ? "bg-accent text-bg-primary shadow-[0_1px_6px_rgba(232,89,12,0.2)]"
                  : "text-text-secondary hover:text-text-primary hover:bg-bg-elevated"
              )}
            >
              {p}
            </button>
          )
        )}

        {/* Next */}
        <button
          onClick={() => onPageChange(page + 1)}
          disabled={page === totalPages}
          aria-label="Next page"
          className={cn(
            "w-8 h-8 flex items-center justify-center rounded-lg text-text-secondary transition-colors duration-150",
            "hover:text-text-primary hover:bg-bg-elevated",
            "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/40",
            "active:scale-[0.95]",
            "disabled:opacity-30 disabled:cursor-not-allowed disabled:hover:bg-transparent disabled:hover:text-text-secondary disabled:active:scale-100"
          )}
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
          </svg>
        </button>
      </nav>
    </div>
  );
}
