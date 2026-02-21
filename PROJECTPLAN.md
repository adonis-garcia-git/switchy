# Switchy — Project Plan

## Current Status

**Last Updated:** 2026-02-20
**Phase:** Core Build Complete
**Done:** All features built (Phases 1-7): Project scaffolding, Convex schema + seed data (85 switches, 34 components, 25 keyboards), Switch Explorer with filters/search/detail/comparison, AI Build Advisor with acoustic rules and tweak refinement, Saved Builds, Group Buy Tracker with CRUD
**Next:** Set up Convex deployment (`npx convex dev --once --configure=new`), set up Clerk, add env vars, seed database via /seed page, then polish + deploy

---

## 1. Project Overview

Switchy is an AI-powered mechanical keyboard build advisor and switch explorer for the custom keyboard community. Users describe their dream typing experience in plain English and get a complete, compatible build recommendation with specific products, prices, and reasoning. The app also includes a searchable switch database with comparison tools, a group buy tracker, and a personal collection manager.

---

## 2. Tech Stack

| Technology | Purpose |
|---|---|
| Next.js 14+ (App Router) | Frontend framework with TypeScript |
| Convex | Real-time database, server functions (queries, mutations, actions) |
| Clerk | Authentication (integrated with Convex via JWT template) |
| Claude Sonnet 4.5 (Anthropic API) | AI model for build recommendations |
| Tailwind CSS | Styling (dark theme default) |
| Vercel | Deployment |

---

## 3. Feature Checklist

### Phase 1: Foundation
- [ ] Scaffold Next.js + Convex + Clerk + Tailwind
- [ ] Create Convex schema (all tables)
- [ ] Create seed data (switches, components, keyboards)
- [ ] Run seed script to populate database

### Phase 2: Switch Explorer
- [ ] Switch Explorer page with grid layout
- [ ] Filter bar (type, force, sound character, pitch, volume, price, brand)
- [ ] Sort controls (price, rating, force, name)
- [ ] Switch cards with type-colored badges
- [ ] Switch detail view page
- [ ] Sound profile visualization component

### Phase 3: Switch Comparison
- [ ] Compare mode (checkbox selection on switch cards)
- [ ] Side-by-side comparison view (2-3 switches)
- [ ] Spec difference highlighting
- [ ] "Use in Build Advisor" button from comparison

### Phase 4: AI Build Advisor
- [ ] Convex action for Anthropic API call
- [ ] System prompt with acoustic interaction rules
- [ ] Build Advisor input UI (conversational text area)
- [ ] Loading states with keyboard-themed messages
- [ ] Build Card result component
- [ ] "Tweak it" refinement flow
- [ ] Error handling for AI response parsing

### Phase 5: Saved Builds
- [ ] Save build recommendation to database
- [ ] Saved builds list page
- [ ] Individual build view page

### Phase 6: Group Buy Tracker
- [ ] Group buy CRUD (add, edit, delete, archive)
- [ ] Status badges (ordered, in production, shipped, delivered)
- [ ] Delivery countdown
- [ ] Total pending cost summary
- [ ] Dashboard view

### Phase 7: My Collection (Stretch)
- [ ] Log completed builds
- [ ] Component inventory tracking
- [ ] "I already own" integration with Build Advisor

### Phase 8: Polish & Deploy
- [ ] Loading states and error handling
- [ ] Responsive/mobile design pass
- [ ] Screenshot-friendly build cards
- [ ] Deploy to Vercel

---

## 4. Database Schema

```typescript
// convex/schema.ts
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
      v.literal("thocky"), v.literal("clacky"), v.literal("creamy"),
      v.literal("poppy"), v.literal("muted"), v.literal("crisp")
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
      v.literal("plate"), v.literal("case"), v.literal("keycapProfile"),
      v.literal("keycapMaterial"), v.literal("mountingStyle"), v.literal("mod")
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
      v.literal("ordered"), v.literal("in_production"),
      v.literal("shipped"), v.literal("delivered")
    ),
    productType: v.union(
      v.literal("keyboard"), v.literal("switches"),
      v.literal("keycaps"), v.literal("accessories")
    ),
    notes: v.string(),
  }).index("by_userId", ["userId"]),

  collection: defineTable({
    userId: v.string(),
    name: v.string(),
    type: v.union(v.literal("build"), v.literal("switches"), v.literal("keycaps"), v.literal("accessory")),
    components: v.optional(v.any()),
    totalCost: v.optional(v.number()),
    notes: v.string(),
  }).index("by_userId", ["userId"]),
});
```

---

## 5. API Endpoints (Convex Functions)

### Queries
| Function | File | Description |
|---|---|---|
| `switches.list` | `convex/switches.ts` | List switches with optional filters (type, brand, sound, price range) |
| `switches.getById` | `convex/switches.ts` | Get single switch by ID |
| `switches.search` | `convex/switches.ts` | Full-text search switches by name |
| `components.list` | `convex/components.ts` | List components, optionally by category |
| `keyboards.list` | `convex/keyboards.ts` | List keyboard kits with optional filters |
| `keyboards.getById` | `convex/keyboards.ts` | Get single keyboard by ID |
| `builds.listByUser` | `convex/builds.ts` | List saved builds for current user |
| `builds.getById` | `convex/builds.ts` | Get single build by ID |
| `groupBuys.listByUser` | `convex/groupBuys.ts` | List group buys for current user |

