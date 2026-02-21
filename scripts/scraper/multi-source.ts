import * as fs from "fs";
import * as path from "path";
import { CHECKPOINT_DIR } from "./config";
import { log, logError, sleep, slugify, parsePrice } from "./utils";
import { NormalizedSwitch, NormalizedKeyboard, NormalizedProduct, NormalizedVendorLink, ScrapingMetadata } from "./types";
import { fetchAllShopifyStores } from "./shopify-stores";
import { scrapeKeybumps, KeybumpsSwitch } from "./keybumps";

// Download ThereminGoat switch scores CSV
async function fetchThereminGoatScores(): Promise<Map<string, number>> {
  const scores = new Map<string, number>();
  const cacheFile = path.join(path.resolve(CHECKPOINT_DIR), "theremingoat-scores.json");

  if (fs.existsSync(cacheFile)) {
    log("theremingoat", "Loading cached scores");
    const cached = JSON.parse(fs.readFileSync(cacheFile, "utf-8"));
    for (const [k, v] of Object.entries(cached)) {
      scores.set(k, v as number);
    }
    return scores;
  }

  try {
    log("theremingoat", "Downloading ThereminGoat switch scores...");
    const url = "https://raw.githubusercontent.com/ThereminGoat/switch-scores/master/1-Composite%20Overall%20Total%20Score%20Sheet.csv";
    const response = await fetch(url);
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    const csv = await response.text();

    // Parse CSV - format is: column headers in first meaningful row, then data rows
    // The CSV has a header area, then actual data with switch names and scores
    const lines = csv.split('\n');
    for (const line of lines) {
      // Look for lines that have switch names and numeric scores
      const parts = line.split(',');
      if (parts.length < 3) continue;

      // Find rows where first non-empty column is a switch name and there are numeric scores
      const name = parts[0]?.trim().replace(/^"/, '').replace(/"$/, '');
      if (!name || name.startsWith('ThereminGoat') || name.startsWith('Total') || name === '' || name === '\ufeff') continue;

      // Try to find the overall score (usually in column index 1 or 2)
      for (let i = 1; i < Math.min(parts.length, 5); i++) {
        const val = parseFloat(parts[i]?.trim() || '');
        if (!isNaN(val) && val > 0 && val <= 200) {
          // Normalize to 0-5 scale (ThereminGoat scores are typically out of 180)
          const normalized = Math.round((val / 180) * 5 * 10) / 10;
          scores.set(name.toLowerCase(), Math.min(normalized, 5));
          break;
        }
      }
    }

    log("theremingoat", `Parsed ${scores.size} switch scores`);

    // Cache
    const obj: Record<string, number> = {};
    for (const [k, v] of scores) obj[k] = v;
    fs.writeFileSync(cacheFile, JSON.stringify(obj, null, 2));

    return scores;
  } catch (error) {
    logError("theremingoat", `Failed: ${error instanceof Error ? error.message : String(error)}`);
    return scores;
  }
}

// Convert Keybumps data to our switch format
function keybumpsToSwitch(kb: KeybumpsSwitch): NormalizedSwitch | null {
  if (!kb.name) return null;

  // Parse brand from name (usually "Brand SwitchName")
  const nameParts = kb.name.split(/\s+/);
  const brand = nameParts[0] || 'Unknown';

  // Parse type
  let type: "linear" | "tactile" | "clicky" = "linear";
  const typeLower = kb.type.toLowerCase();
  if (typeLower.includes('tactile')) type = 'tactile';
  else if (typeLower.includes('clicky') || typeLower.includes('click')) type = 'clicky';

  // Parse force
  const forceMatch = kb.operatingForce.match(/([\d.]+)/);
  const force = forceMatch ? parseFloat(forceMatch[1]) : 0;

  // Parse pre-travel
  const pretravelMatch = kb.preTravel.match(/([\d.]+)/);
  const pretravel = pretravelMatch ? parseFloat(pretravelMatch[1]) : 0;

  // Parse total travel
  const travelMatch = kb.totalTravel.match(/([\d.]+)/);
  const travel = travelMatch ? parseFloat(travelMatch[1]) : 0;

  return {
    brand,
    name: kb.name,
    slug: slugify(kb.name),
    type,
    actuationForceG: force,
    actuationMm: pretravel,
    totalTravelMm: travel,
    pricePerSwitch: 0,
    factoryLubed: kb.factoryLubed.toLowerCase().includes('lubed') || kb.factoryLubed.toLowerCase() === 'yes',
  };
}

