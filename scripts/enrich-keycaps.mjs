#!/usr/bin/env node
/**
 * One-time script: fuzzy-match keycaps.json against scraped keycap listings
 * and copy over imageUrl values. Unmatched keycaps get a representative image
 * from a matched keycap with the same profile, flagged with representativeImage.
 */

import { readFileSync, writeFileSync } from "fs";
import { resolve, dirname } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(__dirname, "..");

const keycaps = JSON.parse(readFileSync(resolve(ROOT, "src/data/keycaps.json"), "utf-8"));
const listings = JSON.parse(readFileSync(resolve(ROOT, "src/data/scraped/keycaps-listings.json"), "utf-8"));

function normalize(str) {
  return str
    .toLowerCase()
    .replace(/[^a-z0-9]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function tokenize(str) {
  return normalize(str).split(" ").filter(Boolean);
}

/** Score how well a listing name matches a keycap set */
function matchScore(kc, listing) {
  const kcFull = normalize(`${kc.brand} ${kc.name}`);
  const listingName = normalize(listing.name);

  // Exact substring match
  if (listingName.includes(kcFull) || kcFull.includes(listingName)) return 100;

  // Try just the set name without brand
  const kcNameOnly = normalize(kc.name);
  if (listingName.includes(kcNameOnly)) return 90;

  const kcTokens = tokenize(`${kc.brand} ${kc.name}`);
  const listingTokens = tokenize(listing.name);

  let matched = 0;
  for (const t of kcTokens) {
    if (listingTokens.some(lt => lt === t || lt.includes(t) || t.includes(lt))) {
      matched++;
    }
  }

  if (matched < 2) return 0;
  return (matched / kcTokens.length) * 80;
}

let exactMatches = 0;
let representativeMatches = 0;
const matchedByProfile = {};

// First pass: find best matches
for (const kc of keycaps) {
  let bestScore = 0;
  let bestListing = null;

  for (const listing of listings) {
    const score = matchScore(kc, listing);
    if (score > bestScore) {
      bestScore = score;
      bestListing = listing;
    }
  }

  if (bestScore >= 45 && bestListing) {
    kc.imageUrl = bestListing.imageUrl;
    exactMatches++;
    // Track a representative per profile
    if (kc.profile && !matchedByProfile[kc.profile]) {
      matchedByProfile[kc.profile] = bestListing.imageUrl;
    }
  }
}

// Second pass: fill unmatched with representative images by profile
for (const kc of keycaps) {
  if (!kc.imageUrl && kc.profile && matchedByProfile[kc.profile]) {
    kc.imageUrl = matchedByProfile[kc.profile];
    kc.representativeImage = true;
    representativeMatches++;
  }
}

// Fallback: use any available image
const anyImage = Object.values(matchedByProfile)[0] || listings[0]?.imageUrl;
for (const kc of keycaps) {
  if (!kc.imageUrl && anyImage) {
    kc.imageUrl = anyImage;
    kc.representativeImage = true;
    representativeMatches++;
  }
}

writeFileSync(
  resolve(ROOT, "src/data/keycaps.json"),
  JSON.stringify(keycaps, null, 2) + "\n"
);

console.log(`Keycaps enrichment complete:`);
console.log(`  Direct matches: ${exactMatches}`);
console.log(`  Representative: ${representativeMatches}`);
console.log(`  Total: ${keycaps.length}`);
console.log(`  Coverage: ${((exactMatches + representativeMatches) / keycaps.length * 100).toFixed(1)}%`);
console.log(`  Profiles with images: ${Object.keys(matchedByProfile).join(", ")}`);
