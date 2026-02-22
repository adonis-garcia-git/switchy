import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

export const list = query({
  args: {
    subcategory: v.optional(v.string()),
    brand: v.optional(v.string()),
    minPrice: v.optional(v.number()),
    maxPrice: v.optional(v.number()),
  },
  returns: v.array(v.any()),
  handler: async (ctx, args) => {
    let accessories;

    if (args.subcategory) {
      accessories = await ctx.db
        .query("accessories")
        .withIndex("by_subcategory", (q) => q.eq("subcategory", args.subcategory!))
        .take(200);
    } else if (args.brand) {
      accessories = await ctx.db
        .query("accessories")
        .withIndex("by_brand", (q) => q.eq("brand", args.brand!))
        .take(200);
    } else {
      accessories = await ctx.db.query("accessories").take(200);
    }

    if (args.minPrice !== undefined) {
      accessories = accessories.filter((a) => a.priceUsd >= args.minPrice!);
    }
    if (args.maxPrice !== undefined) {
      accessories = accessories.filter((a) => a.priceUsd <= args.maxPrice!);
    }

    return accessories;
  },
});

export const getById = query({
  args: { id: v.id("accessories") },
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
      return await ctx.db.query("accessories").take(200);
    }
    return await ctx.db
      .query("accessories")
      .withSearchIndex("search_name", (q) => q.search("name", args.query))
      .take(200);
  },
});

export const getRecommended = query({
  args: {
    limit: v.optional(v.number()),
    subcategory: v.optional(v.string()),
  },
  returns: v.array(v.any()),
  handler: async (ctx, args) => {
    let all;
    if (args.subcategory) {
      all = await ctx.db
        .query("accessories")
        .withIndex("by_subcategory", (q) => q.eq("subcategory", args.subcategory!))
        .take(200);
    } else {
      all = await ctx.db.query("accessories").take(200);
    }
    const sorted = [...all].sort((a, b) => a.priceUsd - b.priceUsd);
    return sorted.slice(0, args.limit ?? 3);
  },
});

export const getAllBrands = query({
  args: {},
  returns: v.array(v.string()),
  handler: async (ctx) => {
    const all = await ctx.db.query("accessories").take(200);
    const brands = [...new Set(all.map((a) => a.brand))];
    return brands.sort();
  },
});

export const getAllSubcategories = query({
  args: {},
  returns: v.array(v.string()),
  handler: async (ctx) => {
    const all = await ctx.db.query("accessories").take(200);
    const subcategories = [...new Set(all.map((a) => a.subcategory))];
    return subcategories.sort();
  },
});

export const seed = mutation({
  args: {
    accessories: v.array(v.object({
      brand: v.string(),
      name: v.string(),
      slug: v.optional(v.string()),
      subcategory: v.string(),
      priceUsd: v.number(),
      inStock: v.optional(v.boolean()),
      notes: v.optional(v.string()),
      imageUrl: v.optional(v.string()),
      productUrl: v.optional(v.string()),
      specs: v.optional(v.any()),
      tags: v.optional(v.array(v.string())),
      fabricated: v.optional(v.boolean()),
    })),
  },
  returns: v.number(),
  handler: async (ctx, args) => {
    const existing = await ctx.db.query("accessories").take(1);
    if (existing.length > 0) return 0;
    const seen = new Set<string>();
    let count = 0;
    for (const accessory of args.accessories) {
      const dedupKey = `${accessory.brand}::${accessory.name}`;
      if (seen.has(dedupKey)) {
        console.warn(`Skipping duplicate accessory: ${dedupKey}`);
        continue;
      }
      seen.add(dedupKey);
      await ctx.db.insert("accessories", accessory);
      count++;
    }
    return count;
  },
});

export const cleanAndReseed = mutation({
  args: {
    accessories: v.array(v.object({
      brand: v.string(),
      name: v.string(),
      slug: v.optional(v.string()),
      subcategory: v.string(),
      priceUsd: v.number(),
      inStock: v.optional(v.boolean()),
      notes: v.optional(v.string()),
      imageUrl: v.optional(v.string()),
      productUrl: v.optional(v.string()),
      specs: v.optional(v.any()),
      tags: v.optional(v.array(v.string())),
      fabricated: v.optional(v.boolean()),
    })),
  },
  returns: v.object({
    deleted: v.number(),
    added: v.number(),
  }),
  handler: async (ctx, args) => {
    const existing = await ctx.db.query("accessories").collect();
    for (const acc of existing) {
      await ctx.db.delete(acc._id);
    }

    const seen = new Set<string>();
    let added = 0;
    for (const acc of args.accessories) {
      const dedupKey = `${acc.brand}::${acc.name}`;
      if (seen.has(dedupKey)) {
        console.warn(`Skipping duplicate accessory: ${dedupKey}`);
        continue;
      }
      seen.add(dedupKey);
      await ctx.db.insert("accessories", acc);
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

    const all = await ctx.db.query("accessories").collect();
    const seen = new Set<string>();
    let duplicatesRemoved = 0;

    for (const acc of all) {
      const key = `${acc.brand}::${acc.name}`;
      if (seen.has(key)) {
        await ctx.db.delete(acc._id);
        duplicatesRemoved++;
      } else {
        seen.add(key);
      }
    }

    return { total: all.length, duplicatesRemoved };
  },
});
