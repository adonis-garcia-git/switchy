"use client";

import { useState, useCallback } from "react";
import type { ToastData } from "@/components/ui/Toast";

let toastCounter = 0;

export function useToast() {
  const [toasts, setToasts] = useState<ToastData[]>([]);

  const showToast = useCallback(
    (opts: { message: string; variant: ToastData["variant"]; action?: ToastData["action"] }) => {
      const id = `toast-${++toastCounter}`;
      setToasts((prev) => [...prev, { id, ...opts }]);
    },
    []
  );

  const dismissToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  return { toasts, showToast, dismissToast };
}
