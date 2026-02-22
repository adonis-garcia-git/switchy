export interface MaterialPreset {
  metalness: number;
  roughness: number;
  clearcoat?: number;
  clearcoatRoughness?: number;
  reflectivity?: number;
}

export const CASE_MATERIALS: Record<string, MaterialPreset> = {
  aluminum: { metalness: 0.9, roughness: 0.15, reflectivity: 0.8 },
  polycarbonate: { metalness: 0.0, roughness: 0.1, clearcoat: 0.8, clearcoatRoughness: 0.1 },
  plastic: { metalness: 0.0, roughness: 0.4 },
  wood: { metalness: 0.0, roughness: 0.7 },
  brass: { metalness: 1.0, roughness: 0.1, reflectivity: 0.9 },
};

export const PLATE_MATERIALS: Record<string, MaterialPreset> = {
  aluminum: { metalness: 0.85, roughness: 0.2 },
  brass: { metalness: 1.0, roughness: 0.15 },
  polycarbonate: { metalness: 0.0, roughness: 0.1, clearcoat: 0.6, clearcoatRoughness: 0.15 },
  fr4: { metalness: 0.0, roughness: 0.6 },
  pom: { metalness: 0.0, roughness: 0.3, clearcoat: 0.3 },
};

export const KEYCAP_MATERIALS: Record<string, MaterialPreset> = {
  pbt: { metalness: 0.0, roughness: 0.7 },
  abs: { metalness: 0.0, roughness: 0.3 },
  pom: { metalness: 0.0, roughness: 0.2, clearcoat: 0.4, clearcoatRoughness: 0.2 },
};

export const KEYCAP_PROFILE_MULTIPLIERS: Record<string, number[]> = {
  cherry: [1.0, 1.0, 1.0, 1.0, 1.0],  // current sculpted heights
  sa: [1.3, 1.25, 1.2, 1.2, 1.15],     // taller keycaps
  dsa: [0.9, 0.9, 0.9, 0.9, 0.9],      // uniform height
  mt3: [1.4, 1.35, 1.3, 1.25, 1.2],    // tall + deeply sculpted
};
