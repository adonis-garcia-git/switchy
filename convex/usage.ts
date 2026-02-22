import { query, mutation } from "./_generated/server";
import { v } from "convex/values";
import { getGuestUserId } from "./guestAuth";

const FREE_LIMIT = 3;
const PRO_LIMIT = 999;

function getCurrentMonthKey(): string {
  const now = new Date();
  const year = now.getUTCFullYear();
  const month = String(now.getUTCMonth() + 1).padStart(2, "0");
  return `${year}-${month}`;
}

export const getMonthlyUsage = query({
  args: {},
  returns: v.object({
    count: v.number(),
    limit: v.number(),
    tier: v.union(v.literal("free"), v.literal("pro")),
    remaining: v.number(),
  }),
  handler: async (ctx) => {
    const userId = await getGuestUserId(ctx);
    const monthKey = getCurrentMonthKey();

    // DEMO MODE: always treat as pro tier (bypasses usage limits)
    const tier: "free" | "pro" = "pro";
    const limit = PRO_LIMIT;

    // Count usage for this month
    const records = await ctx.db
      .query("usageRecords")
      .withIndex("by_userId_month", (q) =>
        q.eq("userId", userId).eq("monthKey", monthKey)
      )
      .collect();

    const count = records.length;
    const remaining = Math.max(0, limit - count);

    return { count, limit, tier, remaining };
  },
});

export const recordUsage = mutation({
  args: {
    actionType: v.union(
      v.literal("generateBuild"),
      v.literal("generateBuildConversational"),
      v.literal("generateBuildFromAnswers")
    ),
  },
  returns: v.null(),
  handler: async (ctx, args) => {
    const userId = await getGuestUserId(ctx);
    const monthKey = getCurrentMonthKey();

    await ctx.db.insert("usageRecords", {
      userId,
      actionType: args.actionType,
      monthKey,
      createdAt: Date.now(),
    });
    return null;
  },
});
