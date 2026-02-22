"use node";

import { action } from "./_generated/server";
import { internal } from "./_generated/api";
import { v } from "convex/values";
import {
  niaUniversalSearch,
  niaQuerySearch,
  hashQuery,
  type NiaSearchResult,
} from "./niaClient";

const CACHE_TTL_MS = 24 * 60 * 60 * 1000; // 24 hours

/**
 * Search all indexed Nia sources for products, reviews, and community intel
 * relevant to a user's build query. Results are cached for 24 hours.
 */
export const searchProducts = action({
  args: {
    query: v.string(),
    maxResults: v.optional(v.number()),
  },
  returns: v.any(),
  handler: async (ctx, args): Promise<NiaSearchResult[]> => {
    const cacheKey = hashQuery(args.query, "universal");
    const maxResults = args.maxResults ?? 10;

    // Check cache first
    const cached = await ctx.runQuery(
      internal.internalFunctions.getNiaCacheByHash,
      { queryHash: cacheKey }
    );
    if (cached && cached.expiresAt > Date.now()) {
      return (cached.result as NiaSearchResult[]).slice(0, maxResults);
    }

    // Fetch from Nia
    try {
      const results = await niaUniversalSearch(args.query, maxResults);

      // Cache the results
      await ctx.runMutation(internal.internalFunctions.insertNiaCache, {
        queryHash: cacheKey,
        result: results,
        source: "universal",
        createdAt: Date.now(),
        expiresAt: Date.now() + CACHE_TTL_MS,
      });

      return results;
    } catch (e) {
      console.error("Nia search failed:", e);
      return [];
    }
  },
});

/**
 * Search for community reviews and characterizations of a specific product.
 */
export const searchReviews = action({
  args: {
    productName: v.string(),
  },
  returns: v.any(),
  handler: async (ctx, args): Promise<NiaSearchResult[]> => {
    const query = `mechanical keyboard review "${args.productName}" sound feel quality`;
    const cacheKey = hashQuery(query, "review");

    // Check cache
    const cached = await ctx.runQuery(
      internal.internalFunctions.getNiaCacheByHash,
      { queryHash: cacheKey }
    );
    if (cached && cached.expiresAt > Date.now()) {
      return cached.result as NiaSearchResult[];
    }

    try {
      const results = await niaUniversalSearch(query, 5);

      await ctx.runMutation(internal.internalFunctions.insertNiaCache, {
        queryHash: cacheKey,
        result: results,
        source: "review",
        createdAt: Date.now(),
        expiresAt: Date.now() + CACHE_TTL_MS,
      });

      return results;
    } catch (e) {
      console.error("Nia review search failed:", e);
      return [];
    }
  },
});

/**
 * Search for a specific product across vendor catalogs.
 * Used by productValidator as a fallback when a product isn't in the local DB.
 */
export const searchProduct = action({
  args: {
    productName: v.string(),
  },
  returns: v.any(),
  handler: async (
    ctx,
    args
  ): Promise<{
    found: boolean;
    vendorUrl?: string;
    price?: number;
    name?: string;
  }> => {
    const query = `"${args.productName}" mechanical keyboard price buy`;
    const cacheKey = hashQuery(query, "product-lookup");

    // Check cache
    const cached = await ctx.runQuery(
      internal.internalFunctions.getNiaCacheByHash,
      { queryHash: cacheKey }
    );
    if (cached && cached.expiresAt > Date.now()) {
      return cached.result as {
        found: boolean;
        vendorUrl?: string;
        price?: number;
      };
    }

    try {
      const results = await niaUniversalSearch(query, 3);

      if (results.length === 0) {
        return { found: false };
      }

      const best = results[0];
      const result = {
        found: true,
        vendorUrl: best.url,
        name: best.title,
        price: extractPrice(best.snippet),
      };

      await ctx.runMutation(internal.internalFunctions.insertNiaCache, {
        queryHash: cacheKey,
        result,
        source: "product-lookup",
        createdAt: Date.now(),
        expiresAt: Date.now() + CACHE_TTL_MS,
      });

      return result;
    } catch (e) {
      console.error("Nia product search failed:", e);
      return { found: false };
    }
  },
});

/**
 * AI-powered query search for glossary and educational content.
 */
export const searchKnowledge = action({
  args: {
    query: v.string(),
  },
  returns: v.any(),
  handler: async (
    ctx,
    args
  ): Promise<{ answer: string; sources: NiaSearchResult[] }> => {
    const cacheKey = hashQuery(args.query, "knowledge");

    const cached = await ctx.runQuery(
      internal.internalFunctions.getNiaCacheByHash,
      { queryHash: cacheKey }
    );
    if (cached && cached.expiresAt > Date.now()) {
      return cached.result as { answer: string; sources: NiaSearchResult[] };
    }

    try {
      const result = await niaQuerySearch(
        `mechanical keyboard ${args.query} definition meaning explanation`
      );

      await ctx.runMutation(internal.internalFunctions.insertNiaCache, {
        queryHash: cacheKey,
        result,
        source: "knowledge",
        createdAt: Date.now(),
        expiresAt: Date.now() + CACHE_TTL_MS,
      });

      return result;
    } catch (e) {
      console.error("Nia knowledge search failed:", e);
      return { answer: "", sources: [] };
    }
  },
});

// ── Helpers ──

function extractPrice(text: string): number | undefined {
  const match = text.match(/\$(\d+(?:\.\d{1,2})?)/);
  return match ? parseFloat(match[1]) : undefined;
}
