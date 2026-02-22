// Per-key customization types for the 3D keyboard customizer

export type SelectionMode = "single" | "row" | "zone" | "all";

export interface PerKeyOverride {
  color?: string;
  legendText?: string;
  legendColor?: string;
  profile?: string;
  artisan?: string;
}

/** Sparse map keyed by "rowIndex-keyIndexInRow" */
export type PerKeyOverrides = Record<string, PerKeyOverride>;

export interface KeySelection {
  mode: SelectionMode;
  keys: Set<string>;
}

/** Stable key ID from layout position */
export function makeKeyId(rowIndex: number, keyIndexInRow: number): string {
  return `${rowIndex}-${keyIndexInRow}`;
}

/** Parse a key ID back to row/key indices */
export function parseKeyId(keyId: string): { rowIndex: number; keyIndex: number } {
  const [row, key] = keyId.split("-").map(Number);
  return { rowIndex: row, keyIndex: key };
}

// 14 real keycap colors for the preset palette
export const KEYCAP_COLOR_PRESETS = [
  { name: "Charcoal", hex: "#2d2d2d" },
  { name: "Dark Gray", hex: "#4a4a4a" },
  { name: "Cream", hex: "#f5f0e1" },
  { name: "White", hex: "#f0f0f0" },
  { name: "Navy", hex: "#1a3a5c" },
  { name: "Teal", hex: "#16a085" },
  { name: "Red", hex: "#c0392b" },
  { name: "Pink", hex: "#e8a0a0" },
  { name: "Orange", hex: "#E8590C" },
  { name: "Yellow", hex: "#f1c40f" },
  { name: "Purple", hex: "#8e44ad" },
  { name: "Lavender", hex: "#b39ddb" },
  { name: "Green", hex: "#27ae60" },
  { name: "Sky Blue", hex: "#4a90c4" },
] as const;
