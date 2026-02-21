import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  switches: defineTable({
    brand: v.string(),
    name: v.string(),
    type: v.union(v.literal("linear"), v.literal("tactile"), v.literal("clicky")),
    actuationForceG: v.number(),
    bottomOutForceG: v.number(),
    actuationMm: v.number(),
    totalTravelMm: v.number(),
    stemMaterial: v.string(),
    housingMaterial: v.string(),
    springType: v.string(),
    factoryLubed: v.boolean(),
    longPole: v.boolean(),
    soundPitch: v.union(v.literal("low"), v.literal("mid"), v.literal("high")),
    soundCharacter: v.union(
      v.literal("thocky"),
      v.literal("clacky"),
      v.literal("creamy"),
      v.literal("poppy"),
      v.literal("muted"),
      v.literal("crisp")
    ),
    soundVolume: v.union(v.literal("quiet"), v.literal("medium"), v.literal("loud")),
    pricePerSwitch: v.number(),
    communityRating: v.number(),
    popularFor: v.array(v.string()),
    notes: v.string(),
    commonlyComparedTo: v.array(v.string()),
  })
    .index("by_type", ["type"])
    .index("by_brand", ["brand"])
    .index("by_soundCharacter", ["soundCharacter"])
    .index("by_soundPitch", ["soundPitch"])
    .searchIndex("search_name", { searchField: "name" }),

  components: defineTable({
    category: v.union(
      v.literal("plate"),
      v.literal("case"),
      v.literal("keycapProfile"),
      v.literal("keycapMaterial"),
      v.literal("mountingStyle"),
      v.literal("mod")
    ),
    name: v.string(),
    soundEffect: v.string(),
    priceRange: v.union(v.literal("budget"), v.literal("mid"), v.literal("premium")),
    notes: v.string(),
    compatibilityNotes: v.string(),
  }).index("by_category", ["category"]),

  keyboards: defineTable({
    brand: v.string(),
    name: v.string(),
    size: v.string(),
    mountingStyle: v.string(),
    plateMaterial: v.string(),
    caseMaterial: v.string(),
    hotSwap: v.boolean(),
    wireless: v.boolean(),
    rgb: v.boolean(),
    priceUsd: v.number(),
    inStock: v.boolean(),
    notes: v.string(),
  })
    .index("by_size", ["size"])
    .index("by_brand", ["brand"])
    .searchIndex("search_name", { searchField: "name" }),

  builds: defineTable({
    userId: v.string(),
    query: v.string(),
    buildName: v.string(),
    summary: v.string(),
    components: v.any(),
    recommendedMods: v.any(),
    estimatedTotal: v.number(),
    soundProfileExpected: v.string(),
    buildDifficulty: v.string(),
    notes: v.string(),
  }).index("by_userId", ["userId"]),

  groupBuys: defineTable({
    userId: v.string(),
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
  }).index("by_userId", ["userId"]),

  collection: defineTable({
    userId: v.string(),
    name: v.string(),
    type: v.union(
      v.literal("build"),
      v.literal("switches"),
      v.literal("keycaps"),
      v.literal("accessory")
    ),
    components: v.optional(v.any()),
    totalCost: v.optional(v.number()),
    notes: v.string(),
  }).index("by_userId", ["userId"]),
});
