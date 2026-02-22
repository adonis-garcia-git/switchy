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
  formatEnrichedContext,
} from "./prompts";
import {
  niaUniversalSearch,
  hashQuery,
  type NiaSearchResult,
} from "./niaClient";
import { niaOracleRun } from "./niaClient";
import {
  extractCriteriaFromPrompt,
  filterSwitches,
  filterKeyboards,
  filterComponents,
} from "./buildFilters";
import { validateBuild } from "./productValidator";
import { getGuestUserId } from "./guestAuth";

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
    const userId = await getGuestUserId(ctx);
    const now = new Date();
    const monthKey = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;

    // Usage gating bypassed for demo mode
    const isPro = true;

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

    const rawDbContext =
      formatDatabaseContext(switches, keyboards, components) + sponsoredContext;

    // Enrich with community intelligence from Nia
    let databaseContext = rawDbContext;
    try {
      const cacheKey = hashQuery(args.query, "universal");
      const cached = await ctx.runQuery(
        internal.internalFunctions.getNiaCacheByHash,
        { queryHash: cacheKey }
      );
      let niaResults: NiaSearchResult[];
      if (cached && cached.expiresAt > Date.now()) {
        niaResults = (cached.result as NiaSearchResult[]).slice(0, 5);
      } else {
        niaResults = await niaUniversalSearch(args.query, 5);
        if (niaResults.length > 0) {
          await ctx.runMutation(internal.internalFunctions.insertNiaCache, {
            queryHash: cacheKey,
            result: niaResults,
            source: "universal",
            createdAt: Date.now(),
            expiresAt: Date.now() + 86400000,
          });
        }
      }
      databaseContext = formatEnrichedContext(rawDbContext, niaResults);
    } catch (e) {
      // Nia enrichment is best-effort — proceed with DB context only
      console.error("Nia enrichment failed for generateBuild:", e);
    }

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
    // Use Nia as fallback for products not in local DB
    let niaFallbacks: Record<string, { found: boolean; vendorUrl?: string; price?: number; name?: string } | null> = {};
    const comps = buildData.components as Record<string, Record<string, unknown>>;
    try {
      const fallbackPromises: Promise<void>[] = [];
      const checkNiaFallback = async (key: string, name: string) => {
        const result = await niaUniversalSearch(`"${name}" mechanical keyboard buy price`, 1);
        if (result.length > 0) {
          const priceMatch = result[0].snippet.match(/\$(\d+(?:\.\d{1,2})?)/);
          niaFallbacks[key] = {
            found: true,
            vendorUrl: result[0].url,
            name: result[0].title,
            price: priceMatch ? parseFloat(priceMatch[1]) : undefined,
          };
        }
      };
      if (comps.keyboardKit?.name) fallbackPromises.push(checkNiaFallback("keyboard", String(comps.keyboardKit.name)));
      if (comps.switches?.name) fallbackPromises.push(checkNiaFallback("switches", String(comps.switches.name)));
      if (comps.keycaps?.name) fallbackPromises.push(checkNiaFallback("keycaps", String(comps.keycaps.name)));
      await Promise.all(fallbackPromises);
    } catch (e) {
      console.error("Nia fallback lookup failed:", e);
    }

    const { validatedBuild } = validateBuild(
      buildData,
      allSwitches,
      allKeyboards,
      allKeycaps,
      niaFallbacks
    );

    // Record usage after successful generation (best-effort for demo mode)
    try {
      await ctx.runMutation(internal.internalFunctions.insertUsageRecord, {
        userId,
        actionType: "generateBuild" as const,
        monthKey,
      });
    } catch (e) {
      console.error("Usage recording failed (demo mode):", e);
    }

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

    const userId = await getGuestUserId(ctx);
    const now = new Date();
    const monthKey = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;

    // Usage gating bypassed for demo mode
    const isPro = true;

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

    const rawDbContext = formatDatabaseContext(
      switches,
      keyboards,
      components
    );

    // Enrich with community intelligence from Nia
    let databaseContext = rawDbContext;
    try {
      const searchQuery = args.message;
      const cacheKey = hashQuery(searchQuery, "universal");
      const cached = await ctx.runQuery(
        internal.internalFunctions.getNiaCacheByHash,
        { queryHash: cacheKey }
      );
      let niaResults: NiaSearchResult[];
      if (cached && cached.expiresAt > Date.now()) {
        niaResults = (cached.result as NiaSearchResult[]).slice(0, 5);
      } else {
        niaResults = await niaUniversalSearch(searchQuery, 5);
        if (niaResults.length > 0) {
          await ctx.runMutation(internal.internalFunctions.insertNiaCache, {
            queryHash: cacheKey,
            result: niaResults,
            source: "universal",
            createdAt: Date.now(),
            expiresAt: Date.now() + 86400000,
          });
        }
      }
      databaseContext = formatEnrichedContext(rawDbContext, niaResults);
    } catch (e) {
      console.error("Nia enrichment failed for conversational:", e);
    }

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
      // Validate against real products with Nia fallbacks
      let niaFallbacks: Record<string, { found: boolean; vendorUrl?: string; price?: number; name?: string } | null> = {};
      const comps = buildData.components as Record<string, Record<string, unknown>>;
      try {
        const fallbackPromises: Promise<void>[] = [];
        const checkNiaFallback = async (key: string, name: string) => {
          const result = await niaUniversalSearch(`"${name}" mechanical keyboard buy price`, 1);
          if (result.length > 0) {
            const priceMatch = result[0].snippet.match(/\$(\d+(?:\.\d{1,2})?)/);
            niaFallbacks[key] = {
              found: true,
              vendorUrl: result[0].url,
              name: result[0].title,
              price: priceMatch ? parseFloat(priceMatch[1]) : undefined,
            };
          }
        };
        if (comps.keyboardKit?.name) fallbackPromises.push(checkNiaFallback("keyboard", String(comps.keyboardKit.name)));
        if (comps.switches?.name) fallbackPromises.push(checkNiaFallback("switches", String(comps.switches.name)));
        if (comps.keycaps?.name) fallbackPromises.push(checkNiaFallback("keycaps", String(comps.keycaps.name)));
        await Promise.all(fallbackPromises);
      } catch (e) {
        console.error("Nia fallback lookup failed:", e);
      }

      const { validatedBuild } = validateBuild(
        buildData,
        allSwitches,
        allKeyboards,
        allKeycaps,
        niaFallbacks
      );

      // Record usage after successful build generation (best-effort for demo mode)
      try {
        await ctx.runMutation(internal.internalFunctions.insertUsageRecord, {
          userId,
          actionType: "generateBuildConversational" as const,
          monthKey,
        });
      } catch (e) {
        console.error("Usage recording failed (demo mode):", e);
      }

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

    // Deep research: if AI signals it needs more context
    if (rawText.includes("[RESEARCH]")) {
      try {
        const researchQuery = rawText
          .replace("[RESEARCH]", "")
          .trim()
          .split("\n")[0]; // Take just the first line as the search query
        const oracleResult = await niaOracleRun(researchQuery);

        // Re-call Claude with enriched context from research
        const enrichedMessages: Anthropic.MessageParam[] = [
          ...messages,
          { role: "assistant" as const, content: rawText.replace(/\[RESEARCH\].*/, "").trim() || "Let me research that for you." },
          {
            role: "user" as const,
            content: `Research findings:\n${oracleResult.answer}\n\nBased on this research, please provide your detailed recommendation or answer.`,
          },
        ];

        const enrichedResponse = await client.messages.create({
          model: "claude-sonnet-4-6",
          max_tokens: 2000,
          system: systemPrompt,
          messages: enrichedMessages,
          tools: [RECOMMEND_BUILD_TOOL],
        });

        // Check if the enriched response contains a build
        const enrichedBuild = extractBuildFromResponse(enrichedResponse);
        if (enrichedBuild) {
          const { validatedBuild } = validateBuild(
            enrichedBuild,
            allSwitches,
            allKeyboards,
            allKeycaps
          );
          try {
            await ctx.runMutation(internal.internalFunctions.insertUsageRecord, {
              userId,
              actionType: "generateBuildConversational" as const,
              monthKey,
            });
          } catch (e) {
            console.error("Usage recording failed (demo mode):", e);
          }
          return {
            type: "build",
            data: validatedBuild,
            rawText: JSON.stringify(validatedBuild),
            researchUsed: true,
          };
        }

        const enrichedText = enrichedResponse.content.find(
          (b) => b.type === "text"
        );
        const finalText =
          enrichedText && enrichedText.type === "text"
            ? enrichedText.text.trim()
            : rawText;

        return { type: "message", data: null, rawText: finalText, researchUsed: true };
      } catch (e) {
        console.error("Oracle research failed, returning original response:", e);
        // Strip the [RESEARCH] marker and return what we have
        const cleaned = rawText.replace(/\[RESEARCH\].*/, "").trim();
        return {
          type: "message",
          data: null,
          rawText:
            cleaned ||
            "I tried to research that but encountered an issue. Could you rephrase your question?",
        };
      }
    }

    return { type: "message", data: null, rawText };
  },
});
