"use node";

import { action } from "./_generated/server";
import { internal } from "./_generated/api";
import { v } from "convex/values";
import Anthropic from "@anthropic-ai/sdk";
import {
  BUILD_SYSTEM_PROMPT,
  RECOMMEND_BUILD_TOOL,
  formatDatabaseContext,
} from "./prompts";
import {
  extractCriteriaFromPrompt,
  extractCriteriaFromAnswers,
  filterSwitches,
  filterKeyboards,
  filterComponents,
  type FilterCriteria,
} from "./buildFilters";
import { validateBuild } from "./productValidator";
import { getGuestUserId } from "./guestAuth";

// ---------------------------------------------------------------------------
// Deterministic question definitions — no AI call needed
// ---------------------------------------------------------------------------

interface QuestionDef {
  id: string;
  type: string;
  question: string;
  subtitle?: string;
  options?: {
    id: string;
    label: string;
    description?: string;
    color?: string;
    viewerUpdate?: Record<string, unknown>;
  }[];
  sliderConfig?: {
    min: number;
    max: number;
    step: number;
    unit: string;
    labels?: { value: number; label: string }[];
  };
  viewerUpdate?: Record<string, unknown>;
  /** Returns true if the user's prompt already covers this question. */
  detectedBy: (criteria: FilterCriteria) => boolean;
}

const ALL_QUESTIONS: QuestionDef[] = [
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
      {
        id: "full",
        label: "Full Size",
        description: "Everything included",
      },
    ],
    viewerUpdate: {},
    detectedBy: (c) => !!c.size,
  },
  {
    id: "sound",
    type: "single-choice",
    question: "What sound are you after?",
    subtitle: "The sound profile shapes everything else",
    options: [
      {
        id: "thocky",
        label: "Thocky",
        description: "Deep, muted, satisfying bass",
        viewerUpdate: { environment: "warehouse", rgbMode: "breathing", rgbColor: "#ff6b35", rgbBrightness: 1.5, hasRGB: true },
      },
      {
        id: "clacky",
        label: "Clacky",
        description: "Sharp, bright, crisp highs",
        viewerUpdate: { environment: "studio", rgbMode: "reactive", rgbColor: "#00bcd4", rgbBrightness: 2, hasRGB: true },
      },
      {
        id: "creamy",
        label: "Creamy",
        description: "Smooth, buttery, refined",
        viewerUpdate: { environment: "dawn", rgbMode: "wave", rgbColor: "#f5f0e1", rgbBrightness: 1, hasRGB: true },
      },
      {
        id: "poppy",
        label: "Poppy",
        description: "Snappy, crisp, bouncy",
        viewerUpdate: { environment: "city", rgbMode: "rainbow", rgbBrightness: 2.5, hasRGB: true },
      },
      {
        id: "silent",
        label: "Silent",
        description: "As quiet as possible",
        viewerUpdate: { environment: "apartment", hasRGB: false },
      },
    ],
    detectedBy: (c) => !!c.soundPreference,
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
    detectedBy: (c) => !!c.budget,
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
    detectedBy: () => false, // Always ask — hard to detect from text
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
    detectedBy: () => false, // Always ask
  },
  {
    id: "keycap_material",
    type: "single-choice",
    question: "Keycap material preference?",
    subtitle: "This affects sound, texture, and durability",
    options: [
      {
        id: "pbt",
        label: "PBT",
        description: "Textured, durable, deeper sound",
        viewerUpdate: { keycapMaterial: "pbt" },
      },
      {
        id: "abs",
        label: "ABS",
        description: "Smooth, vibrant colors, higher-pitched",
        viewerUpdate: { keycapMaterial: "abs" },
      },
      {
        id: "pom",
        label: "POM",
        description: "Ultra-smooth, unique feel, rare",
        viewerUpdate: { keycapMaterial: "pom" },
      },
      {
        id: "no-preference",
        label: "No preference",
        description: "Let the AI decide",
      },
    ],
    detectedBy: (c) => !!c.keycapMaterial,
  },
];

// ---------------------------------------------------------------------------
// Actions
// ---------------------------------------------------------------------------

/**
 * Generate questionnaire questions deterministically based on prompt analysis.
 * No AI call needed — saves one full API round-trip (~3-5 seconds).
 */
export const generateQuestions = action({
  args: {
    initialPrompt: v.string(),
  },
  returns: v.any(),
  handler: async (ctx, args) => {
    await getGuestUserId(ctx);

    // Parse prompt to detect what the user already specified
    const criteria = extractCriteriaFromPrompt(args.initialPrompt);

    // Return only questions for unspecified preferences
    const questions = ALL_QUESTIONS.filter(
      (q) => !q.detectedBy(criteria)
    ).map(({ detectedBy: _fn, ...q }) => q); // Strip internal detectedBy

    return questions;
  },
});

