#!/usr/bin/env node

/**
 * generate-images.mjs
 *
 * Standalone script that generates 9 AI images for the Switchy home screen
 * and builds page via the Replicate API (google/nano-banana-pro).
 *
 * Usage:
 *   REPLICATE_API_TOKEN=r8_xxxxx node generate-images.mjs
 *
 * Images are saved as WebP to public/images/.
 */

import { writeFile, mkdir } from "node:fs/promises";
import { existsSync } from "node:fs";
import path from "node:path";

const REPLICATE_API_TOKEN = process.env.REPLICATE_API_TOKEN;
if (!REPLICATE_API_TOKEN) {
  console.error("Error: REPLICATE_API_TOKEN env var is required.");
  console.error("Usage: REPLICATE_API_TOKEN=r8_xxxxx node generate-images.mjs");
  process.exit(1);
}

const OUTPUT_DIR = path.join(process.cwd(), "public", "images");

const IMAGES = [
  {
    filename: "feature-group-buys.webp",
    aspect_ratio: "16:9",
    prompt: `A curated arrangement of premium mechanical keyboard components laid out on a matte black surface, viewed from a 45-degree overhead angle. Multiple keyboard kits in various stages of assembly — one fully built with dark gray keycaps, one bare PCB with exposed gold contacts, and one aluminum case without internals. Scattered around them are small piles of mechanical switches in translucent housings and a few artisan keycaps. Warm directional lighting from the upper left casts long, dramatic shadows. A single warm orange accent light (#E8590C) provides rim lighting on the metal edges of the cases, creating subtle orange reflections on the brushed aluminum surfaces. Shallow depth of field with the foreground keyboard in sharp focus and background elements softly blurred. Shot on a macro lens at f/2.8, creating a sense of exclusive limited-edition products waiting to be claimed. Dark, moody atmosphere. No text, no logos, no watermarks. Studio product photography style. 4K resolution, 16:9 aspect ratio.`,
  },
  {
    filename: "feature-build-wizard.webp",
    aspect_ratio: "16:9",
    prompt: `A single premium mechanical keyboard photographed in the process of being assembled, viewed from a low three-quarter angle. The keyboard case is open, revealing a half-populated PCB board with some switches already inserted and others waiting beside it in a neat row. A precision screwdriver and switch puller tool rest nearby on the dark matte surface. The scene is lit by dramatic side lighting with warm amber and orange tones (#E8590C), casting precise highlights along the metal tools and the edges of the keyboard case. The background is a deep, near-black gradient. Thin lines of orange light trace along the edges of the keyboard frame like a blueprint coming to life. Cinematic shallow depth of field, 85mm portrait lens at f/2.0. The mood evokes the careful, step-by-step precision of building something custom. No text, no UI elements, no watermarks. Studio product photography. 4K resolution, 16:9 aspect ratio.`,
  },
  {
    filename: "feature-glossary.webp",
    aspect_ratio: "16:9",
    prompt: `An extreme close-up macro photograph of mechanical keyboard switch internals, showing the cross-section of a disassembled switch with the spring, stem, and housing visible. The switch components are arranged in an exploded-view layout on a dark slate surface, each part slightly separated to reveal the mechanism. Warm directional lighting from the right side with an orange color temperature (#E8590C) creating highlights on the metallic spring coils and the polished stem. The translucent switch housing catches and refracts the light subtly. Extremely shallow depth of field — the spring is in razor-sharp focus while the housing blurs softly. Shot with a macro lens at f/1.8, revealing microscopic surface textures. Dark moody atmosphere with a near-black background. The image conveys technical knowledge and deep understanding of keyboard components. No text, no labels, no watermarks. 4K resolution, 16:9 aspect ratio.`,
  },
  {
    filename: "feature-tips-mods.webp",
    aspect_ratio: "16:9",
    prompt: `A wide cinematic photograph of a mechanical keyboard modding workstation, captured from a slightly elevated angle. On the right side of the frame: a partially disassembled mechanical keyboard with keycaps removed, alongside small containers of Krytox lubricant, a brush applying lube to a switch stem, a roll of foam dampening material, and band-aids cut for stabilizer modification. The left third of the frame is intentionally darker and emptier — just the edge of the dark matte desk surface fading into deep shadow, providing clear negative space. Warm workshop lighting from the upper right with strong orange-amber accent tones (#E8590C), creating dramatic rim lighting on the tools and switch components. Small bokeh highlights from background workshop elements. Shallow depth of field with the modding tools in focus. The atmosphere is that of a craftsperson's workbench late at night — focused, intimate, premium. Shot at 35mm wide angle, f/2.0. No text, no overlays, no watermarks. Cinematic ultra-wide composition. 4K resolution, 16:9 aspect ratio.`,
  },
  {
    filename: "category-switches.webp",
    aspect_ratio: "1:1",
    prompt: `A dramatic overhead photograph of dozens of mechanical keyboard switches scattered across a dark matte black surface. The switches are a mix of translucent, opaque, and colored housings — some upright showing their stems, others on their sides revealing the spring mechanism. They are arranged in a natural, flowing scatter pattern that suggests abundance. A single warm orange light source (#E8590C) from the left creates sharp highlights on the translucent housings, making them glow with internal warmth. Long, soft shadows extend to the right. The background is pure dark, near-black. Shot from directly above with a 50mm lens at f/4, giving even sharpness across the scattered switches with a slight vignette at the edges. Premium product photography aesthetic. No text, no watermarks. 4K resolution, 1:1 square aspect ratio.`,
  },
  {
    filename: "category-keyboards.webp",
    aspect_ratio: "1:1",
    prompt: `A premium mechanical keyboard kit photographed at a dramatic low angle, the keyboard tilted slightly toward the camera to reveal its aluminum case profile and side-mounted USB-C port. The case has a brushed dark anodized aluminum finish. Warm orange accent lighting (#E8590C) catches the beveled edges of the case, creating thin bright orange highlight lines along the metal. The keycaps are a dark, uniform charcoal gray. The background is a smooth dark gradient from near-black to slightly lighter charcoal. Shot with an 85mm lens at f/2.8, creating a shallow depth of field where the front edge of the keyboard is sharp and the back row of keycaps dissolves into soft bokeh. Moody, premium product photography. No text, no watermarks. 4K resolution, 1:1 square aspect ratio.`,
  },
  {
    filename: "category-keycaps.webp",
    aspect_ratio: "1:1",
    prompt: `A close-up photograph of a collection of premium PBT keycaps arranged in a loose, artistic cluster on a dark matte surface. The keycaps show various profiles — Cherry, SA, and MT3 — in a monochromatic dark palette with one set featuring subtle warm orange (#E8590C) legends and accent keys. Some keycaps are standing upright showing their sculpted profiles, others are face-down revealing their stem mounts. Warm directional lighting from the upper left highlights the surface texture of the PBT material, showing the subtle matte grain. Shallow depth of field with the center cluster in focus. Dark, moody atmosphere with near-black background. Product photography with artistic still-life composition. No text, no watermarks. 4K resolution, 1:1 square aspect ratio.`,
  },
  {
    filename: "category-accessories.webp",
    aspect_ratio: "1:1",
    prompt: `A carefully arranged flat-lay of mechanical keyboard accessories on a dark matte surface, shot from directly above. Items include: a small jar of Krytox switch lubricant, a coiled aviator USB-C cable in dark paracord, a switch opener tool, a set of stabilizer wires, a strip of PCB foam, and a keycap puller — all arranged with geometric precision and breathing room between items. Warm orange accent light (#E8590C) from the left edge creates subtle highlights on the metallic tools and the glass lubricant jar. Deep shadows on the right side. The composition is clean, organized, and technical — like a surgeon's tray of instruments. Shot with a 50mm lens at f/4 for even sharpness. Near-black background with subtle grain texture. No text, no watermarks. 4K resolution, 1:1 square aspect ratio.`,
  },
  {
    filename: "build-card-default.webp",
    aspect_ratio: "16:9",
    prompt: `An abstract dark background texture for a card UI element. Subtle concentric ripple pattern on a near-black (#0c0c0c) surface, as if a single drop hit dark water. Very faint warm orange (#E8590C) gradient glow from the center, barely visible — just enough to add depth without competing with text overlay. The texture should be minimal, moody, and not distracting. Smooth gradients with subtle grain noise. No recognizable objects, no text, no watermarks. Dark abstract background suitable for text overlay. 4K resolution, 16:9 aspect ratio.`,
  },
];

