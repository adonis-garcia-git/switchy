import * as fs from "fs";
import * as path from "path";
import { CHECKPOINT_DIR, CATEGORIES } from "./config";
import {
  RawProduct,
  RawSwitchDetail,
  RawKeyboardDetail,
  NormalizedSwitch,
  NormalizedKeyboard,
  NormalizedProduct,
  NormalizedVendorLink,
  ScrapingMetadata,
} from "./types";
import { parsePrice, slugify, log, logError } from "./utils";

const BRAND_NORMALIZATIONS: Record<string, string> = {
  keychron: "Keychron",
  gateron: "Gateron",
  cherry: "Cherry",
  kailh: "Kailh",
  akko: "Akko",
  novelkeys: "NovelKeys",
  novelkey: "NovelKeys",
  "jwick/jwk": "JWK",
  jwk: "JWK",
  tecsee: "Tecsee",
  durock: "Durock",
  everglide: "Everglide",
  razer: "Razer",
  logitech: "Logitech",
  corsair: "Corsair",
  "hyper x": "HyperX",
  hyperx: "HyperX",
  wooting: "Wooting",
  glorious: "Glorious",
  ducky: "Ducky",
  leopold: "Leopold",
  varmilo: "Varmilo",
  iqunix: "IQUNIX",
  "kbd fans": "KBDfans",
  kbdfans: "KBDfans",
  hmx: "HMX",
  ttc: "TTC",
  outemu: "Outemu",
  wingtree: "Wingtree",
  geon: "Geon",
  leobog: "Leobog",
  wuque: "Wuque Studio",
  sp: "SP-Star",
  "sp-star": "SP-Star",
  jwick: "JWICK",
  bsun: "BSUN",
  dangkeebs: "DangKeebs",
  cannonkeys: "CannonKeys",
  kinetic: "Kinetic Labs",
  mode: "Mode",
  prevail: "Prevail",
  ks: "KS",
  nuphy: "NuPhy",
  epomaker: "Epomaker",
  yunzii: "Yunzii",
  feker: "Feker",
  royal: "Royal Kludge",
  rk: "Royal Kludge",
  skyloong: "Skyloong",
  cidoo: "Cidoo",
  monsgeek: "MonsGeek",
  fl: "FL",
  luminkey: "Luminkey",
  zoom: "Zoom",
  tofu: "Tofu",
  qk: "QK",
  kbd: "KBD",
  gmmk: "Glorious",
  womier: "Womier",
  lemokey: "Lemokey",
  aula: "Aula",
  redragon: "Redragon",
  velocifire: "Velocifire",
  idobao: "IDOBAO",
  flesports: "FL Esports",
};

/** Infer brand from the first word of the name/slug */
function inferBrand(name: string): string {
  const firstWord = name.split(/[\s-]+/)[0]?.toLowerCase() || "";
  return BRAND_NORMALIZATIONS[firstWord] || "";
}

/** Titlecase a product name, removing brand prefix */
function titleCaseName(rawName: string, brand: string): string {
  const brandLower = brand.toLowerCase();
  let name = rawName;
  // Remove brand prefix if present
  if (name.toLowerCase().startsWith(brandLower + " ")) {
    name = name.slice(brandLower.length + 1);
  } else if (name.toLowerCase().startsWith(brandLower + "-")) {
    name = name.slice(brandLower.length + 1);
  }
  // Title case each word
  return name
    .split(/[\s]+/)
    .map((w) => {
      // Keep acronyms uppercase
      if (/^[A-Z0-9]{2,}$/i.test(w) && w.length <= 4) return w.toUpperCase();
      // Preserve known patterns
      if (/^\d+g$/i.test(w)) return w.toLowerCase();
      if (/^\d+mm$/i.test(w)) return w.toLowerCase();
      return w.charAt(0).toUpperCase() + w.slice(1).toLowerCase();
    })
    .join(" ");
}

