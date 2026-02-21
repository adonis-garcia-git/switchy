"use client";

import { cn } from "@/lib/utils";
import { forwardRef } from "react";

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ className, ...props }, ref) => {
    return (
      <input
        ref={ref}
        className={cn(
          "w-full bg-bg-elevated border border-border-default rounded-lg px-4 py-2.5 text-sm text-text-primary placeholder:text-text-muted focus:border-accent/50 focus:outline-none transition-colors",
          className
        )}
        {...props}
      />
    );
  }
);
Input.displayName = "Input";

interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {}

export const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ className, ...props }, ref) => {
    return (
      <textarea
        ref={ref}
        className={cn(
          "w-full bg-bg-elevated border border-border-default rounded-lg px-4 py-3 text-sm text-text-primary placeholder:text-text-muted focus:border-accent/50 focus:outline-none transition-colors resize-none",
          className
        )}
        {...props}
      />
    );
  }
);
Textarea.displayName = "Textarea";
