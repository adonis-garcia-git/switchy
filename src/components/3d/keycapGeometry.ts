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

// ─── Circular (Typewriter-Style) Keycap Geometry ─────────────────────
// Two-tier shape: narrow cylindrical stem topped by a wider flat disc cap
// Matches real-world typewriter / Logitech Pop Keys style circular keycaps

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
  const capRadius = (keycapSize - 0.12) / 2;    // small gap between adjacent caps
  const stemRadiusFraction = 0.55;               // stem is 55% of cap radius
  const stemR = capRadius * stemRadiusFraction;
  const stemHeightFraction = 0.38;               // lower 38% is stem
  const stemH = h * stemHeightFraction;
  const transitionH = h * 0.07;                  // short concave flare zone
  const topChamfer = 0.06;                       // edge rounding
  const dishDepth = 0.015;                       // nearly flat top
  const segments = 32;

  if (widthU <= 1.25) {
    // ── 1u keys: LatheGeometry with typewriter profile ──
    // Profile curve (radius, y) rotated around Y axis
    const halfH = h / 2;
    const points: THREE.Vector2[] = [];

    // Bottom center → closes bottom face
    points.push(new THREE.Vector2(0, -halfH));
    // Bottom edge of stem
    points.push(new THREE.Vector2(stemR, -halfH));
    // Top of stem wall
    points.push(new THREE.Vector2(stemR, -halfH + stemH));

    // Concave flare transition — 4 interpolated curve points
    const flareSteps = 4;
    for (let i = 1; i <= flareSteps; i++) {
      const t = i / (flareSteps + 1);
      const smooth = 0.5 - 0.5 * Math.cos(t * Math.PI);
      const r = stemR + (capRadius - stemR) * smooth;
      const y = -halfH + stemH + transitionH * t;
      points.push(new THREE.Vector2(r, y));
    }

    // Bottom of cap disc
    points.push(new THREE.Vector2(capRadius, -halfH + stemH + transitionH));
    // Cap wall top (before chamfer)
    points.push(new THREE.Vector2(capRadius, halfH - topChamfer));
    // Chamfer shoulder — soft bevel
    const chamferInset = topChamfer * 0.4;
    points.push(new THREE.Vector2(capRadius - chamferInset, halfH - topChamfer * 0.2));
    // Near-flat top edge
    points.push(new THREE.Vector2(capRadius * 0.5, halfH));
    // Very slight convex center rise → closes top face
    points.push(new THREE.Vector2(0, halfH + dishDepth));

    const geo = new THREE.LatheGeometry(points, segments);
    geo.computeVertexNormals();
    geometryCache.set(key, geo);
    return geo;
  } else {
    // ── Wide keys (>1.25u): Stadium/capsule via BoxGeometry vertex morphing ──
    const w = widthU * 1.905 - 0.205;
    const d = keycapSize;
    const endRadius = d / 2 - 0.06; // radius of hemispherical ends

    const segW = 12;
    const segH = 8;
    const segD = 12;

    const geo = new THREE.BoxGeometry(w, h, d, segW, segH, segD);
    const pos = geo.attributes.position as THREE.BufferAttribute;
    const posArray = pos.array as Float32Array;

    const halfW = w / 2;
    const halfH = h / 2;
    const halfD = d / 2;
    const flatHalfW = halfW - endRadius; // center flat zone boundary

    for (let i = 0; i < pos.count; i++) {
      let x = posArray[i * 3];
      let y = posArray[i * 3 + 1];
      let z = posArray[i * 3 + 2];

      const t = (y + halfH) / h; // normalized height 0..1

      // ── 1. Stadium rounding (capsule/pill shape) ──
      if (Math.abs(x) > flatHalfW) {
        // In the semicircular end zone — remap onto semicircle
        const endCenterX = x > 0 ? flatHalfW : -flatHalfW;
        const localX = x - endCenterX;
        const dist = Math.sqrt(localX * localX + z * z);

        if (dist > endRadius && dist > 0.001) {
          x = endCenterX + (localX / dist) * endRadius;
          z = (z / dist) * endRadius;
        }
      } else {
        // In the rectangular center — clamp depth to endRadius
        if (Math.abs(z) > endRadius) {
          z = Math.sign(z) * endRadius;
        }
      }

      // ── 2. Two-tier stem — narrow lower portion ──
      if (t < stemHeightFraction) {
        x *= stemRadiusFraction;
        z *= stemRadiusFraction;
      } else if (t < stemHeightFraction + 0.07) {
        // ── 3. Concave flare transition ──
        const flareT = (t - stemHeightFraction) / 0.07;
        const smooth = 0.5 - 0.5 * Math.cos(flareT * Math.PI);
        const scale = stemRadiusFraction + (1 - stemRadiusFraction) * smooth;
        x *= scale;
        z *= scale;
      }

      // ── 4. Top chamfer — round upper edges ──
      if (t > 0.85) {
        const chamferT = (t - 0.85) / 0.15;
        const edgeFrac = Math.sqrt(x * x + z * z) / (Math.max(halfW, halfD) + 0.001);
        if (edgeFrac > 0.7) {
          const roundFactor = smoothstep(0.7, 1.0, edgeFrac) * chamferT * 0.08;
          y -= roundFactor;
          const inward = smoothstep(0.8, 1.0, edgeFrac) * chamferT * 0.02;
          x *= (1 - inward);
          z *= (1 - inward);
        }
      }

      // ── 5. Very shallow spherical dish ──
      if (t > 0.9) {
        const dishT = (t - 0.9) / 0.1;
        const nx = x / (halfW + 0.001);
        const nz = z / (halfD + 0.001);
        const dist2 = nx * nx + nz * nz;
        const depression = dishDepth * Math.max(0, 1 - dist2) * dishT;
        y -= depression;
      }

      posArray[i * 3] = x;
      posArray[i * 3 + 1] = y;
      posArray[i * 3 + 2] = z;
    }

    pos.needsUpdate = true;
    geo.computeVertexNormals();

    // ── Chamfer normal adjustment for edge highlights ──
    const normals = geo.attributes.normal as THREE.BufferAttribute;
    const normArray = normals.array as Float32Array;

    for (let i = 0; i < pos.count; i++) {
      const x = posArray[i * 3];
      const y = posArray[i * 3 + 1];
      const z = posArray[i * 3 + 2];

      const t = (y + halfH) / h;
      if (t < 0.6) continue;

      const edgeDist = Math.sqrt(x * x + z * z) / (Math.max(halfW, halfD) + 0.001);
      if (edgeDist > 0.75) {
        const chamferStrength = smoothstep(0.75, 1.0, edgeDist) * 0.35;
        const outX = x / (halfW + 0.001);
        const outZ = z / (halfD + 0.001);
        normArray[i * 3] += outX * chamferStrength;
        normArray[i * 3 + 1] += 0.1 * chamferStrength;
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
}

// ─── Helpers ────────────────────────────────────────────────────────

function smoothstep(edge0: number, edge1: number, x: number): number {
  const t = Math.max(0, Math.min(1, (x - edge0) / (edge1 - edge0)));
  return t * t * (3 - 2 * t);
}
