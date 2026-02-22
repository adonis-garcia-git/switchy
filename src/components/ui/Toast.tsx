"use client";

import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";

export interface ToastData {
  id: string;
  message: string;
  variant: "error" | "success" | "info";
  action?: { label: string; onClick: () => void };
}

interface ToastProps {
  toast: ToastData;
  onDismiss: (id: string) => void;
}

function ToastItem({ toast, onDismiss }: ToastProps) {
  const [isExiting, setIsExiting] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsExiting(true);
      setTimeout(() => onDismiss(toast.id), 200);
    }, 5000);
    return () => clearTimeout(timer);
  }, [toast.id, onDismiss]);

  const handleDismiss = () => {
    setIsExiting(true);
    setTimeout(() => onDismiss(toast.id), 200);
  };

  const variantStyles = {
    error: "border-red-500/30 bg-red-500/10",
    success: "border-emerald-500/30 bg-emerald-500/10",
    info: "border-accent/30 bg-accent/10",
  };

  const iconPaths = {
    error: "M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z",
    success: "M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z",
    info: "M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z",
  };

  const iconColors = {
    error: "text-red-400",
    success: "text-emerald-400",
    info: "text-accent",
  };

  return (
    <div
      className={cn(
        "flex items-start gap-3 px-4 py-3 rounded-xl border backdrop-blur-md shadow-lg max-w-sm w-full",
        "transition-[opacity,transform] duration-200",
        variantStyles[toast.variant],
        isExiting ? "opacity-0 translate-y-2" : "opacity-100 translate-y-0"
      )}
    >
      <svg className={cn("w-5 h-5 shrink-0 mt-0.5", iconColors[toast.variant])} fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={iconPaths[toast.variant]} />
      </svg>
      <div className="flex-1 min-w-0">
        <p className="text-sm text-text-primary">{toast.message}</p>
        {toast.action && (
          <button
            onClick={toast.action.onClick}
            className="text-xs font-semibold text-accent hover:text-accent-hover mt-1 transition-colors duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/40 rounded"
          >
            {toast.action.label}
          </button>
        )}
      </div>
      <button
        onClick={handleDismiss}
        className="text-text-muted hover:text-text-primary shrink-0 transition-colors duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/40 rounded p-0.5"
      >
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
        </svg>
      </button>
    </div>
  );
}

interface ToastContainerProps {
  toasts: ToastData[];
  onDismiss: (id: string) => void;
}

export function ToastContainer({ toasts, onDismiss }: ToastContainerProps) {
  if (toasts.length === 0) return null;

  return (
    <div className="fixed bottom-6 right-6 z-[60] flex flex-col-reverse gap-2">
      {toasts.map((toast) => (
        <ToastItem key={toast.id} toast={toast} onDismiss={onDismiss} />
      ))}
    </div>
  );
}
