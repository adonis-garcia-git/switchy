import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

export const get = query({
  args: {},
  returns: v.any(),
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) return null;
    const budgets = await ctx.db
      .query("groupBuyBudgets")
      .withIndex("by_userId", (q) => q.eq("userId", identity.subject))
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
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Not authenticated");

    const existing = await ctx.db
      .query("groupBuyBudgets")
      .withIndex("by_userId", (q) => q.eq("userId", identity.subject))
      .collect();

    if (existing.length > 0) {
      await ctx.db.patch(existing[0]._id, {
        budgetType: args.budgetType,
        amount: args.amount,
      });
    } else {
      await ctx.db.insert("groupBuyBudgets", {
        userId: identity.subject,
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
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Not authenticated");

    const existing = await ctx.db
      .query("groupBuyBudgets")
      .withIndex("by_userId", (q) => q.eq("userId", identity.subject))
      .collect();

    for (const budget of existing) {
      await ctx.db.delete(budget._id);
    }
    return null;
  },
});
