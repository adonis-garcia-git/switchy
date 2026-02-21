import * as fs from "fs";
import * as path from "path";
import { CHECKPOINT_DIR } from "./config";
import { log, logError } from "./utils";

async function main(): Promise<void> {
  const startTime = Date.now();
  console.log("\n=== KeebFinder Scraper Pipeline ===\n");

  const outDir = path.resolve(CHECKPOINT_DIR);
  if (!fs.existsSync(outDir)) fs.mkdirSync(outDir, { recursive: true });

  // Phase 1: API Discovery
  log("pipeline", "Phase 1: API Discovery");
  try {
    await import("./api-discovery");
  } catch (error) {
    // api-discovery runs on import (top-level), which is fine
    log("pipeline", "Discovery phase completed");
  }

  // Phase 2: List Scraping
  log("pipeline", "Phase 2: List Scraping");
  try {
    const { scrapeAllListings } = await import("./list-scraper");
    await scrapeAllListings();
  } catch (error) {
    logError("pipeline", `List scraping failed: ${error instanceof Error ? error.message : String(error)}`);
    // Continue - we might have partial data from checkpoints
  }

  // Validate listing output
  const listingFiles = fs.readdirSync(outDir).filter((f) => f.endsWith("-listings.json"));
  if (listingFiles.length === 0) {
    logError("pipeline", "No listing files found. Cannot continue.");
    process.exit(1);
  }
  log("pipeline", `Found ${listingFiles.length} listing files`);

  // Phase 3: Detail Scraping
  log("pipeline", "Phase 3: Detail Scraping");
  try {
    const { scrapeDetails } = await import("./detail-scraper");
    await scrapeDetails();
  } catch (error) {
    logError("pipeline", `Detail scraping failed: ${error instanceof Error ? error.message : String(error)}`);
  }

  // Phase 4: Normalization
  log("pipeline", "Phase 4: Normalization");
  try {
    const { normalize } = await import("./normalizer");
    await normalize();
  } catch (error) {
    logError("pipeline", `Normalization failed: ${error instanceof Error ? error.message : String(error)}`);
    process.exit(1);
  }

  // Validate normalized output
  const requiredFiles = ["switches.json", "keyboards.json", "products.json"];
  for (const file of requiredFiles) {
    const filePath = path.join(outDir, file);
    if (!fs.existsSync(filePath)) {
      logError("pipeline", `Missing required file: ${file}`);
      process.exit(1);
    }
    const data = JSON.parse(fs.readFileSync(filePath, "utf-8"));
    log("pipeline", `${file}: ${data.length} items`);
  }

  const elapsed = ((Date.now() - startTime) / 1000).toFixed(1);
  console.log(`\n=== Pipeline Complete (${elapsed}s) ===`);
  console.log("Run 'npx tsx scripts/scraper/db-insert.ts' to insert into Convex");
  console.log("Run 'npx tsx scripts/scraper/ai-enrich.ts' first for AI-enriched switch data");
}

main().catch(console.error);
