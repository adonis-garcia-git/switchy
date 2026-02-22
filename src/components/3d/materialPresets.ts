import type { NormalMapType } from "./proceduralTextures";

export interface MaterialPreset {
  metalness: number;
  roughness: number;
  clearcoat?: number;
  clearcoatRoughness?: number;
  reflectivity?: number;
  normalMapType?: NormalMapType;
  normalScale?: number;
}

export const CASE_MATERIALS: Record<string, MaterialPreset> = {
  aluminum: { metalness: 0.9, roughness: 0.15, reflectivity: 0.8, normalMapType: "brushed-aluminum", normalScale: 0.3 },
  polycarbonate: { metalness: 0.0, roughness: 0.1, clearcoat: 0.8, clearcoatRoughness: 0.1, normalMapType: "polycarbonate", normalScale: 0.15 },
  plastic: { metalness: 0.0, roughness: 0.4, normalMapType: "none" },
  wood: { metalness: 0.0, roughness: 0.7, normalMapType: "wood-grain", normalScale: 0.5 },
  brass: { metalness: 1.0, roughness: 0.1, reflectivity: 0.9, normalMapType: "brass", normalScale: 0.25 },
};

export const PLATE_MATERIALS: Record<string, MaterialPreset> = {
  aluminum: { metalness: 0.85, roughness: 0.2 },
  brass: { metalness: 1.0, roughness: 0.15 },
  polycarbonate: { metalness: 0.0, roughness: 0.1, clearcoat: 0.6, clearcoatRoughness: 0.15 },
  fr4: { metalness: 0.0, roughness: 0.6 },
  pom: { metalness: 0.0, roughness: 0.3, clearcoat: 0.3 },
};

export const KEYCAP_MATERIALS: Record<string, MaterialPreset> = {
  pbt: { metalness: 0.0, roughness: 0.7, normalMapType: "pbt-grain", normalScale: 0.2 },
  abs: { metalness: 0.0, roughness: 0.3, normalMapType: "polycarbonate", normalScale: 0.08 },
  pom: { metalness: 0.0, roughness: 0.2, clearcoat: 0.4, clearcoatRoughness: 0.2, normalMapType: "polycarbonate", normalScale: 0.05 },
};

// ─── Case Finish Modifiers ──────────────────────────────────────────
// Applied on top of case material presets to adjust surface appearance

export interface CaseFinishModifier {
  roughnessOverride?: number;
  metalnessMultiplier: number;
  envMapIntensity: number;
  clearcoat: number;
  clearcoatRoughness: number;
  normalScaleMultiplier: number;
}

export const CASE_FINISHES: Record<string, CaseFinishModifier> = {
  glossy: {
    metalnessMultiplier: 1.0,
    envMapIntensity: 0.8,
    clearcoat: 0,
    clearcoatRoughness: 0,
    normalScaleMultiplier: 1.0,
  },
  matte: {
    roughnessOverride: 0.75,
    metalnessMultiplier: 0.05,
    envMapIntensity: 0.15,
    clearcoat: 0,
    clearcoatRoughness: 0,
    normalScaleMultiplier: 1.6,
  },
  satin: {
    roughnessOverride: 0.45,
    metalnessMultiplier: 0.2,
    envMapIntensity: 0.35,
    clearcoat: 0.1,
    clearcoatRoughness: 0.3,
    normalScaleMultiplier: 1.2,
  },
};

export const KEYCAP_PROFILE_MULTIPLIERS: Record<string, number[]> = {
  cherry: [1.0, 1.0, 1.0, 1.0, 1.0],
  sa: [1.3, 1.25, 1.2, 1.2, 1.15],
  dsa: [0.9, 0.9, 0.9, 0.9, 0.9],
  mt3: [1.4, 1.35, 1.3, 1.25, 1.2],
  oem: [1.1, 1.05, 1.0, 1.0, 0.95],
  kat: [1.15, 1.1, 1.05, 1.05, 1.0],
  xda: [0.85, 0.85, 0.85, 0.85, 0.85],
  circular: [1.2, 1.2, 1.2, 1.2, 1.2],
};
