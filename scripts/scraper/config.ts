export const BASE_URL = "https://keeb-finder.com";

export const CATEGORIES = [
  { name: "switches", path: "/switches", table: "switches" as const },
  { name: "keyboards", path: "/keyboards", table: "keyboards" as const },
  { name: "keycaps", path: "/keycaps", table: "products" as const },
  { name: "mice", path: "/mice", table: "products" as const },
  { name: "deskmats", path: "/deskmats", table: "products" as const },
  { name: "stabilizers", path: "/stabilizers", table: "products" as const },
  { name: "cables", path: "/cables", table: "products" as const },
  { name: "wrist-rests", path: "/wrist-rests", table: "products" as const },
  { name: "pcbs", path: "/pcbs", table: "products" as const },
  { name: "lubricants", path: "/lubricants", table: "products" as const },
  { name: "artisan-keycaps", path: "/artisan-keycaps", table: "products" as const },
] as const;

export const DELAYS = {
  scrollPause: { min: 1500, max: 2500 },
  betweenPages: { min: 3000, max: 5000 },
  betweenCategories: { min: 5000, max: 8000 },
  betweenDetails: { min: 2000, max: 3000 },
  batchInsertPause: 200,
};

export const LIMITS = {
  maxItemsPerCategory: 5000,
  maxNoChangeScrolls: 3,
  maxRetries: 3,
  retryBaseDelay: 10000,
};

export const BATCH_SIZES = {
  switches: 50,
  keyboards: 50,
  products: 75,
  vendorLinks: 150,
};

export const CHECKPOINT_DIR = "src/data/scraped";

export type CategoryConfig = (typeof CATEGORIES)[number];
