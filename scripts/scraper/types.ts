export interface RawProduct {
  name: string;
  brand: string;
  slug: string;
  price: string | number | null;
  originalPrice?: string | number | null;
  imageUrl: string | null;
  imageUrls?: string[];
  detailUrl: string | null;
  tags: string[];
  category: string;
}

export interface RawSwitchDetail {
  name: string;
  brand: string;
  slug: string;
  type: string;
  actuationForceG: number | null;
  bottomOutForceG: number | null;
  actuationMm: number | null;
  totalTravelMm: number | null;
  stemMaterial: string | null;
  housingMaterial: string | null;
  springType: string | null;
  factoryLubed: boolean | null;
  longPole: boolean | null;
  pricePerSwitch: number | null;
  imageUrl: string | null;
  imageUrls: string[];
  productUrl: string | null;
  vendorLinks: RawVendorLink[];
  tags: string[];
}

export interface RawKeyboardDetail {
  name: string;
  brand: string;
  slug: string;
  size: string | null;
  caseMaterial: string | null;
  plateMaterial: string | null;
  mountingStyle: string | null;
  hotSwap: boolean | null;
  wireless: boolean | null;
  rgb: boolean | null;
  priceUsd: number | null;
  imageUrl: string | null;
  imageUrls: string[];
  productUrl: string | null;
  connectivityType: string | null;
  batteryCapacity: string | null;
  weight: string | null;
  knob: boolean | null;
  qmkVia: boolean | null;
  hallEffect: boolean | null;
  pollingRate: string | null;
  vendorLinks: RawVendorLink[];
  tags: string[];
}

export interface RawVendorLink {
  vendor: string;
  url: string;
  price: number | null;
  productName: string;
  productType: string;
}

export interface NormalizedSwitch {
  brand: string;
  name: string;
  slug: string;
  type: "linear" | "tactile" | "clicky";
  actuationForceG: number;
  actuationMm: number;
  totalTravelMm: number;
  pricePerSwitch: number;
  bottomOutForceG?: number;
  stemMaterial?: string;
  housingMaterial?: string;
  springType?: string;
  factoryLubed?: boolean;
  longPole?: boolean;
  imageUrl?: string;
  productUrl?: string;
}

export interface NormalizedKeyboard {
  brand: string;
  name: string;
  slug: string;
  size: string;
  caseMaterial: string;
  hotSwap: boolean;
  wireless: boolean;
  rgb: boolean;
  priceUsd: number;
  mountingStyle?: string;
  plateMaterial?: string;
  inStock?: boolean;
  notes?: string;
  imageUrl?: string;
  productUrl?: string;
  connectivityType?: string;
  batteryCapacity?: string;
  weight?: string;
  knob?: boolean;
  qmkVia?: boolean;
  hallEffect?: boolean;
  pollingRate?: string;
}

export interface NormalizedProduct {
  category: string;
  brand: string;
  name: string;
  slug: string;
  priceUsd?: number;
  originalPrice?: number;
  imageUrl?: string;
  imageUrls?: string[];
  productUrl?: string;
  tags?: string[];
  specs?: Record<string, unknown>;
  inStock?: boolean;
  sourceUrl?: string;
}

export interface NormalizedVendorLink {
  productType: string;
  productName: string;
  vendor: string;
  url: string;
  price?: number;
}

export interface ScrapingMetadata {
  scrapedAt: string;
  categories: Record<string, { listingCount: number; detailCount: number }>;
  totalProducts: number;
  errors: string[];
}

export interface DiscoveryReport {
  method: "api" | "next-data" | "dom-scraping";
  buildId?: string;
  sampleData?: unknown;
  notes: string[];
}
