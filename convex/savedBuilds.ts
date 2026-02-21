import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

export const listByUser = query({
  args: {},
  returns: v.array(v.any()),
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) return [];
    return await ctx.db
      .query("builds")
      .withIndex("by_userId", (q) => q.eq("userId", identity.subject))
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
    components: v.any(),
    recommendedMods: v.any(),
    estimatedTotal: v.number(),
    soundProfileExpected: v.string(),
    buildDifficulty: v.string(),
    notes: v.string(),
    conversationId: v.optional(v.string()),
  },
  returns: v.id("builds"),
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Not authenticated");
    return await ctx.db.insert("builds", {
      userId: identity.subject,
      ...args,
    });
  },
});

export const togglePublic = mutation({
  args: { id: v.id("builds") },
  returns: v.any(),
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Not authenticated");
    const build = await ctx.db.get(args.id);
    if (!build || build.userId !== identity.subject) {
      throw new Error("Not found or not authorized");
    }
    const isPublic = !build.isPublic;
    const shareSlug = isPublic && !build.shareSlug
      ? Math.random().toString(36).substring(2, 10)
      : build.shareSlug;
    await ctx.db.patch(args.id, { isPublic, shareSlug });
    return { isPublic, shareSlug };
  },
});

export const setImageUrl = mutation({
  args: { id: v.id("builds"), imageUrl: v.string() },
  returns: v.null(),
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Not authenticated");
    const build = await ctx.db.get(args.id);
    if (!build || build.userId !== identity.subject) {
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
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Not authenticated");
    const existing = await ctx.db.get(args.id);
    if (!existing || existing.userId !== identity.subject) {
      throw new Error("Not found or not authorized");
    }
    await ctx.db.delete(args.id);
    return null;
  },
});
