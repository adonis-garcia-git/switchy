import * as fs from "fs";
import * as path from "path";
import { ConvexHttpClient } from "convex/browser";
import { api } from "../../convex/_generated/api";
import { BATCH_SIZES, CHECKPOINT_DIR, DELAYS } from "./config";
import { NormalizedSwitch, NormalizedKeyboard, NormalizedProduct, NormalizedVendorLink } from "./types";
import { chunk, sleep, log, logError } from "./utils";

// Load env from .env.local manually
const envPath = path.resolve(".env.local");
if (fs.existsSync(envPath)) {
  const envContent = fs.readFileSync(envPath, "utf-8");
  for (const line of envContent.split("\n")) {
    const match = line.match(/^([^#=]+)=(.*)$/);
    if (match) {
      process.env[match[1].trim()] = match[2].trim().replace(/^["']|["']$/g, "");
    }
  }
}

const CONVEX_URL = process.env.NEXT_PUBLIC_CONVEX_URL;
if (!CONVEX_URL) {
  console.error("NEXT_PUBLIC_CONVEX_URL not found in .env.local");
  process.exit(1);
}

const client = new ConvexHttpClient(CONVEX_URL);

async function clearTable(table: string): Promise<void> {
  log("db", `Clearing table: ${table}`);
  let totalDeleted = 0;
  let deleted: number;
  do {
    deleted = await client.mutation(api.seed.clearTable, { table });
    totalDeleted += deleted;
    if (deleted > 0) await sleep(200);
  } while (deleted > 0);
  log("db", `Cleared ${totalDeleted} records from ${table}`);
}

async function insertSwitches(useEnriched: boolean): Promise<number> {
  const filename = useEnriched ? "switches-enriched.json" : "switches.json";
  const filePath = path.resolve(CHECKPOINT_DIR, filename);
  if (!fs.existsSync(filePath)) {
    logError("db", `${filename} not found`);
    return 0;
  }

  const switches: NormalizedSwitch[] = JSON.parse(fs.readFileSync(filePath, "utf-8"));
  const batches = chunk(switches, BATCH_SIZES.switches);
  let total = 0;

  for (let i = 0; i < batches.length; i++) {
    const count = await client.mutation(api.seed.seedSwitchesBatch, {
      switches: batches[i],
      batchIndex: i,
    });
    total += count;
    log("db", `Switches batch ${i + 1}/${batches.length}: +${count} (total: ${total})`);
    await sleep(DELAYS.batchInsertPause);
  }

  return total;
}

async function insertKeyboards(): Promise<number> {
  const filePath = path.resolve(CHECKPOINT_DIR, "keyboards.json");
  if (!fs.existsSync(filePath)) {
    logError("db", "keyboards.json not found");
    return 0;
  }

  const keyboards: NormalizedKeyboard[] = JSON.parse(fs.readFileSync(filePath, "utf-8"));
  const batches = chunk(keyboards, BATCH_SIZES.keyboards);
  let total = 0;

  for (let i = 0; i < batches.length; i++) {
    const count = await client.mutation(api.seed.seedKeyboardsBatch, {
      keyboards: batches[i],
      batchIndex: i,
    });
    total += count;
    log("db", `Keyboards batch ${i + 1}/${batches.length}: +${count} (total: ${total})`);
    await sleep(DELAYS.batchInsertPause);
  }

  return total;
}

async function insertProducts(): Promise<number> {
  const filePath = path.resolve(CHECKPOINT_DIR, "products.json");
  if (!fs.existsSync(filePath)) {
    logError("db", "products.json not found");
    return 0;
  }

  const products: NormalizedProduct[] = JSON.parse(fs.readFileSync(filePath, "utf-8"));
  const batches = chunk(products, BATCH_SIZES.products);
  let total = 0;

  for (let i = 0; i < batches.length; i++) {
    const count = await client.mutation(api.seed.seedProductsBatch, {
      products: batches[i],
      batchIndex: i,
    });
    total += count;
    log("db", `Products batch ${i + 1}/${batches.length}: +${count} (total: ${total})`);
    await sleep(DELAYS.batchInsertPause);
  }

  return total;
}

async function insertVendorLinks(): Promise<number> {
  const filePath = path.resolve(CHECKPOINT_DIR, "vendor-links.json");
  if (!fs.existsSync(filePath)) {
    logError("db", "vendor-links.json not found");
    return 0;
  }

  const links: NormalizedVendorLink[] = JSON.parse(fs.readFileSync(filePath, "utf-8"));
  const batches = chunk(links, BATCH_SIZES.vendorLinks);
  let total = 0;

  for (let i = 0; i < batches.length; i++) {
    const count = await client.mutation(api.seed.seedVendorLinksBatch, {
      links: batches[i],
      batchIndex: i,
    });
    total += count;
    log("db", `Vendor links batch ${i + 1}/${batches.length}: +${count} (total: ${total})`);
    await sleep(DELAYS.batchInsertPause);
  }

  return total;
}

async function main(): Promise<void> {
  const useEnriched = process.argv.includes("--enriched");
  const startTime = Date.now();

  console.log("\n=== Convex Database Insertion ===");
  console.log(`Using ${useEnriched ? "enriched" : "standard"} switch data\n`);

  // Clear tables
  await clearTable("switches");
  await clearTable("keyboards");
  await clearTable("products");
  await clearTable("vendorLinks");

  console.log();

  // Insert data
  const switchCount = await insertSwitches(useEnriched);
  const keyboardCount = await insertKeyboards();
  const productCount = await insertProducts();
  const vendorLinkCount = await insertVendorLinks();

  const elapsed = ((Date.now() - startTime) / 1000).toFixed(1);

  console.log("\n=== Insertion Summary ===");
  console.log(`Switches:     ${switchCount}`);
  console.log(`Keyboards:    ${keyboardCount}`);
  console.log(`Products:     ${productCount}`);
  console.log(`Vendor Links: ${vendorLinkCount}`);
  console.log(`Total:        ${switchCount + keyboardCount + productCount + vendorLinkCount}`);
  console.log(`Time:         ${elapsed}s`);
}

main().catch(console.error);
