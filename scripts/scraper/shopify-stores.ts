import * as fs from "fs";
import * as path from "path";
import { CHECKPOINT_DIR } from "./config";
import { log, logError, sleep, parsePrice, slugify } from "./utils";
import { NormalizedSwitch, NormalizedKeyboard, NormalizedProduct, NormalizedVendorLink } from "./types";

// Store definitions
const SHOPIFY_STORES = [
  { domain: "divinikey.com", name: "Divinikey", focus: "switches" },
  { domain: "www.novelkeys.com", name: "NovelKeys", focus: "mixed" },
  { domain: "cannonkeys.com", name: "CannonKeys", focus: "mixed" },
  { domain: "hippokeys.com", name: "HippoKeys", focus: "switches" },
  { domain: "kbdfans.com", name: "KBDfans", focus: "mixed" },
  { domain: "www.keychron.com", name: "Keychron", focus: "keyboards" },
  { domain: "dangkeebs.com", name: "DangKeebs", focus: "switches" },
  { domain: "mekibo.com", name: "Mekibo", focus: "switches" },
  { domain: "bolsakeyboardsupply.com", name: "Bolsa Supply", focus: "switches" },
  { domain: "typeractive.xyz", name: "Typeractive", focus: "switches" },
  { domain: "prevailkeyco.com", name: "Prevail Key Co", focus: "switches" },
  { domain: "ashkeebs.com", name: "AshKeebs", focus: "switches" },
];

interface ShopifyProduct {
  id: number;
  title: string;
  handle: string;
  vendor: string;
  product_type: string;
  body_html: string;
  tags: string[];
  variants: { price: string; compare_at_price: string | null; available: boolean }[];
  images: { src: string }[];
}

// Fetch all products from a Shopify store
async function fetchStore(domain: string, storeName: string): Promise<ShopifyProduct[]> {
  const allProducts: ShopifyProduct[] = [];
  let page = 1;

  while (true) {
    const url = `https://${domain}/products.json?limit=250&page=${page}`;
    log("shopify", `Fetching ${storeName} page ${page}...`);

    try {
      const response = await fetch(url);
      if (!response.ok) {
        logError("shopify", `${storeName} page ${page}: HTTP ${response.status}`);
        break;
      }
      const data = await response.json();
      const products = data.products || [];
      if (products.length === 0) break;
      allProducts.push(...products);
      log("shopify", `${storeName} page ${page}: ${products.length} products (total: ${allProducts.length})`);
      page++;
      // Rate limiting - be polite
      await sleep(500);
    } catch (error) {
      logError("shopify", `${storeName} page ${page}: ${error instanceof Error ? error.message : String(error)}`);
      break;
    }
  }

  return allProducts;
}

// Determine if a Shopify product is a switch
function isSwitch(product: ShopifyProduct): boolean {
  const type = product.product_type.toLowerCase();
  const tags = product.tags.map(t => typeof t === 'string' ? t.toLowerCase() : '');
  const title = product.title.toLowerCase();

  return (
    type.includes("switch") ||
    tags.some(t => t.includes("switch") && !t.includes("nintendo")) ||
    (title.includes("switch") && !title.includes("nintendo") && !title.includes("joy-con"))
  );
}

// Determine if a Shopify product is a keyboard
function isKeyboard(product: ShopifyProduct): boolean {
  const type = product.product_type.toLowerCase();
  const tags = product.tags.map(t => typeof t === 'string' ? t.toLowerCase() : '');

  return (
    type.includes("keyboard") ||
    type.includes("kit") ||
    type.includes("barebones") ||
    tags.some(t => t.includes("keyboard") || t.includes("kit"))
  );
}

