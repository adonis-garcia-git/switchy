import { mutation, query } from "./_generated/server";
import { v } from "convex/values";
import { getGuestUserId } from "./guestAuth";

export const get = query({
  args: {},
  returns: v.any(),
  handler: async (ctx) => {
    const userId = await getGuestUserId(ctx);
    const budgets = await ctx.db
      .query("groupBuyBudgets")
      .withIndex("by_userId", (q) => q.eq("userId", userId))
      .collect();
    return budgets[0] ?? null;
  },
});

export const set = mutation({
  args: {
    budgetType: v.union(v.literal("monthly"), v.literal("total")),
    amount: v.number(),
  },
  returns: v.null(),
  handler: async (ctx, args) => {
    const userId = await getGuestUserId(ctx);

    const existing = await ctx.db
      .query("groupBuyBudgets")
      .withIndex("by_userId", (q) => q.eq("userId", userId))
      .collect();

    if (existing.length > 0) {
      await ctx.db.patch(existing[0]._id, {
        budgetType: args.budgetType,
        amount: args.amount,
      });
    } else {
      await ctx.db.insert("groupBuyBudgets", {
        userId,
        budgetType: args.budgetType,
        amount: args.amount,
      });
    }
    return null;
  },
});

export const remove = mutation({
  args: {},
  returns: v.null(),
  handler: async (ctx) => {
    const userId = await getGuestUserId(ctx);

    const existing = await ctx.db
      .query("groupBuyBudgets")
      .withIndex("by_userId", (q) => q.eq("userId", userId))
      .collect();

    for (const budget of existing) {
      await ctx.db.delete(budget._id);
    }
    return null;
  },
});
