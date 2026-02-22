import * as THREE from "three";

// ─── Texture Cache ──────────────────────────────────────────────────
const textureCache = new Map<string, THREE.Texture>();

function getCachedDataTexture(key: string, create: () => THREE.DataTexture): THREE.DataTexture {
  const cached = textureCache.get(key);
  if (cached) return cached as THREE.DataTexture;
  const tex = create();
  textureCache.set(key, tex);
  return tex;
}

function getCachedCanvasTexture(key: string, create: () => THREE.CanvasTexture): THREE.CanvasTexture {
  const cached = textureCache.get(key);
  if (cached) return cached as THREE.CanvasTexture;
  const tex = create();
  textureCache.set(key, tex);
  return tex;
}

// ─── Utility ────────────────────────────────────────────────────────

function seededRandom(seed: number): () => number {
  let s = seed;
  return () => {
    s = (s * 16807 + 0) % 2147483647;
    return (s - 1) / 2147483646;
  };
}

function encodeNormal(nx: number, ny: number): [number, number, number] {
  return [
    Math.round((nx * 0.5 + 0.5) * 255),
    Math.round((ny * 0.5 + 0.5) * 255),
    255, // nz always pointing up (flat base)
  ];
}

// ─── Brushed Aluminum ───────────────────────────────────────────────
// High-frequency horizontal streaks simulating directional brushing

export function createBrushedAluminumNormal(size = 256): THREE.DataTexture {
  return getCachedDataTexture("brushed-aluminum", () => {
    const data = new Uint8Array(size * size * 4);
    const rand = seededRandom(42);

    for (let y = 0; y < size; y++) {
      // Each scanline has a persistent horizontal streak component
      const lineNoise = (rand() - 0.5) * 0.4;
      for (let x = 0; x < size; x++) {
        const i = (y * size + x) * 4;
        // Fine horizontal grain with slight per-pixel variation
        const nx = lineNoise + (rand() - 0.5) * 0.08;
        const ny = (rand() - 0.5) * 0.05; // minimal vertical displacement
        const [r, g, b] = encodeNormal(nx, ny);
        data[i] = r;
        data[i + 1] = g;
        data[i + 2] = b;
        data[i + 3] = 255;
      }
    }

    const tex = new THREE.DataTexture(data, size, size, THREE.RGBAFormat);
    tex.wrapS = tex.wrapT = THREE.RepeatWrapping;
    tex.needsUpdate = true;
    return tex;
  });
}

// ─── PBT Grain ──────────────────────────────────────────────────────
// Subtle random bumps simulating matte plastic micro-texture

export function createPBTGrainNormal(size = 256): THREE.DataTexture {
  return getCachedDataTexture("pbt-grain", () => {
    const data = new Uint8Array(size * size * 4);
    const rand = seededRandom(137);

    for (let y = 0; y < size; y++) {
      for (let x = 0; x < size; x++) {
        const i = (y * size + x) * 4;
        const nx = (rand() - 0.5) * 0.15;
        const ny = (rand() - 0.5) * 0.15;
        const [r, g, b] = encodeNormal(nx, ny);
        data[i] = r;
        data[i + 1] = g;
        data[i + 2] = b;
        data[i + 3] = 255;
      }
    }

    const tex = new THREE.DataTexture(data, size, size, THREE.RGBAFormat);
    tex.wrapS = tex.wrapT = THREE.RepeatWrapping;
    tex.needsUpdate = true;
    return tex;
  });
}

// ─── Wood Grain ─────────────────────────────────────────────────────
// Canvas-drawn elongated curves simulating wood rings and grain

