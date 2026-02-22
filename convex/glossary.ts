import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

// list() - Get all terms, optionally by category
export const list = query({
  args: { category: v.optional(v.string()) },
  returns: v.array(v.any()),
  handler: async (ctx, args) => {
    if (args.category) {
      return await ctx.db
        .query("glossaryTerms")
        .withIndex("by_category", (q) => q.eq("category", args.category!))
        .take(200);
    }
    return await ctx.db.query("glossaryTerms").take(200);
  },
});

// search() - Full text search on term
export const search = query({
  args: { query: v.string() },
  returns: v.array(v.any()),
  handler: async (ctx, args) => {
    return await ctx.db
      .query("glossaryTerms")
      .withSearchIndex("search_term", (q) => q.search("term", args.query))
      .collect();
  },
});

// getByTerm() - Exact term lookup (case-insensitive match via collect + filter)
export const getByTerm = query({
  args: { term: v.string() },
  returns: v.any(),
  handler: async (ctx, args) => {
    const allTerms = await ctx.db.query("glossaryTerms").collect();
    return allTerms.find(
      (t) => t.term.toLowerCase() === args.term.toLowerCase()
    ) ?? null;
  },
});

// seed() - Bulk insert glossary terms
export const seed = mutation({
  args: { terms: v.array(v.object({
    term: v.string(),
    definition: v.string(),
    category: v.string(),
    relatedTerms: v.array(v.string()),
  })) },
  returns: v.number(),
  handler: async (ctx, args) => {
    const existing = await ctx.db.query("glossaryTerms").collect();
    if (existing.length > 0) return 0;
    for (const term of args.terms) {
      await ctx.db.insert("glossaryTerms", term);
    }
    return args.terms.length;
  },
});