### Mutations
| Function | File | Description |
|---|---|---|
| `builds.save` | `convex/builds.ts` | Save a build recommendation |
| `builds.remove` | `convex/builds.ts` | Delete a saved build |
| `groupBuys.create` | `convex/groupBuys.ts` | Add a group buy entry |
| `groupBuys.update` | `convex/groupBuys.ts` | Update group buy status/details |
| `groupBuys.remove` | `convex/groupBuys.ts` | Delete a group buy entry |
| `seed.seedAll` | `convex/seed.ts` | Idempotent seed of all tables |

### Actions
| Function | File | Description |
|---|---|---|
| `builds.generateBuild` | `convex/builds.ts` | Call Anthropic API with user query + database context, return structured build recommendation |

---

## 6. AI Integration Details

### System Prompt Template

The AI action sends to Claude Sonnet 4.5:
- **System prompt:** Acoustic interaction rules, response format spec, switch/component/keyboard data as context
- **User message:** The natural language build query
- **For refinements:** Previous recommendation included as assistant context

### Acoustic Interaction Rules (embedded in system prompt)

```
Sound Profile = switch_type + plate_material + case_material + mounting_style + foam_mods + keycap_material + keycap_profile + lubing

THOCKY builds: linear switches + PC or FR4 plate + PBT keycaps + gasket/soft mount + foam
CLACKY builds: tactile or clicky switches + aluminum plate + ABS keycaps + top mount + minimal foam
CREAMY builds: well-lubed linears + gasket mount + heavy foam + PBT Cherry keycaps
POPPY builds: long-pole linears + PC plate + thin keycaps
MUTED/SILENT builds: silent switches + gasket mount + lots of foam + thick PBT

Plate: Aluminum=brighter/stiffer, PC=deeper/softer, FR4=balanced/muted, Brass=sharp/pingy
Case: Aluminum=resonant(needs foam), PC=warmer, Plastic=hollow(needs foam)
Mounting: Gasket=dampened/flexible, Top mount=stiffer/louder, Tray mount=hollow/pingy
Keycaps: PBT=deeper, ABS=brighter, Thick>thin for deeper, Cherry profile=low/stable, SA=tall/resonant
Mods: PE foam=poppier, Tape mod=deeper, Case foam=removes hollowness, Switch films=tighter/less rattle
```

### Expected Response Shape

```json
{
  "buildName": "string",
  "summary": "string",
  "components": {
    "keyboardKit": { "name": "string", "price": 0, "reason": "string" },
    "switches": { "name": "string", "quantity": 0, "priceEach": 0, "reason": "string" },
    "keycaps": { "name": "string", "price": 0, "reason": "string" },
    "stabilizers": { "name": "string", "price": 0, "reason": "string" }
  },
  "recommendedMods": [
    { "mod": "string", "cost": 0, "effect": "string", "difficulty": "string" }
  ],
  "estimatedTotal": 0,
  "soundProfileExpected": "string",
  "buildDifficulty": "string",
  "notes": "string"
}
```

---

## 7. UI Screen List

| Route | Screen | Key Components |
|---|---|---|
| `/` | Dashboard/Home | Hero input, quick stats, recent builds, nav links |
| `/advisor` | Build Advisor | Text input, loading state, BuildCard result, tweak buttons |
| `/switches` | Switch Explorer | FilterBar, SwitchCard grid, sort controls |
| `/switches/[id]` | Switch Detail | Full specs, sound profile viz, pairings, comparison link |
| `/switches/compare` | Switch Comparison | SwitchComparison (2-3 columns), spec highlighting |
| `/builds` | Saved Builds | Build list with BuildCard previews |
| `/builds/[id]` | Build Detail | Full BuildCard with all components and reasoning |
| `/group-buys` | Group Buy Tracker | GroupBuyEntry cards, status badges, add form |
| `/collection` | My Collection (stretch) | Build gallery, inventory list |

---

## 8. Data Model Relationships

- **builds.userId** → Clerk user ID (string, not a foreign key)
- **groupBuys.userId** → Clerk user ID
- **collection.userId** → Clerk user ID
- **switches**, **components**, **keyboards** → Reference data (no user ownership)
- **builds.components** → Contains names referencing switches/keyboards/components (denormalized for AI output flexibility)

---

## 9. Environment Variables

```env
# Clerk
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=
CLERK_SECRET_KEY=

# Convex
NEXT_PUBLIC_CONVEX_URL=

# Convex server-side (set in Convex dashboard)
CLERK_JWT_ISSUER_DOMAIN=
ANTHROPIC_API_KEY=
```

---

## 10. Build Order

1. Scaffold Next.js + Convex + Clerk + Tailwind
2. Set up Convex schema and seed switch/component/keyboard data
3. Build Switch Explorer UI (browse, filter, search, detail view)
4. Build Switch Comparison view
5. Build the AI Build Advisor integration (Convex action with system prompt)
6. Build the Build Advisor UI (input → loading → build card result)
7. Build saved builds feature (save and view past recommendations)
8. Build Group Buy Tracker (CRUD)
9. Build My Collection (stretch)
10. Polish UI, add loading states, error handling
11. Deploy to Vercel

---

## 11. Design Tokens

```
Colors:
  --bg-primary: #0f0f0f
  --bg-surface: #1a1a1a
  --bg-elevated: #242424
  --border: #2a2a2a
  --accent-primary: #00D4AA (electric teal)
  --accent-secondary: #F59E0B (warm amber)
  --text-primary: #f5f5f5
  --text-secondary: #a0a0a0
  --linear: #E74C3C (red)
  --tactile: #E67E22 (orange/brown)
  --clicky: #3498DB (blue)

Typography:
  Headings: Inter or Space Grotesk (geometric/techy)
  Body: Inter
  Monospace: JetBrains Mono (specs, prices)
```
