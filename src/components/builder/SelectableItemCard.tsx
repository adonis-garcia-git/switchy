"use client";

import { cn } from "@/lib/utils";

interface SelectableItemCardProps {
  selected: boolean;
  onClick: () => void;
  mode?: "radio" | "checkbox";
  children: React.ReactNode;
  className?: string;
  disabled?: boolean;
}

export function SelectableItemCard({
  selected,
  onClick,
  mode = "radio",
  children,
  className,
  disabled,
}: SelectableItemCardProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className={cn(
        "relative w-full text-left rounded-xl border p-4 transition-[border-color,box-shadow,background-color] duration-200",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/40 focus-visible:ring-offset-2 focus-visible:ring-offset-bg-primary",
        "active:scale-[0.98]",
        selected
          ? "border-accent/60 bg-accent/[0.04] glow-accent"
          : "border-border-subtle bg-bg-surface hover:border-border-default hover:bg-bg-elevated/50",
        disabled && "opacity-40 cursor-not-allowed",
        className
      )}
    >
      {/* Selection indicator */}
      <div
        className={cn(
          "absolute top-3 right-3 w-5 h-5 rounded-full border-2 flex items-center justify-center transition-[border-color,background-color] duration-150",
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

      {children}
    </button>
  );
}
