"use client";

import { useState, useCallback, useMemo, useEffect } from "react";
import { cn } from "@/lib/utils";
import { KeyboardViewer3D } from "@/components/3d/KeyboardViewer3D";
import { KeySelectionToolbar } from "./KeySelectionToolbar";
import { KeyCustomizationPanel } from "./KeyCustomizationPanel";
import { useUndoRedo } from "@/hooks/useUndoRedo";
import { useKeyboardShortcuts } from "@/hooks/useKeyboardShortcuts";
import { makeKeyId } from "@/lib/keyCustomization";
import { getKeycapZone } from "@/components/3d/colorways";
import type { SelectionMode, PerKeyOverrides, PerKeyOverride } from "@/lib/keyCustomization";
import type { KeyboardViewerConfig } from "@/lib/keyboard3d";

export interface CustomizerInteractiveProps {
  config: KeyboardViewerConfig;
  selectionMode: SelectionMode;
  selectedKeys: Set<string>;
  onKeySelect: (keyId: string) => void;
  onKeyPaint: (keyId: string) => void;
  paintMode: boolean;
}

interface KeyboardCustomizerProps {
  viewerConfig: KeyboardViewerConfig;
  onOverridesChange: (overrides: PerKeyOverrides) => void;
  className?: string;
  externalViewer?: boolean;
  onInteractivePropsChange?: (props: CustomizerInteractiveProps | null) => void;
}

// Row counts per layout for quick-select
// Must match actual key counts from generateLayout() in KeyboardModel.tsx
const ROW_COUNTS: Record<string, number[]> = {
  "60": [14, 14, 13, 12, 8],
  "65": [15, 14, 13, 13, 9],
  "75": [14, 15, 14, 13, 13, 9],
  "tkl": [13, 18, 17, 16, 16, 9],
  "full": [17, 22, 20, 20, 18, 9],
};

// ─── Per-layout legend + modifier data for zone lookup ───────────────
// Must match the legends assigned by getLegendForKey() in KeyboardModel.tsx

const FROW = ["Esc", "F1", "F2", "F3", "F4", "F5", "F6", "F7", "F8", "F9", "F10", "F11", "F12"];
const FROW_MODS = [true, true, true, true, true, true, true, true, true, true, true, true, true];

const ROW0 = ["`", "1", "2", "3", "4", "5", "6", "7", "8", "9", "0", "-", "=", "\u232B"];
const ROW0_MODS = [false,false,false,false,false,false,false,false,false,false,false,false,false,true];

const ROW1 = ["\u21E5", "Q", "W", "E", "R", "T", "Y", "U", "I", "O", "P", "[", "]", "\\"];
const ROW1_MODS = [true,false,false,false,false,false,false,false,false,false,false,false,false,true];

const ROW2 = ["\u21EA", "A", "S", "D", "F", "G", "H", "J", "K", "L", ";", "'", "\u23CE"];
const ROW2_MODS = [true,false,false,false,false,false,false,false,false,false,false,false,true];

const ROW3 = ["\u21E7", "Z", "X", "C", "V", "B", "N", "M", ",", ".", "/", "\u21E7"];
const ROW3_MODS = [true,false,false,false,false,false,false,false,false,false,false,true];

const ROW3_SPLIT = ["\u21E7", "Z", "X", "C", "V", "B", "N", "M", ",", ".", "/", "\u21E7", "\u2191"];
const ROW3_SPLIT_MODS = [true,false,false,false,false,false,false,false,false,false,false,true,true];

const ROW4_60 = ["Ctrl", "\u2318", "Alt", " ", "Alt", "\u2318", "Fn", "Ctrl"];
const ROW4_60_MODS = [true,true,true,true,true,true,true,true];

const ROW4_65 = ["Ctrl", "\u2318", "Alt", " ", "Alt", "\u2318", "\u2190", "\u2193", "\u2192"];
const ROW4_65_MODS = [true,true,true,true,true,true,true,true,true];

const NAV = ["Ins", "Hm", "PU", "Del", "End", "PD", "", "\u2191", "", "\u2190", "\u2193", "\u2192"];
const NAV_MODS = [true,true,true,true,true,true,true,true,true,true,true,true];

const NUMPAD_R0 = ["NL", "/", "*", "-"];
const NUMPAD_R1 = ["7", "8", "9", "+"];
const NUMPAD_R2 = ["4", "5", "6"];
const NUMPAD_R3 = ["1", "2", "3", "\u23CE"];
const NUMPAD_R4 = ["0", "."];

