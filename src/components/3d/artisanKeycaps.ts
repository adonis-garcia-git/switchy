import * as THREE from "three";

// ─── Artisan Style Types ─────────────────────────────────────────────

export type ArtisanStyle =
  | "mountain"
  | "wave"
  | "gem"
  | "sakura"
  | "topographic"
  | "circuit"
  | "skull"
  | "cat";

export interface ArtisanPreset {
  style: ArtisanStyle;
  name: string;
  primaryColor: string;
  secondaryColor: string;
}

// ─── Built-in Presets ────────────────────────────────────────────────

export const ARTISAN_PRESETS: ArtisanPreset[] = [
  { style: "mountain", name: "Summit", primaryColor: "#4a6741", secondaryColor: "#f5f0e8" },
  { style: "wave", name: "Great Wave", primaryColor: "#1a3a5c", secondaryColor: "#f0f4f8" },
  { style: "gem", name: "Ruby", primaryColor: "#c0392b", secondaryColor: "#e74c3c" },
  { style: "gem", name: "Sapphire", primaryColor: "#2471a3", secondaryColor: "#5dade2" },
  { style: "sakura", name: "Hanami", primaryColor: "#e8a0a0", secondaryColor: "#f5e6e8" },
  { style: "topographic", name: "Contour", primaryColor: "#2d5a3f", secondaryColor: "#f5f0e1" },
  { style: "circuit", name: "PCB", primaryColor: "#1a5c2e", secondaryColor: "#d4a84b" },
  { style: "cat", name: "Neko", primaryColor: "#f5ebe0", secondaryColor: "#3d2b1f" },
];

// ─── Geometry Cache ──────────────────────────────────────────────────

const artisanGeometryCache = new Map<string, THREE.BufferGeometry>();

function artisanCacheKey(style: ArtisanStyle, keycapSize: number, keycapHeight: number): string {
  return `artisan-${style}-${keycapSize.toFixed(2)}-${keycapHeight.toFixed(2)}`;
}

// ─── Displacement Functions ──────────────────────────────────────────

function mountainDisplacement(nx: number, nz: number): number {
  const r = Math.sqrt(nx * nx + nz * nz);
  const peak = Math.max(0, 1 - r * 1.5) * 0.3;
  const ridge = Math.sin(nx * 4 + nz * 2) * 0.04 * (1 - r);
  return peak + ridge;
}

function waveDisplacement(nx: number, nz: number): number {
  return Math.sin(nx * 3.5 + 0.5) * Math.cos(nz * 2.5) * 0.12 +
    Math.sin(nx * 5 + nz * 3) * 0.04;
}

function gemDisplacement(nx: number, nz: number): number {
  const r = Math.sqrt(nx * nx + nz * nz);
  // Faceted pyramid
  const angle = Math.atan2(nz, nx);
  const facets = 6;
  const facetAngle = Math.floor(angle / (Math.PI * 2 / facets)) * (Math.PI * 2 / facets);
  const facetDist = Math.abs(angle - facetAngle - Math.PI / facets);
  const height = Math.max(0, 1 - r * 1.3) * 0.35;
  const facetCut = 1 - facetDist * 0.5;
  return height * facetCut;
}

function sakuraDisplacement(nx: number, nz: number): number {
  // 5-petal flower pattern
  const angle = Math.atan2(nz, nx);
  const r = Math.sqrt(nx * nx + nz * nz);
  const petal = Math.cos(angle * 5) * 0.3 + 0.7;
  const bloom = Math.max(0, 1 - r * 1.5) * petal * 0.15;
  const center = Math.max(0, 1 - r * 4) * 0.1;
  return bloom + center;
}

function topoDisplacement(nx: number, nz: number): number {
  // Topographic contour lines
  const base = Math.sin(nx * 2) * 0.3 + Math.cos(nz * 1.5 + nx) * 0.2;
  const contour = Math.abs(Math.sin(base * 8)) * 0.05;
  return contour + base * 0.05 + 0.05;
}

function circuitDisplacement(nx: number, nz: number): number {
  // Circuit trace pattern — grid-based ridges
  const gridX = Math.abs(Math.sin(nx * 6)) > 0.9 ? 0.08 : 0;
  const gridZ = Math.abs(Math.sin(nz * 6)) > 0.9 ? 0.08 : 0;
  const pad = Math.max(0, 1 - Math.sqrt(nx * nx + nz * nz) * 3) * 0.06;
  return Math.max(gridX, gridZ) + pad;
}

