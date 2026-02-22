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
const ROW_COUNTS: Record<string, number[]> = {
  "60": [14, 14, 13, 12, 8],
  "65": [15, 14, 13, 13, 9],
  "75": [14, 15, 14, 13, 13, 9],
  "tkl": [13, 17, 17, 16, 15, 12],
  "full": [17, 21, 21, 19, 19, 15],
};

// Legend arrays for zone lookup
const LEGEND_ROWS_60 = [
  ["`", "1", "2", "3", "4", "5", "6", "7", "8", "9", "0", "-", "=", "\u232B"],
  ["\u21E5", "Q", "W", "E", "R", "T", "Y", "U", "I", "O", "P", "[", "]", "\\"],
  ["\u21EA", "A", "S", "D", "F", "G", "H", "J", "K", "L", ";", "'", "\u23CE"],
  ["\u21E7", "Z", "X", "C", "V", "B", "N", "M", ",", ".", "/", "\u21E7"],
  ["Ctrl", "\u2318", "Alt", " ", "Alt", "\u2318", "Fn", "Ctrl"],
];
const MOD_FLAGS_60 = [
  [false,false,false,false,false,false,false,false,false,false,false,false,false,true],
  [true,false,false,false,false,false,false,false,false,false,false,false,false,true],
  [true,false,false,false,false,false,false,false,false,false,false,false,true],
  [true,false,false,false,false,false,false,false,false,false,false,true],
  [true,true,true,true,true,true,true,true],
];

function getKeysForZone(zone: string, size: string): string[] {
  const keys: string[] = [];
  const rows = LEGEND_ROWS_60; // simplified — use 60% legends for zone lookup
  const mods = MOD_FLAGS_60;

  rows.forEach((row, rowIdx) => {
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

  const {
    state: overrides,
    setState: setOverrides,
    undo,
    redo,
    canUndo,
    canRedo,
    reset: resetOverrides,
  } = useUndoRedo<PerKeyOverrides>({});

  // Push overrides up whenever they change
  const updateOverrides = useCallback((next: PerKeyOverrides) => {
    setOverrides(next);
    onOverridesChange(next);
  }, [setOverrides, onOverridesChange]);

  // Undo/redo wrappers that also push changes up
  const handleUndo = useCallback(() => {
    undo();
    // We need to read the state after undo — use a timeout to get the updated state
    setTimeout(() => {
      onOverridesChange(overrides);
    }, 0);
  }, [undo, onOverridesChange, overrides]);

  const handleRedo = useCallback(() => {
    redo();
    setTimeout(() => {
      onOverridesChange(overrides);
    }, 0);
  }, [redo, onOverridesChange, overrides]);

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
      const rows = LEGEND_ROWS_60;
      const mods = MOD_FLAGS_60;
      const [rStr, kStr] = keyId.split("-");
      const r = parseInt(rStr, 10);
      const k = parseInt(kStr, 10);
      const legend = rows[r]?.[k] ?? "";
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
          onModeChange={setSelectionMode}
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
            onModeChange={setSelectionMode}
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
