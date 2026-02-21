import { cn } from "@/lib/utils";

interface BadgeProps {
  children: React.ReactNode;
  variant?: "default" | "linear" | "tactile" | "clicky" | "success" | "warning" | "info";
  size?: "sm" | "md";
  className?: string;
}

export function Badge({ children, variant = "default", size = "sm", className }: BadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center font-medium rounded-full",
        size === "sm" && "px-2 py-0.5 text-xs",
        size === "md" && "px-3 py-1 text-sm",
        variant === "default" && "bg-bg-elevated text-text-secondary",
        variant === "linear" && "bg-linear/10 text-linear border border-linear/20",
        variant === "tactile" && "bg-tactile/10 text-tactile border border-tactile/20",
        variant === "clicky" && "bg-clicky/10 text-clicky border border-clicky/20",
        variant === "success" && "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20",
        variant === "warning" && "bg-warning/10 text-warning border border-warning/20",
        variant === "info" && "bg-accent/10 text-accent border border-accent/20",
        className
      )}
    >
      {children}
    </span>
  );
}
