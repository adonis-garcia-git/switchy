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
        "rounded-xl border",
        variant === "default" && "bg-bg-surface border-border-default",
        variant === "elevated" && "bg-bg-elevated border-border-default",
        variant === "interactive" && "bg-bg-surface border-border-subtle hover:border-accent/30 cursor-pointer transition-colors",
        onClick && "cursor-pointer",
        className
      )}
    >
      {children}
    </div>
  );
}
