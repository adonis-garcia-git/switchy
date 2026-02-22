import { query } from "./_generated/server";
import { v } from "convex/values";

export const list = query({
  args: {
    type: v.optional(
      v.union(v.literal("linear"), v.literal("tactile"), v.literal("clicky"))
    ),
    brand: v.optional(v.string()),
    soundCharacter: v.optional(v.string()),
    soundPitch: v.optional(v.string()),
    soundVolume: v.optional(v.string()),
    minForce: v.optional(v.number()),
    maxForce: v.optional(v.number()),
    minPrice: v.optional(v.number()),
    maxPrice: v.optional(v.number()),
    sortBy: v.optional(v.string()),
    sortOrder: v.optional(v.union(v.literal("asc"), v.literal("desc"))),
  },
  returns: v.array(v.any()),
  handler: async (ctx, args) => {
    let switches;

    if (args.type) {
      switches = await ctx.db
        .query("switches")
        .withIndex("by_type", (q) => q.eq("type", args.type!))
        .take(200);
    } else if (args.brand) {
      switches = await ctx.db
        .query("switches")
        .withIndex("by_brand", (q) => q.eq("brand", args.brand!))
        .take(200);
    } else {
      switches = await ctx.db.query("switches").take(200);
    }

    // Apply client-side filters
    if (args.type && !args.brand) {
      // already filtered by index
    }
    if (args.brand && args.type) {
      switches = switches.filter((s) => s.type === args.type);
    }
    if (args.soundCharacter) {
      switches = switches.filter((s) => s.soundCharacter === args.soundCharacter);
    }
    if (args.soundPitch) {
      switches = switches.filter((s) => s.soundPitch === args.soundPitch);
    }
    if (args.soundVolume) {
      switches = switches.filter((s) => s.soundVolume === args.soundVolume);
    }
    if (args.minForce !== undefined) {
      switches = switches.filter((s) => s.actuationForceG >= args.minForce!);
    }
    if (args.maxForce !== undefined) {
      switches = switches.filter((s) => s.actuationForceG <= args.maxForce!);
    }
    if (args.minPrice !== undefined) {