async function createPrediction(prompt, aspect_ratio) {
  const res = await fetch(
    "https://api.replicate.com/v1/models/google/nano-banana-pro/predictions",
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${REPLICATE_API_TOKEN}`,
        "Content-Type": "application/json",
        Prefer: "wait",
      },
      body: JSON.stringify({
        input: { prompt, aspect_ratio },
      }),
    }
  );

  if (!res.ok) {
    const body = await res.text();
    throw new Error(`Replicate API error (${res.status}): ${body}`);
  }

  return res.json();
}

async function pollPrediction(prediction) {
  const pollUrl =
    prediction.urls?.get ||
    `https://api.replicate.com/v1/predictions/${prediction.id}`;

  let result = prediction;
  const maxAttempts = 60; // up to 2 minutes per image

  for (let i = 0; i < maxAttempts; i++) {
    if (result.status === "succeeded") return result;
    if (result.status === "failed" || result.status === "canceled") {
      throw new Error(
        `Generation ${result.status}: ${result.error || "Unknown error"}`
      );
    }

    await new Promise((r) => setTimeout(r, 2000));

    const res = await fetch(pollUrl, {
      headers: { Authorization: `Bearer ${REPLICATE_API_TOKEN}` },
    });
    result = await res.json();
  }

  throw new Error("Generation timed out after 2 minutes");
}

async function downloadImage(url) {
  const res = await fetch(url);
  if (!res.ok) throw new Error(`Download failed (${res.status})`);
  return Buffer.from(await res.arrayBuffer());
}

async function main() {
  if (!existsSync(OUTPUT_DIR)) {
    await mkdir(OUTPUT_DIR, { recursive: true });
  }

  console.log(`\nGenerating ${IMAGES.length} images via Replicate (google/nano-banana-pro)...\n`);

  for (let i = 0; i < IMAGES.length; i++) {
    const { filename, prompt, aspect_ratio } = IMAGES[i];
    const tag = `[${i + 1}/${IMAGES.length}]`;

    console.log(`${tag} Generating ${filename}...`);

    const prediction = await createPrediction(prompt, aspect_ratio);
    const result = await pollPrediction(prediction);

    const imageUrl = Array.isArray(result.output)
      ? result.output[0]
      : result.output;

    const buffer = await downloadImage(imageUrl);
    const outPath = path.join(OUTPUT_DIR, filename);
    await writeFile(outPath, buffer);

    const sizeKB = (buffer.length / 1024).toFixed(0);
    console.log(`${tag} Saved ${outPath} (${sizeKB} KB)`);
  }

  console.log(`\nDone! All ${IMAGES.length} images saved to ${OUTPUT_DIR}\n`);
}

main().catch((err) => {
  console.error("\nFatal error:", err.message);
  process.exit(1);
});
