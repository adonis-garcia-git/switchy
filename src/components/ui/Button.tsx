"use client";

import { cn } from "@/lib/utils";

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "ghost" | "danger";
  size?: "sm" | "md" | "lg";
  loading?: boolean;
}

export function Button({ children, variant = "primary", size = "md", loading, className, disabled, ...props }: ButtonProps) {
  return (
    <button
      disabled={disabled || loading}
      className={cn(
        "inline-flex items-center justify-center font-semibold rounded-lg transition-[background-color,transform,box-shadow] duration-150 disabled:opacity-40 disabled:cursor-not-allowed active:scale-[0.97] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/40 focus-visible:ring-offset-2 focus-visible:ring-offset-bg-primary",
        size === "sm" && "px-3 py-1.5 text-xs",
        size === "md" && "px-4 py-2 text-sm",
        size === "lg" && "px-6 py-3 text-base",
        variant === "primary" && "bg-accent text-bg-primary hover:bg-accent-hover shadow-[0_1px_8px_rgba(118,185,0,0.15)]",
        variant === "secondary" && "bg-bg-elevated text-text-primary border border-border-default hover:border-border-accent hover:bg-bg-floating",
        variant === "ghost" && "text-text-secondary hover:text-text-primary hover:bg-bg-elevated",
        variant === "danger" && "bg-red-500/10 text-red-400 border border-red-500/20 hover:bg-red-500/20",
        className
      )}
      {...props}
    >
      {loading && (
        <svg className="animate-spin -ml-1 mr-2 h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"></path>
        </svg>
      )}
      {children}
    </button>
  );
}
