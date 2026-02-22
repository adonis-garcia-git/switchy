import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

// getByProduct() - Get all vendor links for a product name, enriched with affiliate URLs
export const getByProduct = query({
  args: { productName: v.string() },
  returns: v.array(v.any()),
  handler: async (ctx, args) => {
    const links = await ctx.db
      .query("vendorLinks")
      .withIndex("by_productName", (q) => q.eq("productName", args.productName))
      .collect();

    // Fetch all active affiliate configs
    const affiliateConfigs = await ctx.db
      .query("affiliateConfig")
      .withIndex("by_isActive", (q) => q.eq("isActive", true))
      .collect();

    // Build a lookup map by vendor name
    const configByVendor = new Map(
      affiliateConfigs.map((c) => [c.vendor, c])
    );

    // Enrich each link with affiliate URL if config exists
    return links.map((link) => {
      const config = configByVendor.get(link.vendor);
      if (!config) {
        return { ...link, hasAffiliate: false, affiliateUrl: null };
      }

      const separator = link.url.includes("?") ? "&" : "?";
      const isAmazon = link.url.toLowerCase().includes("amazon");
      const param = isAmazon
        ? `tag=${config.affiliateTag}`
        : `ref=${config.affiliateTag}`;
      const affiliateUrl = `${link.url}${separator}${param}`;

      return { ...link, hasAffiliate: true, affiliateUrl };
    });
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
