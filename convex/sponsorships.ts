import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

// getActive() - Get active sponsorships, optionally filtered by placement
export const getActive = query({
  args: { placement: v.optional(v.string()) },
  returns: v.array(v.any()),
  handler: async (ctx, args) => {
    const today = new Date().toISOString().split("T")[0];

    let results;
    if (args.placement) {
      results = await ctx.db
        .query("sponsorships")
        .withIndex("by_placement", (q) => q.eq("placement", args.placement as any))
        .collect();
    } else {
      results = await ctx.db
        .query("sponsorships")
        .withIndex("by_isActive", (q) => q.eq("isActive", true))
        .collect();
    }

    return results.filter(
      (s) => s.isActive && s.startDate <= today && s.endDate >= today
    );
  },
});

// getFeaturedProductNames() - Get product names of active sponsorships for badge rendering
export const getFeaturedProductNames = query({
  args: {},
  returns: v.array(v.string()),
  handler: async (ctx) => {
    const today = new Date().toISOString().split("T")[0];
    const sponsorships = await ctx.db
      .query("sponsorships")
      .withIndex("by_isActive", (q) => q.eq("isActive", true))
      .collect();

    return sponsorships
      .filter((s) => s.startDate <= today && s.endDate >= today)
      .map((s) => s.productName);
  },
});

// recordImpression() - Increment impression counter on a sponsorship
export const recordImpression = mutation({
  args: { id: v.id("sponsorships") },
  returns: v.null(),
  handler: async (ctx, args) => {
    const sponsorship = await ctx.db.get(args.id);
    if (!sponsorship) throw new Error("Sponsorship not found");
    await ctx.db.patch(args.id, { impressions: sponsorship.impressions + 1 });
    return null;
  },
});

// recordClick() - Increment click counter on a sponsorship
export const recordClick = mutation({
  args: { id: v.id("sponsorships") },
  returns: v.null(),
  handler: async (ctx, args) => {
    const sponsorship = await ctx.db.get(args.id);
    if (!sponsorship) throw new Error("Sponsorship not found");
    await ctx.db.patch(args.id, { clicks: sponsorship.clicks + 1 });
    return null;
  },
});

// create() - Admin creates a sponsorship (requires auth)
export const create = mutation({
  args: {
    vendorName: v.string(),
    productType: v.optional(v.string()),
    productName: v.string(),
    placement: v.union(
      v.literal("featured_badge"),
      v.literal("promoted_search"),
      v.literal("build_recommendation"),
      v.literal("homepage_spotlight")
    ),
    startDate: v.string(),
    endDate: v.string(),
  },
  returns: v.id("sponsorships"),
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Not authenticated");
    return await ctx.db.insert("sponsorships", {
      ...args,
      isActive: true,
      impressions: 0,
      clicks: 0,
    });
  },
});
