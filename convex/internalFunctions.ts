import { internalQuery, internalMutation } from "./_generated/server";
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

export const getConversationById = internalQuery({
  args: { id: v.id("conversations") },
  returns: v.any(),
  handler: async (ctx, args) => {
    return await ctx.db.get(args.id);
  },
});

export const getUserPreferences = internalQuery({
  args: { userId: v.string() },
  returns: v.any(),
  handler: async (ctx, args) => {
    return await ctx.db
      .query("userPreferences")
      .withIndex("by_userId", (q) => q.eq("userId", args.userId))
      .first();
  },
});

export const getBuildById = internalQuery({
  args: { id: v.id("builds") },
  returns: v.any(),
  handler: async (ctx, args) => {
    return await ctx.db.get(args.id);
  },
});

// ── Monetization internal functions ──

export const getSubscriptionByUserId = internalQuery({
  args: { userId: v.string() },
  returns: v.any(),
  handler: async (ctx, args) => {
    return await ctx.db
      .query("subscriptions")
      .withIndex("by_userId", (q) => q.eq("userId", args.userId))
      .first();
  },
});

export const upsertSubscription = internalMutation({
  args: {
    userId: v.string(),
    stripeCustomerId: v.string(),
    stripeSubscriptionId: v.string(),
    stripePriceId: v.string(),
    status: v.string(),
    currentPeriodStart: v.number(),
    currentPeriodEnd: v.number(),
    cancelAtPeriodEnd: v.boolean(),
  },
  returns: v.null(),
  handler: async (ctx, args) => {
    const existing = await ctx.db
      .query("subscriptions")
      .withIndex("by_stripeSubscriptionId", (q) =>
        q.eq("stripeSubscriptionId", args.stripeSubscriptionId)
      )
      .first();

    const now = Date.now();
    const data = {
      userId: args.userId,
      stripeCustomerId: args.stripeCustomerId,
      stripeSubscriptionId: args.stripeSubscriptionId,
      stripePriceId: args.stripePriceId,
      status: args.status as "active" | "canceled" | "past_due" | "trialing" | "incomplete" | "unpaid",
      currentPeriodStart: args.currentPeriodStart,
      currentPeriodEnd: args.currentPeriodEnd,
      cancelAtPeriodEnd: args.cancelAtPeriodEnd,
      updatedAt: now,
    };

    if (existing) {
      await ctx.db.patch(existing._id, data);
    } else {
      await ctx.db.insert("subscriptions", { ...data, createdAt: now });
    }
    return null;
  },
});

export const getUsageCountForMonth = internalQuery({
  args: { userId: v.string(), monthKey: v.string() },
  returns: v.number(),
  handler: async (ctx, args) => {
    const records = await ctx.db
      .query("usageRecords")
      .withIndex("by_userId_month", (q) =>
        q.eq("userId", args.userId).eq("monthKey", args.monthKey)
      )
      .collect();
    return records.length;
  },
});

export const insertUsageRecord = internalMutation({
  args: {
    userId: v.string(),
    actionType: v.union(
      v.literal("generateBuild"),
      v.literal("generateBuildConversational"),
      v.literal("generateBuildFromAnswers")
    ),
    monthKey: v.string(),
  },
  returns: v.null(),
  handler: async (ctx, args) => {
    await ctx.db.insert("usageRecords", {
      userId: args.userId,
      actionType: args.actionType,
      monthKey: args.monthKey,
      createdAt: Date.now(),
    });
    return null;
  },
});

export const getSubscriptionByStripeSubscriptionId = internalQuery({
  args: { stripeSubscriptionId: v.string() },
  returns: v.any(),
  handler: async (ctx, args) => {
    return await ctx.db
      .query("subscriptions")
      .withIndex("by_stripeSubscriptionId", (q) =>
        q.eq("stripeSubscriptionId", args.stripeSubscriptionId)
      )
      .first();
  },
});