// Parse switch specs from body_html
function parseSwitchSpecs(html: string): Partial<NormalizedSwitch> {
  const specs: Partial<NormalizedSwitch> = {};
  if (!html) return specs;

  // Strip HTML tags for easier parsing
  const text = html.replace(/<[^>]+>/g, '\n').replace(/&amp;/g, '&').replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&#39;/g, "'").replace(/&quot;/g, '"').replace(/&nbsp;/g, ' ');

  // Actuation force
  const actuationMatch = text.match(/actuation[:\s]*(\d+(?:\.\d+)?)\s*g/i)
    || text.match(/operating\s*force[:\s]*(\d+(?:\.\d+)?)\s*g/i);
  if (actuationMatch) specs.actuationForceG = parseFloat(actuationMatch[1]);

  // Bottom-out force
  const bottomMatch = text.match(/bottom[\s-]*out[:\s]*(\d+(?:\.\d+)?)\s*g/i);
  if (bottomMatch) specs.bottomOutForceG = parseFloat(bottomMatch[1]);

  // Pre-travel / actuation point
  const pretravelMatch = text.match(/pre[\s-]*travel[:\s]*(\d+(?:\.\d+)?)\s*(?:±[\d.]+\s*)?mm/i)
    || text.match(/actuation\s*(?:point|distance)[:\s]*(\d+(?:\.\d+)?)\s*mm/i);
  if (pretravelMatch) specs.actuationMm = parseFloat(pretravelMatch[1]);

  // Total travel
  const travelMatch = text.match(/total\s*travel[:\s]*(\d+(?:\.\d+)?)\s*(?:±[\d.]+\s*)?mm/i)
    || text.match(/travel\s*distance[:\s]*(\d+(?:\.\d+)?)\s*mm/i);
  if (travelMatch) specs.totalTravelMm = parseFloat(travelMatch[1]);

  // Stem material
  const stemMatch = text.match(/stem[:\s]*([A-Za-z0-9\s]+(?:POM|Nylon|UHMWPE|Polycarbonate|PC))/i)
    || text.match(/stem\s*(?:material)?[:\s]*((?:Hardened\s+)?(?:POM|Nylon|UHMWPE|Polycarbonate|PC|LY|P3|HPE)[A-Za-z0-9\s]*)/i);
  if (stemMatch) specs.stemMaterial = stemMatch[1].trim();

  // Housing materials
  const topHousingMatch = text.match(/top\s*housing[:\s]*([^\n<,]+)/i);
  const bottomHousingMatch = text.match(/bottom\s*housing[:\s]*([^\n<,]+)/i);
  const housingMatch = text.match(/housing[:\s]*([^\n<,]+)/i);
  if (topHousingMatch && bottomHousingMatch) {
    specs.housingMaterial = `${topHousingMatch[1].trim()} / ${bottomHousingMatch[1].trim()}`;
  } else if (housingMatch) {
    specs.housingMaterial = housingMatch[1].trim();
  }

  // Spring type
  const springMatch = text.match(/spring[:\s]*([^\n<]+)/i);
  if (springMatch) specs.springType = springMatch[1].trim().slice(0, 100);

  // Factory lubed
  const lubedText = text.toLowerCase();
  if (lubedText.includes('factory lubed') || lubedText.includes('pre-lubed') || /\blubed\b/.test(lubedText)) {
    specs.factoryLubed = true;
  } else if (lubedText.includes('unlubed') || lubedText.includes('not lubed')) {
    specs.factoryLubed = false;
  }

  // Long pole
  if (/long[\s-]*pole/i.test(text)) {
    specs.longPole = true;
  }

  return specs;
}

// Infer switch type from tags, title, body
function inferSwitchType(product: ShopifyProduct): "linear" | "tactile" | "clicky" {
  const combined = `${product.title} ${product.tags.join(' ')} ${product.product_type}`.toLowerCase();
  if (combined.includes('tactile')) return 'tactile';
  if (combined.includes('clicky') || combined.includes('click')) return 'clicky';
  return 'linear'; // default
}

// Convert a Shopify switch product to our normalized format
function shopifyToSwitch(product: ShopifyProduct, storeDomain: string): NormalizedSwitch {
  const specs = parseSwitchSpecs(product.body_html || '');
  const price = parseFloat(product.variants[0]?.price || '0');

  // Calculate per-switch price from pack price
  // Many stores sell in packs of 10, 36, 70, 90, etc.
  // Try to detect from title or tags
  let perSwitchPrice = price;
  const packMatch = product.title.match(/(\d+)\s*(?:pack|pcs|pieces|count|switches|switch)/i)
    || (product.body_html || '').match(/(\d+)\s*(?:included|per pack|switches per|in each pack)/i);

  // Also check for "Price: $X.XX per switch" in body
  const perSwitchMatch = (product.body_html || '').match(/\$?([\d.]+)\s*per\s*switch/i);
  if (perSwitchMatch) {
    perSwitchPrice = parseFloat(perSwitchMatch[1]);
  } else if (packMatch) {
    const packSize = parseInt(packMatch[1]);
    if (packSize >= 10 && price > 1) {
      perSwitchPrice = Math.round((price / packSize) * 100) / 100;
    }
  }

  const sw: NormalizedSwitch = {
    brand: product.vendor || 'Unknown',
    name: product.title.replace(/\s*switches?\s*$/i, '').replace(/\s*[-–]\s*\d+\s*pack\s*$/i, '').trim(),
    slug: product.handle,
    type: inferSwitchType(product),
    actuationForceG: specs.actuationForceG ?? 0,
    actuationMm: specs.actuationMm ?? 0,
    totalTravelMm: specs.totalTravelMm ?? 0,
    pricePerSwitch: perSwitchPrice,
  };

  if (specs.bottomOutForceG) sw.bottomOutForceG = specs.bottomOutForceG;
  if (specs.stemMaterial) sw.stemMaterial = specs.stemMaterial;
  if (specs.housingMaterial) sw.housingMaterial = specs.housingMaterial;
  if (specs.springType) sw.springType = specs.springType;
  if (specs.factoryLubed != null) sw.factoryLubed = specs.factoryLubed;
  if (specs.longPole != null) sw.longPole = specs.longPole;
  if (product.images[0]?.src) sw.imageUrl = product.images[0].src;
  sw.productUrl = `https://${storeDomain}/products/${product.handle}`;

  return sw;
}

