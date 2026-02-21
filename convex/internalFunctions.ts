import { internalQuery, internalMutation } from "./_generated/server";
import { v } from "convex/values";

export const getAllSwitches = internalQuery({
  args: {},
  returns: v.array(v.any()),
  handler: async (ctx) => {
    return await ctx.db.query("switches").collect();
  },
});

export const getAllComponents = internalQuery({
  args: {},
  returns: v.array(v.any()),
  handler: async (ctx) => {
    return await ctx.db.query("components").collect();
  },
});

export const getAllKeyboards = internalQuery({
  args: {},
  returns: v.array(v.any()),
  handler: async (ctx) => {
    return await ctx.db.query("keyboards").collect();
  },
});

export const getConversationById = internalQuery({
  args: { id: v.id("conversations") },
  returns: v.any(),
  handler: async (ctx, args) => {
    return await ctx.db.get(args.id);
  },
});

export const getUserPreferences = internalQuery({
  args: { userId: v.string() },
  returns: v.any(),
  handler: async (ctx, args) => {
    return await ctx.db
      .query("userPreferences")
      .withIndex("by_userId", (q) => q.eq("userId", args.userId))
      .first();
  },
});

export const getBuildById = internalQuery({
  args: { id: v.id("builds") },
  returns: v.any(),
  handler: async (ctx, args) => {
    return await ctx.db.get(args.id);
  },
});

export const setBuildImageUrl = internalMutation({
  args: { id: v.id("builds"), imageUrl: v.string() },
  returns: v.null(),
  handler: async (ctx, args) => {
    await ctx.db.patch(args.id, { imageUrl: args.imageUrl });
    return null;
  },
});
