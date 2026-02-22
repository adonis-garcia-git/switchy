"use client";

import { useState, useEffect, memo, Component, type ReactNode } from "react";
import dynamic from "next/dynamic";
import { ViewerLoadingState } from "./ViewerLoadingState";
import { cn } from "@/lib/utils";
import type { KeyboardViewerConfig } from "@/lib/keyboard3d";
import type { SelectionMode } from "@/lib/keyCustomization";

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
  interactive?: boolean;
  onKeyPress?: (legend: string) => void;
  selectionMode?: SelectionMode;
  selectedKeys?: Set<string>;
  onKeySelect?: (keyId: string) => void;
  onKeyPaint?: (keyId: string) => void;
  customizeMode?: boolean;
}

export const KeyboardViewer3D = memo(function KeyboardViewer3D({
  config,
  height = "300px",
  autoRotate = true,
  fallback,
  className = "",
  interactive = false,
  onKeyPress,
  selectionMode,
  selectedKeys,
  onKeySelect,
  onKeyPaint,
  customizeMode,
}: KeyboardViewer3DProps) {
  const [webglSupported, setWebglSupported] = useState<boolean | null>(null);

  useEffect(() => {
    setWebglSupported(checkWebGLSupport());
  }, []);

  // Compact mode for modals/small containers (skip heavy AO)
  const numericHeight = parseInt(height, 10);
  const compactMode = !isNaN(numericHeight) && numericHeight < 500;

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
        className={cn(
          "overflow-hidden relative group",
          className || "rounded-xl border border-border-default bg-bg-elevated/30"
        )}
        style={{ height }}
      >
        <KeyboardScene
          config={config}
          autoRotate={autoRotate}
          compactMode={compactMode}
          interactive={interactive}
          onKeyPress={onKeyPress}
          selectionMode={selectionMode}
          selectedKeys={selectedKeys}
          onKeySelect={onKeySelect}
          onKeyPaint={onKeyPaint}
          customizeMode={customizeMode}
        />

        {/* Interaction hint */}
        <div className="absolute bottom-2 left-1/2 -translate-x-1/2 px-3 py-1 rounded-full bg-overlay backdrop-blur-sm border border-border-default text-[10px] text-text-secondary opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none">
          {interactive ? "Click keys \u00b7 Drag to rotate \u00b7 Scroll to zoom" : "Drag to rotate \u00b7 Scroll to zoom"}
        </div>
      </div>
    </WebGLErrorBoundary>
  );
}, (prev, next) => {
  // Custom comparator: shallow-compare config fields + other props
  if (prev.height !== next.height) return false;
  if (prev.autoRotate !== next.autoRotate) return false;
  if (prev.className !== next.className) return false;
  if (prev.interactive !== next.interactive) return false;
  if (prev.customizeMode !== next.customizeMode) return false;
  if (prev.selectionMode !== next.selectionMode) return false;
  if (prev.selectedKeys !== next.selectedKeys) return false;
  if (prev.onKeyPress !== next.onKeyPress) return false;
  if (prev.onKeySelect !== next.onKeySelect) return false;
  if (prev.onKeyPaint !== next.onKeyPaint) return false;
  if (prev.fallback !== next.fallback) return false;

  // Shallow-compare config object fields
  const pc = prev.config as unknown as Record<string, unknown>;
  const nc = next.config as unknown as Record<string, unknown>;
  const keys = new Set([...Object.keys(pc), ...Object.keys(nc)]);
  for (const k of keys) {
    if (pc[k] !== nc[k]) return false;
  }
  return true;
});
