import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

// get() - Get current user's preferences
export const get = query({
  args: {},
  returns: v.any(),
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) return null;
    const prefs = await ctx.db
      .query("userPreferences")
      .withIndex("by_userId", (q) => q.eq("userId", identity.subject))
      .first();
    return prefs;
  },
});

// save() - Create or update preferences (upsert)
export const save = mutation({
  args: {
    experienceLevel: v.union(v.literal("beginner"), v.literal("intermediate"), v.literal("expert")),
    preferredSound: v.optional(v.string()),
    budgetRange: v.optional(v.object({ min: v.number(), max: v.number() })),
    preferredSize: v.optional(v.string()),
  },
  returns: v.any(),
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Not authenticated");

    const existing = await ctx.db
      .query("userPreferences")
      .withIndex("by_userId", (q) => q.eq("userId", identity.subject))
      .first();

    if (existing) {
      await ctx.db.patch(existing._id, { ...args });
      return existing._id;
    }

    return await ctx.db.insert("userPreferences", {
      userId: identity.subject,
      hasCompletedOnboarding: true,
      ...args,
    });
  },
});

// completeOnboarding() - Mark onboarding as complete
export const completeOnboarding = mutation({
  args: {},
  returns: v.null(),
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Not authenticated");

    const existing = await ctx.db
      .query("userPreferences")
      .withIndex("by_userId", (q) => q.eq("userId", identity.subject))
      .first();

    if (existing) {
      await ctx.db.patch(existing._id, { hasCompletedOnboarding: true });
    }
    return null;
  },
});
