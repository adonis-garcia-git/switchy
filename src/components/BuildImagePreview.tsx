"use client";

import { useState } from "react";
import { Modal } from "@/components/ui/Modal";

interface BuildImagePreviewProps {
  imageUrl?: string;
  loading?: boolean;
  onGenerate?: () => void;
  generating?: boolean;
}

export function BuildImagePreview({ imageUrl, loading, onGenerate, generating }: BuildImagePreviewProps) {
  const [fullscreen, setFullscreen] = useState(false);

  if (loading || generating) {
    return (
      <div className="rounded-xl border border-border-subtle overflow-hidden">
        <div className="aspect-video bg-bg-elevated flex items-center justify-center">
          <div className="text-center">
            <div className="w-8 h-8 border-2 border-accent/30 border-t-accent rounded-full animate-spin mx-auto mb-3" />
            <p className="text-sm text-text-muted animate-pulse">Generating visualization...</p>
          </div>
        </div>
      </div>
    );
  }

  if (imageUrl) {
    return (
      <>
        <div
          className="rounded-xl border border-border-subtle overflow-hidden cursor-pointer group"
          onClick={() => setFullscreen(true)}
        >
          <img
            src={imageUrl}
            alt="Keyboard build visualization"
            className="w-full aspect-video object-cover group-hover:scale-105 transition-transform duration-300"
          />
        </div>

        <Modal isOpen={fullscreen} onClose={() => setFullscreen(false)} size="lg">
          <img
            src={imageUrl}
            alt="Keyboard build visualization"
            className="w-full rounded-lg"
          />
        </Modal>
      </>
    );
  }

  if (onGenerate) {
    return (
      <button
        onClick={onGenerate}
        className="w-full rounded-xl border border-dashed border-border-default p-6 text-center hover:border-accent/30 transition-colors group"
      >
        <span className="text-2xl block mb-2">🎨</span>
        <p className="text-sm font-medium text-text-secondary group-hover:text-accent transition-colors">
          Visualize This Build
        </p>
        <p className="text-xs text-text-muted mt-1">Generate an AI image of your keyboard</p>
      </button>
    );
  }

  return null;
}
