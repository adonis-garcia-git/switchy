import { createPage, closeBrowser } from "./browser";
import { BASE_URL } from "./config";
import { log, logError } from "./utils";
import { DiscoveryReport } from "./types";
import * as fs from "fs";
import * as path from "path";

async function discover(): Promise<DiscoveryReport> {
  const report: DiscoveryReport = {
    method: "dom-scraping",
    notes: [],
  };

  log("discovery", "Starting API discovery...");
  const { context, page } = await createPage();

  try {
    // Intercept network requests to find API calls
    const apiCalls: { url: string; method: string }[] = [];
    page.on("response", (response) => {
      const url = response.url();
      const ct = response.headers()["content-type"] || "";
      if (ct.includes("application/json") && !url.includes("_next/static")) {
        apiCalls.push({ url, method: response.request().method() });
      }
    });

    log("discovery", "Navigating to /switches...");
    await page.goto(`${BASE_URL}/switches`, { waitUntil: "networkidle", timeout: 30000 });

    // Check for __NEXT_DATA__
    const nextData = await page.evaluate(() => {
      const el = document.getElementById("__NEXT_DATA__");
      if (el) {
        try {
          const data = JSON.parse(el.textContent || "{}");
          return { found: true, buildId: data.buildId, hasProps: !!data.props };
        } catch {
          return { found: true, buildId: null, hasProps: false };
        }
      }
      return { found: false, buildId: null, hasProps: false };
    });

    if (nextData.found) {
      report.notes.push("Found __NEXT_DATA__ script tag");
      if (nextData.buildId) {
        report.buildId = nextData.buildId;
        report.method = "next-data";
        report.notes.push(`Build ID: ${nextData.buildId}`);
        log("discovery", `Found Next.js build ID: ${nextData.buildId}`);
      }
      if (nextData.hasProps) {
        report.notes.push("__NEXT_DATA__ contains props with page data");
      }
    } else {
      report.notes.push("No __NEXT_DATA__ found");
    }

    // Check intercepted API calls
    if (apiCalls.length > 0) {
      report.notes.push(`Found ${apiCalls.length} JSON API calls:`);
      for (const call of apiCalls.slice(0, 10)) {
        report.notes.push(`  ${call.method} ${call.url}`);
      }
    } else {
      report.notes.push("No JSON API calls detected");
    }

    // Try _next/data route if we have buildId
    if (nextData.buildId) {
      try {
        const dataUrl = `${BASE_URL}/_next/data/${nextData.buildId}/switches.json`;
        const resp = await page.goto(dataUrl, { timeout: 10000 });
        if (resp && resp.status() === 200) {
          report.method = "api";
          report.notes.push(`_next/data route works: ${dataUrl}`);
          log("discovery", "Next.js data route is accessible!");
        }
      } catch {
        report.notes.push("_next/data route not accessible");
      }
    }

    // Check page structure for DOM scraping hints
    const pageStructure = await page.evaluate(() => {
      const cards = document.querySelectorAll('[class*="card"], [class*="Card"], [class*="product"], [class*="Product"], a[href*="/switches/"]');
      const links = document.querySelectorAll('a[href*="/switches/"]');
      return {
        cardCount: cards.length,
        linkCount: links.length,
        sampleLinks: Array.from(links).slice(0, 5).map((l) => (l as HTMLAnchorElement).href),
        bodyClasses: document.body.className,
        hasInfiniteScroll: !!document.querySelector('[class*="infinite"], [class*="load-more"], [data-infinite]'),
      };
    });

    report.notes.push(`DOM structure: ${pageStructure.cardCount} card-like elements, ${pageStructure.linkCount} product links`);
    if (pageStructure.sampleLinks.length > 0) {
      report.notes.push(`Sample links: ${pageStructure.sampleLinks.join(", ")}`);
    }
    report.sampleData = pageStructure;

    // Default recommendation
    if (report.method === "dom-scraping") {
      report.notes.push("Recommendation: Use DOM scraping with infinite scroll handling");
    }

  } catch (error) {
    logError("discovery", `Discovery failed: ${error instanceof Error ? error.message : String(error)}`);
    report.notes.push(`Error during discovery: ${error instanceof Error ? error.message : String(error)}`);
  } finally {
    await context.close();
    await closeBrowser();
  }

  // Save report
  const outDir = path.resolve("src/data/scraped");
  if (!fs.existsSync(outDir)) fs.mkdirSync(outDir, { recursive: true });
  fs.writeFileSync(
    path.join(outDir, "_discovery.json"),
    JSON.stringify(report, null, 2)
  );

  log("discovery", "Discovery complete. Report saved to src/data/scraped/_discovery.json");
  console.log("\n=== Discovery Report ===");
  console.log(`Recommended method: ${report.method}`);
  for (const note of report.notes) {
    console.log(`  ${note}`);
  }

  return report;
}

discover().catch(console.error);
