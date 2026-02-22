"use client";

import { useState, useRef, useCallback, useEffect, type ReactNode } from "react";
import { cn } from "@/lib/utils";

type SnapState = "collapsed" | "half" | "full";

interface StudioMobileDrawerProps {
  children: ReactNode;
  actionBar: ReactNode;
}

// Snap positions as percentage of viewport height from bottom
const SNAP_POSITIONS: Record<SnapState, number> = {
  collapsed: 72,  // just action bar visible
  half: 45,       // action bar + presets + headers
  full: 8,        // full scrollable content (8% from top)
};

export function StudioMobileDrawer({ children, actionBar }: StudioMobileDrawerProps) {
  const [snap, setSnap] = useState<SnapState>("collapsed");
  const [dragging, setDragging] = useState(false);
  const [dragTranslate, setDragTranslate] = useState<number | null>(null);
  const [mounted, setMounted] = useState(false);
  const startY = useRef(0);
  const startTranslate = useRef(0);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setMounted(true);
  }, []);

  const getTranslateForSnap = useCallback((s: SnapState) => {
    if (typeof window === "undefined") return 0;
    return (SNAP_POSITIONS[s] / 100) * window.innerHeight;
  }, []);

  const currentTranslate = dragTranslate ?? getTranslateForSnap(snap);

  const handlePointerDown = useCallback((e: React.PointerEvent) => {
    setDragging(true);
    startY.current = e.clientY;
    startTranslate.current = dragTranslate ?? getTranslateForSnap(snap);
    (e.target as HTMLElement).setPointerCapture(e.pointerId);
  }, [dragTranslate, snap, getTranslateForSnap]);

  const handlePointerMove = useCallback((e: React.PointerEvent) => {
    if (!dragging) return;
    const delta = e.clientY - startY.current;
    const vh = window.innerHeight;
    const minY = (SNAP_POSITIONS.full / 100) * vh;
    const maxY = (SNAP_POSITIONS.collapsed / 100) * vh;
    const newTranslate = Math.max(minY, Math.min(maxY, startTranslate.current + delta));
    setDragTranslate(newTranslate);
  }, [dragging]);

  const handlePointerUp = useCallback(() => {
    if (!dragging) return;
    setDragging(false);

    if (dragTranslate === null) return;

    const vh = window.innerHeight;
    const fraction = dragTranslate / vh;

    // Snap to nearest
    let nearest: SnapState = "collapsed";
    let minDist = Infinity;
    for (const [state, pct] of Object.entries(SNAP_POSITIONS)) {
      const dist = Math.abs(fraction - pct / 100);
      if (dist < minDist) {
        minDist = dist;
        nearest = state as SnapState;
      }
    }

    setSnap(nearest);
    setDragTranslate(null);
  }, [dragging, dragTranslate]);

  const toggleSnap = useCallback(() => {
    if (snap === "collapsed") setSnap("half");
    else if (snap === "half") setSnap("full");
    else setSnap("collapsed");
  }, [snap]);

  return (
    <div
      ref={containerRef}
      className={cn(
        "fixed inset-x-0 bottom-0 z-20 bg-bg-surface/95 backdrop-blur-xl border-t border-border-default rounded-t-2xl shadow-floating",
        !dragging && "transition-transform duration-300 ease-out"
      )}
      style={{
        transform: mounted
          ? `translateY(${currentTranslate}px)`
          : `translateY(${SNAP_POSITIONS[snap]}vh)`,
        height: "92vh",
      }}
    >
      {/* Drag handle */}
      <div
        className="flex items-center justify-center py-3 cursor-grab active:cursor-grabbing touch-none"
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onPointerCancel={handlePointerUp}
        onClick={toggleSnap}
      >
        <div className="w-10 h-1 rounded-full bg-text-muted" />
      </div>

      {/* Action bar (always visible) */}
      <div className="px-4 pb-3">
        {actionBar}
      </div>

      {/* Scrollable content */}
      <div className="overflow-y-auto h-[calc(100%-80px)] px-4 pb-8 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        {children}
      </div>
    </div>
  );
}