// Parse keyboard specs from body_html
function parseKeyboardSpecs(html: string, product: ShopifyProduct): Partial<NormalizedKeyboard> {
  const specs: Partial<NormalizedKeyboard> = {};
  if (!html) return specs;
  const text = html.replace(/<[^>]+>/g, '\n').replace(/&amp;/g, '&').replace(/&nbsp;/g, ' ');
  const tags = product.tags.map(t => typeof t === 'string' ? t.toLowerCase() : '');
  const combined = `${text} ${tags.join(' ')}`.toLowerCase();

  // Size/layout
  const sizeMatch = text.match(/(100%|full[\s-]*size|96%|1800|tkl|tenkeyless|80%|75%|65%|60%|40%|numpad|macro\s*pad)/i);
  if (sizeMatch) specs.size = sizeMatch[1].trim();

  // Case material
  const caseMatch = text.match(/case\s*material[:\s]*([^\n<]+)/i);
  if (caseMatch) specs.caseMaterial = caseMatch[1].trim();

  // Plate material
  const plateMatch = text.match(/plate\s*material[:\s]*([^\n<]+)/i) || text.match(/plate[:\s]*(aluminum|aluminium|brass|polycarbonate|PC|FR4|steel|carbon fiber|POM)/i);
  if (plateMatch) specs.plateMaterial = plateMatch[1].trim();

  // Mounting style
  const mountMatch = text.match(/mount(?:ing)?\s*(?:style|type)?[:\s]*(gasket|tray|top|bottom|sandwich|burger|plateless|o-ring|leaf[\s-]*spring|tadpole)/i);
  if (mountMatch) specs.mountingStyle = mountMatch[1].trim();

  // Booleans from tags/text
  specs.hotSwap = combined.includes('hot-swap') || combined.includes('hotswap') || combined.includes('hot swap');
  specs.wireless = combined.includes('wireless') || combined.includes('bluetooth') || combined.includes('2.4g');
  specs.rgb = combined.includes('rgb') || combined.includes('per-key led') || combined.includes('backlit');
  specs.knob = combined.includes('knob') || combined.includes('rotary encoder');
  specs.qmkVia = combined.includes('qmk') || combined.includes('via');

  // Connectivity
  if (combined.includes('tri-mode') || combined.includes('trimode')) specs.connectivityType = 'Tri-mode (USB/BT/2.4G)';
  else if (combined.includes('dual-mode') || combined.includes('bluetooth') && combined.includes('wired')) specs.connectivityType = 'Dual-mode (USB/BT)';
  else if (combined.includes('wireless')) specs.connectivityType = 'Wireless';
  else specs.connectivityType = 'Wired';

  // Battery
  const batteryMatch = text.match(/battery[:\s]*(\d+\s*mAh)/i);
  if (batteryMatch) specs.batteryCapacity = batteryMatch[1];

  // Weight
  const weightMatch = text.match(/weight[:\s]*([\d.]+\s*(?:g|kg|lbs?))/i);
  if (weightMatch) specs.weight = weightMatch[1];

  return specs;
}

// Convert a Shopify keyboard product to our normalized format
function shopifyToKeyboard(product: ShopifyProduct, storeDomain: string): NormalizedKeyboard {
  const specs = parseKeyboardSpecs(product.body_html || '', product);
  const price = parseFloat(product.variants[0]?.price || '0');

  const kb: NormalizedKeyboard = {
    brand: product.vendor || 'Unknown',
    name: product.title,
    slug: product.handle,
    size: specs.size || 'Unknown',
    caseMaterial: specs.caseMaterial || 'Unknown',
    hotSwap: specs.hotSwap ?? false,
    wireless: specs.wireless ?? false,
    rgb: specs.rgb ?? false,
    priceUsd: price,
  };

  if (specs.mountingStyle) kb.mountingStyle = specs.mountingStyle;
  if (specs.plateMaterial) kb.plateMaterial = specs.plateMaterial;
  if (product.images[0]?.src) kb.imageUrl = product.images[0].src;
  kb.productUrl = `https://${storeDomain}/products/${product.handle}`;
  if (specs.connectivityType) kb.connectivityType = specs.connectivityType;
  if (specs.batteryCapacity) kb.batteryCapacity = specs.batteryCapacity;
  if (specs.weight) kb.weight = specs.weight;
  if (specs.knob) kb.knob = specs.knob;
  if (specs.qmkVia) kb.qmkVia = specs.qmkVia;

  return kb;
}

