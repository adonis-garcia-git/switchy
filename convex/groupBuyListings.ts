import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

export const list = query({
  args: {
    productType: v.optional(
      v.union(
        v.literal("keyboard"),
        v.literal("switches"),
        v.literal("keycaps"),
        v.literal("accessories")
      )
    ),
    status: v.optional(
      v.union(
        v.literal("upcoming"),
        v.literal("live"),
        v.literal("ended"),
        v.literal("shipped")
      )
    ),
    minPrice: v.optional(v.number()),
    maxPrice: v.optional(v.number()),
    sortBy: v.optional(v.string()),
  },
  returns: v.array(v.any()),
  handler: async (ctx, args) => {
    let results;

    if (args.productType) {
      results = await ctx.db
        .query("groupBuyListings")
        .withIndex("by_productType", (q) => q.eq("productType", args.productType!))
        .collect();
    } else if (args.status) {
      results = await ctx.db
        .query("groupBuyListings")
        .withIndex("by_status", (q) => q.eq("status", args.status!))
        .collect();
    } else {
      results = await ctx.db.query("groupBuyListings").collect();
    }

    // Apply additional filters in memory
    if (args.productType && args.status) {
      results = results.filter((r) => r.status === args.status);
    }
    if (args.minPrice !== undefined) {
      results = results.filter((r) => r.priceMin >= args.minPrice!);
    }
    if (args.maxPrice !== undefined) {
      results = results.filter((r) => r.priceMin <= args.maxPrice!);
    }

    // Sort
    const sortBy = args.sortBy || "endingSoon";
    const now = new Date();

    if (sortBy === "endingSoon") {
      results.sort((a, b) => {
        // Live first, then upcoming, then ended/shipped
        const statusOrder: Record<string, number> = { live: 0, upcoming: 1, ended: 2, shipped: 3 };
        const aDiff = (statusOrder[a.status] ?? 2) - (statusOrder[b.status] ?? 2);
        if (aDiff !== 0) return aDiff;
        // Within same status, sort by end date ascending
        if (a.endDate && b.endDate) {
          return new Date(a.endDate).getTime() - new Date(b.endDate).getTime();
        }
        return 0;
      });
    } else if (sortBy === "newest") {
      results.sort((a, b) => {
        const aDate = a.startDate ? new Date(a.startDate).getTime() : 0;
        const bDate = b.startDate ? new Date(b.startDate).getTime() : 0;
        return bDate - aDate;
      });
    } else if (sortBy === "priceLow") {
      results.sort((a, b) => a.priceMin - b.priceMin);
    } else if (sortBy === "priceHigh") {
      results.sort((a, b) => b.priceMin - a.priceMin);
    } else if (sortBy === "popular") {
      results.sort((a, b) => b.trackingCount - a.trackingCount);
    }

    return results;
  },
});

export const search = query({
  args: { query: v.string() },
  returns: v.array(v.any()),
  handler: async (ctx, args) => {
    return await ctx.db
      .query("groupBuyListings")
      .withSearchIndex("search_name", (q) => q.search("name", args.query))
      .take(50);
  },
});

export const getById = query({
  args: { id: v.id("groupBuyListings") },
  returns: v.any(),
  handler: async (ctx, args) => {
    return await ctx.db.get(args.id);
  },
});

export const getAllVendors = query({
  args: {},
  returns: v.array(v.string()),
  handler: async (ctx) => {
    const listings = await ctx.db.query("groupBuyListings").collect();
    const vendors = new Set(listings.map((l) => l.vendor));
    return Array.from(vendors).sort();
  },
});

export const getEndingSoon = query({
  args: {},
  returns: v.array(v.any()),
  handler: async (ctx) => {
    const now = new Date();
    const sevenDaysFromNow = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);
    const listings = await ctx.db
      .query("groupBuyListings")
      .withIndex("by_status", (q) => q.eq("status", "live"))
      .collect();

    return listings
      .filter((l) => {
        if (!l.endDate) return false;
        const endDate = new Date(l.endDate);
        return endDate >= now && endDate <= sevenDaysFromNow;
      })
      .sort((a, b) => {
        return new Date(a.endDate!).getTime() - new Date(b.endDate!).getTime();
      });
  },
});

export const incrementTrackingCount = mutation({
  args: { id: v.id("groupBuyListings") },
  returns: v.null(),
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Not authenticated");
    const listing = await ctx.db.get(args.id);
    if (!listing) throw new Error("Listing not found");
    await ctx.db.patch(args.id, { trackingCount: listing.trackingCount + 1 });
    return null;
  },
});

export const decrementTrackingCount = mutation({
  args: { id: v.id("groupBuyListings") },
  returns: v.null(),
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Not authenticated");
    const listing = await ctx.db.get(args.id);
    if (!listing) throw new Error("Listing not found");
    await ctx.db.patch(args.id, {
      trackingCount: Math.max(0, listing.trackingCount - 1),
    });
    return null;
  },
});

export const seed = mutation({
  args: { listings: v.array(v.any()) },
  returns: v.number(),
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Not authenticated");

    const existing = await ctx.db.query("groupBuyListings").first();
    if (existing) return 0;

    let count = 0;
    for (const listing of args.listings) {
      const cleaned: Record<string, unknown> = {};
      for (const [key, value] of Object.entries(listing)) {
        if (value !== null) cleaned[key] = value;
      }
      await ctx.db.insert("groupBuyListings", cleaned as any);
      count++;
    }
    return count;
  },
});

export const cleanAndReseed = mutation({
  args: { listings: v.array(v.any()) },
  returns: v.object({
    deleted: v.number(),
    added: v.number(),
  }),
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Not authenticated");

    const existing = await ctx.db.query("groupBuyListings").collect();
    let deleted = 0;
    for (const doc of existing) {
      await ctx.db.delete(doc._id);
      deleted++;
    }

    let added = 0;
    for (const listing of args.listings) {
      const cleaned: Record<string, unknown> = {};
      for (const [key, value] of Object.entries(listing)) {
        if (value !== null) cleaned[key] = value;
      }
      await ctx.db.insert("groupBuyListings", cleaned as any);
      added++;
    }

    return { deleted, added };
  },
});
