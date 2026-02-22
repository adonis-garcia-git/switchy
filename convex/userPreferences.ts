import { mutation, query } from "./_generated/server";
import { v } from "convex/values";
import { getGuestUserId } from "./guestAuth";

// get() - Get current user's preferences
export const get = query({
  args: {},
  returns: v.any(),
  handler: async (ctx) => {
    const userId = await getGuestUserId(ctx);
    const prefs = await ctx.db
      .query("userPreferences")
      .withIndex("by_userId", (q) => q.eq("userId", userId))
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
    const userId = await getGuestUserId(ctx);

    const existing = await ctx.db
      .query("userPreferences")
      .withIndex("by_userId", (q) => q.eq("userId", userId))
      .first();

    if (existing) {
      await ctx.db.patch(existing._id, { ...args });
      return existing._id;
    }

    // Convex serializes mutations that read/write overlapping documents, so a
    // read-then-write race (two concurrent inserts for the same userId) is
    // extremely unlikely in practice. A unique index on userId would provide a
    // hard guarantee but is managed in schema.ts.
    return await ctx.db.insert("userPreferences", {
      userId,
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
    const userId = await getGuestUserId(ctx);

    const existing = await ctx.db
      .query("userPreferences")
      .withIndex("by_userId", (q) => q.eq("userId", userId))
      .first();

    if (existing) {
      await ctx.db.patch(existing._id, { hasCompletedOnboarding: true });
    }
    return null;
  },
});