// Deduplicate switches by slug, preferring entries with more data
function deduplicateSwitches(switches: NormalizedSwitch[]): NormalizedSwitch[] {
  const bySlug = new Map<string, NormalizedSwitch>();

  for (const sw of switches) {
    const slug = sw.slug.toLowerCase();
    const existing = bySlug.get(slug);

    if (!existing) {
      bySlug.set(slug, sw);
      continue;
    }

    // Merge: prefer the entry with more non-zero/non-undefined fields
    const countFields = (s: NormalizedSwitch): number => {
      let count = 0;
      if (s.actuationForceG > 0) count++;
      if (s.actuationMm > 0) count++;
      if (s.totalTravelMm > 0) count++;
      if (s.pricePerSwitch > 0) count++;
      if (s.bottomOutForceG) count++;
      if (s.stemMaterial) count++;
      if (s.housingMaterial) count++;
      if (s.springType) count++;
      if (s.factoryLubed != null) count++;
      if (s.imageUrl) count++;
      if (s.productUrl) count++;
      return count;
    };

    if (countFields(sw) > countFields(existing)) {
      // New entry has more data, use it as base and fill gaps from existing
      const merged = { ...sw };
      if (!merged.bottomOutForceG && existing.bottomOutForceG) merged.bottomOutForceG = existing.bottomOutForceG;
      if (!merged.stemMaterial && existing.stemMaterial) merged.stemMaterial = existing.stemMaterial;
      if (!merged.housingMaterial && existing.housingMaterial) merged.housingMaterial = existing.housingMaterial;
      if (!merged.springType && existing.springType) merged.springType = existing.springType;
      if (merged.factoryLubed == null && existing.factoryLubed != null) merged.factoryLubed = existing.factoryLubed;
      if (!merged.imageUrl && existing.imageUrl) merged.imageUrl = existing.imageUrl;
      if (!merged.productUrl && existing.productUrl) merged.productUrl = existing.productUrl;
      if (merged.actuationForceG === 0 && existing.actuationForceG > 0) merged.actuationForceG = existing.actuationForceG;
      if (merged.actuationMm === 0 && existing.actuationMm > 0) merged.actuationMm = existing.actuationMm;
      if (merged.totalTravelMm === 0 && existing.totalTravelMm > 0) merged.totalTravelMm = existing.totalTravelMm;
      if (merged.pricePerSwitch === 0 && existing.pricePerSwitch > 0) merged.pricePerSwitch = existing.pricePerSwitch;
      bySlug.set(slug, merged);
    } else {
      // Existing has more data, fill gaps from new
      if (!existing.bottomOutForceG && sw.bottomOutForceG) existing.bottomOutForceG = sw.bottomOutForceG;
      if (!existing.stemMaterial && sw.stemMaterial) existing.stemMaterial = sw.stemMaterial;
      if (!existing.housingMaterial && sw.housingMaterial) existing.housingMaterial = sw.housingMaterial;
      if (!existing.springType && sw.springType) existing.springType = sw.springType;
      if (existing.factoryLubed == null && sw.factoryLubed != null) existing.factoryLubed = sw.factoryLubed;
      if (!existing.imageUrl && sw.imageUrl) existing.imageUrl = sw.imageUrl;
      if (!existing.productUrl && sw.productUrl) existing.productUrl = sw.productUrl;
      if (existing.actuationForceG === 0 && sw.actuationForceG > 0) existing.actuationForceG = sw.actuationForceG;
      if (existing.actuationMm === 0 && sw.actuationMm > 0) existing.actuationMm = sw.actuationMm;
      if (existing.totalTravelMm === 0 && sw.totalTravelMm > 0) existing.totalTravelMm = sw.totalTravelMm;
      if (existing.pricePerSwitch === 0 && sw.pricePerSwitch > 0) existing.pricePerSwitch = sw.pricePerSwitch;
    }
  }

  return Array.from(bySlug.values());
}

// Deduplicate keyboards
function deduplicateKeyboards(keyboards: NormalizedKeyboard[]): NormalizedKeyboard[] {
  const bySlug = new Map<string, NormalizedKeyboard>();
  for (const kb of keyboards) {
    const slug = kb.slug.toLowerCase();
    if (!bySlug.has(slug)) {
      bySlug.set(slug, kb);
    }
  }
  return Array.from(bySlug.values());
}

// Deduplicate products
function deduplicateProducts(products: NormalizedProduct[]): NormalizedProduct[] {
  const bySlug = new Map<string, NormalizedProduct>();
  for (const p of products) {
    const key = `${p.category}-${p.slug}`.toLowerCase();
    if (!bySlug.has(key)) {
      bySlug.set(key, p);
    }
  }
  return Array.from(bySlug.values());
}

