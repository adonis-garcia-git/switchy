import type { BuildData, KeyboardData } from "./types";
import type { PerKeyOverrides, SelectionMode } from "./keyCustomization";
import type { RGBMode } from "@/components/3d/RGBController";
import type { MountingStyle } from "@/components/3d/CaseGeometry";
import type { EnvironmentPresetName, CameraPresetName } from "@/components/3d/SceneEnvironment";
import type { KeycapColorway } from "@/components/3d/colorways";

export interface KeyboardViewerConfig {
  caseColor: string;
  keycapColor: string;
  keycapAccentColor: string;
  plateColor: string;
  caseMaterial: "aluminum" | "polycarbonate" | "plastic" | "wood" | "brass";
  plateMaterial: "aluminum" | "brass" | "polycarbonate" | "fr4" | "pom";
  keycapMaterial: "pbt" | "abs" | "pom";
  size: "60" | "65" | "75" | "tkl" | "full";
  hasRGB: boolean;
  rgbColor: string;
  keycapProfile: "cherry" | "sa" | "dsa" | "mt3" | "oem" | "kat" | "xda";
  showLegends: boolean;
  userColors?: {
    case?: string;
    keycap?: string;
    accent?: string;
  };
  // ─── Phase 3: Case details ──
  mountingStyle?: MountingStyle;
  // ─── Phase 4: Per-key RGB ──
  rgbMode?: RGBMode;
  rgbSecondaryColor?: string;
  rgbSpeed?: number;
  rgbBrightness?: number;
  // ─── Phase 6: Colorways ──
  colorway?: string;
  customColorway?: KeycapColorway;
  // ─── Phase 7: Scene/Environment ──
  environment?: EnvironmentPresetName;
  showDesk?: boolean;
  deskColor?: string;
  cameraPreset?: CameraPresetName;
  // ─── Phase 8: Interactive ──
  interactive?: boolean;
  // ─── Phase 9: Per-key customization ──
  perKeyOverrides?: PerKeyOverrides;
  selectionMode?: SelectionMode;
  selectedKeys?: Set<string>;
  paintMode?: boolean;
  // ─── Phase 10: Sophisticated upgrades ──
  caseFinish?: "glossy" | "matte" | "satin";
  connectionType?: "wired" | "wireless" | "bluetooth";
  cableColor?: string;
  switchStemColor?: string;
  // ─── Phase 11: Massive upgrade ──
  keycapShape?: "standard" | "circular";
  typingAngle?: number;      // 0-12 degrees, default 6
  deskMaterial?: "wood" | "marble" | "leather" | "concrete" | "fabric" | "metal";
  soundEnabled?: boolean;
  soundProfile?: "linear" | "tactile" | "clicky" | "silent";
}

export const MATERIAL_KEYWORDS: Record<string, KeyboardViewerConfig["caseMaterial"]> = {
  aluminum: "aluminum",
  aluminium: "aluminum",
  alu: "aluminum",
  polycarbonate: "polycarbonate",
  pc: "polycarbonate",
  plastic: "plastic",
  abs: "plastic",
  wood: "wood",
  wooden: "wood",
  brass: "brass",
};

export const PLATE_KEYWORDS: Record<string, KeyboardViewerConfig["plateMaterial"]> = {
  aluminum: "aluminum",
  aluminium: "aluminum",
  alu: "aluminum",
  brass: "brass",
  polycarbonate: "polycarbonate",
  pc: "polycarbonate",
  fr4: "fr4",
  pom: "pom",
};

const KEYCAP_KEYWORDS: Record<string, KeyboardViewerConfig["keycapMaterial"]> = {
  pbt: "pbt",
  abs: "abs",
  pom: "pom",
};

const COLOR_KEYWORDS: Record<string, string> = {
  // Neutrals
  black: "#1a1a1a",
  white: "#f0f0f0",
  gray: "#6b6b6b",
  grey: "#6b6b6b",
  silver: "#c0c0c0",
  dark: "#1a1a1a",
  charcoal: "#2d2d2d",
  // Warm
  red: "#c0392b",
  orange: "#e67e22",
  yellow: "#f1c40f",
  cream: "#f5f0e1",
  beige: "#d4c5a9",
  brown: "#8b6914",
  // Cool
  blue: "#2980b9",
  navy: "#1a3a5c",
  teal: "#16a085",
  green: "#27ae60",
  mint: "#98e4c4",
  cyan: "#00bcd4",
  // Accent
  purple: "#8e44ad",
  pink: "#e84393",
  rose: "#e74c6f",
  lavender: "#b39ddb",
  // Brand
  olivia: "#e8a0a0",
  botanical: "#4a7c59",
  nautilus: "#1a3a5c",
  gmk: "#2d2d2d",
  bingsu: "#d4a5a5",
};