export const getAllKeycaps = internalQuery({
  args: {},
  returns: v.array(v.any()),
  handler: async (ctx) => {
    return await ctx.db.query("keycaps").collect();
  },
});

export const getAllGlossaryTerms = internalQuery({
  args: {},
  returns: v.array(v.any()),
  handler: async (ctx) => {
    return await ctx.db.query("glossaryTerms").collect();
  },
});

export const getActiveBuildSponsorships = internalQuery({
  args: {},
  returns: v.array(v.any()),
  handler: async (ctx) => {
    const now = new Date().toISOString().split("T")[0];
    const sponsorships = await ctx.db
      .query("sponsorships")
      .withIndex("by_placement", (q) => q.eq("placement", "build_recommendation"))
      .collect();
    return sponsorships.filter(
      (s) => s.isActive && s.startDate <= now && s.endDate >= now
    );
  },
});

// ── Nia cache functions ──

export const getNiaCacheByHash = internalQuery({
  args: { queryHash: v.string() },
  returns: v.any(),
  handler: async (ctx, args) => {
    return await ctx.db
      .query("niaCache")
      .withIndex("by_queryHash", (q) => q.eq("queryHash", args.queryHash))
      .first();
  },
});

export const insertNiaCache = internalMutation({
  args: {
    queryHash: v.string(),
    result: v.any(),
    source: v.string(),
    createdAt: v.number(),
    expiresAt: v.number(),
  },
  returns: v.null(),
  handler: async (ctx, args) => {
    // Upsert: delete old entry if exists
    const existing = await ctx.db
      .query("niaCache")
      .withIndex("by_queryHash", (q) => q.eq("queryHash", args.queryHash))
      .first();
    if (existing) {
      await ctx.db.delete(existing._id);
    }
    await ctx.db.insert("niaCache", args);
    return null;
  },
});

// ── Weekly digest functions ──

export const getLatestWeeklyDigest = internalQuery({
  args: {},
  returns: v.any(),
  handler: async (ctx) => {
    const digests = await ctx.db
      .query("weeklyDigest")
      .order("desc")
      .take(1);
    return digests[0] ?? null;
  },
});

export const getWeeklyDigestByKey = internalQuery({
  args: { weekKey: v.string() },
  returns: v.any(),
  handler: async (ctx, args) => {
    return await ctx.db
      .query("weeklyDigest")
      .withIndex("by_weekKey", (q) => q.eq("weekKey", args.weekKey))
      .first();
  },
});

export const insertWeeklyDigest = internalMutation({
  args: {
    weekKey: v.string(),
    trending: v.any(),
    newProducts: v.any(),
    priceChanges: v.any(),
    groupBuyUpdates: v.any(),
    generatedAt: v.number(),
  },
  returns: v.null(),
  handler: async (ctx, args) => {
    await ctx.db.insert("weeklyDigest", args);
    return null;
  },
});

// ── Product suggestion functions ──

export const insertProductSuggestion = internalMutation({
  args: {
    source: v.string(),
    category: v.string(),
    name: v.string(),
    brand: v.string(),
    data: v.any(),
    status: v.union(
      v.literal("pending"),
      v.literal("approved"),
      v.literal("rejected")
    ),
    createdAt: v.number(),
  },
  returns: v.null(),
  handler: async (ctx, args) => {
    await ctx.db.insert("productSuggestions", args);
    return null;
  },
});

export const getProductSuggestionsByStatus = internalQuery({
  args: { status: v.string() },
  returns: v.array(v.any()),
  handler: async (ctx, args) => {
    return await ctx.db
      .query("productSuggestions")
      .withIndex("by_status", (q) =>
        q.eq(
          "status",
          args.status as "pending" | "approved" | "rejected"
        )
      )
      .collect();
  },
});

export const setBuildImageUrl = internalMutation({
  args: { id: v.id("builds"), imageUrl: v.string() },
  returns: v.null(),
  handler: async (ctx, args) => {
    await ctx.db.patch(args.id, { imageUrl: args.imageUrl });
    return null;
  },
});
