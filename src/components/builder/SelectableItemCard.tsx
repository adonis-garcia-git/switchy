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
        "group/card relative w-full text-left rounded-xl border transition-[border-color,box-shadow,background-color] duration-200",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/40 focus-visible:ring-offset-2 focus-visible:ring-offset-bg-primary",
        "active:scale-[0.98]",
        imageUrl ? "" : "p-4",
        selected
          ? "border-accent/60 bg-accent/[0.04] shadow-[0_0_20px_-4px_var(--color-accent-dim),0_4px_12px_-2px_rgba(0,0,0,0.3)]"
          : "border-border-subtle bg-bg-surface hover:border-border-default hover:bg-bg-elevated/50 hover:shadow-[0_4px_16px_-4px_rgba(0,0,0,0.25)]",
        disabled && "opacity-40 cursor-not-allowed",
        className
      )}
    >
      {imageUrl ? (
        <>
          {/* Hero image area */}
          <div className="aspect-[4/3] overflow-hidden rounded-t-xl relative">
            <img
              src={imageUrl}
              alt={imageAlt || ""}
              loading="lazy"
              className={cn(
                "w-full h-full object-cover transition-[filter,mix-blend-mode] duration-300",
                selected
                  ? ""
                  : "mix-blend-luminosity group-hover/card:mix-blend-normal"
              )}
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent" />

            {/* Selection indicator overlaid on image */}
            <div
              className={cn(
                "absolute top-3 right-3 w-5 h-5 rounded-full border-2 flex items-center justify-center transition-[border-color,background-color] duration-150 z-10",
                mode === "checkbox" && "rounded-md",
                selected
                  ? "border-accent bg-accent"
                  : "border-white/60 bg-black/30 backdrop-blur-sm"
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
          </div>

          {/* Content below image */}
          <div className="p-4">
            {children}
          </div>
        </>
      ) : (
        <>
          {/* Selection indicator (no image) */}
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
        </>
      )}
    </button>
  );
}