export function createWoodGrainNormal(size = 512): THREE.CanvasTexture {
  return getCachedCanvasTexture("wood-grain", () => {
    const canvas = document.createElement("canvas");
    canvas.width = size;
    canvas.height = size;
    const ctx = canvas.getContext("2d")!;

    // Flat normal base (pointing straight up in tangent space)
    ctx.fillStyle = `rgb(128, 128, 255)`;
    ctx.fillRect(0, 0, size, size);

    // Draw grain lines
    const rand = seededRandom(77);
    for (let i = 0; i < 60; i++) {
      const y = rand() * size;
      const thickness = 0.5 + rand() * 2;
      const waviness = rand() * 8;
      const offset = rand() * Math.PI * 2;

      ctx.beginPath();
      ctx.strokeStyle = `rgba(${110 + rand() * 36}, 128, 255, ${0.3 + rand() * 0.4})`;
      ctx.lineWidth = thickness;

      for (let x = 0; x < size; x += 2) {
        const yOff = y + Math.sin(x * 0.02 + offset) * waviness;
        if (x === 0) ctx.moveTo(x, yOff);
        else ctx.lineTo(x, yOff);
      }
      ctx.stroke();
    }

    // Add some ring patterns
    for (let i = 0; i < 5; i++) {
      const cx = rand() * size;
      const cy = rand() * size;
      const r = 40 + rand() * 120;
      ctx.beginPath();
      ctx.arc(cx, cy, r, 0, Math.PI * 2);
      ctx.strokeStyle = `rgba(${115 + rand() * 26}, 128, 255, 0.15)`;
      ctx.lineWidth = 1 + rand() * 2;
      ctx.stroke();
    }

    const tex = new THREE.CanvasTexture(canvas);
    tex.wrapS = tex.wrapT = THREE.RepeatWrapping;
    tex.needsUpdate = true;
    return tex;
  });
}

// ─── Polycarbonate ──────────────────────────────────────────────────
// Nearly smooth with faint surface imperfections

export function createPolycarbonateNormal(size = 256): THREE.DataTexture {
  return getCachedDataTexture("polycarbonate", () => {
    const data = new Uint8Array(size * size * 4);
    const rand = seededRandom(211);

    for (let y = 0; y < size; y++) {
      for (let x = 0; x < size; x++) {
        const i = (y * size + x) * 4;
        // Very subtle bumps — mostly flat
        const nx = (rand() - 0.5) * 0.04;
        const ny = (rand() - 0.5) * 0.04;
        const [r, g, b] = encodeNormal(nx, ny);
        data[i] = r;
        data[i + 1] = g;
        data[i + 2] = b;
        data[i + 3] = 255;
      }
    }

    const tex = new THREE.DataTexture(data, size, size, THREE.RGBAFormat);
    tex.wrapS = tex.wrapT = THREE.RepeatWrapping;
    tex.needsUpdate = true;
    return tex;
  });
}

// ─── Brass Polishing ────────────────────────────────────────────────
// Concentric circular polishing marks radiating from center

export function createBrassNormal(size = 256): THREE.CanvasTexture {
  return getCachedCanvasTexture("brass", () => {
    const canvas = document.createElement("canvas");
    canvas.width = size;
    canvas.height = size;
    const ctx = canvas.getContext("2d")!;

    // Flat normal base
    ctx.fillStyle = `rgb(128, 128, 255)`;
    ctx.fillRect(0, 0, size, size);

    const cx = size / 2;
    const cy = size / 2;
    const rand = seededRandom(313);

    // Concentric polishing rings
    for (let i = 0; i < 80; i++) {
      const r = 10 + rand() * (size * 0.6);
      const startAngle = rand() * Math.PI * 2;
      const arcLen = 0.3 + rand() * 1.5;

      ctx.beginPath();
      ctx.arc(cx + (rand() - 0.5) * 20, cy + (rand() - 0.5) * 20, r, startAngle, startAngle + arcLen);
      ctx.strokeStyle = `rgba(${118 + rand() * 20}, 128, 255, ${0.15 + rand() * 0.25})`;
      ctx.lineWidth = 0.5 + rand() * 1.5;
      ctx.stroke();
    }

    const tex = new THREE.CanvasTexture(canvas);
    tex.wrapS = tex.wrapT = THREE.RepeatWrapping;
    tex.needsUpdate = true;
    return tex;
  });
}

// ─── Normal Map Getter ──────────────────────────────────────────────

export type NormalMapType = "brushed-aluminum" | "pbt-grain" | "wood-grain" | "polycarbonate" | "brass" | "none";

export function getNormalMap(type: NormalMapType): THREE.Texture | null {
  switch (type) {
    case "brushed-aluminum": return createBrushedAluminumNormal();
    case "pbt-grain": return createPBTGrainNormal();
    case "wood-grain": return createWoodGrainNormal();
    case "polycarbonate": return createPolycarbonateNormal();
    case "brass": return createBrassNormal();
    case "none":
    default: return null;
  }
}
