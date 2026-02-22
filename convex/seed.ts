import { mutation } from "./_generated/server";
import { v } from "convex/values";
import { getGuestUserId } from "./guestAuth";

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
    const userId = await getGuestUserId(ctx);

    // Check if data already exists (idempotent)
    const existingSwitches = await ctx.db.query("switches").first();
    const existingComponents = await ctx.db.query("components").first();
    const existingKeyboards = await ctx.db.query("keyboards").first();

    let switchesAdded = 0;
    let componentsAdded = 0;
    let keyboardsAdded = 0;

    if (!existingSwitches) {
      const seenSwitches = new Set<string>();
      for (const sw of args.switches) {
        const dedupKey = `${sw.brand}::${sw.name}`;
        if (seenSwitches.has(dedupKey)) {
          console.warn(`Skipping duplicate switch: ${dedupKey}`);
          continue;
        }
        seenSwitches.add(dedupKey);
        const cleaned: Record<string, unknown> = {};
        for (const [key, value] of Object.entries(sw)) {
          if (value !== null) cleaned[key] = value;
        }
        await ctx.db.insert("switches", cleaned as any);
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
      const seenKeyboards = new Set<string>();
      for (const kb of args.keyboards) {
        const dedupKey = `${kb.brand}::${kb.name}`;
        if (seenKeyboards.has(dedupKey)) {
          console.warn(`Skipping duplicate keyboard: ${dedupKey}`);
          continue;
        }
        seenKeyboards.add(dedupKey);
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
    const userId = await getGuestUserId(ctx);

    const tables = [
      "switches",
      "components",
      "keyboards",
      "glossaryTerms",
      "vendorLinks",
      "keycaps",
      "accessories",
      "sponsorships",
      "groupBuyListings",
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
    const userId = await getGuestUserId(ctx);

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
    const userId = await getGuestUserId(ctx);

    const seen = new Set<string>();
    let count = 0;
    for (const sw of args.switches) {
      const key = `${sw.brand}::${sw.name}`;
      if (seen.has(key)) {
        console.warn(`Skipping duplicate switch: ${key}`);
        continue;
      }
      seen.add(key);
      const cleaned: Record<string, unknown> = {};
      for (const [key, value] of Object.entries(sw)) {
        if (value !== null) cleaned[key] = value;
      }
      await ctx.db.insert("switches", cleaned as any);
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
    const userId = await getGuestUserId(ctx);

    const seen = new Set<string>();
    let count = 0;
    for (const kb of args.keyboards) {
      const key = `${kb.brand}::${kb.name}`;
      if (seen.has(key)) {
        console.warn(`Skipping duplicate keyboard: ${key}`);
        continue;
      }
      seen.add(key);
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
    const userId = await getGuestUserId(ctx);

    let count = 0;
    for (const product of args.products) {
      await ctx.db.insert("products", product);
      count++;
    }
    return count;
  },
});

export const cleanAndReseedSwitches = mutation({
  args: {
    switches: v.array(v.any()),
  },
  returns: v.object({
    deleted: v.number(),
    added: v.number(),
  }),
  handler: async (ctx, args) => {
    const userId = await getGuestUserId(ctx);

    // Delete all existing switches
    const existing = await ctx.db.query("switches").collect();
    let deleted = 0;
    for (const sw of existing) {
      await ctx.db.delete(sw._id);
      deleted++;
    }

    // Re-insert from clean data (strip null values — Convex requires undefined, not null)
    // Deduplicate by brand+name to prevent duplicate entries
    const seen = new Set<string>();
    let added = 0;
    for (const sw of args.switches) {
      const dedupKey = `${sw.brand}::${sw.name}`;
      if (seen.has(dedupKey)) {
        console.warn(`Skipping duplicate switch: ${dedupKey}`);
        continue;
      }
      seen.add(dedupKey);
      const cleaned: Record<string, unknown> = {};
      for (const [key, value] of Object.entries(sw)) {
        if (value !== null) {
          cleaned[key] = value;
        }
      }
      await ctx.db.insert("switches", cleaned as any);
      added++;
    }

    return { deleted, added };
  },
});

export const cleanAndReseedKeyboards = mutation({
  args: {
    keyboards: v.array(v.any()),
  },
  returns: v.object({
    deleted: v.number(),
    added: v.number(),
  }),
  handler: async (ctx, args) => {
    const userId = await getGuestUserId(ctx);

    const existing = await ctx.db.query("keyboards").collect();
    for (const kb of existing) {
      await ctx.db.delete(kb._id);
    }

    const seen = new Set<string>();
    let added = 0;
    for (const kb of args.keyboards) {
      const dedupKey = `${kb.brand}::${kb.name}`;
      if (seen.has(dedupKey)) {
        console.warn(`Skipping duplicate keyboard: ${dedupKey}`);
        continue;
      }
      seen.add(dedupKey);
      await ctx.db.insert("keyboards", kb);
      added++;
    }

    return { deleted: existing.length, added };
  },
});

export const seedVendorLinksBatch = mutation({
  args: {
    links: v.array(v.any()),
    batchIndex: v.number(),
  },
  returns: v.number(),
  handler: async (ctx, args) => {
    const userId = await getGuestUserId(ctx);

    let count = 0;
    for (const link of args.links) {
      await ctx.db.insert("vendorLinks", link);
      count++;
    }
    return count;
  },
});

export const deduplicateKeyboards = mutation({
  args: {},
  returns: v.object({
    total: v.number(),
    duplicatesRemoved: v.number(),
  }),
  handler: async (ctx) => {
    const userId = await getGuestUserId(ctx);

    const all = await ctx.db.query("keyboards").collect();
    const seen = new Set<string>();
    let duplicatesRemoved = 0;

    for (const kb of all) {
      const key = `${kb.brand}::${kb.name}`;
      if (seen.has(key)) {
        await ctx.db.delete(kb._id);
        duplicatesRemoved++;
      } else {
        seen.add(key);
      }
    }

    return { total: all.length, duplicatesRemoved };
  },
});
