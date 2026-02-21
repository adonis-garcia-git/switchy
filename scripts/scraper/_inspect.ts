import { chromium } from "playwright";

(async () => {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage({ viewport: { width: 1920, height: 1080 } });

  await page.addInitScript(() => {
    Object.defineProperty(navigator, "webdriver", { get: () => false });
  });

  // Go to switches page
  console.log("Navigating to /switches...");
  await page.goto("https://keeb-finder.com/switches", { waitUntil: "domcontentloaded", timeout: 60000 });
  await new Promise((r) => setTimeout(r, 5000));

  // Get the page HTML structure for product cards
  const analysis = await page.evaluate(() => {
    // Find all links to individual switch pages
    const allLinks = Array.from(document.querySelectorAll("a"));
    const switchLinks = allLinks.filter((a) => {
      const href = a.getAttribute("href") || "";
      // Match /switches/some-slug but NOT /switches/filter/*
      return /^\/switches\/[a-z0-9]/.test(href) && href.indexOf("filter") === -1;
    });

    // Analyze first card DOM structure
    const firstLink = switchLinks[0];
    if (!firstLink) return { error: "No switch links found", totalLinks: allLinks.length };

    // Get the outerHTML of the card (walk up to find container)
    let el: HTMLElement | null = firstLink as HTMLElement;
    let cardHTML = "";
    // Walk up a few levels to find the card wrapper
    for (let i = 0; i < 5; i++) {
      if (el && el.parentElement) {
        el = el.parentElement;
      }
    }
    cardHTML = el?.innerHTML?.slice(0, 3000) || "";

    // Get all text in the first link/card area
    const linkText = firstLink.textContent?.trim().slice(0, 500) || "";

    // Look for patterns in the grid container
    const gridParent = firstLink.closest('[class*="grid"], [class*="Grid"], [class*="list"], [class*="List"]');
    const gridClasses = gridParent?.className || "no-grid-found";
    const gridChildCount = gridParent?.children.length || 0;

    // Sample a few cards
    const samples = switchLinks.slice(0, 5).map((link) => {
      const card = link.closest("div") || link;
      return {
        href: link.getAttribute("href"),
        text: card.textContent?.trim().slice(0, 200) || "",
        imgSrc: card.querySelector("img")?.getAttribute("src")?.slice(0, 100) || null,
        classes: (card as HTMLElement).className?.slice(0, 100) || "",
      };
    });

    // Check for pagination
    const paginationEls = document.querySelectorAll(
      'a[href*="page"], button[class*="page"], [class*="pagination"], [class*="Pagination"], [class*="load-more"], [class*="LoadMore"], nav[aria-label*="page"]'
    );

    // Check total count indicators
    const countEls = Array.from(document.querySelectorAll("*")).filter((el) => {
      const text = el.textContent || "";
      return /\d+\s*(results|switches|products|items|found)/i.test(text) && el.children.length < 3;
    });
    const countTexts = countEls.slice(0, 3).map((el) => el.textContent?.trim().slice(0, 100) || "");

    return {
      switchLinkCount: switchLinks.length,
      gridClasses,
      gridChildCount,
      paginationCount: paginationEls.length,
      countTexts,
      samples,
      firstCardHTML: cardHTML.slice(0, 2000),
    };
  });

  console.log(JSON.stringify(analysis, null, 2));

  // Also check if there's pagination or a "show more" button
  console.log("\n--- Checking for load more / pagination ---");
  const paginationInfo = await page.evaluate(() => {
    const buttons = Array.from(document.querySelectorAll("button"));
    const loadMoreBtns = buttons.filter((b) => {
      const text = b.textContent?.toLowerCase() || "";
      return text.includes("load") || text.includes("more") || text.includes("show") || text.includes("next");
    });
    return {
      buttonTexts: loadMoreBtns.map((b) => b.textContent?.trim().slice(0, 100)),
      totalButtons: buttons.length,
    };
  });
  console.log(JSON.stringify(paginationInfo, null, 2));

  // Check the URL structure and page title
  console.log("\n--- Page title & meta ---");
  const title = await page.title();
  console.log("Title:", title);

  await browser.close();
})();
