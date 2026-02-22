"use node";

import { action } from "./_generated/server";
import { internal } from "./_generated/api";
import { v } from "convex/values";
import Anthropic from "@anthropic-ai/sdk";

const SYSTEM_PROMPT = `You are Switchy, an expert AI mechanical keyboard build advisor. You have deep knowledge of the custom keyboard community, switches, keycaps, plates, mounting styles, and acoustic profiles.

## Acoustic Interaction Rules

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
Mods: PE foam = poppier. Tape mod = deeper. Case foam = removes hollowness. Switch films = tighter housing, less rattle.

## Response Format

You MUST respond with ONLY a valid JSON object (no markdown, no code fences, no extra text) matching this exact structure:

{
  "buildName": "A creative name for this build",
  "summary": "A one-sentence description of what this build achieves",
  "components": {
    "keyboardKit": { "name": "Kit name", "price": 189, "reason": "Why this kit was chosen" },
    "switches": { "name": "Switch name", "quantity": 70, "priceEach": 0.55, "reason": "Why these switches" },
    "keycaps": { "name": "Keycap set name", "price": 45, "reason": "Why these keycaps" },
    "stabilizers": { "name": "Stabilizer name", "price": 18, "reason": "Why these stabilizers" }
  },
  "recommendedMods": [
    { "mod": "Mod name", "cost": 5, "effect": "What it does to the sound/feel", "difficulty": "easy|medium|hard" }
  ],
  "estimatedTotal": 302,
  "soundProfileExpected": "Description of expected sound",
  "buildDifficulty": "beginner-friendly|intermediate|advanced",
  "notes": "Additional tips and context"
}

Use ONLY products from the provided database when possible. If a specific product is needed that isn't in the database (like keycap sets or stabilizers), recommend well-known community favorites. Always calculate estimatedTotal accurately.`;

export const generateBuild = action({
  args: {
    query: v.string(),
    previousBuild: v.optional(v.string()),
  },
  returns: v.any(),
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Not authenticated");

    const switches = await ctx.runQuery(
      internal.internalFunctions.getAllSwitches
    );
    const components = await ctx.runQuery(
      internal.internalFunctions.getAllComponents
    );
    const keyboards = await ctx.runQuery(
      internal.internalFunctions.getAllKeyboards
    );

    const databaseContext = `
## Available Switches Database
${JSON.stringify(
  switches.map((s: Record<string, unknown>) => ({
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

## Available Keyboard Kits
${JSON.stringify(
  keyboards.map((k: Record<string, unknown>) => ({
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
${JSON.stringify(components, null, 0)}
`;

    const messages: Array<{ role: "user" | "assistant"; content: string }> = [];

    if (args.previousBuild) {
      messages.push({
        role: "assistant",
        content: args.previousBuild,
      });
      messages.push({
        role: "user",
        content: `Based on the previous recommendation, here's my follow-up request: ${args.query}\n\nPlease provide an updated build recommendation using the same JSON format.`,
      });
    } else {
      messages.push({
        role: "user",
        content: `Here is the component database to choose from:\n${databaseContext}\n\nUser's build request: "${args.query}"\n\nProvide a complete build recommendation as a JSON object.`,
      });
    }

    const client = new Anthropic({
      apiKey: process.env.ANTHROPIC_API_KEY!,
    });

    const response = await client.messages.create({
      model: "claude-sonnet-4-6",
      max_tokens: 2000,
      system: SYSTEM_PROMPT,
      messages,
    });

    const textContent = response.content.find(
      (block) => block.type === "text"
    );
    if (!textContent || textContent.type !== "text") {
      throw new Error("No text response from AI");
    }

    let responseText = textContent.text.trim();
    // Strip markdown code fences if present
    if (responseText.startsWith("```")) {
      responseText = responseText
        .replace(/^```(?:json)?\n?/, "")
        .replace(/\n?```$/, "");
    }

    try {
      const parsed = JSON.parse(responseText);
      // Validate required fields
      if (!parsed.buildName || !parsed.components || typeof parsed.estimatedTotal !== 'number') {
        throw new Error("Invalid build response structure");
      }
      return parsed;
    } catch {
      // Return error indicator instead of silently broken build
      return {
        buildName: "Parse Error",
        summary: "The AI response could not be parsed. Please try again.",
        components: {
          keyboardKit: { name: "N/A", price: 0, reason: "Parse error" },
          switches: { name: "N/A", price: 0, reason: "Parse error", quantity: 0, priceEach: 0 },
          keycaps: { name: "N/A", price: 0, reason: "Parse error" },
          stabilizers: { name: "N/A", price: 0, reason: "Parse error" },
        },
        recommendedMods: [],
        estimatedTotal: 0,
        soundProfileExpected: "Unable to determine",
        buildDifficulty: "intermediate",
        notes: "The AI response could not be parsed as valid JSON. This usually means the AI returned an unexpected format. Please try rephrasing your request.",
        _parseError: true,
      };
    }
  },
});

