import { mutation, query } from "./_generated/server";
import { v } from "convex/values";
import { getGuestUserId } from "./guestAuth";

export const listByUser = query({
  args: {},
  returns: v.array(v.any()),
  handler: async (ctx) => {
    const userId = await getGuestUserId(ctx);
    return await ctx.db
      .query("builds")
      .withIndex("by_userId", (q) => q.eq("userId", userId))
      .collect();
  },
});

export const getById = query({
  args: { id: v.id("builds") },
  returns: v.any(),
  handler: async (ctx, args) => {
    return await ctx.db.get(args.id);
  },
});

export const save = mutation({
  args: {
    query: v.string(),
    buildName: v.string(),
    summary: v.string(),
    components: v.object({
      keyboardKit: v.object({
        name: v.string(),
        price: v.number(),
        reason: v.string(),
        matchedId: v.optional(v.string()),
        detailUrl: v.optional(v.string()),
        imageUrl: v.optional(v.string()),
        productUrl: v.optional(v.string()),
        externalProduct: v.optional(v.boolean()),
      }),
      switches: v.object({
        name: v.string(),
        price: v.optional(v.number()),
        reason: v.string(),
        quantity: v.number(),
        priceEach: v.number(),
        matchedId: v.optional(v.string()),
        detailUrl: v.optional(v.string()),
        imageUrl: v.optional(v.string()),
        productUrl: v.optional(v.string()),
        externalProduct: v.optional(v.boolean()),
      }),
      keycaps: v.object({
        name: v.string(),
        price: v.number(),
        reason: v.string(),
        matchedId: v.optional(v.string()),
        detailUrl: v.optional(v.string()),
        imageUrl: v.optional(v.string()),
        productUrl: v.optional(v.string()),
        externalProduct: v.optional(v.boolean()),
      }),
      stabilizers: v.object({
        name: v.string(),
        price: v.number(),
        reason: v.string(),
        matchedId: v.optional(v.string()),
        detailUrl: v.optional(v.string()),
        imageUrl: v.optional(v.string()),
        productUrl: v.optional(v.string()),
        externalProduct: v.optional(v.boolean()),
      }),
    }),
    recommendedMods: v.array(v.object({
      mod: v.string(),
      cost: v.number(),
      effect: v.string(),
      difficulty: v.union(v.literal("easy"), v.literal("medium"), v.literal("hard")),
    })),
    estimatedTotal: v.number(),
    soundProfileExpected: v.string(),
    buildDifficulty: v.string(),
    notes: v.string(),
    conversationId: v.optional(v.string()),
  },
  returns: v.id("builds"),
  handler: async (ctx, args) => {
    const userId = await getGuestUserId(ctx);
    return await ctx.db.insert("builds", {
      userId,
      ...args,
    });
  },
});

export const togglePublic = mutation({
  args: { id: v.id("builds") },
  returns: v.any(),
  handler: async (ctx, args) => {
    const userId = await getGuestUserId(ctx);
    const build = await ctx.db.get(args.id);
    if (!build || build.userId !== userId) {
      throw new Error("Not found or not authorized");
    }
    const isPublic = !build.isPublic;
    const shareSlug = isPublic && !build.shareSlug
      ? crypto.randomUUID().replace(/-/g, '').substring(0, 12)
      : build.shareSlug;
    await ctx.db.patch(args.id, { isPublic, shareSlug });
    return { isPublic, shareSlug };
  },
});

export const setImageUrl = mutation({
  args: { id: v.id("builds"), imageUrl: v.string() },
  returns: v.null(),
  handler: async (ctx, args) => {
    const userId = await getGuestUserId(ctx);
    const build = await ctx.db.get(args.id);
    if (!build || build.userId !== userId) {
      throw new Error("Not found or not authorized");
    }
    await ctx.db.patch(args.id, { imageUrl: args.imageUrl });
    return null;
  },
});

export const getByShareSlug = query({
  args: { slug: v.string() },
  returns: v.any(),
  handler: async (ctx, args) => {
    const build = await ctx.db
      .query("builds")
      .withIndex("by_shareSlug", (q) => q.eq("shareSlug", args.slug))
      .first();
    if (!build || !build.isPublic) return null;
    return build;
  },
});

export const remove = mutation({
  args: { id: v.id("builds") },
  returns: v.null(),
  handler: async (ctx, args) => {
    const userId = await getGuestUserId(ctx);
    const existing = await ctx.db.get(args.id);
    if (!existing || existing.userId !== userId) {
      throw new Error("Not found or not authorized");
    }
    await ctx.db.delete(args.id);
    return null;
  },
});
