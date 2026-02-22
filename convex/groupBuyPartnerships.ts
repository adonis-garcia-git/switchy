import { mutation, query } from "./_generated/server";
import { v } from "convex/values";
import { getGuestUserId } from "./guestAuth";

// listActive() - Get active partnerships within date range
export const listActive = query({
  args: {},
  returns: v.array(v.any()),
  handler: async (ctx) => {
    const today = new Date().toISOString().split("T")[0];
    const partnerships = await ctx.db
      .query("groupBuyPartnerships")
      .withIndex("by_isActive", (q) => q.eq("isActive", true))
      .collect();

    return partnerships.filter(
      (p) => p.startDate <= today && p.endDate >= today
    );
  },
});

// getByVendor() - Lookup partnerships by vendor name
export const getByVendor = query({
  args: { vendorName: v.string() },
  returns: v.array(v.any()),
  handler: async (ctx, args) => {
    return await ctx.db
      .query("groupBuyPartnerships")
      .withIndex("by_vendorName", (q) => q.eq("vendorName", args.vendorName))
      .collect();
  },
});

// create() - Admin creates a partnership (requires auth)
export const create = mutation({
  args: {
    vendorName: v.string(),
    groupBuyName: v.string(),
    commissionPercent: v.number(),
    affiliateUrl: v.string(),
    startDate: v.string(),
    endDate: v.string(),
  },
  returns: v.id("groupBuyPartnerships"),
  handler: async (ctx, args) => {
    const userId = await getGuestUserId(ctx);
    return await ctx.db.insert("groupBuyPartnerships", {
      ...args,
      isActive: true,
      totalClicks: 0,
    });
  },
});

// recordReferralClick() - Increment totalClicks counter on a partnership
export const recordReferralClick = mutation({
  args: { id: v.id("groupBuyPartnerships") },
  returns: v.null(),
  handler: async (ctx, args) => {
    const partnership = await ctx.db.get(args.id);
    if (!partnership) throw new Error("Partnership not found");
    await ctx.db.patch(args.id, { totalClicks: partnership.totalClicks + 1 });
    return null;
  },
});
