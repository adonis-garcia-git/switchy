#!/usr/bin/env node

import puppeteer from "puppeteer";
import { readdirSync, mkdirSync, existsSync } from "fs";
import { join } from "path";

const args = process.argv.slice(2);
const isRef = args.includes("--ref");
const positional = args.filter((a) => a !== "--ref");
const url = positional[0];
const label = positional[1] || "";

if (!url) {
  console.error(
    "Usage: node screenshot.mjs <url> [label] [--ref]\n\n  --ref   Save to references/ instead of screenshots/"
  );
  process.exit(1);
}

const folder = isRef ? "references" : "screenshots";
const prefix = isRef ? "ref" : "screenshot";
const dir = join(process.cwd(), folder);
if (!existsSync(dir)) mkdirSync(dir, { recursive: true });

// Auto-increment number
const existing = readdirSync(dir).filter((f) => f.startsWith(`${prefix}-`));
let maxNum = 0;
for (const f of existing) {
  const match = f.match(new RegExp(`^${prefix}-(\\d+)`));
  if (match) maxNum = Math.max(maxNum, parseInt(match[1], 10));
}
const num = maxNum + 1;

const suffix = label ? `-${label}` : "";
const filename = `${prefix}-${num}${suffix}.png`;
const filepath = join(dir, filename);

const browser = await puppeteer.launch({ headless: true });
const page = await browser.newPage();
await page.setViewport({ width: 1440, height: 900 });
await page.goto(url, { waitUntil: "networkidle2", timeout: 30000 });
await page.screenshot({ path: filepath, fullPage: true });
await browser.close();

console.log(`Saved: ${folder}/${filename}`);
