import * as fs from "fs";
import * as path from "path";
import { createPage, closeBrowser } from "./browser";
import { CHECKPOINT_DIR } from "./config";
import { log, logError, sleep } from "./utils";

export interface KeybumpsSwitch {
  name: string;
  type: string;
  operatingForce: string;
  sound: string;
  preTravel: string;
  totalTravel: string;
  mount: string;
  factoryLubed: string;
}

export async function scrapeKeybumps(): Promise<KeybumpsSwitch[]> {
  const cacheFile = path.join(path.resolve(CHECKPOINT_DIR), "keybumps-switches.json");

  if (fs.existsSync(cacheFile)) {
    log("keybumps", `Loading cached data from ${cacheFile}`);
    return JSON.parse(fs.readFileSync(cacheFile, "utf-8"));
  }

  log("keybumps", "Scraping keybumps.com/switch-list.html...");
  const { context, page } = await createPage();

  try {
    await page.goto("https://keybumps.com/switch-list.html", {
      waitUntil: "domcontentloaded",
      timeout: 30000,
    });

    // Wait for table/data to render
    await sleep(5000);

    // Try to accept cookies if dialog appears
    try {
      const acceptBtn = await page.$('button:has-text("Accept"), #accept-cookies');
      if (acceptBtn) await acceptBtn.click();
      await sleep(1000);
    } catch { /* no cookie dialog */ }

    // Extract table data
    const switches = await page.evaluate(() => {
      const results: {
        name: string;
        type: string;
        operatingForce: string;
        sound: string;
        preTravel: string;
        totalTravel: string;
        mount: string;
        factoryLubed: string;
      }[] = [];

      // Try to find the data table - could be <table> or a div-based grid
      const tables = document.querySelectorAll("table");
      for (const table of tables) {
        const rows = table.querySelectorAll("tr");
        for (let i = 1; i < rows.length; i++) {
          const cells = rows[i].querySelectorAll("td");
          if (cells.length >= 6) {
            results.push({
              name: cells[0]?.textContent?.trim() || "",
              type: cells[1]?.textContent?.trim() || "",
              operatingForce: cells[2]?.textContent?.trim() || "",
              sound: cells[3]?.textContent?.trim() || "",
              preTravel: cells[4]?.textContent?.trim() || "",
              totalTravel: cells[5]?.textContent?.trim() || "",
              mount: cells[6]?.textContent?.trim() || "",
              factoryLubed: cells[7]?.textContent?.trim() || "",
            });
          }
        }
      }

      // If no tables found, try div-based data grid
      if (results.length === 0) {
        // Look for DataTables or similar structure
        const dataRows = document.querySelectorAll('[role="row"], .dataTables_wrapper tr, .dataTable tr');
        for (const row of dataRows) {
          const cells = row.querySelectorAll('[role="cell"], td');
          if (cells.length >= 6) {
            results.push({
              name: cells[0]?.textContent?.trim() || "",
              type: cells[1]?.textContent?.trim() || "",
              operatingForce: cells[2]?.textContent?.trim() || "",
              sound: cells[3]?.textContent?.trim() || "",
              preTravel: cells[4]?.textContent?.trim() || "",
              totalTravel: cells[5]?.textContent?.trim() || "",
              mount: cells[6]?.textContent?.trim() || "",
              factoryLubed: cells[7]?.textContent?.trim() || "",
            });
          }
        }
      }

      return results;
    });

    log("keybumps", `Scraped ${switches.length} switches from Keybumps`);

    if (switches.length > 0) {
      const outDir = path.resolve(CHECKPOINT_DIR);
      if (!fs.existsSync(outDir)) fs.mkdirSync(outDir, { recursive: true });
      fs.writeFileSync(cacheFile, JSON.stringify(switches, null, 2));
    }

    return switches;
  } catch (error) {
    logError("keybumps", `Failed: ${error instanceof Error ? error.message : String(error)}`);
    return [];
  } finally {
    await context.close();
    await closeBrowser();
  }
}