// Convert to generic product
function shopifyToProduct(product: ShopifyProduct, storeDomain: string, category: string): NormalizedProduct {
  const price = parseFloat(product.variants[0]?.price || '0');
  return {
    category,
    brand: product.vendor || 'Unknown',
    name: product.title,
    slug: product.handle,
    priceUsd: price > 0 ? price : undefined,
    imageUrl: product.images[0]?.src,
    productUrl: `https://${storeDomain}/products/${product.handle}`,
    tags: product.tags.filter(t => typeof t === 'string'),
    inStock: product.variants.some(v => v.available),
    sourceUrl: `https://${storeDomain}/products/${product.handle}`,
  };
}

// Categorize product type
function categorizeProduct(product: ShopifyProduct): string {
  const type = product.product_type.toLowerCase();
  const tags = product.tags.map(t => typeof t === 'string' ? t.toLowerCase() : '').join(' ');
  const title = product.title.toLowerCase();
  const combined = `${type} ${tags} ${title}`;

  if (combined.includes('keycap')) return 'keycaps';
  if (combined.includes('stabilizer') || combined.includes('stab')) return 'stabilizers';
  if (combined.includes('lube') || combined.includes('lubricant') || combined.includes('krytox') || combined.includes('tribosys')) return 'lubricants';
  if (combined.includes('deskmat') || combined.includes('desk mat') || combined.includes('mousepad')) return 'deskmats';
  if (combined.includes('cable') || combined.includes('coiled')) return 'cables';
  if (combined.includes('artisan')) return 'artisan-keycaps';
  if (combined.includes('mouse') || combined.includes('mice')) return 'mice';
  if (combined.includes('wrist') || combined.includes('rest')) return 'wrist-rests';
  return 'accessories';
}

// Extract vendor links from products
function extractVendorLink(product: ShopifyProduct, storeDomain: string, storeName: string, productType: string): NormalizedVendorLink {
  const price = parseFloat(product.variants[0]?.price || '0');
  return {
    productType,
    productName: product.title,
    vendor: storeName,
    url: `https://${storeDomain}/products/${product.handle}`,
    ...(price > 0 && { price }),
  };
}

// Main export: fetch all stores and return categorized data
export async function fetchAllShopifyStores(): Promise<{
  switches: NormalizedSwitch[];
  keyboards: NormalizedKeyboard[];
  products: NormalizedProduct[];
  vendorLinks: NormalizedVendorLink[];
}> {
  const allSwitches: NormalizedSwitch[] = [];
  const allKeyboards: NormalizedKeyboard[] = [];
  const allProducts: NormalizedProduct[] = [];
  const allVendorLinks: NormalizedVendorLink[] = [];

  const outDir = path.resolve(CHECKPOINT_DIR);
  if (!fs.existsSync(outDir)) fs.mkdirSync(outDir, { recursive: true });

  for (const store of SHOPIFY_STORES) {
    const cacheFile = path.join(outDir, `shopify-${store.domain.replace(/\./g, '-')}.json`);

    let products: ShopifyProduct[];
    if (fs.existsSync(cacheFile)) {
      log("shopify", `Loading cached ${store.name} (${cacheFile})`);
      products = JSON.parse(fs.readFileSync(cacheFile, "utf-8"));
    } else {
      products = await fetchStore(store.domain, store.name);
      if (products.length > 0) {
        fs.writeFileSync(cacheFile, JSON.stringify(products));
        log("shopify", `Cached ${products.length} products from ${store.name}`);
      }
      // Delay between stores
      await sleep(1000);
    }

    log("shopify", `Processing ${products.length} products from ${store.name}...`);

    for (const product of products) {
      if (isSwitch(product)) {
        const sw = shopifyToSwitch(product, store.domain);
        allSwitches.push(sw);
        allVendorLinks.push(extractVendorLink(product, store.domain, store.name, 'switch'));
      } else if (isKeyboard(product)) {
        const kb = shopifyToKeyboard(product, store.domain);
        allKeyboards.push(kb);
        allVendorLinks.push(extractVendorLink(product, store.domain, store.name, 'keyboard'));
      } else {
        const category = categorizeProduct(product);
        allProducts.push(shopifyToProduct(product, store.domain, category));
        allVendorLinks.push(extractVendorLink(product, store.domain, store.name, category === 'keycaps' ? 'keycaps' : category === 'stabilizers' ? 'stabilizer' : 'accessory'));
      }
    }

    log("shopify", `${store.name}: ${allSwitches.length} switches, ${allKeyboards.length} keyboards, ${allProducts.length} other products`);
  }

  return { switches: allSwitches, keyboards: allKeyboards, products: allProducts, vendorLinks: allVendorLinks };
}
