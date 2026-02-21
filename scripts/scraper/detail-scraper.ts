import * as fs from "fs";
import * as path from "path";
import { Page } from "playwright";
import { createPage, closeBrowser } from "./browser";
import { BASE_URL, DELAYS, CHECKPOINT_DIR } from "./config";
import { RawProduct, RawSwitchDetail, RawKeyboardDetail, RawVendorLink } from "./types";
import { randomDelay, sleep, withRetry, log, logError, parsePrice, parseForce, parseDistance } from "./utils";

async function scrapeSwitchDetail(page: Page, product: RawProduct): Promise<RawSwitchDetail | null> {
  try {
    if (!product.detailUrl) return null;

    await withRetry(async () => {
      await page.goto(product.detailUrl!, { waitUntil: "networkidle", timeout: 30000 });
    }, `Switch detail: ${product.name}`);

    await sleep(1000);

    return await page.evaluate((prod) => {
      const getText = (selector: string): string | null => {
        const el = document.querySelector(selector);
        return el?.textContent?.trim() || null;
      };

      const getSpecValue = (label: string): string | null => {
        const allRows = document.querySelectorAll("tr, [class*='spec'], [class*='Spec'], dl dt, [class*='detail'], [class*='Detail']");
        for (const row of allRows) {
          if (row.textContent?.toLowerCase().includes(label.toLowerCase())) {
            const valueEl = row.querySelector("td:last-child, dd, [class*='value'], [class*='Value'], span:last-child");
            if (valueEl) return valueEl.textContent?.trim() || null;
            // If the label is in a dt, get the next dd
            if (row.tagName === "DT") {
              const dd = row.nextElementSibling;
              if (dd?.tagName === "DD") return dd.textContent?.trim() || null;
            }
          }
        }
        return null;
      };

      // Extract vendor links
      const vendorLinks: { vendor: string; url: string; price: number | null; productName: string; productType: string }[] = [];
      const buyLinks = document.querySelectorAll('a[href*="vendor"], a[class*="buy"], a[class*="Buy"], a[class*="shop"], a[class*="Shop"], a[rel="nofollow"]');
      buyLinks.forEach((link) => {
        const a = link as HTMLAnchorElement;
        if (a.href && !a.href.includes("keeb-finder.com")) {
          const priceEl = a.closest("[class*='price'], [class*='Price']") || a.querySelector("[class*='price']");
          vendorLinks.push({
            vendor: new URL(a.href).hostname.replace("www.", ""),
            url: a.href,
            price: null,
            productName: prod.name,
            productType: "switch",
          });
        }
      });

      // Extract images
      const images = Array.from(document.querySelectorAll("img"))
        .map((img) => img.src || img.getAttribute("data-src"))
        .filter((src): src is string => !!src && !src.includes("logo") && !src.includes("icon"))
        .slice(0, 10);

      return {
        name: prod.name,
        brand: prod.brand,
        slug: prod.slug,
        type: getSpecValue("type") || getSpecValue("switch type") || "",
        actuationForceG: null,
        bottomOutForceG: null,
        actuationMm: null,
        totalTravelMm: null,
        stemMaterial: getSpecValue("stem") || getSpecValue("stem material"),
        housingMaterial: getSpecValue("housing") || getSpecValue("housing material"),
        springType: getSpecValue("spring") || getSpecValue("spring type"),
        factoryLubed: null,
        longPole: null,
        pricePerSwitch: null,
        imageUrl: images[0] || prod.imageUrl,
        imageUrls: images,
        productUrl: prod.detailUrl,
        vendorLinks,
        tags: prod.tags,
      } as RawSwitchDetail;
    }, product);
  } catch (error) {
    logError("switch-detail", `Failed: ${product.name} - ${error instanceof Error ? error.message : String(error)}`);
    return null;
  }
}

