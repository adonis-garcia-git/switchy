import * as fs from "fs";
import * as path from "path";
import { Page } from "playwright";
import { createPage, closeBrowser } from "./browser";
import { BASE_URL, CATEGORIES, DELAYS, LIMITS, CHECKPOINT_DIR, CategoryConfig } from "./config";
import { RawProduct, DiscoveryReport } from "./types";
import { randomDelay, sleep, withRetry, log, logError } from "./utils";

async function scrollToBottom(page: Page, category: string): Promise<void> {
  let previousHeight = 0;
  let noChangeCount = 0;

  while (noChangeCount < LIMITS.maxNoChangeScrolls) {
    const currentHeight = await page.evaluate(() => document.body.scrollHeight);
    if (currentHeight === previousHeight) {
      noChangeCount++;
      log(category, `No scroll change (${noChangeCount}/${LIMITS.maxNoChangeScrolls})`);
    } else {
      noChangeCount = 0;
      log(category, `Scrolled to ${currentHeight}px`);
    }
    previousHeight = currentHeight;
    await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
    await sleep(randomDelay(DELAYS.scrollPause));
  }
}

async function extractProducts(page: Page, category: string): Promise<RawProduct[]> {
  return page.evaluate((cat) => {
    const products: {
      name: string;
      brand: string;
      slug: string;
      price: string | null;
      originalPrice: string | null;
      imageUrl: string | null;
      detailUrl: string | null;
      tags: string[];
      category: string;
    }[] = [];

    // Try multiple selector strategies
    const productLinks = document.querySelectorAll(`a[href*="/${cat}/"]`);
    const seen = new Set<string>();

    productLinks.forEach((el) => {
      const link = el as HTMLAnchorElement;
      const href = link.href;
      if (!href || seen.has(href)) return;
      seen.add(href);

      // Extract slug from URL
      const urlParts = new URL(href).pathname.split("/").filter(Boolean);
      const slug = urlParts[urlParts.length - 1] || "";
      if (!slug) return;

      // Try to find product info within the card
      const card = link.closest('[class*="card"], [class*="Card"], [class*="product"], [class*="Product"]') || link;

      // Name - try multiple selectors
      const nameEl = card.querySelector('h2, h3, h4, [class*="name"], [class*="Name"], [class*="title"], [class*="Title"]');
      const name = nameEl?.textContent?.trim() || slug.replace(/-/g, " ");

      // Brand
      const brandEl = card.querySelector('[class*="brand"], [class*="Brand"], [class*="manufacturer"]');
      const brand = brandEl?.textContent?.trim() || "";

      // Price
      const priceEl = card.querySelector('[class*="price"], [class*="Price"]');
      const price = priceEl?.textContent?.trim() || null;

      // Original/sale price
      const origPriceEl = card.querySelector('[class*="original"], [class*="was"], [class*="strikethrough"], s, del');
      const originalPrice = origPriceEl?.textContent?.trim() || null;

      // Image
      const imgEl = card.querySelector("img");
      const imageUrl = imgEl?.src || imgEl?.getAttribute("data-src") || null;

      // Tags
      const tagEls = card.querySelectorAll('[class*="tag"], [class*="Tag"], [class*="badge"], [class*="Badge"], [class*="chip"]');
      const tags = Array.from(tagEls).map((t) => t.textContent?.trim() || "").filter(Boolean);

      products.push({
        name,
        brand,
        slug,
        price,
        originalPrice,
        imageUrl,
        detailUrl: href,
        tags,
        category: cat,
      });
    });

    return products;
  }, category);
}

async function scrapeCategory(page: Page, category: CategoryConfig): Promise<RawProduct[]> {
  const url = `${BASE_URL}${category.path}`;
  log(category.name, `Navigating to ${url}`);

  await withRetry(async () => {
    await page.goto(url, { waitUntil: "networkidle", timeout: 60000 });
  }, `Navigate to ${category.name}`);

  // Wait for content to load
  await sleep(2000);

  // Scroll to load all products
  log(category.name, "Scrolling to load all products...");
  await scrollToBottom(page, category.name);

  // Extract products
  const products = await extractProducts(page, category.name);
  log(category.name, `Found ${products.length} products`);

  // Enforce safety cap
  if (products.length > LIMITS.maxItemsPerCategory) {
    log(category.name, `Capping at ${LIMITS.maxItemsPerCategory} items`);
    return products.slice(0, LIMITS.maxItemsPerCategory);
  }

  return products;
}

export async function scrapeAllListings(): Promise<void> {
  log("listings", "Starting listing scraper...");
  const outDir = path.resolve(CHECKPOINT_DIR);
  if (!fs.existsSync(outDir)) fs.mkdirSync(outDir, { recursive: true });

  // Check discovery report for method hints
  const discoveryPath = path.join(outDir, "_discovery.json");
  let discovery: DiscoveryReport | null = null;
  if (fs.existsSync(discoveryPath)) {
    discovery = JSON.parse(fs.readFileSync(discoveryPath, "utf-8"));
    log("listings", `Using discovery method: ${discovery!.method}`);
  }

  const { context, page } = await createPage();

  try {
    for (const category of CATEGORIES) {
      const checkpointFile = path.join(outDir, `${category.name}-listings.json`);

      // Skip if checkpoint exists
      if (fs.existsSync(checkpointFile)) {
        const existing = JSON.parse(fs.readFileSync(checkpointFile, "utf-8"));
        log(category.name, `Checkpoint exists with ${existing.length} items, skipping`);
        continue;
      }

      try {
        const products = await scrapeCategory(page, category);

        // Save checkpoint
        fs.writeFileSync(checkpointFile, JSON.stringify(products, null, 2));
        log(category.name, `Saved ${products.length} listings to ${checkpointFile}`);
      } catch (error) {
        logError(category.name, `Failed to scrape: ${error instanceof Error ? error.message : String(error)}`);
      }

      // Delay between categories
      await sleep(randomDelay(DELAYS.betweenCategories));
    }
  } finally {
    await context.close();
    await closeBrowser();
  }

  log("listings", "Listing scraper complete");
}

// Run directly
if (require.main === module) {
  scrapeAllListings().catch(console.error);
}
