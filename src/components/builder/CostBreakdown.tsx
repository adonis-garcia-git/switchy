"use client";

import { useMemo, useState } from "react";
import { cn, formatPriceWhole } from "@/lib/utils";
import type { BuildComponents } from "@/lib/types";

interface CostBreakdownProps {
  components: BuildComponents;
  total: number;
}

const COMPONENT_COLORS: Record<string, { bg: string; text: string }> = {
  keyboardKit: { bg: "bg-blue-400", text: "text-blue-400" },
  switches: { bg: "bg-amber-400", text: "text-amber-400" },
  keycaps: { bg: "bg-purple-400", text: "text-purple-400" },
  stabilizers: { bg: "bg-emerald-400", text: "text-emerald-400" },
};

const COMPONENT_LABELS: Record<string, string> = {
  keyboardKit: "Keyboard",
  switches: "Switches",
  keycaps: "Keycaps",
  stabilizers: "Stabilizers",
};

export function CostBreakdown({ components, total }: CostBreakdownProps) {
  const [hoveredSegment, setHoveredSegment] = useState<string | null>(null);

  const segments = useMemo(() => {
    const items: { key: string; price: number; pct: number }[] = [];
    if (components.keyboardKit?.price) {
      items.push({ key: "keyboardKit", price: components.keyboardKit.price, pct: 0 });
    }
    if (components.switches?.price) {
      const switchPrice = components.switches.quantity
        ? components.switches.quantity * components.switches.priceEach
        : components.switches.price;
      items.push({ key: "switches", price: switchPrice, pct: 0 });
    }
    if (components.keycaps?.price) {
      items.push({ key: "keycaps", price: components.keycaps.price, pct: 0 });
    }
    if (components.stabilizers?.price) {
      items.push({ key: "stabilizers", price: components.stabilizers.price, pct: 0 });
    }
    const sum = items.reduce((acc, i) => acc + i.price, 0) || 1;
    items.forEach((i) => { i.pct = (i.price / sum) * 100; });
    return items;
  }, [components]);

  return (
    <div className="space-y-2">
      {/* Stacked bar */}
      <div className="flex h-3 rounded-full overflow-hidden bg-bg-elevated">
        {segments.map((seg) => (
          <div
            key={seg.key}
            className={cn(
              "h-full transition-opacity duration-150 relative",
              COMPONENT_COLORS[seg.key]?.bg || "bg-text-muted",
              hoveredSegment && hoveredSegment !== seg.key ? "opacity-40" : "opacity-100"
            )}
            style={{ width: `${seg.pct}%` }}
            onMouseEnter={() => setHoveredSegment(seg.key)}
            onMouseLeave={() => setHoveredSegment(null)}
          />
        ))}
      </div>
      {/* Legend */}
      <div className="flex flex-wrap gap-x-4 gap-y-1">
        {segments.map((seg) => (
          <div
            key={seg.key}
            className="flex items-center gap-1.5 text-xs cursor-default"
            onMouseEnter={() => setHoveredSegment(seg.key)}
            onMouseLeave={() => setHoveredSegment(null)}
          >
            <div className={cn("w-2 h-2 rounded-full", COMPONENT_COLORS[seg.key]?.bg)} />
            <span className={cn(
              "transition-colors duration-150",
              hoveredSegment === seg.key ? (COMPONENT_COLORS[seg.key]?.text || "text-text-primary") : "text-text-muted"
            )}>
              {COMPONENT_LABELS[seg.key]} — {formatPriceWhole(seg.price)} ({Math.round(seg.pct)}%)
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
