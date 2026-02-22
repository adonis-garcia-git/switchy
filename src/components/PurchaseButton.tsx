"use client";

import { cn, generatePurchaseUrl } from "@/lib/utils";

interface PurchaseButtonProps {
  brand: string;
  name: string;
  productUrl?: string;
  type: "switch" | "keyboard";
  size?: "sm" | "md";
  className?: string;
}

export function PurchaseButton({
  brand,
  name,
  productUrl,
  type,
  size = "md",
  className,
}: PurchaseButtonProps) {
  const href = productUrl || generatePurchaseUrl(brand, name, type);
  const label = productUrl ? "Buy Now" : "Find on Amazon";

  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className={cn(
        "inline-flex items-center justify-center gap-1.5 font-semibold rounded-lg",
        "bg-accent text-bg-primary",
        "hover:bg-accent-hover",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/40 focus-visible:ring-offset-2 focus-visible:ring-offset-bg-primary",
        "active:scale-[0.97]",
        "transition-[background-color,transform,box-shadow] duration-150",
        "shadow-[0_1px_8px_rgba(232,89,12,0.15)]",
        "font-[family-name:var(--font-outfit)]",
        size === "sm" && "px-3 py-1.5 text-xs",
        size === "md" && "px-4 py-2.5 text-sm",
        className
      )}
    >
      {label}
      <svg
        className={cn(
          "shrink-0",
          size === "sm" ? "w-3 h-3" : "w-3.5 h-3.5"
        )}
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
        strokeWidth={2.5}
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M7 17L17 7M17 7H7M17 7v10"
        />
      </svg>
    </a>
  );
}
