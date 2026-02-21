import { cn } from "@/lib/utils";

interface SkeletonProps {
  className?: string;
  variant?: "text" | "card" | "circle";
}

export function Skeleton({ className, variant = "text" }: SkeletonProps) {
  return (
    <div
      className={cn(
        "animate-pulse bg-bg-elevated",
        variant === "text" && "h-4 rounded",
        variant === "card" && "h-48 rounded-xl",
        variant === "circle" && "w-10 h-10 rounded-full",
        className
      )}
    />
  );
}