export const generateBuildConversational = action({
  args: {
    conversationId: v.id("conversations"),
    message: v.string(),
  },
  returns: v.any(),
  handler: async (ctx, args) => {
    // Get conversation history
    const conversation = await ctx.runQuery(
      internal.internalFunctions.getConversationById,
      { id: args.conversationId }
    );
    if (!conversation) throw new Error("Conversation not found");

    // Get user preferences if available
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Not authenticated");
    let preferences = null;
    if (identity) {
      preferences = await ctx.runQuery(
        internal.internalFunctions.getUserPreferences,
        { userId: identity.subject }
      );
    }

    // Get database context
    const switches = await ctx.runQuery(
      internal.internalFunctions.getAllSwitches
    );
    const components = await ctx.runQuery(
      internal.internalFunctions.getAllComponents
    );
    const keyboards = await ctx.runQuery(
      internal.internalFunctions.getAllKeyboards
    );

    const databaseContext = `
## Available Switches Database
${JSON.stringify(
  switches.map((s: Record<string, unknown>) => ({
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

## Available Keyboard Kits
${JSON.stringify(
  keyboards.map((k: Record<string, unknown>) => ({
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

    // Build preference context
    let preferenceContext = "";
    if (preferences) {
      preferenceContext = `\n\n## User Preferences\n- Experience Level: ${preferences.experienceLevel}\n`;
      if (preferences.preferredSound)
        preferenceContext += `- Preferred Sound: ${preferences.preferredSound}\n`;
      if (preferences.budgetRange)
        preferenceContext += `- Budget Range: $${preferences.budgetRange.min}-$${preferences.budgetRange.max}\n`;
      if (preferences.preferredSize)
        preferenceContext += `- Preferred Size: ${preferences.preferredSize}\n`;
    }

    // Build conversation system prompt
    const conversationalSystemPrompt =
      SYSTEM_PROMPT +
      `

## Conversation Mode
You are in a multi-turn conversation with the user. You can:
1. Answer questions about keyboards conversationally (respond with plain text)
2. Recommend builds (respond with the JSON format above)
3. Modify previous recommendations based on feedback

If the user is asking a question or chatting, respond conversationally in plain text (NOT JSON).
If the user is requesting a build or modification, respond with the JSON build format.
${preferenceContext}`;

    // Build messages array from conversation history
    const messages: Array<{ role: "user" | "assistant"; content: string }> = [];

    if (conversation.messages.length === 0) {
      // First message includes DB context
      messages.push({
        role: "user",
        content: `Here is the component database to choose from:\n${databaseContext}\n\nUser's request: "${args.message}"`,
      });
    } else {
      // Include database context in the first message
      messages.push({
        role: "user",
        content: `Here is the component database to choose from:\n${databaseContext}\n\nUser's request: "${conversation.messages[0].content}"`,
      });
      // Add remaining conversation history
      for (let i = 1; i < conversation.messages.length; i++) {
        messages.push({
          role: conversation.messages[i].role as "user" | "assistant",
          content: conversation.messages[i].content,
        });
      }
      // Add the new message
      messages.push({ role: "user", content: args.message });
    }

    const client = new Anthropic({
      apiKey: process.env.ANTHROPIC_API_KEY!,
    });

    const response = await client.messages.create({
      model: "claude-sonnet-4-6",
      max_tokens: 2000,
      system: conversationalSystemPrompt,
      messages,
    });

    const textContent = response.content.find(
      (block) => block.type === "text"
    );
    if (!textContent || textContent.type !== "text") {
      throw new Error("No text response from AI");
    }

    let responseText = textContent.text.trim();
    if (responseText.startsWith("```")) {
      responseText = responseText
        .replace(/^```(?:json)?\n?/, "")
        .replace(/\n?```$/, "");
    }

    // Try to parse as JSON (build recommendation)
    try {
      const buildData = JSON.parse(responseText);
      // Validate it's actually a build recommendation, not just any JSON
      if (buildData.buildName && buildData.components && typeof buildData.estimatedTotal === 'number') {
        return { type: "build", data: buildData, rawText: responseText };
      }
      // Parsed as JSON but doesn't look like a build - treat as message
      return { type: "message", data: null, rawText: responseText };
    } catch {
      // It's a conversational response
      return { type: "message", data: null, rawText: responseText };
    }
  },
});
