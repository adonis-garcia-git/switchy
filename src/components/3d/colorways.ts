// Keycap colorway system — multi-zone color mapping for realistic keycap sets

export interface KeycapColorway {
  name: string;
  alphas: string;       // A-Z, digits
  modifiers: string;    // Tab, Shift, Ctrl, Alt
  accents: string;      // Esc, Enter
  spacebar: string;
  functionRow?: string;
  legends: string;      // legend text color
}

// Modifier legends (unicode + text)
const MODIFIER_LEGENDS = new Set([
  "\u21E5", "\u21EA", "\u23CE", "\u21E7", "\u232B",
  "Ctrl", "\u2318", "Alt", "Fn",
  "Ins", "Hm", "PU", "Del", "End", "PD", "NL",
]);

const ACCENT_LEGENDS = new Set(["Esc", "\u23CE"]); // Esc and Enter

const SPACEBAR_LEGENDS = new Set([" "]);

const FROW_LEGENDS = new Set([
  "F1", "F2", "F3", "F4", "F5", "F6",
  "F7", "F8", "F9", "F10", "F11", "F12",
]);

export function getKeycapZone(legend: string, isModifier: boolean): keyof Pick<KeycapColorway, "alphas" | "modifiers" | "accents" | "spacebar" | "functionRow"> {
  if (SPACEBAR_LEGENDS.has(legend)) return "spacebar";
  if (ACCENT_LEGENDS.has(legend)) return "accents";
  if (FROW_LEGENDS.has(legend)) return "functionRow";
  if (isModifier || MODIFIER_LEGENDS.has(legend)) return "modifiers";
  return "alphas";
}

export function getKeycapColor(colorway: KeycapColorway, legend: string, isModifier: boolean): string {
  const zone = getKeycapZone(legend, isModifier);
  if (zone === "functionRow" && colorway.functionRow) return colorway.functionRow;
  if (zone === "functionRow") return colorway.modifiers; // fallback
  return colorway[zone];
}

export function getLegendColor(colorway: KeycapColorway): string {
  return colorway.legends;
}

// ─── Preset Colorways ──────────────────────────────────────────────

export const COLORWAYS: Record<string, KeycapColorway> = {
  // Classic monochrome sets
  wob: {
    name: "WoB (White on Black)",
    alphas: "#1a1a1a",
    modifiers: "#1a1a1a",
    accents: "#cc3333",
    spacebar: "#1a1a1a",
    functionRow: "#1a1a1a",
    legends: "#f0f0f0",
  },
  bow: {
    name: "BoW (Black on White)",
    alphas: "#f0f0f0",
    modifiers: "#d4d4d4",
    accents: "#333333",
    spacebar: "#f0f0f0",
    functionRow: "#d4d4d4",
    legends: "#1a1a1a",
  },
  olivia: {
    name: "GMK Olivia",
    alphas: "#f5f0e8",
    modifiers: "#1a1a1a",
    accents: "#e8a0a0",
    spacebar: "#f5f0e8",
    functionRow: "#1a1a1a",
    legends: "#1a1a1a",
  },
  botanical: {
    name: "GMK Botanical",
    alphas: "#f5f0e1",
    modifiers: "#2d5a3f",
    accents: "#4a7c59",
    spacebar: "#f5f0e1",
    functionRow: "#2d5a3f",
    legends: "#2d5a3f",
  },
  nautilus: {
    name: "GMK Nautilus",
    alphas: "#1a3a5c",
    modifiers: "#0d2240",
    accents: "#d4a84b",
    spacebar: "#1a3a5c",
    functionRow: "#0d2240",
    legends: "#d4a84b",
  },
  modern_dark: {
    name: "Modern Dark",
    alphas: "#2d2d2d",
    modifiers: "#1a1a1a",
    accents: "#E8590C",
    spacebar: "#2d2d2d",
    functionRow: "#1a1a1a",
    legends: "#e0e0e0",
  },
  mizu: {
    name: "GMK Mizu",
    alphas: "#f0f4f8",
    modifiers: "#4a90c4",
    accents: "#2b6da0",
    spacebar: "#f0f4f8",
    functionRow: "#4a90c4",
    legends: "#2b6da0",
  },
  dracula: {
    name: "GMK Dracula",
    alphas: "#282a36",
    modifiers: "#1e1f29",
    accents: "#bd93f9",
    spacebar: "#282a36",
    functionRow: "#1e1f29",
    legends: "#f8f8f2",
  },
  nord: {
    name: "GMK Nord",
    alphas: "#3b4252",
    modifiers: "#2e3440",
    accents: "#88c0d0",
    spacebar: "#3b4252",
    functionRow: "#2e3440",
    legends: "#d8dee9",
  },
  laser: {
    name: "GMK Laser",
    alphas: "#1a0a2e",
    modifiers: "#0d0520",
    accents: "#ff2975",
    spacebar: "#1a0a2e",
    functionRow: "#0d0520",
    legends: "#c4b5ff",
  },
  bingsu: {
    name: "GMK Bingsu",
    alphas: "#f5ebe0",
    modifiers: "#d4a5a5",
    accents: "#b56b6b",
    spacebar: "#f5ebe0",
    functionRow: "#d4a5a5",
    legends: "#5a3e3e",
  },
  cafe: {
    name: "GMK Cafe",
    alphas: "#f2e6d9",
    modifiers: "#3d2b1f",
    accents: "#c49a6c",
    spacebar: "#f2e6d9",
    functionRow: "#3d2b1f",
    legends: "#3d2b1f",
  },
  carbon: {
    name: "GMK Carbon",
    alphas: "#393939",
    modifiers: "#2d2d2d",
    accents: "#e67e22",
    spacebar: "#393939",
    functionRow: "#2d2d2d",
    legends: "#f0f0f0",
  },
  solarized_dark: {
    name: "Solarized Dark",
    alphas: "#073642",
    modifiers: "#002b36",
    accents: "#b58900",
    spacebar: "#073642",
    functionRow: "#002b36",
    legends: "#839496",
  },
  metropolis: {
    name: "GMK Metropolis",
    alphas: "#505a6e",
    modifiers: "#3a4255",
    accents: "#e8b54d",
    spacebar: "#505a6e",
    functionRow: "#3a4255",
    legends: "#d4d8e0",
  },
};

export const COLORWAY_NAMES = Object.keys(COLORWAYS);
