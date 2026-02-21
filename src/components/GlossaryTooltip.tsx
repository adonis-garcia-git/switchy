"use client";

import { useGlossary } from "./GlossaryProvider";
import { Tooltip } from "@/components/ui/Tooltip";
import Link from "next/link";

interface GlossaryTooltipProps {
  term: string;
  children: React.ReactNode;
}

export function GlossaryTooltip({ term, children }: GlossaryTooltipProps) {
  const { getTerm } = useGlossary();
  const glossaryEntry = getTerm(term);

  if (!glossaryEntry) {
    return <>{children}</>;
  }

  return (
    <Tooltip content={glossaryEntry.definition}>
      <Link
        href={`/glossary?term=${encodeURIComponent(term)}`}
        className="underline decoration-dotted decoration-text-muted/40 hover:decoration-accent transition-colors cursor-help"
        onClick={(e) => e.stopPropagation()}
      >
        {children}
      </Link>
    </Tooltip>
  );
}
