import { mutation, query } from "./_generated/server";
import { v } from "convex/values";
import { getGuestUserId } from "./guestAuth";

export const listByUser = query({
  args: {},
  returns: v.array(v.any()),
  handler: async (ctx) => {
    const userId = await getGuestUserId(ctx);
    return await ctx.db
      .query("groupBuys")
      .withIndex("by_userId", (q) => q.eq("userId", userId))
      .collect();
  },
});

export const getStats = query({
  args: {},
  returns: v.any(),
  handler: async (ctx) => {
    const userId = await getGuestUserId(ctx);
    const entries = await ctx.db
      .query("groupBuys")
      .withIndex("by_userId", (q) => q.eq("userId", userId))
      .collect();

    const active = entries.filter((e) => e.status !== "delivered");
    const delivered = entries.filter((e) => e.status === "delivered");
    const totalPending = active.reduce((sum, e) => sum + e.cost, 0);
    const totalSpentAllTime = entries.reduce((sum, e) => sum + e.cost, 0);
    const now = new Date();
    const overdue = active.filter((e) => new Date(e.estimatedShipDate) < now);
    const avgWaitDays = active.length > 0
      ? Math.round(active.reduce((sum, e) => {
          const ordered = new Date(e.orderDate).getTime();
          return sum + (now.getTime() - ordered) / (1000 * 60 * 60 * 24);
        }, 0) / active.length)
      : 0;

    // Delivered this month
    const thisMonth = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;
    const deliveredThisMonth = delivered.filter((e) => {
      const history = e.statusHistory as Array<{ from: string; to: string; changedAt: number }> | undefined;
      if (history) {
        const deliveryEvent = history.find((h) => h.to === "delivered");
        if (deliveryEvent) {
          const d = new Date(deliveryEvent.changedAt);
          return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}` === thisMonth;
        }
      }
      return false;
    }).length;

    // Longest active wait
    const longestWait = active.length > 0
      ? Math.round(Math.max(...active.map((e) => {
          const ordered = new Date(e.orderDate).getTime();
          return (now.getTime() - ordered) / (1000 * 60 * 60 * 24);
        })))
      : 0;

    // Spending by product type
    const spendingByType: Record<string, number> = {};
    for (const e of entries) {
      spendingByType[e.productType] = (spendingByType[e.productType] || 0) + e.cost;
    }

    // Spending by vendor
    const spendingByVendor: Record<string, number> = {};
    for (const e of entries) {
      spendingByVendor[e.vendor] = (spendingByVendor[e.vendor] || 0) + e.cost;
    }

    return {
      totalPending,
      activeCount: active.length,
      avgWaitDays,
      overdueCount: overdue.length,
      totalEntries: entries.length,
      deliveredCount: entries.length - active.length,
      totalSpentAllTime,
      deliveredThisMonth,
      longestWait,
      spendingByType,
      spendingByVendor,
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
    const userId = await getGuestUserId(ctx);
    return await ctx.db.insert("groupBuys", {
      userId,
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
    const userId = await getGuestUserId(ctx);
    const { id, ...fields } = args;
    const existing = await ctx.db.get(id);
    if (!existing || existing.userId !== userId) {
      throw new Error("Not found or not authorized");
    }
    const updates: Record<string, unknown> = {};
    for (const [key, value] of Object.entries(fields)) {
      if (value !== undefined) updates[key] = value;
    }
    // Record status change in history
    if (args.status && args.status !== existing.status) {
      const history = (existing.statusHistory as Array<{ from: string; to: string; changedAt: number }>) || [];
      updates.statusHistory = [...history, {
        from: existing.status,
        to: args.status,
        changedAt: Date.now(),
      }];
    }
    await ctx.db.patch(id, updates);
    return null;
  },
});

export const remove = mutation({
  args: { id: v.id("groupBuys") },
  returns: v.null(),
  handler: async (ctx, args) => {
    const userId = await getGuestUserId(ctx);
    const existing = await ctx.db.get(args.id);
    if (!existing || existing.userId !== userId) {
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
    const userId = await getGuestUserId(ctx);

    const { listingId, ...fields } = args;

    // Create the tracker entry with listing reference
    const id = await ctx.db.insert("groupBuys", {
      userId,
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

export const getActivityLog = query({
  args: {},
  returns: v.any(),
  handler: async (ctx) => {
    const userId = await getGuestUserId(ctx);
    const entries = await ctx.db
      .query("groupBuys")
      .withIndex("by_userId", (q) => q.eq("userId", userId))
      .collect();

    const events: Array<{
      type: "created" | "status_change" | "delivered";
      productName: string;
      productType: string;
      timestamp: number;
      from?: string;
      to?: string;
    }> = [];

    for (const entry of entries) {
      // Creation event
      events.push({
        type: "created",
        productName: entry.productName,
        productType: entry.productType,
        timestamp: entry._creationTime,
      });

      // Status change events from history
      const history = entry.statusHistory as Array<{ from: string; to: string; changedAt: number }> | undefined;
      if (history) {
        for (const h of history) {
          events.push({
            type: h.to === "delivered" ? "delivered" : "status_change",
            productName: entry.productName,
            productType: entry.productType,
            timestamp: h.changedAt,
            from: h.from,
            to: h.to,
          });
        }
      }
    }

    // Sort by most recent first, limit to 20
    events.sort((a, b) => b.timestamp - a.timestamp);
    return events.slice(0, 20);
  },
});

export const bulkUpdateStatus = mutation({
  args: {
    ids: v.array(v.id("groupBuys")),
    status: v.union(
      v.literal("ordered"),
      v.literal("in_production"),
      v.literal("shipped"),
      v.literal("delivered")
    ),
  },
  returns: v.null(),
  handler: async (ctx, args) => {
    const userId = await getGuestUserId(ctx);

    for (const id of args.ids) {
      const existing = await ctx.db.get(id);
      if (!existing || existing.userId !== userId) continue;
      if (existing.status === args.status) continue;

      const history = (existing.statusHistory as Array<{ from: string; to: string; changedAt: number }>) || [];
      await ctx.db.patch(id, {
        status: args.status,
        statusHistory: [...history, {
          from: existing.status,
          to: args.status,
          changedAt: Date.now(),
        }],
      });
    }
    return null;
  },
});

export const getTrackedListingIds = query({
  args: {},
  returns: v.array(v.string()),
  handler: async (ctx) => {
    const userId = await getGuestUserId(ctx);
    const entries = await ctx.db
      .query("groupBuys")
      .withIndex("by_userId", (q) => q.eq("userId", userId))
      .collect();
    return entries
      .filter((e) => e.listingId !== undefined)
      .map((e) => e.listingId as string);
  },
});
