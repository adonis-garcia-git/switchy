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
  "aluminum-matte": { metalness: 0.45, roughness: 0.65, reflectivity: 0.3, normalMapType: "matte-anodized", normalScale: 0.15 },
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

// ─── Cable Materials ─────────────────────────────────────────────────
export const CABLE_MATERIAL: MaterialPreset = {
  metalness: 0,
  roughness: 0.75,
};

export const AVIATOR_MATERIAL: MaterialPreset = {
  metalness: 0.85,
  roughness: 0.2,
};

export const KEYCAP_PROFILE_MULTIPLIERS: Record<string, number[]> = {
  cherry: [1.0, 1.0, 1.0, 1.0, 1.0],
  sa: [1.3, 1.25, 1.2, 1.2, 1.15],
  dsa: [0.9, 0.9, 0.9, 0.9, 0.9],
  mt3: [1.4, 1.35, 1.3, 1.25, 1.2],
  oem: [1.1, 1.05, 1.0, 1.0, 0.95],
  kat: [1.15, 1.1, 1.05, 1.05, 1.0],
  xda: [0.85, 0.85, 0.85, 0.85, 0.85],
};
