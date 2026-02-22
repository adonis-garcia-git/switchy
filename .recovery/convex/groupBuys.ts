import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

export const listByUser = query({
  args: {},
  returns: v.array(v.any()),
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) return [];
    return await ctx.db
      .query("groupBuys")
      .withIndex("by_userId", (q) => q.eq("userId", identity.subject))
      .collect();
  },
});

export const getStats = query({
  args: {},
  returns: v.any(),
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) return null;
    const entries = await ctx.db
      .query("groupBuys")
      .withIndex("by_userId", (q) => q.eq("userId", identity.subject))
      .collect();

    const active = entries.filter((e) => e.status !== "delivered");
    const totalPending = active.reduce((sum, e) => sum + e.cost, 0);
    const now = new Date();
    const overdue = active.filter((e) => new Date(e.estimatedShipDate) < now);
    const avgWaitDays = active.length > 0
      ? Math.round(active.reduce((sum, e) => {
          const ordered = new Date(e.orderDate).getTime();
          return sum + (now.getTime() - ordered) / (1000 * 60 * 60 * 24);
        }, 0) / active.length)
      : 0;

    // Spending by product type
    const spendingByType: Record<string, number> = {};
    for (const e of entries) {
      spendingByType[e.productType] = (spendingByType[e.productType] || 0) + e.cost;
    }

    return {
      totalPending,
      activeCount: active.length,
      avgWaitDays,
      overdueCount: overdue.length,
      totalEntries: entries.length,
      deliveredCount: entries.length - active.length,
      spendingByType,
    };
  },
});

export const create = mutation({
  args: {
    productName: v.string(),
    vendor: v.string(),
    orderDate: v.string(),
    estimatedShipDate: v.string(),
    cost: v.number(),
    status: v.union(
      v.literal("ordered"),
      v.literal("in_production"),
      v.literal("shipped"),
      v.literal("delivered")
    ),
    productType: v.union(
      v.literal("keyboard"),
      v.literal("switches"),
      v.literal("keycaps"),
      v.literal("accessories")
    ),
    notes: v.string(),
    trackingUrl: v.optional(v.string()),
    trackingNumber: v.optional(v.string()),
    imageUrl: v.optional(v.string()),
  },
  returns: v.id("groupBuys"),
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Not authenticated");
    return await ctx.db.insert("groupBuys", {
      userId: identity.subject,
      ...args,
    });
  },
});

export const update = mutation({
  args: {
    id: v.id("groupBuys"),
    productName: v.optional(v.string()),
    vendor: v.optional(v.string()),
    orderDate: v.optional(v.string()),
    estimatedShipDate: v.optional(v.string()),
    cost: v.optional(v.number()),
    status: v.optional(
      v.union(
        v.literal("ordered"),
        v.literal("in_production"),
        v.literal("shipped"),
        v.literal("delivered")
      )
    ),
    productType: v.optional(
      v.union(
        v.literal("keyboard"),
        v.literal("switches"),
        v.literal("keycaps"),
        v.literal("accessories")
      )
    ),
    notes: v.optional(v.string()),
    trackingUrl: v.optional(v.string()),
    trackingNumber: v.optional(v.string()),
    imageUrl: v.optional(v.string()),
  },
  returns: v.null(),
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Not authenticated");
    const { id, ...fields } = args;
    const existing = await ctx.db.get(id);
    if (!existing || existing.userId !== identity.subject) {
      throw new Error("Not found or not authorized");
    }
    const updates: Record<string, unknown> = {};
    for (const [key, value] of Object.entries(fields)) {
      if (value !== undefined) updates[key] = value;
    }
    await ctx.db.patch(id, updates);
    return null;
  },
});

export const remove = mutation({
  args: { id: v.id("groupBuys") },
  returns: v.null(),
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Not authenticated");
    const existing = await ctx.db.get(args.id);
    if (!existing || existing.userId !== identity.subject) {
      throw new Error("Not found or not authorized");
    }
    // If this entry was created from a listing, decrement the tracking count
    if (existing.listingId) {
      const listing = await ctx.db.get(existing.listingId);
      if (listing) {
        await ctx.db.patch(existing.listingId, {
          trackingCount: Math.max(0, listing.trackingCount - 1),
        });
      }
    }
    await ctx.db.delete(args.id);
    return null;
  },
});

export const createFromListing = mutation({
  args: {
    listingId: v.id("groupBuyListings"),
    productName: v.string(),
    vendor: v.string(),
    orderDate: v.string(),
    estimatedShipDate: v.string(),
    cost: v.number(),
    status: v.union(
      v.literal("ordered"),
      v.literal("in_production"),
      v.literal("shipped"),
      v.literal("delivered")
    ),
    productType: v.union(
      v.literal("keyboard"),
      v.literal("switches"),
      v.literal("keycaps"),
      v.literal("accessories")
    ),
    notes: v.string(),
    trackingUrl: v.optional(v.string()),
    imageUrl: v.optional(v.string()),
  },
  returns: v.id("groupBuys"),
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Not authenticated");

    const { listingId, ...fields } = args;

    // Create the tracker entry with listing reference
    const id = await ctx.db.insert("groupBuys", {
      userId: identity.subject,
      listingId,
      ...fields,
    });

    // Increment the listing's tracking count
    const listing = await ctx.db.get(listingId);
    if (listing) {
      await ctx.db.patch(listingId, {
        trackingCount: listing.trackingCount + 1,
      });
    }

    return id;
  },
});

export const getTrackedListingIds = query({
  args: {},
  returns: v.array(v.string()),
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) return [];
    const entries = await ctx.db
      .query("groupBuys")
      .withIndex("by_userId", (q) => q.eq("userId", identity.subject))
      .collect();
    return entries
      .filter((e) => e.listingId !== undefined)
      .map((e) => e.listingId as string);
  },
});