const TAG_NORMALIZATIONS: Record<string, string> = {
  "hot-swappable": "Hot-Swap",
  hotswap: "Hot-Swap",
  "hot swap": "Hot-Swap",
  "hot-swap": "Hot-Swap",
  hotswappable: "Hot-Swap",
  bluetooth: "Bluetooth",
  "2.4g": "2.4GHz Wireless",
  "2.4 ghz": "2.4GHz Wireless",
  wireless: "Wireless",
  rgb: "RGB",
  "per-key rgb": "RGB",
  backlit: "Backlit",
  "qmk/via": "QMK/VIA",
  qmk: "QMK",
  via: "VIA",
  "gasket mount": "Gasket Mount",
  gasket: "Gasket Mount",
  "tray mount": "Tray Mount",
  "top mount": "Top Mount",
};

function normalizeBrand(raw: string): string {
  if (!raw) return "Unknown";
  const lower = raw.toLowerCase().trim();
  return BRAND_NORMALIZATIONS[lower] || raw.trim().split(/\s+/).map((w) => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase()).join(" ");
}

function normalizeTag(raw: string): string {
  const lower = raw.toLowerCase().trim();
  return TAG_NORMALIZATIONS[lower] || raw.trim();
}

function normalizeSwitchType(raw: string): "linear" | "tactile" | "clicky" {
  const lower = raw.toLowerCase().trim();
  if (lower.includes("linear") || lower.includes("silent linear")) return "linear";
  if (lower.includes("tactile")) return "tactile";
  if (lower.includes("clicky") || lower.includes("click")) return "clicky";
  return "linear"; // Default fallback
}

function normalizeSwitches(listings: RawProduct[], details: RawSwitchDetail[]): NormalizedSwitch[] {
  const detailMap = new Map<string, RawSwitchDetail>();
  for (const d of details) {
    detailMap.set(d.slug, d);
  }

  const seen = new Set<string>();
  const normalized: NormalizedSwitch[] = [];

  const allItems = [...details.map((d) => ({ ...d, fromDetail: true }))];

  // Add listings that don't have details
  for (const listing of listings) {
    if (!detailMap.has(listing.slug)) {
      allItems.push({
        name: listing.name,
        brand: listing.brand,
        slug: listing.slug,
        type: "",
        actuationForceG: null,
        bottomOutForceG: null,
        actuationMm: null,
        totalTravelMm: null,
        stemMaterial: null,
        housingMaterial: null,
        springType: null,
        factoryLubed: null,
        longPole: null,
        pricePerSwitch: parsePrice(listing.price),
        imageUrl: listing.imageUrl,
        imageUrls: listing.imageUrl ? [listing.imageUrl] : [],
        productUrl: listing.detailUrl,
        vendorLinks: [],
        tags: listing.tags,
        fromDetail: false,
      });
    }
  }

  for (const item of allItems) {
    if (seen.has(item.slug)) continue;
    seen.add(item.slug);

    const price = item.pricePerSwitch ?? parsePrice(listings.find((l) => l.slug === item.slug)?.price);

    // Infer brand from slug/name if not provided
    const rawBrand = item.brand || inferBrand(item.name || item.slug);
    const brand = normalizeBrand(rawBrand);
    // Infer type from name/slug if not provided
    const typeSource = item.type || item.name || item.slug;

    const sw: NormalizedSwitch = {
      brand,
      name: titleCaseName(item.name || item.slug.replace(/-/g, " "), brand),
      slug: item.slug,
      type: normalizeSwitchType(typeSource),
      actuationForceG: item.actuationForceG ?? 0,
      actuationMm: item.actuationMm ?? 0,
      totalTravelMm: item.totalTravelMm ?? 0,
      pricePerSwitch: price ?? 0,
    };

    if (item.bottomOutForceG != null) sw.bottomOutForceG = item.bottomOutForceG;
    if (item.stemMaterial) sw.stemMaterial = item.stemMaterial;
    if (item.housingMaterial) sw.housingMaterial = item.housingMaterial;
    if (item.springType) sw.springType = item.springType;
    if (item.factoryLubed != null) sw.factoryLubed = item.factoryLubed;
    if (item.longPole != null) sw.longPole = item.longPole;
    if (item.imageUrl) sw.imageUrl = item.imageUrl;
    if (item.productUrl) sw.productUrl = item.productUrl;

    normalized.push(sw);
  }

  return normalized;
}

