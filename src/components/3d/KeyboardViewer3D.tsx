"use client";

import { useState, useEffect, Component, type ReactNode } from "react";
import dynamic from "next/dynamic";
import { ViewerLoadingState } from "./ViewerLoadingState";
import type { KeyboardViewerConfig } from "@/lib/keyboard3d";

const KeyboardScene = dynamic(
  () => import("./KeyboardScene").then((mod) => ({ default: mod.KeyboardScene })),
  { ssr: false, loading: () => <ViewerLoadingState /> }
);

// Error boundary for WebGL context loss
class WebGLErrorBoundary extends Component<
  { children: ReactNode; fallback?: ReactNode },
  { hasError: boolean }
> {
  constructor(props: { children: ReactNode; fallback?: ReactNode }) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  render() {
    if (this.state.hasError) {
      return (
        this.props.fallback || (
          <div className="rounded-xl border border-border-default bg-bg-elevated/50 flex items-center justify-center p-8">
            <p className="text-sm text-text-muted">3D viewer unavailable. Your browser may not support WebGL.</p>
          </div>
        )
      );
    }
    return this.props.children;
  }
}

function checkWebGLSupport(): boolean {
  if (typeof window === "undefined") return false;
  try {
    const canvas = document.createElement("canvas");
    return !!(
      canvas.getContext("webgl2") || canvas.getContext("webgl")
    );
  } catch {
    return false;
  }
}

interface KeyboardViewer3DProps {
  config: KeyboardViewerConfig;
  height?: string;
  autoRotate?: boolean;
  fallback?: ReactNode;
  className?: string;
}

export function KeyboardViewer3D({
  config,
  height = "300px",
  autoRotate = true,
  fallback,
  className = "",
}: KeyboardViewer3DProps) {
  const [webglSupported, setWebglSupported] = useState<boolean | null>(null);

  useEffect(() => {
    setWebglSupported(checkWebGLSupport());
  }, []);

  // Still checking
  if (webglSupported === null) {
    return <ViewerLoadingState height={height} />;
  }

  // No WebGL — show fallback
  if (!webglSupported) {
    return (
      fallback ? (
        <>{fallback}</>
      ) : (
        <div
          className="rounded-xl border border-border-default bg-bg-elevated/50 flex items-center justify-center"
          style={{ height }}
        >
          <p className="text-sm text-text-muted">3D viewer requires WebGL support.</p>
        </div>
      )
    );
  }

  return (
    <WebGLErrorBoundary fallback={fallback}>
      <div
        className={`rounded-xl border border-border-default bg-bg-elevated/30 overflow-hidden relative group ${className}`}
        style={{ height }}
      >
        <KeyboardScene config={config} autoRotate={autoRotate} />

        {/* Interaction hint */}
        <div className="absolute bottom-2 left-1/2 -translate-x-1/2 px-3 py-1 rounded-full bg-black/50 backdrop-blur-sm border border-white/10 text-[10px] text-white/50 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none">
          Drag to rotate &middot; Scroll to zoom
        </div>
      </div>
    </WebGLErrorBoundary>
  );
}
