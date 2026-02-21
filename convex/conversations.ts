import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

export const listByUser = query({
  args: {},
  returns: v.array(v.any()),
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) return [];
    return await ctx.db
      .query("conversations")
      .withIndex("by_userId", (q) => q.eq("userId", identity.subject))
      .order("desc")
      .collect();
  },
});

export const getById = query({
  args: { id: v.id("conversations") },
  returns: v.any(),
  handler: async (ctx, args) => {
    return await ctx.db.get(args.id);
  },
});

export const create = mutation({
  args: {},
  returns: v.id("conversations"),
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Not authenticated");
    return await ctx.db.insert("conversations", {
      userId: identity.subject,
      messages: [],
      createdAt: Date.now(),
    });
  },
});

export const addMessage = mutation({
  args: {
    conversationId: v.id("conversations"),
    role: v.string(),
    content: v.string(),
  },
  returns: v.null(),
  handler: async (ctx, args) => {
    const conversation = await ctx.db.get(args.conversationId);
    if (!conversation) throw new Error("Conversation not found");
    const messages = [
      ...conversation.messages,
      {
        role: args.role,
        content: args.content,
        timestamp: Date.now(),
      },
    ];
    await ctx.db.patch(args.conversationId, { messages });
    return null;
  },
});

export const setActiveBuild = mutation({
  args: {
    conversationId: v.id("conversations"),
    buildResult: v.any(),
  },
  returns: v.null(),
  handler: async (ctx, args) => {
    await ctx.db.patch(args.conversationId, {
      activeBuildResult: args.buildResult,
    });
    return null;
  },
});

export const remove = mutation({
  args: { id: v.id("conversations") },
  returns: v.null(),
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Not authenticated");
    const conversation = await ctx.db.get(args.id);
    if (!conversation || conversation.userId !== identity.subject) {
      throw new Error("Not found or not authorized");
    }
    await ctx.db.delete(args.id);
    return null;
  },
});