function normalizeKeyboards(listings: RawProduct[], details: RawKeyboardDetail[]): NormalizedKeyboard[] {
  const detailMap = new Map<string, RawKeyboardDetail>();
  for (const d of details) {
    detailMap.set(d.slug, d);
  }

  const seen = new Set<string>();
  const normalized: NormalizedKeyboard[] = [];

  for (const listing of listings) {
    if (seen.has(listing.slug)) continue;
    // Skip filter/category links (not real products)
    if (listing.detailUrl && listing.detailUrl.includes("/filter/")) continue;
    seen.add(listing.slug);

    const detail = detailMap.get(listing.slug);
    const price = parsePrice(listing.price) ?? (detail?.priceUsd ?? 0);

    const rawBrand = detail?.brand || listing.brand || inferBrand(listing.name || listing.slug);
    const kbBrand = normalizeBrand(rawBrand);

    const kb: NormalizedKeyboard = {
      brand: kbBrand,
      name: titleCaseName(detail?.name || listing.name || listing.slug.replace(/-/g, " "), kbBrand),
      slug: listing.slug,
      size: detail?.size || "Unknown",
      caseMaterial: detail?.caseMaterial || "Unknown",
      hotSwap: detail?.hotSwap ?? listing.tags.some((t) => normalizeTag(t) === "Hot-Swap"),
      wireless: detail?.wireless ?? listing.tags.some((t) => ["Wireless", "Bluetooth", "2.4GHz Wireless"].includes(normalizeTag(t))),
      rgb: detail?.rgb ?? listing.tags.some((t) => normalizeTag(t) === "RGB"),
      priceUsd: price,
    };

    if (detail?.mountingStyle) kb.mountingStyle = detail.mountingStyle;
    if (detail?.plateMaterial) kb.plateMaterial = detail.plateMaterial;
    if (detail?.imageUrl) kb.imageUrl = detail.imageUrl;
    else if (listing.imageUrl) kb.imageUrl = listing.imageUrl;
    if (detail?.productUrl || listing.detailUrl) kb.productUrl = detail?.productUrl || listing.detailUrl || undefined;
    if (detail?.connectivityType) kb.connectivityType = detail.connectivityType;
    if (detail?.batteryCapacity) kb.batteryCapacity = detail.batteryCapacity;
    if (detail?.weight) kb.weight = detail.weight;
    if (detail?.knob) kb.knob = detail.knob;
    if (detail?.qmkVia) kb.qmkVia = detail.qmkVia;
    if (detail?.hallEffect) kb.hallEffect = detail.hallEffect;
    if (detail?.pollingRate) kb.pollingRate = detail.pollingRate;

    normalized.push(kb);
  }

  return normalized;
}

function normalizeGenericProducts(listings: RawProduct[], categoryName: string): NormalizedProduct[] {
  const seen = new Set<string>();
  const normalized: NormalizedProduct[] = [];

  for (const listing of listings) {
    if (seen.has(listing.slug)) continue;
    seen.add(listing.slug);

    const rawProdBrand = listing.brand || inferBrand(listing.name || listing.slug);
    const prodBrand = normalizeBrand(rawProdBrand);

    const product: NormalizedProduct = {
      category: categoryName,
      brand: prodBrand,
      name: titleCaseName(listing.name || listing.slug.replace(/-/g, " "), prodBrand),
      slug: listing.slug,
    };

    const price = parsePrice(listing.price);
    if (price != null) product.priceUsd = price;

    const origPrice = parsePrice(listing.originalPrice);
    if (origPrice != null) product.originalPrice = origPrice;

    if (listing.imageUrl) product.imageUrl = listing.imageUrl;
    if (listing.detailUrl) product.productUrl = listing.detailUrl;
    if (listing.tags.length > 0) product.tags = listing.tags.map(normalizeTag);
    product.sourceUrl = listing.detailUrl || undefined;

    normalized.push(product);
  }

  return normalized;
}

function extractVendorLinks(switchDetails: RawSwitchDetail[], keyboardDetails: RawKeyboardDetail[]): NormalizedVendorLink[] {
  const links: NormalizedVendorLink[] = [];
  const seen = new Set<string>();

  for (const detail of switchDetails) {
    for (const vl of detail.vendorLinks) {
      const key = `${vl.url}-${vl.productName}`;
      if (seen.has(key)) continue;
      seen.add(key);
      links.push({
        productType: "switch",
        productName: vl.productName,
        vendor: vl.vendor,
        url: vl.url,
        ...(vl.price != null && { price: vl.price }),
      });
    }
  }

  for (const detail of keyboardDetails) {
    for (const vl of detail.vendorLinks) {
      const key = `${vl.url}-${vl.productName}`;
      if (seen.has(key)) continue;
      seen.add(key);
      links.push({
        productType: "keyboard",
        productName: vl.productName,
        vendor: vl.vendor,
        url: vl.url,
        ...(vl.price != null && { price: vl.price }),
      });
    }
  }

  return links;
}

