# Claude Code Opus 4.6 — Initial Build Prompt for `Switchy`

---

## START OF PROMPT

You are building **Switchy** — an AI-powered mechanical keyboard build advisor and switch explorer for the custom keyboard community. This is a hackathon project being built by a 2-person team. Your job is to build the full working application.

---

## Why This Exists

The custom mechanical keyboard community (1M+ members on r/MechanicalKeyboards, 250K+ on r/mechmarket) spends $500–$2,000+ per year on custom builds, switches, keycaps, and accessories. Building a custom keyboard involves choosing from hundreds of switches, multiple plate materials, various case types, different mounting styles, keycap profiles, and optional mods — all of which interact to determine how the keyboard sounds and feels.

**There is currently zero AI-native tooling for this community.** Enthusiasts rely on:
- Scattered YouTube sound test videos (can't search by desired sound)
- Reddit threads asking "what switch should I get?" (slow, inconsistent answers)
- Discord servers for group buy tracking (fragmented across dozens of servers)
- Airtable/Google Sheets for tracking personal collections and pending group buys
- Blog posts like Theremingoat's (incredible depth but not interactive or searchable)
- KeebFinder.com (group buy aggregator, but no AI, no recommendations)

The core pain point: a new or intermediate enthusiast wants to build a keyboard that sounds and feels a specific way, but the knowledge needed to pick compatible components is scattered across dozens of sources and takes weeks to learn.

**Switchy lets you describe your dream typing experience in plain English and instantly get a complete, compatible build recommendation with specific products and prices.**

---

## Tech Stack

- **Framework:** Next.js 14+ (App Router) with TypeScript
- **Backend/Database:** Convex (convex.dev) — real-time database, server functions (actions + mutations + queries), file storage
- **Auth:** Clerk (clerk.com) — integrate with Convex using the official Convex + Clerk integration
- **AI Model:** Use Claude Sonnet 4.5 via Anthropic API (or OpenRouter). This is a text-only task — no vision needed. The AI receives the user's natural language query + the full switch/component database + acoustic interaction rules as context, and returns structured build recommendations.
- **Styling:** Tailwind CSS (dark theme default)
- **Deployment:** Vercel

---

## Features (in build priority order)

### Feature 1: Switch & Component Database (build first — foundation)

Seed Convex tables with curated mechanical keyboard component data.

**Switches Table (~80-100 entries):**
```typescript
{
  brand: string,            // "Gateron", "Cherry", "Kailh", "Durock", "JWK", "SP-Star", etc.
  name: string,             // "Oil King", "MX Red", "Box Jade"
  type: "linear" | "tactile" | "clicky",
  actuationForceG: number,  // in grams (e.g., 45, 55, 67)
  bottomOutForceG: number,  // in grams
  actuationMm: number,      // in mm (e.g., 2.0)
  totalTravelMm: number,    // in mm (e.g., 4.0)
  stemMaterial: string,     // "POM", "Nylon", "UHMWPE", "Polycarbonate"
  housingMaterial: string,  // "Nylon", "Polycarbonate", "Ink (Nylon blend)", "UHMWPE"
  springType: string,       // "standard", "long", "progressive", "slow"
  factoryLubed: boolean,
  longPole: boolean,        // affects bottom-out sound (sharper, poppier)
  soundPitch: "low" | "mid" | "high",
  soundCharacter: "thocky" | "clacky" | "creamy" | "poppy" | "muted" | "crisp",
  soundVolume: "quiet" | "medium" | "loud",
  pricePerSwitch: number,   // USD (e.g., 0.35, 0.55, 1.10)
  communityRating: number,  // 1-5 scale
  popularFor: string[],     // ["budget thock", "office use", "gaming", "typing", "first custom"]
  notes: string,            // community wisdom, modding tips
  commonlyComparedTo: string[] // names of similar switches
}
```

**Components Table (~30-40 entries across categories):**
```typescript
{
  category: "plate" | "case" | "keycapProfile" | "keycapMaterial" | "mountingStyle" | "mod",
  name: string,           // "Aluminum", "Polycarbonate", "FR4", "Cherry Profile", "Gasket Mount", etc.
  soundEffect: string,    // "brighter, pingy" / "deeper, muted" / "balanced, neutral"
  priceRange: string,     // "budget" | "mid" | "premium"
  notes: string,          // how it affects the build
  compatibilityNotes: string // e.g., "Cherry profile keycaps may interfere with north-facing LEDs"
}
```

**Keyboard Kits Table (~20-30 popular kits):**
```typescript
{
  brand: string,          // "Keychron", "KBDfans", "Mode", "Zoom65", etc.
  name: string,           // "Q1 Pro", "KBD67 Lite", "Mode Sonnet"
  size: string,           // "60%", "65%", "75%", "TKL", "Full"
  mountingStyle: string,  // "gasket", "top", "tray", "sandwich"
  plateMaterial: string,  // what plate(s) it comes with or supports
  caseMaterial: string,   // "Aluminum", "Polycarbonate", "Plastic"
  hotSwap: boolean,
  wireless: boolean,
  rgb: boolean,
  priceUsd: number,
  inStock: boolean,       // generally available vs group-buy-only
  notes: string
}
```

**For the hackathon, generate realistic component data** covering the most popular and recommended switches, keyboard kits, and components. Include well-known options across budget, mid-range, and premium tiers. The data should reflect real community preferences and actual pricing as of early 2026.

Include switches like: Cherry MX Red/Brown/Blue, Gateron Yellow/Oil King/Milky Yellow Pro, Kailh Box Jade/Navy, Durock POM/T1, JWK Black V2, SP-Star Meteor White, Boba U4T, Zealios V2, Akko CS series, HMX switches, etc.

### Feature 2: AI Build Advisor (the "magic moment" — core feature)

This is the hero feature. The flow:

1. User types a natural language description of their desired keyboard experience
2. The app sends this query + the full switch database + component database + acoustic interaction rules to the AI model
3. The AI returns a structured build recommendation
4. The UI renders a beautiful "build card" with all components, prices, reasoning, and optional mods

**Example user queries the AI must handle:**
- "I want a deep thocky 65% board for office use, under $300"
- "Best budget first custom keyboard for a college student who games"
- "I want something that sounds like rain on a wooden desk, very quiet, for late night use"
- "Clacky and loud 75% for maximum typing satisfaction, don't care about coworkers"
- "I have a Keychron Q1 and want to make it sound more creamy and less pingy"
- "What's a good tactile switch that isn't mushy? I type a lot of code"

**The AI system prompt must encode the acoustic interaction rules:**

```
Sound Profile = switch_type + plate_material + case_material + mounting_style + foam_mods + keycap_material + keycap_profile + lubing

Key rules:
THOCKY builds: linear switches + PC or FR4 plate + PBT keycaps + gasket/soft mount + foam
CLACKY builds: tactile or clicky switches + aluminum plate + ABS keycaps + top mount + minimal foam
CREAMY builds: well-lubed linears + gasket mount + heavy foam + PBT Cherry keycaps
POPPY builds: long-pole linears + PC plate + thin keycaps
MUTED/SILENT builds: silent switches + gasket mount + lots of foam + thick PBT

Plate effects: Aluminum = brighter, stiffer. PC = deeper, softer. FR4 = balanced, slightly muted. Brass = sharp, pingy (needs dampening).
Case effects: Aluminum = resonant (needs foam). PC = warmer. Plastic = hollow (needs foam).
Mounting: Gasket = dampened, flexible. Top mount = stiffer, louder. Tray mount = most hollow/pingy.
Keycaps: PBT = deeper. ABS = brighter. Thick > thin for deeper sound. Cherry profile = low and stable. SA = tall and resonant.
Mods: PE foam = poppier. Tape mod = deeper. Case foam = removes hollowness. Switch films = tighter housing, less rattle.
```

**Expected AI response structure:**
```json
{
  "buildName": "The Office Thock",
  "summary": "A quiet, deep-sounding 65% wireless board perfect for office use",
  "components": {
    "keyboardKit": { "name": "...", "price": 189, "reason": "..." },
    "switches": { "name": "...", "quantity": 70, "priceEach": 0.55, "reason": "..." },
    "keycaps": { "name": "...", "price": 45, "reason": "..." },
    "stabilizers": { "name": "...", "price": 18, "reason": "..." }
  },
  "recommendedMods": [
    { "mod": "PE foam sheet", "cost": 5, "effect": "Deepens sound, adds pop", "difficulty": "easy" }
  ],
  "estimatedTotal": 302,
  "soundProfileExpected": "Deep, muted thock with minimal ping",
  "buildDifficulty": "beginner-friendly",
  "notes": "The gasket mount naturally dampens resonance..."
}
```

### Feature 3: Switch Explorer & Comparator

A searchable, filterable database of all switches:
- **Filter by:** type (linear/tactile/clicky), actuation force range, sound character, sound pitch, volume level, price range, brand
- **Sort by:** price, community rating, actuation force, name
- **Switch cards** showing: name, brand, type badge (color-coded), force, sound profile tags, price, community rating
- **Compare mode:** Select 2-3 switches → side-by-side comparison view highlighting differences
- **Detail view:** Full specs, community notes, what it pairs well with, commonly compared switches

### Feature 4: Group Buy Tracker

Users can manually track their pending group buy orders:
- Add entry: product name, vendor, order date, estimated ship date, cost, status (ordered/in production/shipped/delivered), product type (keyboard/switches/keycaps/accessories), notes
- Dashboard view: list of active group buys with status badges and countdown to estimated delivery
- Total spent on pending orders
- Mark as delivered / archive completed orders

### Feature 5: My Collection (stretch goal)

Users can catalog their completed builds and component inventory:
- Log a build: name, photo, components used (switches, keycaps, case, plate, mods), total cost, notes
- Track loose switches and keycap sets not in a build
- "I already own X" — the build advisor can factor in components you already have

---

## UI/UX Design Requirements

### Overall Aesthetic
- **Dark theme** — the keyboard community lives in dark mode
- Technical but approachable — data-dense but well-organized
- The design should evoke the keyboard community aesthetic: clean lines, mechanical precision, subtle RGB-inspired accent colors
- Switch type color coding: Linear = Red tones, Tactile = Brown/Orange tones, Clicky = Blue tones (matching the classic Cherry MX color convention that the community universally recognizes)

### Color Palette
- Dark background: deep charcoal/near-black
- Primary accent: electric teal/cyan (#00D4AA range) — evokes RGB/tech aesthetic without being garish
- Secondary: warm amber for warnings/highlights
- Switch type colors: Red (#E74C3C) for linear, Orange/Brown (#E67E22) for tactile, Blue (#3498DB) for clicky
- Cards and surfaces: slightly elevated dark gray with subtle borders

### Typography
- Display font with personality for headings (something techy/geometric but not generic)
- Clean, highly readable body font for specs and descriptions
- Monospace for technical specs (force values, measurements, prices)

### Key Screens

1. **Dashboard/Home**
   - Hero section: Build Advisor input (large text field with placeholder: "Describe your dream keyboard...")
   - Below: Quick stats (X switches in database, your Y builds, Z pending group buys)
   - Recent build recommendations
   - Quick links to Switch Explorer and Group Buy Tracker

2. **Build Advisor**
   - Large text input area (feels conversational, like a chat)
   - Placeholder examples that rotate: "I want a thocky 65%...", "Best budget tactile board...", "Make my Keychron Q1 sound better..."
   - Submit button: "Build My Board"
   - Loading state with keyboard-themed messages ("Selecting switches...", "Testing sound profiles...", "Assembling your build...")
   - Result: A "Build Card" — a beautiful, structured recommendation showing each component with its image placeholder, name, price, and the AI's reasoning
   - Total cost prominently displayed
   - "Save Build" and "Try Another" buttons
   - "Tweak it" option: "Make it cheaper" / "Make it thockier" / "Make it wireless" — refines the recommendation

3. **Switch Explorer**
   - Filter bar at top: type toggles (linear/tactile/clicky), force slider, sound character multi-select, price range slider
   - Grid of switch cards below
   - Each card: switch name, brand, type badge (color-coded), actuation force, sound tags (thocky/clacky/etc as pills), price per switch, community rating stars
   - "Compare" checkbox on each card — selecting 2-3 opens comparison view
   - Tap card for detail view with full specs, notes, and pairings

4. **Switch Comparison**
   - 2-3 columns side by side
   - Each spec row: highlight the "winner" or just show differences clearly
   - Sound profile comparison: visual representation (pitch spectrum bar, volume indicator, character tags)
   - Price comparison
   - "Use in Build Advisor" button that pre-fills a recommendation query

5. **Group Buy Tracker**
   - List/card view of tracked group buys
   - Status badges: Ordered (blue), In Production (amber), Shipped (green), Delivered (gray)
   - Estimated delivery countdown
   - Total pending cost summary
   - Add new entry form (modal or dedicated page)

6. **My Collection** (stretch)
   - Gallery view of builds with photo cards
   - Component inventory list with filters

### Responsive Design
- Must work on mobile — many users browse keyboard stuff on phones
- Touch-friendly filter controls
- Build cards should be screenshot-friendly (users will want to share them)
- Filter toggles should be easy to use on touch (not tiny checkboxes)

---

## Project Structure

```
switchy/
├── convex/
│   ├── schema.ts                # Database schema
│   ├── switches.ts              # Switch database queries
│   ├── components.ts            # Component database queries
│   ├── keyboards.ts             # Keyboard kit queries
│   ├── builds.ts                # AI build advisor action + saved builds
│   ├── groupBuys.ts             # Group buy tracker CRUD
│   ├── collection.ts            # User collection management
│   ├── seed.ts                  # Database seed script
│   └── http.ts                  # HTTP routes if needed
├── src/
│   ├── app/
│   │   ├── layout.tsx           # Root layout with Clerk + Convex providers
│   │   ├── page.tsx             # Landing/dashboard with Build Advisor input
│   │   ├── advisor/
│   │   │   └── page.tsx         # Full Build Advisor page
│   │   ├── switches/
│   │   │   ├── page.tsx         # Switch Explorer with filters
│   │   │   ├── [id]/
│   │   │   │   └── page.tsx     # Switch detail view
│   │   │   └── compare/
│   │   │       └── page.tsx     # Switch comparison view
│   │   ├── group-buys/
│   │   │   └── page.tsx         # Group Buy Tracker
│   │   ├── collection/
│   │   │   └── page.tsx         # My Collection (stretch)
│   │   └── builds/
│   │       ├── page.tsx         # Saved build recommendations
│   │       └── [id]/
│   │           └── page.tsx     # Individual build view
│   ├── components/
│   │   ├── ui/                  # Reusable UI components
│   │   ├── SwitchCard.tsx       # Switch display card
│   │   ├── BuildCard.tsx        # Build recommendation card
│   │   ├── SwitchComparison.tsx # Side-by-side comparison
│   │   ├── FilterBar.tsx        # Switch explorer filters
│   │   ├── GroupBuyEntry.tsx    # Group buy entry card
│   │   ├── SoundProfile.tsx    # Visual sound profile component
│   │   └── Navigation.tsx       # App navigation
│   ├── lib/
│   │   ├── constants.ts         # App constants, switch type colors
│   │   └── utils.ts             # Utility functions
│   └── data/
│       ├── switches.json        # Seed data for switches
│       ├── components.json      # Seed data for components
│       └── keyboards.json       # Seed data for keyboard kits
├── public/
├── tailwind.config.ts
├── next.config.js
├── convex.json
├── package.json
└── PROJECTPLAN.md               # ← CREATE THIS (see below)
```

---

## First Task: Create PROJECTPLAN.md

Before writing any code, create a `PROJECTPLAN.md` file in the project root that contains:

1. **Project Overview** — one paragraph on what Switchy is
2. **Tech Stack** — list of all technologies
3. **Feature Checklist** — every feature broken into subtasks with checkboxes `[ ]` that can be checked off `[x]` across sessions
4. **Database Schema** — the full Convex schema
5. **API Endpoints** — every Convex query, mutation, and action
6. **AI Integration Details** — the system prompt template with acoustic interaction rules, expected request/response shapes
7. **UI Screen List** — every screen with its route and key components
8. **Data Model Relationships** — how tables relate to each other
9. **Environment Variables Needed** — list of all env vars (Clerk keys, Convex URL, Anthropic/OpenRouter API key)
10. **Build Order** — the exact sequence of implementation steps
11. **Current Status** — a section at the top that gets updated each session with what's done and what's next

The build order in the project plan should be:
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

## Environment Variables

The app will need these environment variables:
```
# Clerk
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=
CLERK_SECRET_KEY=

# Convex
NEXT_PUBLIC_CONVEX_URL=

# AI Model (choose one)
ANTHROPIC_API_KEY=           # If using Claude directly
# OR
OPENROUTER_API_KEY=          # If using Nemotron/other models via OpenRouter
```

---

## Important Implementation Notes

- **Convex actions** (not mutations) must be used for the AI API call since it's a third-party HTTP request
- **The switch database seed** should be idempotent — check if data exists before inserting
- **Sound profile visualization** is important — don't just show text tags. Create a simple visual component: a horizontal bar or spectrum showing pitch (low → high), a volume indicator (quiet → loud), and character tags as colored pills
- **The Build Advisor should feel conversational** — the input should feel like talking to a knowledgeable friend, not filling out a form. The text area is the primary interface, not dropdowns and sliders.
- **"Tweak it" refinement** is a key UX feature: after getting a recommendation, the user should be able to say "make it cheaper" or "I actually want tactile" and get a refined recommendation. Implement this as a follow-up query that includes the previous recommendation as context.
- **Switch type colors** are deeply ingrained in the community: Red = Linear, Brown/Orange = Tactile, Blue = Clicky. Use these consistently on every type badge.
- **Loading states** should be keyboard-themed and fun: "Lubing the switches...", "Testing the plate flex...", "Foam modding the case...", "Sound testing your build..."
- **Error handling:** Handle AI response parsing failures (retry or display raw text), empty database states (prompt to wait for seed), and network errors gracefully
- **Build cards should be screenshot-friendly** — users will want to share their recommended builds on Discord and Reddit. Make them look good as standalone visual units.

Now, begin building. Start with the PROJECTPLAN.md, then scaffold the project, then build features in the specified order.

## END OF PROMPT