const SIZE_KEYWORDS: Record<string, KeyboardViewerConfig["size"]> = {
  "60%": "60",
  "60": "60",
  "65%": "65",
  "65": "65",
  "75%": "75",
  "75": "75",
  tkl: "tkl",
  tenkeyless: "tkl",
  "80%": "tkl",
  full: "full",
  "100%": "full",
  "full-size": "full",
  fullsize: "full",
};

export const MOUNTING_KEYWORDS: Record<string, MountingStyle> = {
  gasket: "gasket",
  "gasket-mount": "gasket",
  "top-mount": "top-mount",
  "top mount": "top-mount",
  topmount: "top-mount",
  "tray-mount": "tray-mount",
  "tray mount": "tray-mount",
  traymount: "tray-mount",
  "plate-mount": "plate-mount",
  "plate mount": "plate-mount",
};

export function parseKeyword<T>(text: string, keywords: Record<string, T>): T | undefined {
  const lower = text.toLowerCase();
  for (const [keyword, value] of Object.entries(keywords)) {
    if (lower.includes(keyword)) return value;
  }
  return undefined;
}

function parseColor(text: string): string | undefined {
  const lower = text.toLowerCase();
  for (const [keyword, hex] of Object.entries(COLOR_KEYWORDS)) {
    if (lower.includes(keyword)) return hex;
  }
  return undefined;
}

export function buildDataToViewerConfig(build: BuildData, keyboard?: KeyboardData): KeyboardViewerConfig {
  const config: KeyboardViewerConfig = {
    caseColor: "#2d2d2d",
    keycapColor: "#e8e8e8",
    keycapAccentColor: "#E8590C",
    plateColor: "#8a8a8a",
    caseMaterial: "aluminum",
    plateMaterial: "aluminum",
    keycapMaterial: "pbt",
    size: "65",
    hasRGB: false,
    rgbColor: "#E8590C",
    keycapProfile: "cherry",
    showLegends: true,
  };

  // Parse from keyboard data if available
  if (keyboard) {
    config.caseMaterial = parseKeyword(keyboard.caseMaterial, MATERIAL_KEYWORDS) || config.caseMaterial;
    if (keyboard.plateMaterial) {
      config.plateMaterial = parseKeyword(keyboard.plateMaterial, PLATE_KEYWORDS) || config.plateMaterial;
    }
    config.size = parseKeyword(keyboard.size, SIZE_KEYWORDS) || config.size;
    config.hasRGB = keyboard.rgb;
    config.caseColor = parseColor(keyboard.caseMaterial) || config.caseColor;

    // Parse mounting style if available
    if (keyboard.mountingStyle) {
      config.mountingStyle = parseKeyword(keyboard.mountingStyle, MOUNTING_KEYWORDS);
    }
  }

  // Parse from build components
  if (build.components) {
    const kitName = build.components.keyboardKit?.name || "";
    const keycapName = build.components.keycaps?.name || "";

    // Case material from kit name
    config.caseMaterial = parseKeyword(kitName, MATERIAL_KEYWORDS) || config.caseMaterial;
    config.caseColor = parseColor(kitName) || config.caseColor;

    // Size from kit name
    config.size = parseKeyword(kitName, SIZE_KEYWORDS) || config.size;

    // Keycap material and color
    config.keycapMaterial = parseKeyword(keycapName, KEYCAP_KEYWORDS) || config.keycapMaterial;
    config.keycapColor = parseColor(keycapName) || config.keycapColor;

    // Accent color from keycap set name patterns
    const accentColor = parseColor(keycapName.replace(config.keycapColor, ""));
    if (accentColor && accentColor !== config.keycapColor) {
      config.keycapAccentColor = accentColor;
    }

    // Mounting style from kit name
    config.mountingStyle = parseKeyword(kitName, MOUNTING_KEYWORDS) || config.mountingStyle;
  }

  return config;
}

export const DEFAULT_VIEWER_CONFIG: KeyboardViewerConfig = {
  caseColor: "#2d2d2d",
  keycapColor: "#e8e8e8",
  keycapAccentColor: "#E8590C",
  plateColor: "#8a8a8a",
  caseMaterial: "aluminum",
  plateMaterial: "aluminum",
  keycapMaterial: "pbt",
  size: "65",
  hasRGB: false,
  rgbColor: "#E8590C",
  keycapProfile: "cherry",
  showLegends: true,
};