/**
 * Generate a build recommendation from questionnaire answers.
 * Uses tool_use for guaranteed JSON, pre-filtered DB, and product validation.
 */
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
    const userId = await getGuestUserId(ctx);
    const now = new Date();
    const monthKey = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;

    // Usage gating bypassed for demo mode
    const isPro = true;

    // Fetch all products
    const allSwitches: Record<string, unknown>[] = await ctx.runQuery(
      internal.internalFunctions.getAllSwitches
    );
    const allComponents: Record<string, unknown>[] = await ctx.runQuery(
      internal.internalFunctions.getAllComponents
    );
    const allKeyboards: Record<string, unknown>[] = await ctx.runQuery(
      internal.internalFunctions.getAllKeyboards
    );
    const allKeycaps: Record<string, unknown>[] = await ctx.runQuery(
      internal.internalFunctions.getAllKeycaps
    );

    // Merge criteria from prompt + questionnaire answers
    const promptCriteria = extractCriteriaFromPrompt(args.initialPrompt);
    const answerCriteria = extractCriteriaFromAnswers(args.answers);
    const criteria = { ...promptCriteria, ...answerCriteria };

    // Pre-filter to only relevant products
    const switches = filterSwitches(allSwitches, criteria);
    const keyboards = filterKeyboards(allKeyboards, criteria);
    const components = filterComponents(allComponents, criteria);

    const databaseContext = formatDatabaseContext(
      switches,
      keyboards,
      components
    );

    // Convert answers to rich natural language (not lossy key-value pairs)
    const answerDescriptions = args.answers
      .map((a) => {
        const question = ALL_QUESTIONS.find((q) => q.id === a.questionId);
        const questionText = question?.question || a.questionId;

        // For choice questions, resolve the option label + description
        if (question?.options && typeof a.value === "string") {
          const option = question.options.find((o) => o.id === a.value);
          if (option) {
            const desc = option.description
              ? ` (${option.description})`
              : "";
            return `${questionText} ${option.label}${desc}`;
          }
        }

        // For slider, include the unit
        if (question?.sliderConfig) {
          return `${questionText} ${question.sliderConfig.unit}${a.value}`;
        }

        return `${questionText} ${JSON.stringify(a.value)}`;
      })
      .join("\n");

    const client = new Anthropic({
      apiKey: process.env.ANTHROPIC_API_KEY!,
    });

    const response = await client.messages.create({
      model: "claude-sonnet-4-6",
      max_tokens: 2000,
      system: BUILD_SYSTEM_PROMPT,
      messages: [
        {
          role: "user",
          content: `Database:\n${databaseContext}\n\nUser's initial request: "${args.initialPrompt}"\n\nUser's preferences from questionnaire:\n${answerDescriptions}\n\nProvide a complete build recommendation by calling the recommend_build tool.`,
        },
      ],
      tools: [RECOMMEND_BUILD_TOOL],
      tool_choice: { type: "tool", name: "recommend_build" },
    });

    // Extract build from tool_use response (guaranteed by tool_choice)
    const toolUse = response.content.find(
      (block) =>
        block.type === "tool_use" && block.name === "recommend_build"
    );

    if (toolUse && toolUse.type === "tool_use") {
      const buildData = toolUse.input as Record<string, unknown>;

      if (
        buildData.buildName &&
        buildData.components &&
        typeof buildData.estimatedTotal === "number"
      ) {
        // Validate against real products
        const { validatedBuild } = validateBuild(
          buildData,
          allSwitches,
          allKeyboards,
          allKeycaps
        );

        // Record usage after successful generation (best-effort for demo mode)
        try {
          await ctx.runMutation(internal.internalFunctions.insertUsageRecord, {
            userId,
            actionType: "generateBuildFromAnswers" as const,
            monthKey,
          });
        } catch (e) {
          console.error("Usage recording failed (demo mode):", e);
        }

        return validatedBuild;
      }
    }

    // Fallback — should never hit this with tool_choice: tool
    return {
      buildName: "Generation Error",
      summary:
        "Failed to generate a build recommendation. Please try again.",
      components: {
        keyboardKit: {
          name: "N/A",
          price: 0,
          reason: "Generation error",
        },
        switches: {
          name: "N/A",
          price: 0,
          reason: "Generation error",
          quantity: 0,
          priceEach: 0,
        },
        keycaps: {
          name: "N/A",
          price: 0,
          reason: "Generation error",
        },
        stabilizers: {
          name: "N/A",
          price: 0,
          reason: "Generation error",
        },
      },
      recommendedMods: [],
      estimatedTotal: 0,
      soundProfileExpected: "Unable to determine",
      buildDifficulty: "intermediate",
      notes:
        "The AI failed to generate a valid build recommendation. Please try rephrasing your request.",
      _parseError: true,
    };
  },
});
