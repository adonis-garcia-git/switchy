import { useEffect } from "react";
import { KEYCAP_COLOR_PRESETS } from "@/lib/keyCustomization";

interface KeyboardShortcutActions {
  undo: () => void;
  redo: () => void;
  selectAll: () => void;
  deselectAll: () => void;
  resetSelected: () => void;
  applyColorPreset: (hex: string) => void;
  /** Set false to disable shortcuts (e.g. when a text input is focused) */
  enabled?: boolean;
}

export function useKeyboardShortcuts({
  undo,
  redo,
  selectAll,
  deselectAll,
  resetSelected,
  applyColorPreset,
  enabled = true,
}: KeyboardShortcutActions) {
  useEffect(() => {
    if (!enabled) return;

    function handleKeyDown(e: KeyboardEvent) {
      // Skip when typing in inputs
      const tag = (e.target as HTMLElement)?.tagName;
      if (tag === "INPUT" || tag === "TEXTAREA" || tag === "SELECT") return;

      const mod = e.metaKey || e.ctrlKey;

      // Ctrl/Cmd+Z → Undo
      if (mod && !e.shiftKey && e.key === "z") {
        e.preventDefault();
        undo();
        return;
      }

      // Ctrl/Cmd+Shift+Z → Redo
      if (mod && e.shiftKey && e.key === "z") {
        e.preventDefault();
        redo();
        return;
      }

      // Ctrl/Cmd+A → Select all
      if (mod && e.key === "a") {
        e.preventDefault();
        selectAll();
        return;
      }

      // Escape → Deselect
      if (e.key === "Escape") {
        e.preventDefault();
        deselectAll();
        return;
      }

      // Delete/Backspace → Reset selected keys
      if (e.key === "Delete" || e.key === "Backspace") {
        e.preventDefault();
        resetSelected();
        return;
      }

      // 1-9 → Quick-apply color preset
      const num = parseInt(e.key, 10);
      if (!mod && num >= 1 && num <= 9 && num <= KEYCAP_COLOR_PRESETS.length) {
        e.preventDefault();
        applyColorPreset(KEYCAP_COLOR_PRESETS[num - 1].hex);
      }
    }

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [enabled, undo, redo, selectAll, deselectAll, resetSelected, applyColorPreset]);
}
