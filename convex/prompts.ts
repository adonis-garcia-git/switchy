// Shared prompt constants and tool schemas for AI build generation
// No "use node" — this is a pure utility file importable by any Convex environment

export const ACOUSTIC_RULES = `## Acoustic Interaction Rules

Sound Profile = switch_type + plate_material + case_material + mounting_style + foam_mods + keycap_material + keycap_profile + lubing

Key rules:
- THOCKY builds: linear switches + PC or FR4 plate + PBT keycaps + gasket/soft mount + foam
- CLACKY builds: tactile or clicky switches + aluminum plate + ABS keycaps + top mount + minimal foam
- CREAMY builds: well-lubed linears + gasket mount + heavy foam + PBT Cherry keycaps
- POPPY builds: long-pole linears + PC plate + thin keycaps
- MUTED/SILENT builds: silent switches + gasket mount + lots of foam + thick PBT

Plate effects: Aluminum = brighter, stiffer. PC = deeper, softer. FR4 = balanced, slightly muted. Brass = sharp, pingy (needs dampening).
Case effects: Aluminum = resonant (needs foam). PC = warmer. Plastic = hollow (needs foam).
Mounting: Gasket = dampened, flexible. Top mount = stiffer, louder. Tray mount = most hollow/pingy.
Keycaps: PBT = deeper. ABS = brighter. Thick > thin for deeper sound. Cherry profile = low and stable. SA = tall and resonant.
Mods: PE foam = poppier. Tape mod = deeper. Case foam = removes hollowness. Switch films = tighter housing, less rattle.`;

export const BUILD_SYSTEM_PROMPT = `You are Switchy, an expert AI mechanical keyboard build advisor. You have deep knowledge of the custom keyboard community, switches, keycaps, plates, mounting styles, and acoustic profiles.

${ACOUSTIC_RULES}

Use ONLY products from the provided database when possible. If a specific product is needed that isn't in the database (like keycap sets or stabilizers), recommend well-known community favorites. Always calculate estimatedTotal accurately as the sum of all component costs.

When recommending a build, always call the recommend_build tool. Never output raw JSON.`;

export const CONVERSATIONAL_SYSTEM_PROMPT = `${BUILD_SYSTEM_PROMPT}

## Conversation Mode
You are in a multi-turn conversation with the user. You can:
1. Answer questions about keyboards conversationally (respond with plain text)
2. Recommend builds (call the recommend_build tool)
3. Modify previous recommendations based on feedback (call the recommend_build tool again)

If the user is asking a question or chatting, respond conversationally in plain text.
If the user is requesting a build or modification, call the recommend_build tool.`;

/**
 * Tool schema for structured build recommendations via Anthropic tool_use.
 * Matches the BuildData interface in src/lib/types.ts exactly.
 * Using tool_use guarantees valid JSON and eliminates parse errors.
 */
export const RECOMMEND_BUILD_TOOL = {
  name: "recommend_build",
  description:
    "Recommend a complete keyboard build based on user preferences. Call this tool whenever providing a build recommendation.",
  input_schema: {
    type: "object" as const,
    properties: {
      buildName: {
        type: "string",
        description: "A creative name for this build",
      },
      summary: {
        type: "string",
        description:
          "A one-sentence description of what this build achieves",
      },
      components: {
        type: "object",
        properties: {
          keyboardKit: {
            type: "object",
            properties: {
              name: {
                type: "string",
                description: "Full name of the keyboard kit (Brand + Model)",
              },
              price: { type: "number", description: "Price in USD" },
              reason: {
                type: "string",
                description: "Why this kit was chosen for the build",
              },
            },
            required: ["name", "price", "reason"],
          },
          switches: {
            type: "object",
            properties: {
              name: {
                type: "string",
                description: "Full name of the switch (Brand + Model)",
              },
              quantity: {
                type: "integer",
                description: "Number of switches needed",
              },
              priceEach: {
                type: "number",
                description: "Price per switch in USD",
              },
              reason: {
                type: "string",
                description: "Why these switches were chosen",
              },
            },
            required: ["name", "quantity", "priceEach", "reason"],
          },
          keycaps: {
            type: "object",
            properties: {
              name: {
                type: "string",
                description: "Name of the keycap set",
              },
              price: { type: "number", description: "Price in USD" },
              reason: {
                type: "string",
                description: "Why these keycaps were chosen",
              },
            },
            required: ["name", "price", "reason"],
          },
          stabilizers: {
            type: "object",
            properties: {
              name: {
                type: "string",
                description: "Name of the stabilizer set",
              },
              price: { type: "number", description: "Price in USD" },
              reason: {
                type: "string",
                description: "Why these stabilizers were chosen",
              },
            },
            required: ["name", "price", "reason"],
          },
        },
        required: ["keyboardKit", "switches", "keycaps", "stabilizers"],
      },
      recommendedMods: {
        type: "array",
        items: {
          type: "object",
          properties: {
            mod: {
              type: "string",
              description: "Name of the modification",
            },
            cost: { type: "number", description: "Cost in USD" },
            effect: {
              type: "string",
              description: "What this mod does to sound/feel",
            },
            difficulty: {
              type: "string",
              enum: ["easy", "medium", "hard"],
              description: "How difficult this mod is",
            },
          },
          required: ["mod", "cost", "effect", "difficulty"],
        },
      },
      estimatedTotal: {
        type: "number",
        description: "Total build cost in USD",
      },
      soundProfileExpected: {
        type: "string",
        description: "Description of the expected sound profile",
      },
      buildDifficulty: {
        type: "string",
        enum: ["beginner-friendly", "intermediate", "advanced"],
      },
      notes: {
        type: "string",
        description: "Additional tips and context for the builder",
      },
    },
    required: [
      "buildName",
      "summary",
      "components",
      "recommendedMods",
      "estimatedTotal",
      "soundProfileExpected",
      "buildDifficulty",
      "notes",
    ],
  },
};

/**
 * Format filtered database products into a compact context string for the AI.
 */
export function formatDatabaseContext(
  switches: Record<string, unknown>[],
  keyboards: Record<string, unknown>[],
  components: Record<string, unknown>[]
): string {
  return `## Available Switches (${switches.length} matches)
${JSON.stringify(
  switches.map((s) => ({
    name: `${s.brand} ${s.name}`,
    type: s.type,
    actuationForceG: s.actuationForceG,
    soundCharacter: s.soundCharacter,
    soundPitch: s.soundPitch,
    soundVolume: s.soundVolume,
    pricePerSwitch: s.pricePerSwitch,
    longPole: s.longPole,
    stemMaterial: s.stemMaterial,
    housingMaterial: s.housingMaterial,
    communityRating: s.communityRating,
    popularFor: s.popularFor,
  })),
  null,
  0
)}

## Available Keyboard Kits (${keyboards.length} matches)
${JSON.stringify(
  keyboards.map((k) => ({
    name: `${k.brand} ${k.name}`,
    size: k.size,
    mountingStyle: k.mountingStyle,
    plateMaterial: k.plateMaterial,
    caseMaterial: k.caseMaterial,
    hotSwap: k.hotSwap,
    wireless: k.wireless,
    priceUsd: k.priceUsd,
    inStock: k.inStock,
  })),
  null,
  0
)}

## Available Components & Mods
${JSON.stringify(components, null, 0)}`;
}
