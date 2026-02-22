import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  switches: defineTable({
    brand: v.string(),
    name: v.string(),
    slug: v.optional(v.string()),
    type: v.union(v.literal("linear"), v.literal("tactile"), v.literal("clicky")),
    actuationForceG: v.number(),
    bottomOutForceG: v.optional(v.number()),
    actuationMm: v.number(),
    totalTravelMm: v.number(),
    stemMaterial: v.optional(v.string()),
    housingMaterial: v.optional(v.string()),
    springType: v.optional(v.string()),
    factoryLubed: v.optional(v.boolean()),
    longPole: v.optional(v.boolean()),
    soundPitch: v.optional(v.union(v.literal("low"), v.literal("mid"), v.literal("high"))),
    soundCharacter: v.optional(v.union(
      v.literal("thocky"),
      v.literal("clacky"),
      v.literal("creamy"),
      v.literal("poppy"),
      v.literal("muted"),
      v.literal("crisp")
    )),
    soundVolume: v.optional(v.union(v.literal("quiet"), v.literal("medium"), v.literal("loud"))),
    pricePerSwitch: v.number(),
    communityRating: v.optional(v.number()),
    popularFor: v.optional(v.array(v.string())),
    notes: v.optional(v.string()),
    commonlyComparedTo: v.optional(v.array(v.string())),
    imageUrl: v.optional(v.string()),
    productUrl: v.optional(v.string()),
    soundSampleUrl: v.optional(v.string()),
    fabricated: v.optional(v.boolean()),
  })
    .index("by_type", ["type"])
    .index("by_brand", ["brand"])
    .index("by_slug", ["slug"])
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
    slug: v.optional(v.string()),
    size: v.string(),
    mountingStyle: v.optional(v.string()),
    plateMaterial: v.optional(v.string()),
    caseMaterial: v.string(),
    hotSwap: v.boolean(),
    wireless: v.boolean(),
    rgb: v.boolean(),
    priceUsd: v.number(),
    inStock: v.optional(v.boolean()),
    notes: v.optional(v.string()),
    connectivityType: v.optional(v.string()),
    batteryCapacity: v.optional(v.string()),
    weight: v.optional(v.string()),
    knob: v.optional(v.boolean()),
    qmkVia: v.optional(v.boolean()),
    hallEffect: v.optional(v.boolean()),
    pollingRate: v.optional(v.string()),
    imageUrl: v.optional(v.string()),
    productUrl: v.optional(v.string()),
    fabricated: v.optional(v.boolean()),
  })
    .index("by_size", ["size"])
    .index("by_brand", ["brand"])
    .index("by_slug", ["slug"])
    .searchIndex("search_name", { searchField: "name" }),

  products: defineTable({
    category: v.string(),
    brand: v.string(),
    name: v.string(),
    slug: v.string(),
    priceUsd: v.optional(v.number()),
    originalPrice: v.optional(v.number()),
    imageUrl: v.optional(v.string()),
    imageUrls: v.optional(v.array(v.string())),
    productUrl: v.optional(v.string()),
    tags: v.optional(v.array(v.string())),
    specs: v.optional(v.any()),
    inStock: v.optional(v.boolean()),
    sourceUrl: v.optional(v.string()),
  })
    .index("by_category", ["category"])
    .index("by_slug", ["slug"])
    .index("by_brand", ["brand"])
    .searchIndex("search_name", { searchField: "name" }),

  builds: defineTable({
    userId: v.string(),
    query: v.string(),
    buildName: v.string(),
    summary: v.string(),
    components: v.object({
      keyboardKit: v.object({
        name: v.string(),
        price: v.number(),
        reason: v.string(),
      }),
      switches: v.object({
        name: v.string(),
        price: v.optional(v.number()),
        reason: v.string(),
        quantity: v.number(),
        priceEach: v.number(),
      }),
      keycaps: v.object({
        name: v.string(),
        price: v.number(),
        reason: v.string(),
      }),
      stabilizers: v.object({
        name: v.string(),
        price: v.number(),
        reason: v.string(),
      }),
    }),
    recommendedMods: v.array(v.object({
      mod: v.string(),
      cost: v.number(),
      effect: v.string(),
      difficulty: v.union(v.literal("easy"), v.literal("medium"), v.literal("hard")),
    })),
    estimatedTotal: v.number(),
    soundProfileExpected: v.string(),
    buildDifficulty: v.string(),
    notes: v.string(),
    isPublic: v.optional(v.boolean()),
    shareSlug: v.optional(v.string()),
    imageUrl: v.optional(v.string()),
    conversationId: v.optional(v.string()),
  })
    .index("by_userId", ["userId"])
    .index("by_shareSlug", ["shareSlug"]),

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
    trackingUrl: v.optional(v.string()),
    trackingNumber: v.optional(v.string()),
    imageUrl: v.optional(v.string()),
    listingId: v.optional(v.id("groupBuyListings")),
  }).index("by_userId", ["userId"]),

  groupBuyListings: defineTable({
    name: v.string(),
    slug: v.string(),
    designer: v.optional(v.string()),
    vendor: v.string(),
    vendorUrl: v.optional(v.string()),
    description: v.optional(v.string()),
    productType: v.union(
      v.literal("keyboard"),
      v.literal("switches"),
      v.literal("keycaps"),
      v.literal("accessories")
    ),
    status: v.union(
      v.literal("upcoming"),
      v.literal("live"),
      v.literal("ended"),
      v.literal("shipped")
    ),
    priceMin: v.number(),
    priceMax: v.optional(v.number()),
    startDate: v.optional(v.string()),
    endDate: v.optional(v.string()),
    estimatedShipDate: v.optional(v.string()),
    imageUrl: v.optional(v.string()),
    tags: v.optional(v.array(v.string())),
    trackingCount: v.number(),
    isFeatured: v.optional(v.boolean()),
  })
    .index("by_status", ["status"])
    .index("by_productType", ["productType"])
    .index("by_endDate", ["endDate"])
    .index("by_slug", ["slug"])
    .searchIndex("search_name", { searchField: "name" }),

  conversations: defineTable({
    userId: v.string(),
    messages: v.array(
      v.object({
        role: v.string(),
        content: v.string(),
        timestamp: v.number(),
      })
    ),
    activeBuildResult: v.optional(v.any()),
    createdAt: v.number(),
  }).index("by_userId", ["userId"]),

  userPreferences: defineTable({
    userId: v.string(),
    experienceLevel: v.union(
      v.literal("beginner"),
      v.literal("intermediate"),
      v.literal("expert")
    ),
    preferredSound: v.optional(v.string()),
    budgetRange: v.optional(
      v.object({ min: v.number(), max: v.number() })
    ),
    preferredSize: v.optional(v.string()),
    hasCompletedOnboarding: v.boolean(),
  }).index("by_userId", ["userId"]),

  keycaps: defineTable({
    brand: v.string(),
    name: v.string(),
    slug: v.optional(v.string()),
    profile: v.string(),
    material: v.string(),
    legendType: v.optional(v.string()),
    numKeys: v.optional(v.number()),
    compatibility: v.optional(v.string()),
    manufacturer: v.optional(v.string()),
    priceUsd: v.number(),
    inStock: v.optional(v.boolean()),
    notes: v.optional(v.string()),
    imageUrl: v.optional(v.string()),
    productUrl: v.optional(v.string()),
    tags: v.optional(v.array(v.string())),
    fabricated: v.optional(v.boolean()),
  })
    .index("by_profile", ["profile"])
    .index("by_material", ["material"])
    .index("by_brand", ["brand"])
    .index("by_slug", ["slug"])
    .searchIndex("search_name", { searchField: "name" }),

  accessories: defineTable({
    brand: v.string(),
    name: v.string(),
    slug: v.optional(v.string()),
    subcategory: v.string(),
    priceUsd: v.number(),
    inStock: v.optional(v.boolean()),
    notes: v.optional(v.string()),
    imageUrl: v.optional(v.string()),
    productUrl: v.optional(v.string()),
    specs: v.optional(v.any()),
    tags: v.optional(v.array(v.string())),
    fabricated: v.optional(v.boolean()),
  })
    .index("by_subcategory", ["subcategory"])
    .index("by_brand", ["brand"])
    .index("by_slug", ["slug"])
    .searchIndex("search_name", { searchField: "name" }),

  glossaryTerms: defineTable({
    term: v.string(),
    definition: v.string(),
    category: v.string(),
    relatedTerms: v.array(v.string()),
    difficulty: v.optional(v.union(v.literal("beginner"), v.literal("intermediate"), v.literal("advanced"))),
    pronunciation: v.optional(v.string()),
    imageUrl: v.optional(v.string()),
    example: v.optional(v.string()),
  })
    .index("by_category", ["category"])
    .searchIndex("search_term", { searchField: "term" }),

  vendorLinks: defineTable({
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
  })
    .index("by_productName", ["productName"])
    .index("by_vendor", ["vendor"])
    .searchIndex("search_productName", { searchField: "productName" }),

  soundSamples: defineTable({
    switchName: v.string(),
    audioUrl: v.string(),
    plateType: v.optional(v.string()),
    recordingNotes: v.optional(v.string()),
  }).index("by_switchName", ["switchName"]),

  // ── Monetization tables ──

  subscriptions: defineTable({
    userId: v.string(),
    stripeCustomerId: v.string(),
    stripeSubscriptionId: v.string(),
    stripePriceId: v.string(),
    status: v.union(
      v.literal("active"),
      v.literal("canceled"),
      v.literal("past_due"),
      v.literal("trialing"),
      v.literal("incomplete"),
      v.literal("unpaid")
    ),
    currentPeriodStart: v.number(),
    currentPeriodEnd: v.number(),
    cancelAtPeriodEnd: v.boolean(),
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index("by_userId", ["userId"])
    .index("by_stripeCustomerId", ["stripeCustomerId"])
    .index("by_stripeSubscriptionId", ["stripeSubscriptionId"]),

  usageRecords: defineTable({
    userId: v.string(),
    actionType: v.union(
      v.literal("generateBuild"),
      v.literal("generateBuildConversational"),
      v.literal("generateBuildFromAnswers")
    ),
    monthKey: v.string(),
    createdAt: v.number(),
  }).index("by_userId_month", ["userId", "monthKey"]),

  affiliateClicks: defineTable({
    vendorLinkId: v.id("vendorLinks"),
    userId: v.optional(v.string()),
    productName: v.string(),
    vendor: v.string(),
    clickedAt: v.number(),
    referrerPage: v.optional(v.string()),
  })
    .index("by_vendorLinkId", ["vendorLinkId"])
    .index("by_clickedAt", ["clickedAt"]),

  affiliateConfig: defineTable({
    vendor: v.string(),
    affiliateTag: v.string(),
    isActive: v.boolean(),
  })
    .index("by_vendor", ["vendor"])
    .index("by_isActive", ["isActive"]),

  sponsorships: defineTable({
    vendorName: v.string(),
    productType: v.optional(v.string()),
    productName: v.string(),
    placement: v.union(
      v.literal("featured_badge"),
      v.literal("promoted_search"),
      v.literal("build_recommendation"),
      v.literal("homepage_spotlight"),
      v.literal("explorer_carousel"),
      v.literal("deal_banner")
    ),
    startDate: v.string(),
    endDate: v.string(),
    isActive: v.boolean(),
    impressions: v.number(),
    clicks: v.number(),
    productUrl: v.optional(v.string()),
    imageUrl: v.optional(v.string()),
    priceUsd: v.optional(v.number()),
  })
    .index("by_isActive", ["isActive"])
    .index("by_placement", ["placement"])
    .index("by_productName", ["productName"]),

  groupBuyPartnerships: defineTable({
    vendorName: v.string(),
    groupBuyName: v.string(),
    commissionPercent: v.number(),
    affiliateUrl: v.string(),
    startDate: v.string(),
    endDate: v.string(),
    isActive: v.boolean(),
    totalClicks: v.number(),
  })
    .index("by_vendorName", ["vendorName"])
    .index("by_isActive", ["isActive"]),

  buildRequests: defineTable({
    userId: v.optional(v.string()),
    contactEmail: v.string(),
    contactName: v.string(),
    buildSpecId: v.optional(v.id("builds")),
    buildSpec: v.optional(v.any()),
    budget: v.string(),
    notes: v.optional(v.string()),
    status: v.union(
      v.literal("pending"),
      v.literal("quoted"),
      v.literal("accepted"),
      v.literal("declined"),
      v.literal("completed")
    ),
    quoteAmount: v.optional(v.number()),
    quoteNotes: v.optional(v.string()),
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index("by_userId", ["userId"])
    .index("by_status", ["status"])
    .index("by_createdAt", ["createdAt"]),
});
