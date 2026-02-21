import { query } from "./_generated/server";
import { v } from "convex/values";

export const list = query({
  args: {
    category: v.optional(v.string()),
    brand: v.optional(v.string()),
    minPrice: v.optional(v.number()),
    maxPrice: v.optional(v.number()),
    sortBy: v.optional(v.string()),
    sortOrder: v.optional(v.union(v.literal("asc"), v.literal("desc"))),
  },
  returns: v.array(v.any()),
  handler: async (ctx, args) => {
    let products;

    if (args.category) {
      products = await ctx.db
        .query("products")
        .withIndex("by_category", (q) => q.eq("category", args.category!))
        .collect();
    } else if (args.brand) {
      products = await ctx.db
        .query("products")
        .withIndex("by_brand", (q) => q.eq("brand", args.brand!))
        .collect();
    } else {
      products = await ctx.db.query("products").collect();
    }

    if (args.brand && args.category) {
      products = products.filter((p) => p.brand === args.brand);
    }
    if (args.minPrice !== undefined) {
      products = products.filter((p) => (p.priceUsd ?? 0) >= args.minPrice!);
    }
    if (args.maxPrice !== undefined) {
      products = products.filter((p) => (p.priceUsd ?? Infinity) <= args.maxPrice!);
    }

    const sortBy = args.sortBy || "name";
    const sortOrder = args.sortOrder || "asc";
    products.sort((a, b) => {
      const aVal: unknown = a[sortBy as keyof typeof a];
      const bVal: unknown = b[sortBy as keyof typeof b];
      if (typeof aVal === "string" && typeof bVal === "string") {
        return sortOrder === "asc" ? aVal.localeCompare(bVal) : bVal.localeCompare(aVal);
      }
      return sortOrder === "asc"
        ? Number(aVal ?? 0) - Number(bVal ?? 0)
        : Number(bVal ?? 0) - Number(aVal ?? 0);
    });

    return products;
  },
});

export const getById = query({
  args: { id: v.id("products") },
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
      return await ctx.db.query("products").collect();
    }
    return await ctx.db
      .query("products")
      .withSearchIndex("search_name", (q) => q.search("name", args.query))
      .collect();
  },
});

export const getAllCategories = query({
  args: {},
  returns: v.array(v.string()),
  handler: async (ctx) => {
    const products = await ctx.db.query("products").collect();
    const categories = [...new Set(products.map((p) => p.category))];
    return categories.sort();
  },
});

export const getAllBrands = query({
  args: { category: v.optional(v.string()) },
  returns: v.array(v.string()),
  handler: async (ctx, args) => {
    let products;
    if (args.category) {
      products = await ctx.db
        .query("products")
        .withIndex("by_category", (q) => q.eq("category", args.category!))
        .collect();
    } else {
      products = await ctx.db.query("products").collect();
    }
    const brands = [...new Set(products.map((p) => p.brand))];
    return brands.sort();
  },
});
