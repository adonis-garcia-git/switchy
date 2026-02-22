import { query } from "./_generated/server";
import { v } from "convex/values";

export const getLatest = query({
  args: {},
  returns: v.any(),
  handler: async (ctx) => {
    const digests = await ctx.db
      .query("weeklyDigest")
      .order("desc")
      .take(1);
    return digests[0] ?? null;
  },
});

export const getByWeekKey = query({
  args: { weekKey: v.string() },
  returns: v.any(),
  handler: async (ctx, args) => {
    return await ctx.db
      .query("weeklyDigest")
      .withIndex("by_weekKey", (q) => q.eq("weekKey", args.weekKey))
      .first();
  },
});
