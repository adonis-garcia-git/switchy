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
          "w-full bg-bg-surface border border-border-default rounded-lg px-4 py-2.5 text-sm text-text-primary placeholder:text-text-muted/60 focus:border-border-accent focus:outline-none transition-[border-color,box-shadow] duration-150",
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
          "w-full bg-bg-surface border border-border-default rounded-lg px-4 py-3 text-sm text-text-primary placeholder:text-text-muted/60 focus:border-border-accent focus:outline-none transition-[border-color,box-shadow] duration-150 resize-none",
          className
        )}
        {...props}
      />
    );
  }
);
Textarea.displayName = "Textarea";
