import { mutation, query } from "./_generated/server";
import { v } from "convex/values";
import { getGuestUserId } from "./guestAuth";

export const listByUser = query({
  args: {},
  returns: v.array(v.any()),
  handler: async (ctx) => {
    const userId = await getGuestUserId(ctx);
    return await ctx.db
      .query("conversations")
      .withIndex("by_userId", (q) => q.eq("userId", userId))
      .order("desc")
      .collect();
  },
});

export const getById = query({
  args: { id: v.id("conversations") },
  returns: v.any(),
  handler: async (ctx, args) => {
    const userId = await getGuestUserId(ctx);
    const conversation = await ctx.db.get(args.id);
    if (!conversation || conversation.userId !== userId) return null;
    return conversation;
  },
});

export const create = mutation({
  args: {},
  returns: v.id("conversations"),
  handler: async (ctx) => {
    const userId = await getGuestUserId(ctx);
    return await ctx.db.insert("conversations", {
      userId,
      messages: [],
      createdAt: Date.now(),
    });
  },
});

// Note: Convex serializes mutations that read/write the same document,
// so concurrent addMessage calls on the same conversation are safe.
export const addMessage = mutation({
  args: {
    conversationId: v.id("conversations"),
    role: v.string(),
    content: v.string(),
  },
  returns: v.null(),
  handler: async (ctx, args) => {
    const userId = await getGuestUserId(ctx);
    const conversation = await ctx.db.get(args.conversationId);
    if (!conversation) throw new Error("Conversation not found");
    if (conversation.userId !== userId) throw new Error("Not authorized");
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
    const userId = await getGuestUserId(ctx);
    const conversation = await ctx.db.get(args.conversationId);
    if (!conversation) throw new Error("Conversation not found");
    if (conversation.userId !== userId) throw new Error("Not authorized");
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
    const userId = await getGuestUserId(ctx);
    const conversation = await ctx.db.get(args.id);
    if (!conversation || conversation.userId !== userId) {
      throw new Error("Not found or not authorized");
    }
    await ctx.db.delete(args.id);
    return null;
  },
});
