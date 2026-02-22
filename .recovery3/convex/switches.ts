import { query } from "./_generated/server";
import { v } from "convex/values";

export const list = query({
  args: {
    type: v.optional(
      v.union(v.literal("linear"), v.literal("tactile"), v.literal("clicky"))
    ),
    brand: v.optional(v.string()),
    soundCharacter: v.optional(v.string()),
    soundPitch: v.optional(v.string()),
    soundVolume: v.optional(v.string()),
    minForce: v.optional(v.number()),
    maxForce: v.optional(v.number()),
    minPrice: v.optional(v.number()),
    maxPrice: v.optional(v.number()),
    sortBy: v.optional(v.string()),
    sortOrder: v.optional(v.union(v.literal("asc"), v.literal("desc"))),
  },
  returns: v.array(v.any()),
  handler: async (ctx, args) => {
    let switches;

    if (args.type) {
      switches = await ctx.db
        .query("switches")
        .withIndex("by_type", (q) => q.eq("type", args.type!))
        .take(200);
    } else if (args.brand) {
      switches = await ctx.db
        .query("switches")
        .withIndex("by_brand", (q) => q.eq("brand", args.brand!))
        .take(200);
    } else {
      switches = await ctx.db.query("switches").take(200);
    }

    // Apply client-side filters
    if (args.type && !args.brand) {
      // already filtered by index
    }
    if (args.brand && args.type) {
      switches = switches.filter((s) => s.type === args.type);
    }
    if (args.soundCharacter) {
      switches = switches.filter((s) => s.soundCharacter === args.soundCharacter);
    }
    if (args.soundPitch) {
      switches = switches.filter((s) => s.soundPitch === args.soundPitch);
    }
    if (args.soundVolume) {
      switches = switches.filter((s) => s.soundVolume === args.soundVolume);
    }
    if (args.minForce !== undefined) {
      switches = switches.filter((s) => s.actuationForceG >= args.minForce!);
    }
    if (args.maxForce !== undefined) {
      switches = switches.filter((s) => s.actuationForceG <= args.maxForce!);
    }
    if (args.minPrice !== undefined) {
      switches = switches.filter((s) => s.pricePerSwitch >= args.minPrice!);
    }
    if (args.maxPrice !== undefined) {
      switches = switches.filter((s) => s.pricePerSwitch <= args.maxPrice!);
    }

    // Sort
    const sortBy = args.sortBy || "name";
    const sortOrder = args.sortOrder || "asc";
    switches.sort((a, b) => {
      const aVal: unknown = a[sortBy as keyof typeof a];
      const bVal: unknown = b[sortBy as keyof typeof b];
      if (typeof aVal === "string" && typeof bVal === "string") {
        return sortOrder === "asc"
          ? aVal.localeCompare(bVal)
          : bVal.localeCompare(aVal);
      }
      return sortOrder === "asc"
        ? Number(aVal ?? 0) - Number(bVal ?? 0)
        : Number(bVal ?? 0) - Number(aVal ?? 0);
    });

    return switches;
  },
});

export const getById = query({
  args: { id: v.id("switches") },
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
      return await ctx.db.query("switches").take(200);
    }
    return await ctx.db
      .query("switches")
      .withSearchIndex("search_name", (q) => q.search("name", args.query))
      .take(200);
  },
});

export const getRecommended = query({
  args: { limit: v.optional(v.number()) },
  returns: v.array(v.any()),
  handler: async (ctx, args) => {
    const all = await ctx.db.query("switches").take(200);
    const sorted = all
      .filter((s) => s.communityRating != null)
      .sort((a, b) => (b.communityRating ?? 0) - (a.communityRating ?? 0));
    return sorted.slice(0, args.limit ?? 3);
  },
});

export const getAllBrands = query({
  args: {},
  returns: v.array(v.string()),
  handler: async (ctx) => {
    const switches = await ctx.db.query("switches").collect();
    const brands = [...new Set(switches.map((s) => s.brand))];
    return brands.sort();
  },
});
