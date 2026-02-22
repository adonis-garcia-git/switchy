"use client";

import { cn } from "@/lib/utils";
import type { SelectionMode } from "@/lib/keyCustomization";

interface KeySelectionToolbarProps {
  mode: SelectionMode;
  onModeChange: (mode: SelectionMode) => void;
  selectedCount: number;
  onUndo: () => void;
  onRedo: () => void;
  canUndo: boolean;
  canRedo: boolean;
  onReset: () => void;
  paintMode: boolean;
  onPaintModeToggle: () => void;
}

const MODES: { value: SelectionMode; label: string; icon: string }[] = [
  { value: "single", label: "Single", icon: "M15 15l-2 5L9 9l11 4-5 2zm0 0l5 5" },
  { value: "row", label: "Row", icon: "M4 6h16M4 12h16" },
  { value: "zone", label: "Zone", icon: "M4 5a1 1 0 011-1h4a1 1 0 011 1v4a1 1 0 01-1 1H5a1 1 0 01-1-1V5zm10 0a1 1 0 011-1h4a1 1 0 011 1v4a1 1 0 01-1 1h-4a1 1 0 01-1-1V5zM4 15a1 1 0 011-1h4a1 1 0 011 1v4a1 1 0 01-1 1H5a1 1 0 01-1-1v-4z" },
  { value: "all", label: "All", icon: "M4 4h16v16H4z" },
];

export function KeySelectionToolbar({
  mode,
  onModeChange,
  selectedCount,
  onUndo,
  onRedo,
  canUndo,
  canRedo,
  onReset,
  paintMode,
  onPaintModeToggle,
}: KeySelectionToolbarProps) {
  return (
    <div className="flex flex-col gap-1.5 px-2 py-1.5 rounded-xl bg-bg-surface/90 backdrop-blur-md border border-border-subtle/50 shadow-[0_2px_12px_rgba(0,0,0,0.25)]">
      {/* Row 1: Selection mode buttons with full labels */}
      <div className="flex items-center gap-1">
        {MODES.map((m) => (
          <button
            key={m.value}
            onClick={() => onModeChange(m.value)}
            className={cn(
              "flex-1 flex items-center justify-center gap-1 px-1 py-1 rounded-md text-[11px] font-semibold transition-[background-color,color] duration-150",
              "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/40",
              mode === m.value
                ? "bg-accent text-bg-primary shadow-[0_1px_6px_rgba(232,89,12,0.2)]"
                : "text-text-secondary hover:text-text-primary hover:bg-bg-elevated"
            )}
          >
            <svg className="w-3 h-3 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d={m.icon} />
            </svg>
            {m.label}
          </button>
        ))}
      </div>

      {/* Row 2: Paint, undo/redo, reset, count */}
      <div className="flex items-center gap-1">
        {/* Paint mode */}
        <button
          onClick={onPaintModeToggle}
          className={cn(
            "flex items-center gap-1 px-2 py-1 rounded-md text-[10px] font-semibold transition-[background-color,color] duration-150",
            "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/40",
            paintMode
              ? "bg-purple-500/20 text-purple-400 ring-1 ring-purple-500/30"
              : "text-text-secondary hover:text-text-primary hover:bg-bg-elevated"
          )}
          title="Paint mode — click or drag to color keys"
        >
          <svg className="w-3 h-3 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zm0 0h12a2 2 0 002-2v-4a2 2 0 00-2-2h-2.343M11 7.343l1.657-1.657a2 2 0 012.828 0l2.829 2.829a2 2 0 010 2.828l-8.486 8.485" />
          </svg>
          Paint
        </button>

        <div className="w-px h-3.5 bg-border-subtle/50" />

        {/* Undo */}
        <button
          onClick={onUndo}
          disabled={!canUndo}
          className="p-1 rounded-md text-text-secondary hover:text-text-primary hover:bg-bg-elevated disabled:opacity-30 disabled:cursor-not-allowed transition-[background-color,color,opacity] duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/40"
          title="Undo (Ctrl+Z)"
        >
          <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M3 10h10a5 5 0 015 5v2M3 10l4-4M3 10l4 4" />
          </svg>
        </button>

        {/* Redo */}
        <button
          onClick={onRedo}
          disabled={!canRedo}
          className="p-1 rounded-md text-text-secondary hover:text-text-primary hover:bg-bg-elevated disabled:opacity-30 disabled:cursor-not-allowed transition-[background-color,color,opacity] duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/40"
          title="Redo (Ctrl+Shift+Z)"
        >
          <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M21 10H11a5 5 0 00-5 5v2M21 10l-4-4M21 10l-4 4" />
          </svg>
        </button>

        {/* Reset */}
        <button
          onClick={onReset}
          className="p-1 rounded-md text-text-secondary hover:text-red-400 hover:bg-red-500/10 transition-[background-color,color] duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/40"
          title="Reset all overrides"
        >
          <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
          </svg>
        </button>

        {/* Spacer + selection count */}
        <div className="flex-1" />
        {selectedCount > 0 && (
          <span className="text-[10px] text-accent font-semibold tabular-nums px-1 whitespace-nowrap">
            {selectedCount} selected
          </span>
        )}
      </div>
    </div>
  );
}
