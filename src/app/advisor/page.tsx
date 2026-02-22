"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function AdvisorRedirect() {
  const router = useRouter();

  useEffect(() => {
    router.replace("/builder");
  }, [router]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-bg-primary">
      <div className="text-center">
        <div className="w-8 h-8 border-2 border-accent/30 border-t-accent rounded-full animate-spin mx-auto mb-4" />
        <p className="text-sm text-text-muted">Redirecting to Builder...</p>
      </div>
    </div>
  );
}