function getLayoutLegends(size: string): { legends: string[][]; mods: boolean[][] } {
  if (size === "60") {
    return {
      legends: [ROW0, ROW1, ROW2, ROW3, ROW4_60],
      mods: [ROW0_MODS, ROW1_MODS, ROW2_MODS, ROW3_MODS, ROW4_60_MODS],
    };
  }
  if (size === "65") {
    return {
      legends: [
        [...ROW0, "Del"],
        ROW1,
        ROW2,
        ROW3_SPLIT,
        ROW4_65,
      ],
      mods: [
        [...ROW0_MODS, true],
        ROW1_MODS,
        ROW2_MODS,
        ROW3_SPLIT_MODS,
        ROW4_65_MODS,
      ],
    };
  }
  if (size === "75") {
    return {
      legends: [
        [...FROW, "Del"],
        [...ROW0, "Del"],
        ROW1,
        ROW2,
        ROW3_SPLIT,
        ROW4_65,
      ],
      mods: [
        [...FROW_MODS, true],
        [...ROW0_MODS, true],
        ROW1_MODS,
        ROW2_MODS,
        ROW3_SPLIT_MODS,
        ROW4_65_MODS,
      ],
    };
  }
  if (size === "tkl") {
    return {
      legends: [
        FROW,
        [...ROW0, "Del", ...NAV.slice(0, 3)],
        [...ROW1, ...NAV.slice(3, 6)],
        [...ROW2, ...NAV.slice(6, 9)],
        [...ROW3_SPLIT, ...NAV.slice(9, 12)],
        ROW4_65,
      ],
      mods: [
        FROW_MODS,
        [...ROW0_MODS, true, ...NAV_MODS.slice(0, 3)],
        [...ROW1_MODS, ...NAV_MODS.slice(3, 6)],
        [...ROW2_MODS, ...NAV_MODS.slice(6, 9)],
        [...ROW3_SPLIT_MODS, ...NAV_MODS.slice(9, 12)],
        ROW4_65_MODS,
      ],
    };
  }
  // full
  return {
    legends: [
      [...FROW, ...NUMPAD_R0],
      [...ROW0, "Del", ...NAV.slice(0, 3), ...NUMPAD_R1],
      [...ROW1, ...NAV.slice(3, 6), ...NUMPAD_R2],
      [...ROW2, ...NAV.slice(6, 9), ...NUMPAD_R3],
      [...ROW3_SPLIT, ...NAV.slice(9, 12), ...NUMPAD_R4],
      ROW4_65,
    ],
    mods: [
      [...FROW_MODS, true, true, true, true],
      [...ROW0_MODS, true, ...NAV_MODS.slice(0, 3), false, false, false, true],
      [...ROW1_MODS, ...NAV_MODS.slice(3, 6), false, false, false],
      [...ROW2_MODS, ...NAV_MODS.slice(6, 9), false, false, false, true],
      [...ROW3_SPLIT_MODS, ...NAV_MODS.slice(9, 12), false, false],
      ROW4_65_MODS,
    ],
  };
}

function getKeysForZone(zone: string, size: string): string[] {
  const keys: string[] = [];
  const { legends, mods } = getLayoutLegends(size);

  legends.forEach((row, rowIdx) => {
    row.forEach((legend, keyIdx) => {
      const isMod = mods[rowIdx]?.[keyIdx] ?? false;
      const keyZone = getKeycapZone(legend, isMod);
      if (keyZone === zone) {
        keys.push(makeKeyId(rowIdx, keyIdx));
      }
    });
  });

  return keys;
}

