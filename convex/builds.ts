"use node";

import { action } from "./_generated/server";
import { internal } from "./_generated/api";
import { v } from "convex/values";
import Anthropic from "@anthropic-ai/sdk";
import {
  BUILD_SYSTEM_PROMPT,
  CONVERSATIONAL_SYSTEM_PROMPT,
  RECOMMEND_BUILD_TOOL,
  formatDatabaseContext,
} from "./prompts";
import {
  extractCriteriaFromPrompt,
  filterSwitches,
  filterKeyboards,
  filterComponents,
} from "./buildFilters";
import { validateBuild } from "./productValidator";

const ERROR_BUILD = {
  buildName: "Generation Error",
  summary: "Failed to generate a build recommendation. Please try again.",
  components: {
    keyboardKit: { name: "N/A", price: 0, reason: "Generation error" },
    switches: {
      name: "N/A",
      price: 0,
      reason: "Generation error",
      quantity: 0,
      priceEach: 0,
    },
    keycaps: { name: "N/A", price: 0, reason: "Generation error" },
    stabilizers: { name: "N/A", price: 0, reason: "Generation error" },
  },
  recommendedMods: [],
  estimatedTotal: 0,
  soundProfileExpected: "Unable to determine",
  buildDifficulty: "intermediate",
  notes:
    "The AI failed to generate a valid build recommendation. Please try rephrasing your request.",
  _parseError: true,
};

/**
 * Extract a build recommendation from a tool_use response block.
 */
function extractBuildFromResponse(
  response: Anthropic.Message
): Record<string, unknown> | null {
  const toolUse = response.content.find(
    (block) => block.type === "tool_use" && block.name === "recommend_build"
  );
  if (toolUse && toolUse.type === "tool_use") {
    return toolUse.input as Record<string, unknown>;
  }
  return null;
}

export const generateBuild = action({
  args: {
    query: v.string(),
    previousBuild: v.optional(v.string()),
  },
  returns: v.any(),
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Not authenticated");

    const userId = identity.subject;
    const now = new Date();
    const monthKey = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;

    // Usage gating: check subscription tier
    const subscription = await ctx.runQuery(
      internal.internalFunctions.getSubscriptionByUserId,
      { userId }
    );
    const isPro =
      subscription?.status === "active" &&
      subscription.currentPeriodEnd > Date.now();

    if (!isPro) {
      const usageCount = await ctx.runQuery(
        internal.internalFunctions.getUsageCountForMonth,
        { userId, monthKey }
      );
      if (usageCount >= 3) {
        throw new Error("FREE_TIER_LIMIT_REACHED");
      }
    }

    // Fetch all products
    const allSwitches = await ctx.runQuery(
      internal.internalFunctions.getAllSwitches
    );
    const allComponents = await ctx.runQuery(
      internal.internalFunctions.getAllComponents
    );
    const allKeyboards = await ctx.runQuery(
      internal.internalFunctions.getAllKeyboards
    );
    const allKeycaps = await ctx.runQuery(
      internal.internalFunctions.getAllKeycaps
    );

    // Pre-filter based on user prompt
    const criteria = extractCriteriaFromPrompt(args.query);
    const switches = filterSwitches(allSwitches, criteria);
    const keyboards = filterKeyboards(allKeyboards, criteria);
    const components = filterComponents(allComponents, criteria);

    // Inject sponsored products into context
    const activeSponsorships = await ctx.runQuery(
      internal.internalFunctions.getActiveBuildSponsorships,
      {}
    );
    let sponsoredContext = "";
    if (activeSponsorships.length > 0) {
      sponsoredContext =
        "\n\nSponsored/Partner Products (prefer these if they fit the user's needs well — never recommend a poor-fit sponsored product):\n" +
        activeSponsorships
          .map(
            (s: { productName: string; vendorName: string }) =>
              `[SPONSORED] ${s.productName} by ${s.vendorName}`
          )
          .join("\n");
    }

    const databaseContext =
      formatDatabaseContext(switches, keyboards, components) + sponsoredContext;

    const messages: Anthropic.MessageParam[] = [];

    if (args.previousBuild) {
      // Tweak flow: present previous build as a prior tool_use so the AI has full context
      let previousBuildData: Record<string, unknown>;
      try {
        previousBuildData = JSON.parse(args.previousBuild);
      } catch {
        previousBuildData = {};
      }

      messages.push({
        role: "user",
        content: `Here is the component database to choose from:\n${databaseContext}\n\nPlease recommend a keyboard build.`,
      });
      messages.push({
        role: "assistant",
        content: [
          {
            type: "tool_use",
            id: "prev_build",
            name: "recommend_build",
            input: previousBuildData,
          },
        ],
      });
      messages.push({
        role: "user",
        content: [
          {
            type: "tool_result",
            tool_use_id: "prev_build",
            content: "Build recommendation noted. The user wants changes.",
          },
          {
            type: "text",
            text: `Based on the previous recommendation, here's my follow-up request: ${args.query}\n\nPlease provide an updated build recommendation by calling the recommend_build tool.`,
          },
        ],
      });
    } else {
      messages.push({
        role: "user",
        content: `Here is the component database to choose from:\n${databaseContext}\n\nUser's build request: "${args.query}"\n\nProvide a complete build recommendation by calling the recommend_build tool.`,
      });
    }

    const client = new Anthropic({
      apiKey: process.env.ANTHROPIC_API_KEY!,
    });

    const response = await client.messages.create({
      model: "claude-sonnet-4-6",
      max_tokens: 2000,
      system: BUILD_SYSTEM_PROMPT,
      messages,
      tools: [RECOMMEND_BUILD_TOOL],
      tool_choice: { type: "tool", name: "recommend_build" },
    });

    const buildData = extractBuildFromResponse(response);

    if (!buildData || !buildData.buildName || !buildData.components) {
      return ERROR_BUILD;
    }

    // Validate against real products — correct names, prices, attach IDs + images
    const { validatedBuild } = validateBuild(
      buildData,
      allSwitches,
      allKeyboards,
      allKeycaps
    );

    // Record usage after successful generation
    await ctx.runMutation(internal.internalFunctions.insertUsageRecord, {
      userId,
      actionType: "generateBuild" as const,
      monthKey,
    });

    return validatedBuild;
  },
});

