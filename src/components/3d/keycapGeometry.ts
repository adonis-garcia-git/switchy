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
    dishDepth: [0.07, 0.06, 0.05, 0.05, 0.04],
    draftAngle: 0.04,     // ~2.3 degrees
    topScale: 0.86,
  },
  kat: {
    dishType: "spherical",
    dishDepth: [0.08, 0.07, 0.06, 0.06, 0.05],
    draftAngle: 0.06,     // ~3.4 degrees
    topScale: 0.83,
  },
  xda: {
    dishType: "spherical",
    dishDepth: [0.03, 0.03, 0.03, 0.03, 0.03], // uniform flat
    draftAngle: 0.035,    // ~2 degrees
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

  // Subdivisions (6 vertical for smoother chamfer silhouette)
  const segW = 8;
  const segH = 6;
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

    // ── Edge rounding + chamfer bevel ──
    // Enhanced smooth-step on corners to round sharp edges
    // with wider chamfer zone for rim lighting catch
    if (t > 0.6) {
      const edgeT = (t - 0.6) / 0.4;
      const cornerDist = Math.max(Math.abs(x) / halfW, Math.abs(posArray[i * 3 + 2]) / halfD);
      if (cornerDist > 0.8) {
        // More aggressive rounding for chamfer effect
        const roundFactor = smoothstep(0.8, 1.0, cornerDist) * edgeT * 0.09;
        y -= roundFactor;
        // Push edges slightly inward for bevel geometry
        const inwardPush = smoothstep(0.85, 1.0, cornerDist) * edgeT * 0.015;
        x *= (1 - inwardPush);
        posArray[i * 3 + 2] = posArray[i * 3 + 2] * (1 - inwardPush);
      }
    }

    posArray[i * 3] = x;
    posArray[i * 3 + 1] = y;
  }

  pos.needsUpdate = true;
  geo.computeVertexNormals();

  // ── Chamfer normal adjustment ──
  // Tilt normals outward at keycap edges to create a bevel that catches rim lighting
  const normals = geo.attributes.normal as THREE.BufferAttribute;
  const normArray = normals.array as Float32Array;

  for (let i = 0; i < pos.count; i++) {
    const x = posArray[i * 3];
    const y = posArray[i * 3 + 1];
    const z = posArray[i * 3 + 2];

    const t = (y + halfH) / h;
    if (t < 0.6) continue;

    const edgeDist = Math.max(Math.abs(x) / halfW, Math.abs(z) / halfD);
    if (edgeDist > 0.75) {
      const chamferStrength = smoothstep(0.75, 1.0, edgeDist) * 0.35;
      // Tilt normal outward from center
      const outX = x / (halfW + 0.001);
      const outZ = z / (halfD + 0.001);
      normArray[i * 3] += outX * chamferStrength;
      normArray[i * 3 + 1] += 0.1 * chamferStrength; // slight upward bias
      normArray[i * 3 + 2] += outZ * chamferStrength;

      // Re-normalize
      const nx = normArray[i * 3];
      const ny = normArray[i * 3 + 1];
      const nz = normArray[i * 3 + 2];
      const len = Math.sqrt(nx * nx + ny * ny + nz * nz);
      if (len > 0) {
        normArray[i * 3] /= len;
        normArray[i * 3 + 1] /= len;
        normArray[i * 3 + 2] /= len;
      }
    }
  }
  normals.needsUpdate = true;

  geometryCache.set(key, geo);
  return geo;
}

// ─── Circular Keycap Geometry ────────────────────────────────────────

export function createCircularKeycap(
  row: number,
  widthU: number,
  keycapSize: number,
  keycapHeight: number,
): THREE.BufferGeometry {
  const key = `circular-${row}-${widthU.toFixed(2)}`;
  const cached = geometryCache.get(key);
  if (cached) return cached;

  const h = keycapHeight;
  const baseRadius = keycapSize / 2;
  const topRadius = baseRadius * 0.88; // slight draft angle
  const radialSegs = 24;
  const heightSegs = 6;

  if (widthU <= 1.25) {
    // Standard circular key — cylinder with spherical dish
    const geo = new THREE.CylinderGeometry(topRadius, baseRadius, h, radialSegs, heightSegs);
    const pos = geo.attributes.position as THREE.BufferAttribute;
    const posArray = pos.array as Float32Array;
    const halfH = h / 2;

    // Apply spherical dish to top face
    for (let i = 0; i < pos.count; i++) {
      const x = posArray[i * 3];
      const y = posArray[i * 3 + 1];
      const z = posArray[i * 3 + 2];
      const t = (y + halfH) / h;

      if (t > 0.85) {
        const dishT = (t - 0.85) / 0.15;
        const dist2 = (x * x + z * z) / (topRadius * topRadius);
        const depression = 0.06 * Math.max(0, 1 - dist2) * dishT;
        posArray[i * 3 + 1] = y - depression;
      }
    }

    pos.needsUpdate = true;
    geo.computeVertexNormals();
    geometryCache.set(key, geo);
    return geo;
  } else {
    // Wide key — stadium/oval shape (stretched cylinder)
    const w = widthU * 1.905 - 0.205;
    const d = keycapSize;
    const stretch = w / d;

    const geo = new THREE.CylinderGeometry(topRadius, baseRadius, h, radialSegs, heightSegs);
    const pos = geo.attributes.position as THREE.BufferAttribute;
    const posArray = pos.array as Float32Array;
    const halfH = h / 2;

    for (let i = 0; i < pos.count; i++) {
      // Stretch x-axis for stadium shape
      posArray[i * 3] *= stretch;

      const x = posArray[i * 3];
      const y = posArray[i * 3 + 1];
      const z = posArray[i * 3 + 2];
      const t = (y + halfH) / h;

      if (t > 0.85) {
        const dishT = (t - 0.85) / 0.15;
        const nx = x / (topRadius * stretch);
        const nz = z / topRadius;
        const dist2 = nx * nx + nz * nz;
        const depression = 0.04 * Math.max(0, 1 - dist2) * dishT;
        posArray[i * 3 + 1] = y - depression;
      }
    }

    pos.needsUpdate = true;
    geo.computeVertexNormals();
    geometryCache.set(key, geo);
    return geo;
  }
}

// ─── Helpers ────────────────────────────────────────────────────────

function smoothstep(edge0: number, edge1: number, x: number): number {
  const t = Math.max(0, Math.min(1, (x - edge0) / (edge1 - edge0)));
  return t * t * (3 - 2 * t);
}
