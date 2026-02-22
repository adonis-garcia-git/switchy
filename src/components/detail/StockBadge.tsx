interface StockBadgeProps {
  inStock?: boolean;
}

export function StockBadge({ inStock }: StockBadgeProps) {
  return (
    <span className="inline-flex items-center gap-1.5 text-xs font-medium">
      <span
        className={`w-2 h-2 rounded-full ${
          inStock
            ? "bg-emerald-400 shadow-[0_0_6px_rgba(52,211,153,0.5)]"
            : "bg-amber-400 shadow-[0_0_6px_rgba(251,191,36,0.4)]"
        }`}
      />
      <span className={inStock ? "text-emerald-400" : "text-amber-400"}>
        {inStock ? "In Stock" : "Check Availability"}
      </span>
    </span>
  );
}
