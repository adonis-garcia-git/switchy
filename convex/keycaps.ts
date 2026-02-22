import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

export const list = query({
  args: {
    profile: v.optional(v.string()),
    material: v.optional(v.string()),
    brand: v.optional(v.string()),
    minPrice: v.optional(v.number()),
    maxPrice: v.optional(v.number()),
  },
  returns: v.array(v.any()),
  handler: async (ctx, args) => {
    let keycaps;

    if (args.profile) {
      keycaps = await ctx.db
        .query("keycaps")
        .withIndex("by_profile", (q) => q.eq("profile", args.profile!))
        .take(200);
    } else if (args.material) {
      keycaps = await ctx.db
        .query("keycaps")
        .withIndex("by_material", (q) => q.eq("material", args.material!))
        .take(200);
    } else if (args.brand) {
      keycaps = await ctx.db
        .query("keycaps")
        .withIndex("by_brand", (q) => q.eq("brand", args.brand!))
        .take(200);
    } else {
      keycaps = await ctx.db.query("keycaps").take(200);
    }

    if (args.minPrice !== undefined) {
      keycaps = keycaps.filter((k) => k.priceUsd >= args.minPrice!);
    }
    if (args.maxPrice !== undefined) {
      keycaps = keycaps.filter((k) => k.priceUsd <= args.maxPrice!);
    }

    return keycaps;
  },
});

export const getById = query({
  args: { id: v.id("keycaps") },
  returns: v.any(),
  handler: async (ctx, args) => {
    return await ctx.db.get(args.id);
  },
});

export const search = query({
  args: { query: v.string() },
  returns: v.array(v.any()),
  handler: async (ctx, args) => {
    if (!args.query.trim()) {
      return await ctx.db.query("keycaps").take(200);
    }
    return await ctx.db
      .query("keycaps")
      .withSearchIndex("search_name", (q) => q.search("name", args.query))
      .take(200);
  },
});

export const getRecommended = query({
  args: { limit: v.optional(v.number()) },
  returns: v.array(v.any()),
  handler: async (ctx, args) => {
    const all = await ctx.db.query("keycaps").take(200);
    const sorted = [...all].sort((a, b) => a.priceUsd - b.priceUsd);
    return sorted.slice(0, args.limit ?? 3);
  },
});

export const getAllBrands = query({
  args: {},
  returns: v.array(v.string()),
  handler: async (ctx) => {
    const all = await ctx.db.query("keycaps").take(200);
    const brands = [...new Set(all.map((k) => k.brand))];
    return brands.sort();
  },
});

export const getAllProfiles = query({
  args: {},
  returns: v.array(v.string()),
  handler: async (ctx) => {
    const all = await ctx.db.query("keycaps").take(200);
    const profiles = [...new Set(all.map((k) => k.profile))];
    return profiles.sort();
  },
});

export const seed = mutation({
  args: {
    keycaps: v.array(v.object({
      brand: v.string(),
      name: v.string(),
      slug: v.optional(v.string()),
      profile: v.string(),
      material: v.string(),
      legendType: v.optional(v.string()),
      numKeys: v.optional(v.number()),
      compatibility: v.optional(v.string()),
      manufacturer: v.optional(v.string()),
      priceUsd: v.number(),
      inStock: v.optional(v.boolean()),
      notes: v.optional(v.string()),
      imageUrl: v.optional(v.string()),
      productUrl: v.optional(v.string()),
      tags: v.optional(v.array(v.string())),
      fabricated: v.optional(v.boolean()),
    })),
  },
  returns: v.number(),
  handler: async (ctx, args) => {
    const existing = await ctx.db.query("keycaps").take(1);
    if (existing.length > 0) return 0;
    const seen = new Set<string>();
    let count = 0;
    for (const keycap of args.keycaps) {
      const dedupKey = `${keycap.brand}::${keycap.name}`;
      if (seen.has(dedupKey)) {
        console.warn(`Skipping duplicate keycap: ${dedupKey}`);
        continue;
      }
      seen.add(dedupKey);
      await ctx.db.insert("keycaps", keycap);
      count++;
    }
    return count;
  },
});

export const cleanAndReseed = mutation({
  args: {
    keycaps: v.array(v.object({
      brand: v.string(),
      name: v.string(),
      slug: v.optional(v.string()),
      profile: v.string(),
      material: v.string(),
      legendType: v.optional(v.string()),
      numKeys: v.optional(v.number()),
      compatibility: v.optional(v.string()),
      manufacturer: v.optional(v.string()),
      priceUsd: v.number(),
      inStock: v.optional(v.boolean()),
      notes: v.optional(v.string()),
      imageUrl: v.optional(v.string()),
      productUrl: v.optional(v.string()),
      tags: v.optional(v.array(v.string())),
      fabricated: v.optional(v.boolean()),
    })),
  },
  returns: v.object({
    deleted: v.number(),
    added: v.number(),
  }),
  handler: async (ctx, args) => {
    const existing = await ctx.db.query("keycaps").collect();
    for (const kc of existing) {
      await ctx.db.delete(kc._id);
    }

    const seen = new Set<string>();
    let added = 0;
    for (const kc of args.keycaps) {
      const dedupKey = `${kc.brand}::${kc.name}`;
      if (seen.has(dedupKey)) {
        console.warn(`Skipping duplicate keycap: ${dedupKey}`);
        continue;
      }
      seen.add(dedupKey);
      await ctx.db.insert("keycaps", kc);
      added++;
    }

    return { deleted: existing.length, added };
  },
});

export const deduplicate = mutation({
  args: {},
  returns: v.object({
    total: v.number(),
    duplicatesRemoved: v.number(),
  }),
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Not authenticated");

    const all = await ctx.db.query("keycaps").collect();
    const seen = new Set<string>();
    let duplicatesRemoved = 0;

    for (const kc of all) {
      const key = `${kc.brand}::${kc.name}`;
      if (seen.has(key)) {
        await ctx.db.delete(kc._id);
        duplicatesRemoved++;
      } else {
        seen.add(key);
      }
    }

    return { total: all.length, duplicatesRemoved };
  },
});
