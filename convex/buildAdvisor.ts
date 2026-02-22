"use node";

import { action } from "./_generated/server";
import { internal } from "./_generated/api";
import { v } from "convex/values";
import Anthropic from "@anthropic-ai/sdk";

const QUESTION_SYSTEM_PROMPT = `You are Switchy, an expert AI mechanical keyboard build advisor. Given a user's initial description of their dream keyboard, generate as many structured questions as needed to fully understand the user's preferences.

Each question should help you understand:
1. Their preferred keyboard size/layout
2. Their sound preference (thocky, clacky, creamy, etc.)
3. Their budget range
4. Case color / keycap color preferences
5. Keycap color preferences (separate from case color)
6. Keycap material preference (PBT, ABS, POM)
7. Special features (hot-swap, wireless, RGB, knob, etc.)
8. Key priorities (typing feel, gaming, wireless, build quality, etc.)

IMPORTANT: Return ONLY a valid JSON array of question objects. No markdown, no code fences, no extra text.

Each question object must have:
- "id": unique string identifier (e.g., "size", "sound", "budget", "colors", "keycap_color", "keycap_material", "priorities")
- "type": one of "single-choice", "multi-choice", "color-picker", "slider"
- "question": the question text (short, conversational)
- "subtitle": optional helper text
- "options": array of { "id": string, "label": string, "description": string } (for choice types)
- "sliderConfig": { "min": number, "max": number, "step": number, "unit": string, "labels": [{"value": number, "label": string}] } (for slider type)
- "viewerUpdate": optional partial 3D viewer config update when user answers (for colors/size)

For the color-picker type, options should include color hex values in a "color" field.

Example viewerUpdate for size question: { "size": "65" }
Example viewerUpdate for color question: { "caseColor": "#1a3a5c" }
Example viewerUpdate for keycap color: { "keycapColor": "#e8e8e8" }

Avoid questions that repeat what the user already told you. If they said "thocky 65%", skip the size and sound questions.`;

