import { query } from "./_generated/server";
import { v } from "convex/values";

export const list = query({
  args: {
    size: v.optional(v.string()),
    brand: v.optional(v.string()),
    minPrice: v.optional(v.number()),
    maxPrice: v.optional(v.number()),
    hotSwapOnly: v.optional(v.boolean()),
    wirelessOnly: v.optional(v.boolean()),
  },
  returns: v.array(v.any()),
  handler: async (ctx, args) => {
    let keyboards;

    if (args.size) {
      keyboards = await ctx.db
        .query("keyboards")
        .withIndex("by_size", (q) => q.eq("size", args.size!))
        .take(200);
    } else if (args.brand) {
      keyboards = await ctx.db
        .query("keyboards")
        .withIndex("by_brand", (q) => q.eq("brand", args.brand!))
        .take(200);
    } else {
      keyboards = await ctx.db.query("keyboards").take(200);
    }

    if (args.minPrice !== undefined) {
      keyboards = keyboards.filter((k) => k.priceUsd >= args.minPrice!);
    }
    if (args.maxPrice !== undefined) {
      keyboards = keyboards.filter((k) => k.priceUsd <= args.maxPrice!);
    }
    if (args.hotSwapOnly) {
      keyboards = keyboards.filter((k) => k.hotSwap);
    }
    if (args.wirelessOnly) {
      keyboards = keyboards.filter((k) => k.wireless);
    }

    return keyboards;
  },
});

export const getById = query({
  args: { id: v.id("keyboards") },
  returns: v.any(),
  handler: async (ctx, args) => {
    return await ctx.db.get(args.id);
  },
});

export const getRecommended = query({
  args: { limit: v.optional(v.number()) },
  returns: v.array(v.any()),
  handler: async (ctx, args) => {
    const all = await ctx.db.query("keyboards").take(200);
    const sorted = [...all].sort((a, b) => a.priceUsd - b.priceUsd);
    return sorted.slice(0, args.limit ?? 3);
  },
});

export const getAllBrands = query({
  args: {},
  returns: v.array(v.string()),
  handler: async (ctx) => {
    const all = await ctx.db.query("keyboards").take(200);
    const brands = [...new Set(all.map((k) => k.brand))];
    return brands.sort();
  },
});

export const search = query({
  args: { query: v.string() },
  returns: v.array(v.any()),
  handler: async (ctx, args) => {
    if (!args.query.trim()) {
      return await ctx.db.query("keyboards").take(200);
    }
    return await ctx.db
      .query("keyboards")
      .withSearchIndex("search_name", (q) => q.search("name", args.query))
      .take(200);
  },
});