async function scrapeKeyboardDetail(page: Page, product: RawProduct): Promise<RawKeyboardDetail | null> {
  try {
    if (!product.detailUrl) return null;

    await withRetry(async () => {
      await page.goto(product.detailUrl!, { waitUntil: "networkidle", timeout: 30000 });
    }, `Keyboard detail: ${product.name}`);

    await sleep(1000);

    return await page.evaluate((prod) => {
      const getSpecValue = (label: string): string | null => {
        const allRows = document.querySelectorAll("tr, [class*='spec'], [class*='Spec'], dl dt, [class*='detail'], [class*='Detail']");
        for (const row of allRows) {
          if (row.textContent?.toLowerCase().includes(label.toLowerCase())) {
            const valueEl = row.querySelector("td:last-child, dd, [class*='value'], [class*='Value'], span:last-child");
            if (valueEl) return valueEl.textContent?.trim() || null;
            if (row.tagName === "DT") {
              const dd = row.nextElementSibling;
              if (dd?.tagName === "DD") return dd.textContent?.trim() || null;
            }
          }
        }
        return null;
      };

      const hasTag = (keyword: string): boolean => {
        const text = document.body.textContent?.toLowerCase() || "";
        return text.includes(keyword.toLowerCase());
      };

      // Extract vendor links
      const vendorLinks: { vendor: string; url: string; price: number | null; productName: string; productType: string }[] = [];
      const buyLinks = document.querySelectorAll('a[rel="nofollow"], a[href*="vendor"], a[class*="buy"], a[class*="shop"]');
      buyLinks.forEach((link) => {
        const a = link as HTMLAnchorElement;
        if (a.href && !a.href.includes("keeb-finder.com")) {
          vendorLinks.push({
            vendor: new URL(a.href).hostname.replace("www.", ""),
            url: a.href,
            price: null,
            productName: prod.name,
            productType: "keyboard",
          });
        }
      });

      const images = Array.from(document.querySelectorAll("img"))
        .map((img) => img.src || img.getAttribute("data-src"))
        .filter((src): src is string => !!src && !src.includes("logo") && !src.includes("icon"))
        .slice(0, 10);

      return {
        name: prod.name,
        brand: prod.brand,
        slug: prod.slug,
        size: getSpecValue("size") || getSpecValue("layout") || getSpecValue("form factor"),
        caseMaterial: getSpecValue("case material") || getSpecValue("case"),
        plateMaterial: getSpecValue("plate material") || getSpecValue("plate"),
        mountingStyle: getSpecValue("mount") || getSpecValue("mounting"),
        hotSwap: hasTag("hot-swap") || hasTag("hotswap") || hasTag("hot swap"),
        wireless: hasTag("wireless") || hasTag("bluetooth") || hasTag("2.4g"),
        rgb: hasTag("rgb") || hasTag("backlight"),
        priceUsd: null,
        imageUrl: images[0] || prod.imageUrl,
        imageUrls: images,
        productUrl: prod.detailUrl,
        connectivityType: getSpecValue("connectivity") || getSpecValue("connection"),
        batteryCapacity: getSpecValue("battery"),
        weight: getSpecValue("weight"),
        knob: hasTag("knob") || hasTag("rotary"),
        qmkVia: hasTag("qmk") || hasTag("via"),
        hallEffect: hasTag("hall effect"),
        pollingRate: getSpecValue("polling rate"),
        vendorLinks,
        tags: prod.tags,
      } as RawKeyboardDetail;
    }, product);
  } catch (error) {
    logError("keyboard-detail", `Failed: ${product.name} - ${error instanceof Error ? error.message : String(error)}`);
    return null;
  }
}

export async function scrapeDetails(): Promise<void> {
  log("details", "Starting detail scraper...");
  const outDir = path.resolve(CHECKPOINT_DIR);

  const { context, page } = await createPage();

  try {
    // Scrape switch details
    const switchListingFile = path.join(outDir, "switches-listings.json");
    const switchDetailFile = path.join(outDir, "switches-details.json");

    if (fs.existsSync(switchListingFile) && !fs.existsSync(switchDetailFile)) {
      const listings: RawProduct[] = JSON.parse(fs.readFileSync(switchListingFile, "utf-8"));
      const details: RawSwitchDetail[] = [];
      const scraped = new Set<string>();

      log("details", `Scraping ${listings.length} switch details...`);
      for (let i = 0; i < listings.length; i++) {
        const product = listings[i];
        if (scraped.has(product.slug)) continue;

        const detail = await scrapeSwitchDetail(page, product);
        if (detail) {
          details.push(detail);
          scraped.add(product.slug);
        }

        // Checkpoint every 50
        if (details.length % 50 === 0 && details.length > 0) {
          fs.writeFileSync(switchDetailFile, JSON.stringify(details, null, 2));
          log("details", `Switch checkpoint: ${details.length}/${listings.length}`);
        }

        await sleep(randomDelay(DELAYS.betweenDetails));
      }

      fs.writeFileSync(switchDetailFile, JSON.stringify(details, null, 2));
      log("details", `Saved ${details.length} switch details`);
    } else if (fs.existsSync(switchDetailFile)) {
      log("details", "Switch details checkpoint exists, skipping");
    }

    // Scrape keyboard details
    const kbListingFile = path.join(outDir, "keyboards-listings.json");
    const kbDetailFile = path.join(outDir, "keyboards-details.json");

    if (fs.existsSync(kbListingFile) && !fs.existsSync(kbDetailFile)) {
      const listings: RawProduct[] = JSON.parse(fs.readFileSync(kbListingFile, "utf-8"));
      const details: RawKeyboardDetail[] = [];
      const scraped = new Set<string>();

      log("details", `Scraping ${listings.length} keyboard details...`);
      for (let i = 0; i < listings.length; i++) {
        const product = listings[i];
        if (scraped.has(product.slug)) continue;

        const detail = await scrapeKeyboardDetail(page, product);
        if (detail) {
          details.push(detail);
          scraped.add(product.slug);
        }

        if (details.length % 50 === 0 && details.length > 0) {
          fs.writeFileSync(kbDetailFile, JSON.stringify(details, null, 2));
          log("details", `Keyboard checkpoint: ${details.length}/${listings.length}`);
        }

        await sleep(randomDelay(DELAYS.betweenDetails));
      }

      fs.writeFileSync(kbDetailFile, JSON.stringify(details, null, 2));
      log("details", `Saved ${details.length} keyboard details`);
    } else if (fs.existsSync(kbDetailFile)) {
      log("details", "Keyboard details checkpoint exists, skipping");
    }
  } finally {
    await context.close();
    await closeBrowser();
  }

  log("details", "Detail scraper complete");
}

if (require.main === module) {
  scrapeDetails().catch(console.error);
}
