import * as THREE from "three";

// ─── Types ──────────────────────────────────────────────────────────

export type KeycapProfile = "cherry" | "sa" | "dsa" | "mt3" | "oem" | "kat" | "xda";

interface ProfileParams {
  dishType: "cylindrical" | "spherical";
  dishDepth: number[];     // per-row dish depth (units)
  draftAngle: number;      // side taper in radians
  topScale: number;        // how much the top face shrinks (0-1)
}

// ─── Profile Definitions ────────────────────────────────────────────

const PROFILES: Record<KeycapProfile, ProfileParams> = {
  cherry: {
    dishType: "cylindrical",
    dishDepth: [0.06, 0.05, 0.04, 0.04, 0.03], // deeper on number row
    draftAngle: 0.035,    // ~2 degrees
    topScale: 0.88,
  },
  sa: {
    dishType: "spherical",
    dishDepth: [0.09, 0.09, 0.09, 0.09, 0.09], // uniform deep scoop
    draftAngle: 0.07,     // ~4 degrees
    topScale: 0.82,
  },
  dsa: {
    dishType: "spherical",
    dishDepth: [0.04, 0.04, 0.04, 0.04, 0.04], // uniform shallow
    draftAngle: 0.052,    // ~3 degrees
    topScale: 0.85,
  },
  mt3: {
    dishType: "spherical",
    dishDepth: [0.11, 0.10, 0.09, 0.08, 0.07], // deep with steep taper
    draftAngle: 0.122,    // ~7 degrees
    topScale: 0.78,
  },
  oem: {
    dishType: "cylindrical",
    dishDepth: [0.07, 0.06, 0.05, 0.05, 0.04], // cylindrical, slight taper
    draftAngle: 0.04,     // ~2.3 degrees
    topScale: 0.86,
  },
  kat: {
    dishType: "spherical",
    dishDepth: [0.08, 0.07, 0.06, 0.06, 0.05], // spherical, medium scoop
    draftAngle: 0.065,    // ~3.7 degrees
    topScale: 0.83,
  },
  xda: {
    dishType: "spherical",
    dishDepth: [0.03, 0.03, 0.03, 0.03, 0.03], // uniform flat spherical
    draftAngle: 0.045,    // ~2.6 degrees
    topScale: 0.87,
  },
};

// ─── Geometry Cache ─────────────────────────────────────────────────

const geometryCache = new Map<string, THREE.BufferGeometry>();

function cacheKey(profile: KeycapProfile, row: number, widthU: number): string {
  return `${profile}-${row}-${widthU.toFixed(2)}`;
}

export function clearGeometryCache(): void {
  geometryCache.forEach((g) => g.dispose());
  geometryCache.clear();
}

// ─── Sculpted Geometry Builder ──────────────────────────────────────

export function createSculptedKeycap(
  profile: KeycapProfile,
  row: number,
  widthU: number,
  keycapSize: number,
  keycapHeight: number,
): THREE.BufferGeometry {
  const key = cacheKey(profile, row, widthU);
  const cached = geometryCache.get(key);
  if (cached) return cached;

  const params = PROFILES[profile];
  const clampedRow = Math.min(row, params.dishDepth.length - 1);
  const dishDepth = params.dishDepth[clampedRow];

  const w = widthU * 1.905 - 0.205; // gap-adjusted width
  const d = keycapSize;
  const h = keycapHeight;

  // Subdivisions
  const segW = 8;
  const segH = 4;
  const segD = 8;

  const geo = new THREE.BoxGeometry(w, h, d, segW, segH, segD);
  const pos = geo.attributes.position as THREE.BufferAttribute;
  const posArray = pos.array as Float32Array;

  const halfW = w / 2;
  const halfH = h / 2;
  const halfD = d / 2;
  const topScale = params.topScale;
  const draftAngle = params.draftAngle;

  for (let i = 0; i < pos.count; i++) {
    let x = posArray[i * 3];
    let y = posArray[i * 3 + 1];
    const z = posArray[i * 3 + 2];

    // Normalized height (0 = bottom, 1 = top)
    const t = (y + halfH) / h;

    // ── Draft angle (side taper) ──
    // Sides narrow toward the top
    const taperFactor = 1 - t * draftAngle * 2;
    x *= 1 - (1 - taperFactor) * (Math.abs(x) / halfW);

    // Top face also shrinks
    if (t > 0.85) {
      const topT = (t - 0.85) / 0.15;
      const scale = 1 - topT * (1 - topScale);
      x *= scale;
      // Also taper depth slightly
      posArray[i * 3 + 2] = z * scale;
    }

    // ── Dish (top face only) ──
    if (t > 0.9) {
      const dishT = (t - 0.9) / 0.1; // 0-1 within top region
      const nx = x / halfW; // normalized -1 to 1
      const nz = posArray[i * 3 + 2] / halfD;

      let depression = 0;
      if (params.dishType === "cylindrical") {
        // Cylindrical: dish primarily along x-axis
        depression = dishDepth * (1 - nx * nx) * dishT;
      } else {
        // Spherical: dish in both directions
        const dist2 = nx * nx + nz * nz;
        depression = dishDepth * Math.max(0, 1 - dist2) * dishT;
      }

      y -= depression;
    }

    // ── Edge rounding ──
    // Smooth-step on corners to round sharp edges
    if (t > 0.7) {
      const edgeT = (t - 0.7) / 0.3;
      const cornerDist = Math.max(Math.abs(x) / halfW, Math.abs(posArray[i * 3 + 2]) / halfD);
      if (cornerDist > 0.85) {
        const roundFactor = smoothstep(0.85, 1.0, cornerDist) * edgeT * 0.06;
        y -= roundFactor;
      }
    }

    posArray[i * 3] = x;
    posArray[i * 3 + 1] = y;
  }

  pos.needsUpdate = true;
  geo.computeVertexNormals();

  geometryCache.set(key, geo);
  return geo;
}

// ─── Helpers ────────────────────────────────────────────────────────

function smoothstep(edge0: number, edge1: number, x: number): number {
  const t = Math.max(0, Math.min(1, (x - edge0) / (edge1 - edge0)));
  return t * t * (3 - 2 * t);
}
