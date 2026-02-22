"use client";

import { cn } from "@/lib/utils";

interface SelectableItemCardProps {
  selected: boolean;
  onClick: () => void;
  mode?: "radio" | "checkbox";
  children: React.ReactNode;
  className?: string;
  disabled?: boolean;
  imageUrl?: string;
  imageAlt?: string;
}

export function SelectableItemCard({
  selected,
  onClick,
  mode = "radio",
  children,
  className,
  disabled,
  imageUrl,
  imageAlt,
}: SelectableItemCardProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className={cn(
        "relative w-full text-left rounded-xl border p-4 transition-[border-color,box-shadow,background-color,transform] duration-200",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/40 focus-visible:ring-offset-2 focus-visible:ring-offset-bg-primary",
        "active:scale-[0.98]",
        selected
          ? "border-accent/60 bg-accent/[0.04] glow-accent"
          : "border-border-subtle bg-bg-surface hover:border-border-default hover:bg-bg-elevated/50 hover:translate-y-[-1px]",
        disabled && "opacity-40 cursor-not-allowed hover:translate-y-0",
        className
      )}
    >
      {/* Selection indicator */}
      <div
        className={cn(
          "absolute top-3 right-3 w-5 h-5 rounded-full border-2 flex items-center justify-center transition-[border-color,background-color] duration-150 z-10",
          mode === "checkbox" && "rounded-md",
          selected
            ? "border-accent bg-accent"
            : "border-border-default bg-bg-surface"
        )}
      >
        {selected && (
          <svg
            className="w-3 h-3 text-bg-primary"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            strokeWidth={3}
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M5 13l4 4L19 7"
            />
          </svg>
        )}
      </div>

      {imageUrl ? (
        <div className="flex gap-3.5">
          {/* Product image */}
          <div className="w-20 h-20 rounded-lg bg-bg-elevated border border-border-subtle overflow-hidden shrink-0 relative">
            <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent z-[1]" />
            <img
              src={imageUrl}
              alt={imageAlt || ""}
              className="w-full h-full object-cover"
              loading="lazy"
            />
          </div>
          {/* Content beside image */}
          <div className="flex-1 min-w-0">
            {children}
          </div>
        </div>
      ) : (
        children
      )}
    </button>
  );
}