// Main pipeline
async function main(): Promise<void> {
  const startTime = Date.now();
  console.log("\n=== Multi-Source Scraper Pipeline ===\n");

  const outDir = path.resolve(CHECKPOINT_DIR);
  if (!fs.existsSync(outDir)) fs.mkdirSync(outDir, { recursive: true });

  // Phase 1: Shopify stores (main data source)
  log("pipeline", "Phase 1: Fetching from Shopify stores...");
  const shopify = await fetchAllShopifyStores();
  log("pipeline", `Shopify: ${shopify.switches.length} switches, ${shopify.keyboards.length} keyboards, ${shopify.products.length} other`);

  // Phase 2: Keybumps (supplementary switch specs)
  log("pipeline", "Phase 2: Scraping Keybumps switch list...");
  let keybumpsSwitches: NormalizedSwitch[] = [];
  try {
    const keybumpsRaw = await scrapeKeybumps();
    keybumpsSwitches = keybumpsRaw
      .map(keybumpsToSwitch)
      .filter((s): s is NormalizedSwitch => s !== null);
    log("pipeline", `Keybumps: ${keybumpsSwitches.length} switches`);
  } catch (error) {
    logError("pipeline", `Keybumps failed: ${error instanceof Error ? error.message : String(error)}`);
  }

  // Phase 3: ThereminGoat scores (community ratings)
  log("pipeline", "Phase 3: Downloading ThereminGoat scores...");
  const tgScores = await fetchThereminGoatScores();
  log("pipeline", `ThereminGoat: ${tgScores.size} switch scores`);

  // Phase 4: Merge and deduplicate
  log("pipeline", "Phase 4: Merging and deduplicating...");

  // Combine all switches
  const allSwitches = [...shopify.switches, ...keybumpsSwitches];
  const dedupedSwitches = deduplicateSwitches(allSwitches);

  // Apply ThereminGoat scores
  let scoresApplied = 0;
  for (const sw of dedupedSwitches) {
    // Try various name formats to match
    const searchNames = [
      sw.name.toLowerCase(),
      `${sw.brand} ${sw.name}`.toLowerCase(),
      sw.slug.replace(/-/g, ' '),
    ];
    for (const name of searchNames) {
      if (tgScores.has(name)) {
        (sw as any).communityRating = tgScores.get(name);
        scoresApplied++;
        break;
      }
    }
  }
  log("pipeline", `Applied ${scoresApplied} ThereminGoat scores`);

  const dedupedKeyboards = deduplicateKeyboards(shopify.keyboards);
  const dedupedProducts = deduplicateProducts(shopify.products);

  // Phase 5: Write output files
  log("pipeline", "Phase 5: Writing output files...");

  fs.writeFileSync(path.join(outDir, "switches.json"), JSON.stringify(dedupedSwitches, null, 2));
  fs.writeFileSync(path.join(outDir, "keyboards.json"), JSON.stringify(dedupedKeyboards, null, 2));
  fs.writeFileSync(path.join(outDir, "products.json"), JSON.stringify(dedupedProducts, null, 2));
  fs.writeFileSync(path.join(outDir, "vendor-links.json"), JSON.stringify(shopify.vendorLinks, null, 2));

  // Write metadata
  const metadata: ScrapingMetadata = {
    scrapedAt: new Date().toISOString(),
    categories: {
      switches: { listingCount: allSwitches.length, detailCount: dedupedSwitches.length },
      keyboards: { listingCount: shopify.keyboards.length, detailCount: dedupedKeyboards.length },
    },
    totalProducts: dedupedSwitches.length + dedupedKeyboards.length + dedupedProducts.length,
    errors: [],
  };

  // Count products by category
  const productCats: Record<string, number> = {};
  for (const p of dedupedProducts) {
    productCats[p.category] = (productCats[p.category] || 0) + 1;
  }
  for (const [cat, count] of Object.entries(productCats)) {
    metadata.categories[cat] = { listingCount: count, detailCount: count };
  }

  fs.writeFileSync(path.join(outDir, "_metadata.json"), JSON.stringify(metadata, null, 2));

  const elapsed = ((Date.now() - startTime) / 1000).toFixed(1);

  console.log("\n=== Multi-Source Scraper Results ===");
  console.log(`Switches:      ${dedupedSwitches.length} (${allSwitches.length} before dedup)`);
  console.log(`Keyboards:     ${dedupedKeyboards.length}`);
  console.log(`Other Products:${dedupedProducts.length}`);
  for (const [cat, count] of Object.entries(productCats).sort((a, b) => b[1] - a[1])) {
    console.log(`  ${cat}: ${count}`);
  }
  console.log(`Vendor Links:  ${shopify.vendorLinks.length}`);
  console.log(`TG Scores:     ${scoresApplied} applied`);
  console.log(`Time:          ${elapsed}s`);
  console.log(`\nOutput: ${outDir}/`);
  console.log("Run 'npx tsx scripts/scraper/db-insert.ts' to load into Convex");
}

main().catch(console.error);
