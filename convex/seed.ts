import { mutation } from "./_generated/server";
import { v } from "convex/values";

export const seedAll = mutation({
  args: {
    switches: v.array(v.any()),
    components: v.array(v.any()),
    keyboards: v.array(v.any()),
  },
  returns: v.object({
    switchesAdded: v.number(),
    componentsAdded: v.number(),
    keyboardsAdded: v.number(),
  }),
  handler: async (ctx, args) => {
    // Check if data already exists (idempotent)
    const existingSwitches = await ctx.db.query("switches").first();
    const existingComponents = await ctx.db.query("components").first();
    const existingKeyboards = await ctx.db.query("keyboards").first();

    let switchesAdded = 0;
    let componentsAdded = 0;
    let keyboardsAdded = 0;

    if (!existingSwitches) {
      for (const sw of args.switches) {
        await ctx.db.insert("switches", sw);
        switchesAdded++;
      }
    }

    if (!existingComponents) {
      for (const comp of args.components) {
        await ctx.db.insert("components", comp);
        componentsAdded++;
      }
    }

    if (!existingKeyboards) {
      for (const kb of args.keyboards) {
        await ctx.db.insert("keyboards", kb);
        keyboardsAdded++;
      }
    }

    return { switchesAdded, componentsAdded, keyboardsAdded };
  },
});

export const clearAll = mutation({
  args: {},
  returns: v.null(),
  handler: async (ctx) => {
    const tables = [
      "switches",
      "components",
      "keyboards",
      "glossaryTerms",
      "vendorLinks",
    ] as const;
    for (const table of tables) {
      const docs = await ctx.db.query(table).collect();
      for (const doc of docs) {
        await ctx.db.delete(doc._id);
      }
    }
    return null;
  },
});

export const clearTable = mutation({
  args: { table: v.string() },
  returns: v.number(),
  handler: async (ctx, args) => {
    const tableName = args.table as "switches" | "keyboards" | "products" | "vendorLinks";
    const docs = await ctx.db.query(tableName).take(2000);
    for (const doc of docs) {
      await ctx.db.delete(doc._id);
    }
    return docs.length;
  },
});

export const seedSwitchesBatch = mutation({
  args: {
    switches: v.array(v.any()),
    batchIndex: v.number(),
  },
  returns: v.number(),
  handler: async (ctx, args) => {
    let count = 0;
    for (const sw of args.switches) {
      await ctx.db.insert("switches", sw);
      count++;
    }
    return count;
  },
});

export const seedKeyboardsBatch = mutation({
  args: {
    keyboards: v.array(v.any()),
    batchIndex: v.number(),
  },
  returns: v.number(),
  handler: async (ctx, args) => {
    let count = 0;
    for (const kb of args.keyboards) {
      await ctx.db.insert("keyboards", kb);
      count++;
    }
    return count;
  },
});

export const seedProductsBatch = mutation({
  args: {
    products: v.array(v.any()),
    batchIndex: v.number(),
  },
  returns: v.number(),
  handler: async (ctx, args) => {
    let count = 0;
    for (const product of args.products) {
      await ctx.db.insert("products", product);
      count++;
    }
    return count;
  },
});

export const seedVendorLinksBatch = mutation({
  args: {
    links: v.array(v.any()),
    batchIndex: v.number(),
  },
  returns: v.number(),
  handler: async (ctx, args) => {
    let count = 0;
    for (const link of args.links) {
      await ctx.db.insert("vendorLinks", link);
      count++;
    }
    return count;
  },
});
