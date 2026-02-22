import { mutation } from "./_generated/server";
import { v } from "convex/values";

// trackClick() - Record an affiliate link click
export const trackClick = mutation({
  args: {
    vendorLinkId: v.id("vendorLinks"),
    userId: v.optional(v.string()),
    productName: v.string(),
    vendor: v.string(),
    referrerPage: v.optional(v.string()),
  },
  returns: v.id("affiliateClicks"),
  handler: async (ctx, args) => {
    return await ctx.db.insert("affiliateClicks", {
      vendorLinkId: args.vendorLinkId,
      userId: args.userId,
      productName: args.productName,
      vendor: args.vendor,
      clickedAt: Date.now(),
      referrerPage: args.referrerPage,
    });
  },
});
