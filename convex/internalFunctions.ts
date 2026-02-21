import { internalQuery } from "./_generated/server";
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
