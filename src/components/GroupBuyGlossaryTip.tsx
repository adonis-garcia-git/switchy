"use client";

import { Tooltip } from "@/components/ui/Tooltip";

const TERM_DEFINITIONS: Record<string, string> = {
  IC: "Interest Check — a survey phase where designers gauge community demand before committing to production.",
  GB: "Group Buy — a community pre-order where buyers pay upfront and wait months for manufacturing and delivery.",
  MOQ: "Minimum Order Quantity — the minimum number of orders needed for the manufacturer to begin production.",
  Extras: "Leftover units from a fulfilled group buy, sold on a first-come-first-served basis. Ships immediately.",
  "In-stock": "Products available for immediate purchase and shipping, no group buy wait required.",
};

interface GroupBuyGlossaryTipProps {
  term: keyof typeof TERM_DEFINITIONS | string;
  children?: React.ReactNode;
}

export function GroupBuyGlossaryTip({ term, children }: GroupBuyGlossaryTipProps) {
  const definition = TERM_DEFINITIONS[term];
  if (!definition) return <>{children ?? term}</>;

  return (
    <Tooltip content={definition}>
      <span className="border-b border-dotted border-text-muted/40 cursor-help">
        {children ?? term}
      </span>
    </Tooltip>
  );
}