export const generateBuildConversational = action({
  args: {
    conversationId: v.id("conversations"),
    message: v.string(),
  },
  returns: v.any(),
  handler: async (ctx, args) => {
    const conversation = await ctx.runQuery(
      internal.internalFunctions.getConversationById,
      { id: args.conversationId }
    );
    if (!conversation) throw new Error("Conversation not found");

    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Not authenticated");

    const userId = identity.subject;
    const now = new Date();
    const monthKey = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;

    // Usage gating: check subscription tier
    const subscription = await ctx.runQuery(
      internal.internalFunctions.getSubscriptionByUserId,
      { userId }
    );
    const isPro =
      subscription?.status === "active" &&
      subscription.currentPeriodEnd > Date.now();

    if (!isPro) {
      const usageCount = await ctx.runQuery(
        internal.internalFunctions.getUsageCountForMonth,
        { userId, monthKey }
      );
      if (usageCount >= 3) {
        throw new Error("FREE_TIER_LIMIT_REACHED");
      }
    }

    let preferences = null;
    preferences = await ctx.runQuery(
      internal.internalFunctions.getUserPreferences,
      { userId }
    );

    // Fetch all products
    const allSwitches = await ctx.runQuery(
      internal.internalFunctions.getAllSwitches
    );
    const allComponents = await ctx.runQuery(
      internal.internalFunctions.getAllComponents
    );
    const allKeyboards = await ctx.runQuery(
      internal.internalFunctions.getAllKeyboards
    );
    const allKeycaps = await ctx.runQuery(
      internal.internalFunctions.getAllKeycaps
    );

    // Pre-filter based on full conversation context
    const fullContext =
      conversation.messages
        .map((m: Record<string, unknown>) => String(m.content))
        .join(" ") +
      " " +
      args.message;
    const criteria = extractCriteriaFromPrompt(fullContext);
    const switches = filterSwitches(allSwitches, criteria);
    const keyboards = filterKeyboards(allKeyboards, criteria);
    const components = filterComponents(allComponents, criteria);

    const databaseContext = formatDatabaseContext(
      switches,
      keyboards,
      components
    );

    // Build preference context
    let preferenceContext = "";
    if (preferences) {
      preferenceContext = `\n\nUser Preferences: Experience ${preferences.experienceLevel}`;
      if (preferences.preferredSound)
        preferenceContext += `, sound: ${preferences.preferredSound}`;
      if (preferences.budgetRange)
        preferenceContext += `, budget: $${preferences.budgetRange.min}-$${preferences.budgetRange.max}`;
      if (preferences.preferredSize)
        preferenceContext += `, size: ${preferences.preferredSize}`;
    }

    const systemPrompt = CONVERSATIONAL_SYSTEM_PROMPT + preferenceContext;

    // Build messages array from conversation history
    const messages: Anthropic.MessageParam[] = [];

    if (conversation.messages.length === 0) {
      messages.push({
        role: "user",
        content: `Here is the component database to choose from:\n${databaseContext}\n\nUser's request: "${args.message}"`,
      });
    } else {
      messages.push({
        role: "user",
        content: `Here is the component database to choose from:\n${databaseContext}\n\nUser's request: "${conversation.messages[0].content}"`,
      });
      for (let i = 1; i < conversation.messages.length; i++) {
        messages.push({
          role: conversation.messages[i].role as "user" | "assistant",
          content: conversation.messages[i].content,
        });
      }
      messages.push({ role: "user", content: args.message });
    }

    const client = new Anthropic({
      apiKey: process.env.ANTHROPIC_API_KEY!,
    });

    const response = await client.messages.create({
      model: "claude-sonnet-4-6",
      max_tokens: 2000,
      system: systemPrompt,
      messages,
      tools: [RECOMMEND_BUILD_TOOL],
      // auto: AI decides whether to call tool (build) or respond with text (chat)
    });

    // Check if the AI called the recommend_build tool
    const buildData = extractBuildFromResponse(response);

    if (buildData) {
      // Validate against real products
      const { validatedBuild } = validateBuild(
        buildData,
        allSwitches,
        allKeyboards,
        allKeycaps
      );

      // Record usage after successful build generation
      await ctx.runMutation(internal.internalFunctions.insertUsageRecord, {
        userId,
        actionType: "generateBuildConversational" as const,
        monthKey,
      });

      return {
        type: "build",
        data: validatedBuild,
        rawText: JSON.stringify(validatedBuild),
      };
    }

    // Otherwise it's a conversational text response
    const textContent = response.content.find(
      (block) => block.type === "text"
    );
    const rawText =
      textContent && textContent.type === "text"
        ? textContent.text.trim()
        : "";
    return { type: "message", data: null, rawText };
  },
});
