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
      <div className="rounded-xl border border-border-default overflow-hidden shadow-surface">
        <div className="aspect-video bg-bg-elevated flex items-center justify-center">
          <div className="text-center">
            <div className="w-8 h-8 border-2 border-accent/30 border-t-accent rounded-full animate-spin mx-auto mb-3" />
            <p className="text-sm text-text-secondary">Generating visualization...</p>
            <p className="text-xs text-text-muted mt-1">This may take a moment</p>
          </div>
        </div>
      </div>
    );
  }

  if (imageUrl) {
    return (
      <>
        <div
          className="rounded-xl border border-border-default overflow-hidden cursor-pointer group shadow-surface"
          onClick={() => setFullscreen(true)}
        >
          <div className="relative">
            <img
              src={imageUrl}
              alt="Keyboard build visualization"
              className="w-full aspect-video object-cover group-hover:scale-[1.03] transition-transform duration-300"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex items-end justify-center pb-4">
              <span className="text-xs text-white/80 font-medium">Click to enlarge</span>
            </div>
          </div>
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
        className="w-full rounded-xl border border-dashed border-border-default bg-bg-elevated/50 p-6 text-center hover:border-accent/30 hover:bg-bg-elevated transition-[border-color,background-color] duration-200 group focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/40"
      >
        <div className="w-10 h-10 rounded-lg bg-accent/10 border border-accent/20 flex items-center justify-center mx-auto mb-3">
          <svg className="w-5 h-5 text-accent" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
        </div>
        <p className="text-sm font-medium text-text-secondary group-hover:text-accent transition-colors duration-200">
          Visualize This Build
        </p>
        <p className="text-xs text-text-muted mt-1">Generate an AI image of your keyboard</p>
      </button>
    );
  }

  return null;
}
