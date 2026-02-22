import { query } from "./_generated/server";
import { v } from "convex/values";
import { getGuestUserId } from "./guestAuth";

export const getUserSubscription = query({
  args: {},
  returns: v.any(),
  handler: async (ctx) => {
    const userId = await getGuestUserId(ctx);
    return await ctx.db
      .query("subscriptions")
      .withIndex("by_userId", (q) => q.eq("userId", userId))
      .first();
  },
});

export const getUserTier = query({
  args: {},
  returns: v.union(v.literal("free"), v.literal("pro")),
  handler: async (ctx) => {
    const userId = await getGuestUserId(ctx);
    const subscription = await ctx.db
      .query("subscriptions")
      .withIndex("by_userId", (q) => q.eq("userId", userId))
      .first();
    if (
      subscription &&
      subscription.status === "active" &&
      subscription.currentPeriodEnd > Date.now()
    ) {
      return "pro";
    }
    return "free";
  },
});
