"use client";

import { useState, useRef, useEffect, type ReactNode } from "react";
import { cn } from "@/lib/utils";

interface StudioAccordionProps {
  title: string;
  icon: ReactNode;
  defaultOpen?: boolean;
  children: ReactNode;
}

export function StudioAccordion({
  title,
  icon,
  defaultOpen = false,
  children,
}: StudioAccordionProps) {
  const [open, setOpen] = useState(defaultOpen);
  const contentRef = useRef<HTMLDivElement>(null);
  const [height, setHeight] = useState<number | undefined>(
    defaultOpen ? undefined : 0
  );

  useEffect(() => {
    if (!contentRef.current) return;
    if (open) {
      setHeight(contentRef.current.scrollHeight);
      // After transition, set to auto so content can resize
      const timer = setTimeout(() => setHeight(undefined), 200);
      return () => clearTimeout(timer);
    } else {
      // First set explicit height, then collapse
      setHeight(contentRef.current.scrollHeight);
      requestAnimationFrame(() => {
        requestAnimationFrame(() => setHeight(0));
      });
    }
  }, [open]);

  return (
    <div className="border-b border-border-subtle last:border-b-0">
      <button
        onClick={() => setOpen(!open)}
        className={cn(
          "flex items-center gap-2.5 w-full py-3 px-1 text-xs font-semibold uppercase tracking-wider",
          "transition-colors duration-150 rounded",
          "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/40",
          open
            ? "text-text-primary"
            : "text-text-secondary hover:text-text-primary"
        )}
      >
        <span className="w-4 h-4 flex items-center justify-center text-accent/70 shrink-0">
          {icon}
        </span>
        <span className="flex-1 text-left">{title}</span>
        <svg
          className={cn(
            "w-3 h-3 text-text-muted transition-transform duration-200",
            open && "rotate-180"
          )}
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth={2.5}
        >
          <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
        </svg>
      </button>
      <div
        ref={contentRef}
        className="overflow-hidden transition-[height] duration-200 ease-out"
        style={{ height: height !== undefined ? `${height}px` : "auto" }}
      >
        <div className="pb-4 space-y-3">{children}</div>
      </div>
    </div>
  );
}
