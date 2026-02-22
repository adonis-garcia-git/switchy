import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

// getByProduct() - Get all vendor links for a product name
export const getByProduct = query({
  args: { productName: v.string() },
  returns: v.array(v.any()),
  handler: async (ctx, args) => {
    return await ctx.db
      .query("vendorLinks")
      .withIndex("by_productName", (q) => q.eq("productName", args.productName))
      .collect();
  },
});

// getByVendor() - Get all links from a vendor
export const getByVendor = query({
  args: { vendor: v.string() },
  returns: v.array(v.any()),
  handler: async (ctx, args) => {
    return await ctx.db
      .query("vendorLinks")
      .withIndex("by_vendor", (q) => q.eq("vendor", args.vendor))
      .collect();
  },
});

// list() - Get all vendor links
export const list = query({
  args: {},
  returns: v.array(v.any()),
  handler: async (ctx) => {
    return await ctx.db.query("vendorLinks").take(500);
  },
});

// seed() - Bulk insert vendor links
export const seed = mutation({
  args: { links: v.array(v.object({
    productType: v.union(
      v.literal("switch"),
      v.literal("keyboard"),
      v.literal("keycaps"),
      v.literal("stabilizer"),
      v.literal("accessory"),
      v.literal("mouse"),
      v.literal("deskmat"),
      v.literal("cable"),
      v.literal("pcb"),
      v.literal("lubricant"),
      v.literal("artisan"),
      v.literal("wrist-rest")
    ),
    productName: v.string(),
    vendor: v.string(),
    url: v.string(),
    price: v.optional(v.number()),
    lastVerified: v.optional(v.string()),
  })) },
  returns: v.number(),
  handler: async (ctx, args) => {
    const existing = await ctx.db.query("vendorLinks").collect();
    if (existing.length > 0) return 0;
    for (const link of args.links) {
      await ctx.db.insert("vendorLinks", link);
    }
    return args.links.length;
  },
});
