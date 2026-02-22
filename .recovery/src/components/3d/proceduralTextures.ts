
// ─── Normal Map Getter ──────────────────────────────────────────────

// ─── Matte Anodized ──────────────────────────────────────────────────
// Fine uniform micro-texture (no directional brushing) for matte aluminum finishes

export function createMatteAnodizedNormal(size = 256): THREE.DataTexture {
  return getCachedDataTexture("matte-anodized", () => {
    const data = new Uint8Array(size * size * 4);
    const rand = seededRandom(557);

    for (let y = 0; y < size; y++) {
      for (let x = 0; x < size; x++) {
        const i = (y * size + x) * 4;
        // Fine uniform displacement — no directional bias
        const nx = (rand() - 0.5) * 0.08;
        const ny = (rand() - 0.5) * 0.08;
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

// ─── Normal Map Getter ──────────────────────────────────────────────

export type NormalMapType = "brushed-aluminum" | "pbt-grain" | "wood-grain" | "polycarbonate" | "brass" | "matte-anodized" | "none";

export function getNormalMap(type: NormalMapType): THREE.Texture | null {
  switch (type) {
    case "brushed-aluminum": return createBrushedAluminumNormal();
    case "pbt-grain": return createPBTGrainNormal();
    case "wood-grain": return createWoodGrainNormal();
    case "polycarbonate": return createPolycarbonateNormal();
    case "brass": return createBrassNormal();
    case "matte-anodized": return createMatteAnodizedNormal();
    case "none":
    default: return null;
  }
}