export async function normalize(): Promise<void> {
  log("normalizer", "Starting normalization...");
  const outDir = path.resolve(CHECKPOINT_DIR);

  const metadata: ScrapingMetadata = {
    scrapedAt: new Date().toISOString(),
    categories: {},
    totalProducts: 0,
    errors: [],
  };

  // Normalize switches
  const switchListings: RawProduct[] = JSON.parse(
    fs.readFileSync(path.join(outDir, "switches-listings.json"), "utf-8").toString() || "[]"
  ).filter(Boolean);
  const switchDetails: RawSwitchDetail[] = fs.existsSync(path.join(outDir, "switches-details.json"))
    ? JSON.parse(fs.readFileSync(path.join(outDir, "switches-details.json"), "utf-8"))
    : [];

  const switches = normalizeSwitches(switchListings, switchDetails);
  fs.writeFileSync(path.join(outDir, "switches.json"), JSON.stringify(switches, null, 2));
  metadata.categories.switches = { listingCount: switchListings.length, detailCount: switchDetails.length };
  metadata.totalProducts += switches.length;
  log("normalizer", `Normalized ${switches.length} switches`);

  // Normalize keyboards
  const kbListings: RawProduct[] = JSON.parse(
    fs.readFileSync(path.join(outDir, "keyboards-listings.json"), "utf-8").toString() || "[]"
  ).filter(Boolean);
  const kbDetails: RawKeyboardDetail[] = fs.existsSync(path.join(outDir, "keyboards-details.json"))
    ? JSON.parse(fs.readFileSync(path.join(outDir, "keyboards-details.json"), "utf-8"))
    : [];

  const keyboards = normalizeKeyboards(kbListings, kbDetails);
  fs.writeFileSync(path.join(outDir, "keyboards.json"), JSON.stringify(keyboards, null, 2));
  metadata.categories.keyboards = { listingCount: kbListings.length, detailCount: kbDetails.length };
  metadata.totalProducts += keyboards.length;
  log("normalizer", `Normalized ${keyboards.length} keyboards`);

  // Normalize other categories
  const allProducts: NormalizedProduct[] = [];
  for (const category of CATEGORIES) {
    if (category.name === "switches" || category.name === "keyboards") continue;

    const listingFile = path.join(outDir, `${category.name}-listings.json`);
    if (!fs.existsSync(listingFile)) {
      log("normalizer", `No listings found for ${category.name}, skipping`);
      continue;
    }

    const listings: RawProduct[] = JSON.parse(fs.readFileSync(listingFile, "utf-8"));
    const products = normalizeGenericProducts(listings, category.name);
    allProducts.push(...products);
    metadata.categories[category.name] = { listingCount: listings.length, detailCount: 0 };
    metadata.totalProducts += products.length;
    log("normalizer", `Normalized ${products.length} ${category.name} products`);
  }

  fs.writeFileSync(path.join(outDir, "products.json"), JSON.stringify(allProducts, null, 2));

  // Extract vendor links
  const vendorLinks = extractVendorLinks(switchDetails, kbDetails);
  fs.writeFileSync(path.join(outDir, "vendor-links.json"), JSON.stringify(vendorLinks, null, 2));
  log("normalizer", `Extracted ${vendorLinks.length} vendor links`);

  // Save metadata
  fs.writeFileSync(path.join(outDir, "_metadata.json"), JSON.stringify(metadata, null, 2));
  log("normalizer", "Normalization complete");
  console.log("\n=== Normalization Summary ===");
  console.log(`Total products: ${metadata.totalProducts}`);
  for (const [cat, data] of Object.entries(metadata.categories)) {
    console.log(`  ${cat}: ${data.listingCount} listings, ${data.detailCount} details`);
  }
}

if (require.main === module) {
  normalize().catch(console.error);
}
