import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

export const list = query({
  args: {},
  returns: v.array(v.any()),
  handler: async (ctx) => {
    return await ctx.db.query("affiliateConfig").collect();
  },
});

export const seed = mutation({
  args: {
    configs: v.array(
      v.object({
        vendor: v.string(),
        affiliateTag: v.string(),
        isActive: v.boolean(),
      })
    ),
  },
  returns: v.number(),
  handler: async (ctx, args) => {
    const existing = await ctx.db.query("affiliateConfig").collect();
    if (existing.length > 0) return 0;
    for (const config of args.configs) {
      await ctx.db.insert("affiliateConfig", config);
    }
    return args.configs.length;
  },
});