export const generateQuestions = action({
  args: {
    initialPrompt: v.string(),
  },
  returns: v.any(),
  handler: async (_ctx, args) => {
    const client = new Anthropic({
      apiKey: process.env.ANTHROPIC_API_KEY!,
    });

    const response = await client.messages.create({
      model: "claude-sonnet-4-6",
      max_tokens: 2000,
      system: QUESTION_SYSTEM_PROMPT,
      messages: [
        {
          role: "user",
          content: `User's initial request: "${args.initialPrompt}"\n\nGenerate structured questions to refine this build request. Skip questions about things the user already specified.`,
        },
      ],
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

    try {
      return JSON.parse(responseText);
    } catch {
      // Return default questions if parsing fails
      return [
        {
          id: "size",
          type: "single-choice",
          question: "What size keyboard?",
          subtitle: "This affects your layout and available keys",
          options: [
            { id: "60", label: "60%", description: "Compact, no arrows or F-row" },
            { id: "65", label: "65%", description: "Compact + arrow keys" },
            { id: "75", label: "75%", description: "Compact + F-row + arrows" },
            { id: "tkl", label: "TKL", description: "Full layout, no numpad" },
            { id: "full", label: "Full Size", description: "Everything included" },
          ],
          viewerUpdate: {},
        },
        {
          id: "sound",
          type: "single-choice",
          question: "What sound are you after?",
          subtitle: "The sound profile shapes everything else",
          options: [
            { id: "thocky", label: "Thocky", description: "Deep, muted, satisfying bass" },
            { id: "clacky", label: "Clacky", description: "Sharp, bright, crisp highs" },
            { id: "creamy", label: "Creamy", description: "Smooth, buttery, refined" },
            { id: "poppy", label: "Poppy", description: "Snappy, crisp, bouncy" },
            { id: "silent", label: "Silent", description: "As quiet as possible" },
          ],
        },
        {
          id: "budget",
          type: "slider",
          question: "What's your budget?",
          subtitle: "Total build cost including all components",
          sliderConfig: {
            min: 50,
            max: 600,
            step: 25,
            unit: "$",
            labels: [
              { value: 100, label: "Entry" },
              { value: 200, label: "Sweet spot" },
              { value: 350, label: "Premium" },
              { value: 500, label: "Endgame" },
            ],
          },
        },
        {
          id: "colors",
          type: "color-picker",
          question: "Pick your case color",
          subtitle: "Your keyboard's main color",
          options: [
            { id: "black", label: "Black", color: "#1a1a1a" },
            { id: "silver", label: "Silver", color: "#c0c0c0" },
            { id: "navy", label: "Navy", color: "#1a3a5c" },
            { id: "white", label: "White", color: "#f0f0f0" },
            { id: "green", label: "Forest", color: "#2d5a3d" },
            { id: "burgundy", label: "Burgundy", color: "#722F37" },
            { id: "cream", label: "Cream", color: "#f5f0e1" },
            { id: "purple", label: "Purple", color: "#5B3A8C" },
          ],
        },
        {
          id: "keycap_color",
          type: "color-picker",
          question: "Pick your keycap color",
          subtitle: "The color of your keycaps (separate from case color)",
          options: [
            { id: "white", label: "White", color: "#f0f0f0" },
            { id: "black", label: "Black", color: "#2d2d2d" },
            { id: "cream", label: "Cream", color: "#f5f0e1" },
            { id: "gray", label: "Gray", color: "#8a8a8a" },
            { id: "lavender", label: "Lavender", color: "#b39ddb" },
            { id: "mint", label: "Mint", color: "#98e4c4" },
            { id: "pink", label: "Pink", color: "#f4b4c4" },
            { id: "botanical", label: "Botanical Green", color: "#4a7c59" },
          ],
        },
        {
          id: "keycap_material",
          type: "single-choice",
          question: "Keycap material preference?",
          subtitle: "This affects sound, texture, and durability",
          options: [
            { id: "pbt", label: "PBT", description: "Textured, durable, deeper sound" },
            { id: "abs", label: "ABS", description: "Smooth, vibrant colors, higher-pitched" },
            { id: "pom", label: "POM", description: "Ultra-smooth, unique feel, rare" },
            { id: "no-preference", label: "No preference", description: "Let the AI decide" },
          ],
        },
      ];
    }
  },
});

export const generateBuildFromAnswers = action({
  args: {
    initialPrompt: v.string(),
    answers: v.array(
      v.object({
        questionId: v.string(),
        value: v.any(),
      })
    ),
  },
  returns: v.any(),
  handler: async (ctx, args): Promise<Record<string, unknown>> => {
    const switches: Record<string, unknown>[] = await ctx.runQuery(
      internal.internalFunctions.getAllSwitches
    );
    const components: Record<string, unknown>[] = await ctx.runQuery(
      internal.internalFunctions.getAllComponents
    );
    const keyboards: Record<string, unknown>[] = await ctx.runQuery(
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
  })),
  null,
  0
)}

## Available Components & Mods
${JSON.stringify(components, null, 0)}`;

    // Convert answers to natural language
    const answersSummary = args.answers
      .map((a) => `${a.questionId}: ${JSON.stringify(a.value)}`)
      .join("\n");

    const buildSystemPrompt = `You are Switchy, an expert AI mechanical keyboard build advisor.

## Acoustic Interaction Rules
Sound Profile = switch_type + plate_material + case_material + mounting_style + foam_mods + keycap_material + keycap_profile + lubing

Key rules:
- THOCKY builds: linear switches + PC or FR4 plate + PBT keycaps + gasket/soft mount + foam
- CLACKY builds: tactile or clicky switches + aluminum plate + ABS keycaps + top mount + minimal foam
- CREAMY builds: well-lubed linears + gasket mount + heavy foam + PBT Cherry keycaps
- POPPY builds: long-pole linears + PC plate + thin keycaps
- MUTED/SILENT builds: silent switches + gasket mount + lots of foam + thick PBT

## Response Format
Respond with ONLY a valid JSON object (no markdown, no code fences):
{
  "buildName": "Creative build name",
  "summary": "One-sentence description",
  "components": {
    "keyboardKit": { "name": "Kit name", "price": 189, "reason": "Why chosen" },
    "switches": { "name": "Switch name", "quantity": 70, "priceEach": 0.55, "reason": "Why chosen" },
    "keycaps": { "name": "Keycap set", "price": 45, "reason": "Why chosen" },
    "stabilizers": { "name": "Stabilizer name", "price": 18, "reason": "Why chosen" }
  },
  "recommendedMods": [
    { "mod": "Mod name", "cost": 5, "effect": "Sound/feel effect", "difficulty": "easy|medium|hard" }
  ],
  "estimatedTotal": 302,
  "soundProfileExpected": "Expected sound description",
  "buildDifficulty": "beginner-friendly|intermediate|advanced",
  "notes": "Additional tips"
}

Use ONLY products from the provided database when possible.`;

    const client = new Anthropic({
      apiKey: process.env.ANTHROPIC_API_KEY!,
    });

    const response = await client.messages.create({
      model: "claude-sonnet-4-6",
      max_tokens: 2000,
      system: buildSystemPrompt,
      messages: [
        {
          role: "user",
          content: `Database:\n${databaseContext}\n\nUser's initial request: "${args.initialPrompt}"\n\nUser's preferences from questionnaire:\n${answersSummary}\n\nProvide a complete build recommendation as JSON.`,
        },
      ],
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

    try {
      return JSON.parse(responseText);
    } catch {
      return {
        buildName: "Build Recommendation",
        summary: "AI-generated recommendation",
        rawResponse: responseText,
        estimatedTotal: 0,
        soundProfileExpected: "",
        buildDifficulty: "intermediate",
        notes: responseText,
        components: {},
        recommendedMods: [],
      };
    }
  },
});
