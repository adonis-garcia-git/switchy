"use node";

import { internalAction } from "./_generated/server";
import { internal } from "./_generated/api";
import { v } from "convex/values";
import { niaOracleRun, niaUniversalSearch } from "./niaClient";

/**
 * Weekly product sync — discovers new releases across vendors.
 */
export const weeklyProductSync = internalAction({
  args: {},
  returns: v.null(),
  handler: async (ctx): Promise<null> => {
    try {
      const result = await niaOracleRun(
        "New mechanical keyboard switches, keyboards, and keycap sets released this week across major vendors including Divinikey, KBDfans, Keychron, Novelkeys, and CannonKeys. List each product with name, brand, category, and approximate price."
      );

      // Parse products from the oracle response and insert as suggestions
      const products = parseProductsFromText(result.answer);
      for (const product of products) {
        await ctx.runMutation(
          internal.internalFunctions.insertProductSuggestion,
          {
            source: "nia-weekly-sync",
            category: product.category,
            name: product.name,
            brand: product.brand,
            data: product,
            status: "pending",
            createdAt: Date.now(),
          }
        );
      }
    } catch (e) {
      console.error("Weekly product sync failed:", e);
    }
    return null;
  },
});

/**
 * Weekly trending analysis — what's hot in the community.
 */
export const weeklyTrendingAnalysis = internalAction({
  args: {},
  returns: v.null(),
  handler: async (ctx): Promise<null> => {
    const now = new Date();
    const weekNum = getISOWeekNumber(now);
    const weekKey = `${now.getFullYear()}-W${String(weekNum).padStart(2, "0")}`;

    try {
      // Run parallel research queries
      const [trending, priceChanges, groupBuyUpdates] = await Promise.all([
        niaOracleRun(
          "What mechanical keyboards, switches, and keycaps are trending this week on Reddit (r/MechanicalKeyboards) and YouTube? List the top 5-10 trending products with brief community sentiment."
        ),
        niaUniversalSearch(
          "mechanical keyboard price drop sale discount this week",
          10
        ),
        niaOracleRun(
          "Status updates for active mechanical keyboard group buys: which ones shipped, which have delays, which opened for extras?"
        ),
      ]);

      await ctx.runMutation(internal.internalFunctions.insertWeeklyDigest, {
        weekKey,
        trending: trending.answer,
        newProducts: null,
        priceChanges: priceChanges.map((r) => ({
          title: r.title,
          snippet: r.snippet,
          url: r.url,
        })),
        groupBuyUpdates: groupBuyUpdates.answer,
        generatedAt: Date.now(),
      });
    } catch (e) {
      console.error("Weekly trending analysis failed:", e);
    }
    return null;
  },
});

// ── Helpers ──

interface ParsedProduct {
  name: string;
  brand: string;
  category: string;
  price?: number;
}

function parseProductsFromText(text: string): ParsedProduct[] {
  const products: ParsedProduct[] = [];
  const lines = text.split("\n");

  for (const line of lines) {
    // Match patterns like "Brand Name - $XX" or "Brand Name ($XX)"
    const match = line.match(
      /(?:^[-*]\s*)?(.+?)(?:\s*[-–]\s*|\s*\()\$?(\d+(?:\.\d{2})?)/
    );
    if (match) {
      const fullName = match[1].trim();
      const price = parseFloat(match[2]);

      // Try to split brand from product name
      const parts = fullName.split(/\s+/);
      const brand = parts[0] ?? "Unknown";
      const name = parts.length > 1 ? parts.slice(1).join(" ") : fullName;

      // Infer category from keywords
      let category = "keyboard";
      const lower = fullName.toLowerCase();
      if (
        lower.includes("switch") ||
        lower.includes("linear") ||
        lower.includes("tactile")
      )
        category = "switch";
      else if (
        lower.includes("keycap") ||
        lower.includes("cap") ||
        lower.includes("pbt") ||
        lower.includes("abs")
      )
        category = "keycap";

      products.push({ name, brand, category, price });
    }
  }

  return products;
}

function getISOWeekNumber(date: Date): number {
  const d = new Date(
    Date.UTC(date.getFullYear(), date.getMonth(), date.getDate())
  );
  const dayNum = d.getUTCDay() || 7;
  d.setUTCDate(d.getUTCDate() + 4 - dayNum);
  const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
  return Math.ceil(((d.getTime() - yearStart.getTime()) / 86400000 + 1) / 7);
}
