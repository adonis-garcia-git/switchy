import { query } from "./_generated/server";
import { v } from "convex/values";

export const list = query({
  args: {
    category: v.optional(v.string()),
  },
  returns: v.array(v.any()),
  handler: async (ctx, args) => {
    if (args.category) {
      return await ctx.db
        .query("components")
        .withIndex("by_category", (q) =>
          q.eq(
            "category",
            args.category as
              | "plate"
              | "case"
              | "keycapProfile"
              | "keycapMaterial"
              | "mountingStyle"
              | "mod"
          )
        )
        .collect();
    }
    return await ctx.db.query("components").collect();
  },
});
