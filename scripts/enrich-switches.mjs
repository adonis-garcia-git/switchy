#!/usr/bin/env node
/**
 * One-time script: fuzzy-match switches.json against scraped switch listings
 * and copy over imageUrl values. Unmatched switches get a representative image
 * from a matched switch of the same type.
 */

import { readFileSync, writeFileSync } from "fs";
import { resolve, dirname } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(__dirname, "..");

const switches = JSON.parse(readFileSync(resolve(ROOT, "src/data/switches.json"), "utf-8"));
const listings = JSON.parse(readFileSync(resolve(ROOT, "src/data/scraped/switches-listings.json"), "utf-8"));

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

/** Score how well a listing name matches a switch (brand + name) */
function matchScore(sw, listing) {
  const swFull = normalize(`${sw.brand} ${sw.name}`);
  const listingName = normalize(listing.name);

  // Exact substring match
  if (listingName.includes(swFull) || swFull.includes(listingName)) return 100;

  const swTokens = tokenize(`${sw.brand} ${sw.name}`);
  const listingTokens = tokenize(listing.name);

  let matched = 0;
  for (const t of swTokens) {
    if (listingTokens.some(lt => lt === t || lt.includes(t) || t.includes(lt))) {
      matched++;
    }
  }

  // At least 2 tokens must match and at least 50% of switch tokens
  if (matched < 2) return 0;
  return (matched / swTokens.length) * 80;
}

let exactMatches = 0;
let representativeMatches = 0;
const matchedByType = { linear: null, tactile: null, clicky: null };

// First pass: find best matches
for (const sw of switches) {
  let bestScore = 0;
  let bestListing = null;

  for (const listing of listings) {
    const score = matchScore(sw, listing);
    if (score > bestScore) {
      bestScore = score;
      bestListing = listing;
    }
  }

  if (bestScore >= 50 && bestListing) {
    sw.imageUrl = bestListing.imageUrl;
    exactMatches++;
    // Track a representative per type
    if (!matchedByType[sw.type]) {
      matchedByType[sw.type] = bestListing.imageUrl;
    }
  }
}

// Second pass: fill unmatched with representative images
for (const sw of switches) {
  if (!sw.imageUrl && matchedByType[sw.type]) {
    sw.imageUrl = matchedByType[sw.type];
    sw.representativeImage = true;
    representativeMatches++;
  }
}

// Fallback: if any type had zero matches, use any available image
const anyImage = Object.values(matchedByType).find(Boolean) || listings[0]?.imageUrl;
for (const sw of switches) {
  if (!sw.imageUrl && anyImage) {
    sw.imageUrl = anyImage;
    sw.representativeImage = true;
    representativeMatches++;
  }
}

writeFileSync(
  resolve(ROOT, "src/data/switches.json"),
  JSON.stringify(switches, null, 2) + "\n"
);

console.log(`Switches enrichment complete:`);
console.log(`  Direct matches: ${exactMatches}`);
console.log(`  Representative: ${representativeMatches}`);
console.log(`  Total: ${switches.length}`);
console.log(`  Coverage: ${((exactMatches + representativeMatches) / switches.length * 100).toFixed(1)}%`);
