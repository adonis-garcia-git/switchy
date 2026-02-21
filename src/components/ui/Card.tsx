"use client";

import { cn } from "@/lib/utils";

interface CardProps {
  children: React.ReactNode;
  className?: string;
  variant?: "default" | "elevated" | "interactive";
  onClick?: () => void;
}

export function Card({ children, className, variant = "default", onClick }: CardProps) {
  return (
    <div
      onClick={onClick}
      className={cn(
        "rounded-xl border relative",
        variant === "default" && "bg-bg-surface border-border-default shadow-surface",
        variant === "elevated" && "bg-bg-elevated border-border-default shadow-elevated",
        variant === "interactive" &&
          "bg-bg-surface border-border-subtle shadow-surface hover:border-border-accent hover:glow-accent cursor-pointer transition-[border-color,box-shadow] duration-200",
        onClick && "cursor-pointer",
        className
      )}
    >
      {children}
    </div>
  );
}
