"use client";

import { useCallback } from "react";
import { useRouter } from "next/navigation";
import { cn } from "@/lib/utils";
import { encodeStudioConfig } from "@/lib/studioShare";
import type { KeyboardViewerConfig } from "@/lib/keyboard3d";

interface StudioActionBarProps {
  config: KeyboardViewerConfig;
  onShareToast: () => void;
  onOverridesExcludedToast: () => void;
  className?: string;
}

export function StudioActionBar({
  config,
  onShareToast,
  onOverridesExcludedToast,
  className,
}: StudioActionBarProps) {
  const router = useRouter();

  const handleShare = useCallback(() => {
    const { encoded, overridesExcluded } = encodeStudioConfig(config);
    const url = `${window.location.origin}/studio?c=${encoded}`;
    navigator.clipboard.writeText(url).then(() => {
      onShareToast();
      if (overridesExcluded) {
        onOverridesExcludedToast();
      }
    });
  }, [config, onShareToast, onOverridesExcludedToast]);

  const handleBuildThis = useCallback(() => {
    const { encoded } = encodeStudioConfig(config);
    router.push(`/builder?mode=custom&studio=${encoded}`);
  }, [config, router]);

  return (
    <div className={cn(
      "flex items-center gap-3",
      className
    )}>
      {/* Share */}
      <button
        onClick={handleShare}
        className={cn(
          "flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold",
          "bg-white/[0.06] border border-white/[0.1] text-text-primary backdrop-blur-md",
          "hover:bg-white/[0.1] hover:border-white/[0.16] active:scale-[0.97]",
          "transition-[background-color,border-color,transform] duration-150",
          "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/40"
        )}
      >
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
        </svg>
        Share
      </button>

      {/* Build This */}
      <button
        onClick={handleBuildThis}
        className={cn(
          "flex-1 flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold",
          "bg-accent text-bg-primary shadow-[0_2px_16px_rgba(232,89,12,0.25)]",
          "hover:bg-accent-hover active:scale-[0.97]",
          "transition-[background-color,transform] duration-150",
          "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/50"
        )}
      >
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z" />
        </svg>
        Build This
      </button>
    </div>
  );
}
