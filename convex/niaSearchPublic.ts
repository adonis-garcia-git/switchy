"use node";

import { action } from "./_generated/server";
import { v } from "convex/values";
import { niaUniversalSearch, hashQuery, type NiaSearchResult } from "./niaClient";
import { internal } from "./_generated/api";

const CACHE_TTL_MS = 4 * 60 * 60 * 1000; // 4 hours for search page

/**
 * Universal search across both local Convex data and Nia-indexed external sources.
 * Powers the /search page.
 */
export const universalSearch = action({
  args: {
    query: v.string(),
    limit: v.optional(v.number()),
  },
  returns: v.any(),
  handler: async (ctx, args): Promise<{ local: unknown[]; external: unknown[] }> => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Not authenticated");

    const limit = args.limit ?? 10;
    const cacheKey = hashQuery(args.query, "search-page");

    // Check cache
    const cached: Record<string, unknown> | null = await ctx.runQuery(
      internal.internalFunctions.getNiaCacheByHash,
      { queryHash: cacheKey }
    );
    if (cached && (cached.expiresAt as number) > Date.now()) {
      return cached.result as { local: unknown[]; external: unknown[] };
    }

    // Search local Convex tables in parallel with Nia
    const [localSwitches, localKeyboards, localKeycaps, externalResults]: [
      Record<string, unknown>[],
      Record<string, unknown>[],
      Record<string, unknown>[],
      NiaSearchResult[]
    ] = await Promise.all([
        ctx.runQuery(internal.internalFunctions.getAllSwitches) as Promise<Record<string, unknown>[]>,
        ctx.runQuery(internal.internalFunctions.getAllKeyboards) as Promise<Record<string, unknown>[]>,
        ctx.runQuery(internal.internalFunctions.getAllKeycaps) as Promise<Record<string, unknown>[]>,
        niaUniversalSearch(args.query, limit).catch(() => [] as NiaSearchResult[]),
      ]);

    // Filter local results by query
    const queryLower = args.query.toLowerCase();
    const localResults = [
      ...localSwitches
        .filter(
          (s: Record<string, unknown>) =>
            String(s.name).toLowerCase().includes(queryLower) ||
            String(s.brand).toLowerCase().includes(queryLower) ||
            String(s.type).toLowerCase().includes(queryLower) ||
            String(s.soundCharacter ?? "").toLowerCase().includes(queryLower)
        )
        .slice(0, limit)
        .map((s: Record<string, unknown>) => ({
          type: "switch" as const,
          name: `${s.brand} ${s.name}`,
          price: s.pricePerSwitch,
          imageUrl: s.imageUrl,
          detailUrl: `/switches/${s._id}`,
          source: "local",
        })),
      ...localKeyboards
        .filter(
          (k: Record<string, unknown>) =>
            String(k.name).toLowerCase().includes(queryLower) ||
            String(k.brand).toLowerCase().includes(queryLower) ||
            String(k.size ?? "").toLowerCase().includes(queryLower) ||
            String(k.mountingStyle ?? "").toLowerCase().includes(queryLower)
        )
        .slice(0, limit)
        .map((k: Record<string, unknown>) => ({
          type: "keyboard" as const,
          name: `${k.brand} ${k.name}`,
          price: k.priceUsd,
          imageUrl: k.imageUrl,
          detailUrl: `/keyboards/${k._id}`,
          source: "local",
        })),
      ...localKeycaps
        .filter(
          (kc: Record<string, unknown>) =>
            String(kc.name).toLowerCase().includes(queryLower) ||
            String(kc.brand).toLowerCase().includes(queryLower) ||
            String(kc.profile ?? "").toLowerCase().includes(queryLower)
        )
        .slice(0, limit)
        .map((kc: Record<string, unknown>) => ({
          type: "keycap" as const,
          name: `${kc.brand} ${kc.name}`,
          price: kc.priceUsd,
          imageUrl: kc.imageUrl,
          detailUrl: `/keycaps/${kc._id}`,
          source: "local",
        })),
    ];

    const external: unknown[] = externalResults.map((r: NiaSearchResult) => ({
      type: "external" as const,
      name: r.title,
      snippet: r.snippet,
      url: r.url,
      source: r.source,
    }));

    const result: { local: unknown[]; external: unknown[] } = { local: localResults, external };

    // Cache
    try {
      await ctx.runMutation(internal.internalFunctions.insertNiaCache, {
        queryHash: cacheKey,
        result,
        source: "search-page",
        createdAt: Date.now(),
        expiresAt: Date.now() + CACHE_TTL_MS,
      });
    } catch {
      // Cache write is best-effort
    }

    return result;
  },
});