function skullDisplacement(nx: number, nz: number): number {
  // Stylized skull shape
  const r = Math.sqrt(nx * nx + nz * nz);
  const cranium = Math.max(0, 1 - r * 1.2) * 0.25;
  // Eye sockets
  const eyeL = Math.max(0, 1 - Math.sqrt((nx + 0.3) ** 2 + (nz - 0.15) ** 2) * 5) * 0.1;
  const eyeR = Math.max(0, 1 - Math.sqrt((nx - 0.3) ** 2 + (nz - 0.15) ** 2) * 5) * 0.1;
  return cranium - eyeL - eyeR;
}

function catDisplacement(nx: number, nz: number): number {
  // Cat face with ears
  const r = Math.sqrt(nx * nx + nz * nz);
  const face = Math.max(0, 1 - r * 1.4) * 0.15;
  // Ears
  const earL = Math.max(0, 1 - Math.sqrt((nx + 0.5) ** 2 + (nz - 0.5) ** 2) * 4) * 0.2;
  const earR = Math.max(0, 1 - Math.sqrt((nx - 0.5) ** 2 + (nz - 0.5) ** 2) * 4) * 0.2;
  return face + earL + earR;
}

const DISPLACEMENT_FN: Record<ArtisanStyle, (nx: number, nz: number) => number> = {
  mountain: mountainDisplacement,
  wave: waveDisplacement,
  gem: gemDisplacement,
  sakura: sakuraDisplacement,
  topographic: topoDisplacement,
  circuit: circuitDisplacement,
  skull: skullDisplacement,
  cat: catDisplacement,
};

// ─── Create Artisan Geometry ─────────────────────────────────────────

export function createArtisanGeometry(
  style: ArtisanStyle,
  keycapSize: number,
  keycapHeight: number,
): THREE.BufferGeometry {
  const key = artisanCacheKey(style, keycapSize, keycapHeight);
  const cached = artisanGeometryCache.get(key);
  if (cached) return cached;

  // 1u keycap base
  const w = keycapSize;
  const d = keycapSize;
  const h = keycapHeight;
  const segs = 16;

  const geo = new THREE.BoxGeometry(w, h, d, segs, 6, segs);
  const pos = geo.attributes.position as THREE.BufferAttribute;
  const arr = pos.array as Float32Array;

  const halfW = w / 2;
  const halfH = h / 2;
  const halfD = d / 2;
  const displace = DISPLACEMENT_FN[style];

  for (let i = 0; i < pos.count; i++) {
    const x = arr[i * 3];
    const y = arr[i * 3 + 1];
    const z = arr[i * 3 + 2];

    const t = (y + halfH) / h; // 0=bottom, 1=top

    // Slight draft angle
    const taper = 1 - t * 0.04;
    arr[i * 3] = x * taper;
    arr[i * 3 + 2] = z * taper;

    // Top-face displacement
    if (t > 0.85) {
      const topT = (t - 0.85) / 0.15;
      const nx = x / halfW; // -1 to 1
      const nz = z / halfD;
      const displacement = displace(nx, nz) * topT;
      arr[i * 3 + 1] = y + displacement;
    }
  }

  pos.needsUpdate = true;
  geo.computeVertexNormals();

  artisanGeometryCache.set(key, geo);
  return geo;
}

// ─── Artisan Material Overrides ──────────────────────────────────────

export interface ArtisanMaterialProps {
  color: string;
  metalness: number;
  roughness: number;
  clearcoat: number;
  clearcoatRoughness: number;
  emissive?: string;
  emissiveIntensity?: number;
}

export function getArtisanMaterial(
  style: ArtisanStyle,
  primaryColor: string,
): ArtisanMaterialProps {
  switch (style) {
    case "gem":
      return {
        color: primaryColor,
        metalness: 0.1,
        roughness: 0.05,
        clearcoat: 1.0,
        clearcoatRoughness: 0.02,
        emissive: primaryColor,
        emissiveIntensity: 0.15,
      };
    case "circuit":
      return {
        color: primaryColor,
        metalness: 0.3,
        roughness: 0.4,
        clearcoat: 0.6,
        clearcoatRoughness: 0.1,
      };
    case "wave":
    case "mountain":
      return {
        color: primaryColor,
        metalness: 0.0,
        roughness: 0.5,
        clearcoat: 0.3,
        clearcoatRoughness: 0.3,
      };
    default:
      return {
        color: primaryColor,
        metalness: 0.0,
        roughness: 0.6,
        clearcoat: 0.2,
        clearcoatRoughness: 0.3,
      };
  }
}