export function KeyboardCustomizer({
  viewerConfig,
  onOverridesChange,
  className,
  externalViewer = false,
  onInteractivePropsChange,
}: KeyboardCustomizerProps) {
  const [selectionMode, setSelectionMode] = useState<SelectionMode>("single");
  const [selectedKeys, setSelectedKeys] = useState<Set<string>>(new Set());
  const [paintMode, setPaintMode] = useState(false);
  const [activeTab, setActiveTab] = useState("colors");
  const [activeColor, setActiveColor] = useState("#E8590C");

  // Mode change handler — "all" immediately selects every key
  const handleModeChange = useCallback((mode: SelectionMode) => {
    setSelectionMode(mode);
    if (mode === "all") {
      const allKeys = new Set<string>();
      const rowCounts = ROW_COUNTS[viewerConfig.size] || ROW_COUNTS["65"];
      rowCounts.forEach((count, rowIdx) => {
        for (let k = 0; k < count; k++) {
          allKeys.add(makeKeyId(rowIdx, k));
        }
      });
      setSelectedKeys(allKeys);
    }
  }, [viewerConfig.size]);

  const {
    state: overrides,
    setState: setOverrides,
    undo,
    redo,
    canUndo,
    canRedo,
    reset: resetOverrides,
  } = useUndoRedo<PerKeyOverrides>(viewerConfig.perKeyOverrides ?? {});

  // Push overrides up whenever they change
  const updateOverrides = useCallback((next: PerKeyOverrides) => {
    setOverrides(next);
    onOverridesChange(next);
  }, [setOverrides, onOverridesChange]);

  // Undo/redo wrappers that also push changes up
  const handleUndo = useCallback(() => {
    const prev = undo();
    if (prev !== undefined) onOverridesChange(prev);
  }, [undo, onOverridesChange]);

  const handleRedo = useCallback(() => {
    const next = redo();
    if (next !== undefined) onOverridesChange(next);
  }, [redo, onOverridesChange]);

  // Handle key selection from 3D model
  const handleKeySelect = useCallback((keyId: string) => {
    if (selectionMode === "all") {
      // Select all keys
      const allKeys = new Set<string>();
      const rowCounts = ROW_COUNTS[viewerConfig.size] || ROW_COUNTS["65"];
      rowCounts.forEach((count, rowIdx) => {
        for (let k = 0; k < count; k++) {
          allKeys.add(makeKeyId(rowIdx, k));
        }
      });
      setSelectedKeys(allKeys);
    } else if (selectionMode === "row") {
      // Select entire row
      const rowIdx = parseInt(keyId.split("-")[0], 10);
      const rowCounts = ROW_COUNTS[viewerConfig.size] || ROW_COUNTS["65"];
      const count = rowCounts[rowIdx] || 0;
      const rowKeys = new Set<string>();
      for (let k = 0; k < count; k++) {
        rowKeys.add(makeKeyId(rowIdx, k));
      }
      setSelectedKeys(rowKeys);
    } else if (selectionMode === "zone") {
      // Select zone based on key legend
      const { legends, mods } = getLayoutLegends(viewerConfig.size);
      const [rStr, kStr] = keyId.split("-");
      const r = parseInt(rStr, 10);
      const k = parseInt(kStr, 10);
      const legend = legends[r]?.[k] ?? "";
      const isMod = mods[r]?.[k] ?? false;
      const zone = getKeycapZone(legend, isMod);
      const zoneKeys = getKeysForZone(zone, viewerConfig.size);
      setSelectedKeys(new Set(zoneKeys));
    } else {
      // Single — toggle
      setSelectedKeys((prev) => {
        const next = new Set(prev);
        if (next.has(keyId)) {
          next.delete(keyId);
        } else {
          next.add(keyId);
        }
        return next;
      });
    }
  }, [selectionMode, viewerConfig.size]);

  // Handle paint mode — apply active color on hover
  const handleKeyPaint = useCallback((keyId: string) => {
    const next = { ...overrides, [keyId]: { ...overrides[keyId], color: activeColor } };
    updateOverrides(next);
  }, [overrides, activeColor, updateOverrides]);

  // Apply override to selected keys
  const handleApplyOverride = useCallback((override: PerKeyOverride) => {
    if (selectedKeys.size === 0) return;
    if (override.color) setActiveColor(override.color);

    const next = { ...overrides };
    selectedKeys.forEach((keyId) => {
      next[keyId] = { ...next[keyId], ...override };
    });
    updateOverrides(next);
  }, [selectedKeys, overrides, updateOverrides]);

  // Remove artisan from selected keys
  const handleRemoveArtisan = useCallback(() => {
    if (selectedKeys.size === 0) return;
    const next = { ...overrides };
    selectedKeys.forEach((keyId) => {
      if (next[keyId]) {
        const { artisan: _, ...rest } = next[keyId];
        next[keyId] = rest;
      }
    });
    updateOverrides(next);
  }, [selectedKeys, overrides, updateOverrides]);

  // Quick actions
  const handleQuickAction = useCallback((action: "alphas" | "modifiers" | "functionRow" | "reset") => {
    if (action === "reset") {
      updateOverrides({});
      setSelectedKeys(new Set());
      return;
    }
    const zoneKeys = getKeysForZone(action, viewerConfig.size);
    setSelectedKeys(new Set(zoneKeys));
  }, [viewerConfig.size, updateOverrides]);

  // Select all
  const selectAll = useCallback(() => {
    const allKeys = new Set<string>();
    const rowCounts = ROW_COUNTS[viewerConfig.size] || ROW_COUNTS["65"];
    rowCounts.forEach((count, rowIdx) => {
      for (let k = 0; k < count; k++) {
        allKeys.add(makeKeyId(rowIdx, k));
      }
    });
    setSelectedKeys(allKeys);
  }, [viewerConfig.size]);

  const deselectAll = useCallback(() => {
    setSelectedKeys(new Set());
  }, []);

  const resetSelected = useCallback(() => {
    if (selectedKeys.size === 0) return;
    const next = { ...overrides };
    selectedKeys.forEach((keyId) => {
      delete next[keyId];
    });
    updateOverrides(next);
  }, [selectedKeys, overrides, updateOverrides]);

  const applyColorPreset = useCallback((hex: string) => {
    if (selectedKeys.size === 0) return;
    handleApplyOverride({ color: hex });
  }, [selectedKeys, handleApplyOverride]);

  // Keyboard shortcuts
  useKeyboardShortcuts({
    undo: handleUndo,
    redo: handleRedo,
    selectAll,
    deselectAll,
    resetSelected,
    applyColorPreset,
  });

  // Merge overrides into viewer config
  const mergedConfig = useMemo(() => ({
    ...viewerConfig,
    perKeyOverrides: overrides,
    selectionMode,
    selectedKeys,
    paintMode,
  }), [viewerConfig, overrides, selectionMode, selectedKeys, paintMode]);

  // Push interactive state up to page-level viewer when in external mode
  useEffect(() => {
    if (!externalViewer || !onInteractivePropsChange) return;
    onInteractivePropsChange({
      config: mergedConfig,
      selectionMode,
      selectedKeys,
      onKeySelect: handleKeySelect,
      onKeyPaint: handleKeyPaint,
      paintMode,
    });
  }, [externalViewer, onInteractivePropsChange, mergedConfig, selectionMode, selectedKeys, handleKeySelect, handleKeyPaint, paintMode]);

  // Cleanup: clear interactive props on unmount
  useEffect(() => {
    if (!externalViewer || !onInteractivePropsChange) return;
    return () => {
      onInteractivePropsChange(null);
    };
  }, [externalViewer, onInteractivePropsChange]);

  // External viewer mode: only render toolbar + panel (3D viewer is page-level)
  if (externalViewer) {
    return (
      <div className={cn("flex flex-col gap-4", className)}>
        {/* Selection toolbar */}
        <KeySelectionToolbar
          mode={selectionMode}
          onModeChange={handleModeChange}
          selectedCount={selectedKeys.size}
          onUndo={handleUndo}
          onRedo={handleRedo}
          canUndo={canUndo}
          canRedo={canRedo}
          onReset={() => {
            resetOverrides({});
            onOverridesChange({});
            setSelectedKeys(new Set());
          }}
          paintMode={paintMode}
          onPaintModeToggle={() => setPaintMode((p) => !p)}
        />

        {/* Customization panel */}
        <div className="p-4 rounded-2xl bg-bg-surface/80 backdrop-blur-md border border-border-subtle/50 shadow-surface max-h-[500px] lg:max-h-[calc(100vh-18rem)] overflow-hidden flex flex-col">
          <KeyCustomizationPanel
            selectedCount={selectedKeys.size}
            onApplyOverride={handleApplyOverride}
            onQuickAction={handleQuickAction}
            onRemoveArtisan={handleRemoveArtisan}
            activeTab={activeTab}
            onTabChange={setActiveTab}
          />
        </div>
      </div>
    );
  }

  // Standalone mode: full layout with internal 3D viewer
  return (
    <div className={cn("flex flex-col lg:flex-row gap-4 h-full", className)}>
      {/* 3D Viewer */}
      <div className="relative flex-1 min-h-[300px] lg:min-h-0">
        {/* Selection toolbar — floating above viewer */}
        <div className="absolute top-3 left-1/2 -translate-x-1/2 z-10">
          <KeySelectionToolbar
            mode={selectionMode}
            onModeChange={handleModeChange}
            selectedCount={selectedKeys.size}
            onUndo={handleUndo}
            onRedo={handleRedo}
            canUndo={canUndo}
            canRedo={canRedo}
            onReset={() => {
              resetOverrides({});
              onOverridesChange({});
              setSelectedKeys(new Set());
            }}
            paintMode={paintMode}
            onPaintModeToggle={() => setPaintMode((p) => !p)}
          />
        </div>

        <KeyboardViewer3D
          config={mergedConfig}
          height="100%"
          autoRotate={false}
          className="rounded-xl border border-border-default bg-bg-elevated/30"
          selectionMode={selectionMode}
          selectedKeys={selectedKeys}
          onKeySelect={handleKeySelect}
          onKeyPaint={handleKeyPaint}
        />
      </div>

      {/* Customization panel — sidebar on desktop, bottom on mobile */}
      <div className="w-full lg:w-[300px] xl:w-[340px] shrink-0">
        <div className="p-4 rounded-2xl bg-bg-surface/80 backdrop-blur-md border border-border-subtle/50 shadow-surface h-full max-h-[500px] lg:max-h-[calc(100vh-12rem)] overflow-hidden flex flex-col">
          <KeyCustomizationPanel
            selectedCount={selectedKeys.size}
            onApplyOverride={handleApplyOverride}
            onQuickAction={handleQuickAction}
            onRemoveArtisan={handleRemoveArtisan}
            activeTab={activeTab}
            onTabChange={setActiveTab}
          />
        </div>
      </div>
    </div>
  );
}
