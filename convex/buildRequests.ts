import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

// submit() - Create a build quote request (auth optional)
export const submit = mutation({
  args: {
    contactEmail: v.string(),
    contactName: v.string(),
    buildSpecId: v.optional(v.id("builds")),
    buildSpec: v.optional(v.any()),
    budget: v.string(),
    notes: v.optional(v.string()),
  },
  returns: v.id("buildRequests"),
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    const now = Date.now();
    return await ctx.db.insert("buildRequests", {
      userId: identity?.subject,
      contactEmail: args.contactEmail,
      contactName: args.contactName,
      buildSpecId: args.buildSpecId,
      buildSpec: args.buildSpec,
      budget: args.budget,
      notes: args.notes,
      status: "pending",
      createdAt: now,
      updatedAt: now,
    });
  },
});

// listByUser() - Get current user's build requests
export const listByUser = query({
  args: {},
  returns: v.array(v.any()),
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) return [];
    return await ctx.db
      .query("buildRequests")
      .withIndex("by_userId", (q) => q.eq("userId", identity.subject))
      .collect();
  },
});

// getById() - Get a single build request by ID
export const getById = query({
  args: { id: v.id("buildRequests") },
  returns: v.any(),
  handler: async (ctx, args) => {
    return await ctx.db.get(args.id);
  },
});

// updateStatus() - Admin updates status and optionally adds quote details
export const updateStatus = mutation({
  args: {
    id: v.id("buildRequests"),
    status: v.union(
      v.literal("pending"),
      v.literal("quoted"),
      v.literal("accepted"),
      v.literal("declined"),
      v.literal("completed")
    ),
    quoteAmount: v.optional(v.number()),
    quoteNotes: v.optional(v.string()),
  },
  returns: v.null(),
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Not authenticated");
    const request = await ctx.db.get(args.id);
    if (!request) throw new Error("Build request not found");
    await ctx.db.patch(args.id, {
      status: args.status,
      quoteAmount: args.quoteAmount,
      quoteNotes: args.quoteNotes,
      updatedAt: Date.now(),
    });
    return null;
  },
});
