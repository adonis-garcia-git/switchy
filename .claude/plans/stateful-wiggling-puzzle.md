# Plan: Deduplicate switches.json

## Context

`src/data/switches.json` has **117 entries** with **18 duplicate pairs** (36 entries total sharing the same brand+name+slug). These appear to be from two separate data collection passes — indices 0–80 and 82–116 — with slightly differing specs. When seeded, duplicates end up in the Convex DB since there are no unique constraints on the switches table.

## Deduplication Strategy

For each of the 18 duplicate pairs, **merge into one entry** by picking the better version:

| # | Brand + Name | Keep | Reason |
|---|---|---|---|
| 1 | Akko V3 Cream Blue | [91] | More accurate specs (55g actuation, extended spring, factory lubed) |
| 2 | Akko V3 Cream Yellow | [90] | Higher rating (4.3), extended spring, factory lubed |
| 3 | Durock Sunflower | [30] | Correct type=linear (idx 94 says tactile — wrong for Sunflower) |
| 4 | Durock T1 | [93] | Higher rating (4.4), correct 67g force for T1 |
| 5 | Gateron CJ | [86] | Higher rating (4.5), gold-plated spring |
| 6 | Gateron Milky Yellow Pro | [9] | Identical — keep first |
| 7 | Gateron Oil King | [83] | Higher rating (4.6), correct INK housing + long spring |
| 8 | Gazzew Boba U4T | [36] | More detailed housing description, correct 50g variant |
| 9 | HMX Xinhai | [46] | Higher rating (4.3), correct 47g actuation |
| 10 | KTT Kang White V3 | [96] | Higher rating (4.3) |
| 11 | KTT Peach | [53] | Higher rating (4.0), extended spring |
| 12 | KTT Strawberry | [95] | Higher rating (4.2) |
| 13 | SP-Star Meteor White | [99] | Higher rating (4.4), correct 57g force |
| 14 | SP-Star Polaris Gray | [100] | Higher rating (4.3), correct 67g force |
| 15 | TTC Bluish White | [104] | Higher rating (4.0) |
| 16 | TTC Gold Pink V2 | [103] | Higher rating (4.1) |
| 17 | Tecsee Purple Panda | [109] | Higher rating (4.2) |
| 18 | Tecsee Sapphire V2 | [111] | Higher rating (4.0), UHMWPE housing is correct for Sapphire V2 |

**Result:** 117 – 18 removed = **99 unique switches**

## Implementation

### Step 1: Write a dedup script (`/tmp/dedup-switches.mjs`)

Node script that:
1. Reads `src/data/switches.json`
2. Groups entries by `brand + name`
3. For each duplicate pair, keeps the preferred index (hardcoded from the table above)
4. Writes the deduplicated array back to `src/data/switches.json`

### Step 2: Run the script

Execute the script, verify output has 99 entries with zero duplicate brand+name combos.

## Files Modified

| File | Change |
|---|---|
| `src/data/switches.json` | 117 → 99 entries (remove 18 duplicates) |

No schema changes, no Convex function changes, no UI changes needed. The seed page already reads from this JSON file.

## Verification

1. `switches.json` has exactly 99 entries
2. Zero duplicate `brand + name` combinations
3. Zero duplicate `slug` values
4. JSON is valid and well-formatted
5. After re-seeding via `/seed`, Switch Explorer shows 99 unique switches
