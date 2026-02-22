import type { FilterState } from "@/components/FilterBar";
import type { KeycapFilterState, AccessoryFilterState } from "@/lib/types";

export const DEFAULT_SWITCH_FILTERS: FilterState = {
  type: null,
  soundCharacter: null,
  soundPitch: null,
  soundVolume: null,
  minForce: 20,
  maxForce: 100,
  minPrice: 0,
  maxPrice: 2,
  brand: null,
  sortBy: "communityRating",
  sortOrder: "desc",
};

export interface KeyboardFilterState {
  size: string | null;
  brand: string | null;
  hotSwapOnly: boolean;
  wirelessOnly: boolean;
  minPrice: number | null;
  maxPrice: number | null;
  sortBy: string;
}

export const DEFAULT_KEYBOARD_FILTERS: KeyboardFilterState = {
  size: null,
  brand: null,
  hotSwapOnly: false,
  wirelessOnly: false,
  minPrice: null,
  maxPrice: null,
  sortBy: "name",
};

const VALID_SWITCH_TYPES = ["linear", "tactile", "clicky"];
const VALID_SOUND_CHARS = ["thocky", "clacky", "creamy", "poppy", "muted", "crisp"];
const VALID_PITCHES = ["low", "mid", "high"];
const VALID_VOLUMES = ["quiet", "medium", "loud"];

export function parseSwitchParams(searchParams: URLSearchParams): Partial<FilterState> {
  const filters: Partial<FilterState> = {};

  const type = searchParams.get("type");
  if (type && VALID_SWITCH_TYPES.includes(type)) filters.type = type;

  const sound = searchParams.get("sound");
  if (sound && VALID_SOUND_CHARS.includes(sound)) filters.soundCharacter = sound;

  const pitch = searchParams.get("pitch");
  if (pitch && VALID_PITCHES.includes(pitch)) filters.soundPitch = pitch;

  const volume = searchParams.get("volume");
  if (volume && VALID_VOLUMES.includes(volume)) filters.soundVolume = volume;

  const brand = searchParams.get("brand");
  if (brand) filters.brand = brand;

  const minForce = searchParams.get("minForce");
  if (minForce) {
    const val = parseInt(minForce, 10);
    if (!isNaN(val)) filters.minForce = val;
  }

  const maxForce = searchParams.get("maxForce");
  if (maxForce) {
    const val = parseInt(maxForce, 10);
    if (!isNaN(val)) filters.maxForce = val;
  }

  const sort = searchParams.get("sort");
  if (sort) filters.sortBy = sort;

  const order = searchParams.get("order");
  if (order === "asc" || order === "desc") filters.sortOrder = order;

  return filters;
}

export function switchFiltersToParams(filters: FilterState): URLSearchParams {
  const params = new URLSearchParams();
  if (filters.type) params.set("type", filters.type);
  if (filters.soundCharacter) params.set("sound", filters.soundCharacter);
  if (filters.soundPitch) params.set("pitch", filters.soundPitch);
  if (filters.soundVolume) params.set("volume", filters.soundVolume);
  if (filters.brand) params.set("brand", filters.brand);
  if (filters.minForce > 20) params.set("minForce", String(filters.minForce));
  if (filters.maxForce < 100) params.set("maxForce", String(filters.maxForce));
  if (filters.sortBy !== "communityRating") params.set("sort", filters.sortBy);
  if (filters.sortOrder !== "desc") params.set("order", filters.sortOrder);
  return params;
}

export function parseKeyboardParams(searchParams: URLSearchParams): Partial<KeyboardFilterState> {
  const filters: Partial<KeyboardFilterState> = {};

  const size = searchParams.get("size");
  if (size) filters.size = size;

  const brand = searchParams.get("brand");
  if (brand) filters.brand = brand;

  if (searchParams.get("hotswap") === "true") filters.hotSwapOnly = true;
  if (searchParams.get("wireless") === "true") filters.wirelessOnly = true;

  const minPrice = searchParams.get("minPrice");
  if (minPrice) {
    const val = parseInt(minPrice, 10);
    if (!isNaN(val)) filters.minPrice = val;
  }

  const maxPrice = searchParams.get("maxPrice");
  if (maxPrice) {
    const val = parseInt(maxPrice, 10);
    if (!isNaN(val)) filters.maxPrice = val;
  }

  const sort = searchParams.get("sort");
  if (sort) filters.sortBy = sort;

  return filters;
}

export function keyboardFiltersToParams(filters: KeyboardFilterState): URLSearchParams {
  const params = new URLSearchParams();
  if (filters.size) params.set("size", filters.size);
  if (filters.brand) params.set("brand", filters.brand);
  if (filters.hotSwapOnly) params.set("hotswap", "true");
  if (filters.wirelessOnly) params.set("wireless", "true");
  if (filters.minPrice != null) params.set("minPrice", String(filters.minPrice));
  if (filters.maxPrice != null) params.set("maxPrice", String(filters.maxPrice));
  if (filters.sortBy !== "name") params.set("sort", filters.sortBy);
  return params;
}

export function buildSwitchUrl(filters: Partial<FilterState>): string {
  const params = new URLSearchParams();
  if (filters.type) params.set("type", filters.type);
  if (filters.soundCharacter) params.set("sound", filters.soundCharacter);
  if (filters.soundPitch) params.set("pitch", filters.soundPitch);
  if (filters.soundVolume) params.set("volume", filters.soundVolume);
  if (filters.brand) params.set("brand", filters.brand);
  const qs = params.toString();
  return `/switches${qs ? `?${qs}` : ""}`;
}

export function buildKeyboardUrl(filters: Partial<KeyboardFilterState>): string {
  const params = new URLSearchParams();
  if (filters.size) params.set("size", filters.size);
  if (filters.brand) params.set("brand", filters.brand);
  if (filters.hotSwapOnly) params.set("hotswap", "true");
  if (filters.wirelessOnly) params.set("wireless", "true");
  if (filters.minPrice != null) params.set("minPrice", String(filters.minPrice));
  if (filters.maxPrice != null) params.set("maxPrice", String(filters.maxPrice));
  const qs = params.toString();
  return `/keyboards${qs ? `?${qs}` : ""}`;
}

// ── Keycap filter params ──

export const DEFAULT_KEYCAP_FILTERS: KeycapFilterState = {
  profile: null,
  material: null,
  brand: null,
  minPrice: null,
  maxPrice: null,
  sortBy: "name",
  sortOrder: "asc",
};

export function parseKeycapParams(searchParams: URLSearchParams): Partial<KeycapFilterState> {
  const filters: Partial<KeycapFilterState> = {};
  const profile = searchParams.get("profile");
  if (profile) filters.profile = profile;
  const material = searchParams.get("material");
  if (material) filters.material = material;
  const brand = searchParams.get("brand");
  if (brand) filters.brand = brand;
  const minPrice = searchParams.get("minPrice");
  if (minPrice) { const val = parseInt(minPrice, 10); if (!isNaN(val)) filters.minPrice = val; }
  const maxPrice = searchParams.get("maxPrice");
  if (maxPrice) { const val = parseInt(maxPrice, 10); if (!isNaN(val)) filters.maxPrice = val; }
  const sort = searchParams.get("sort");
  if (sort) filters.sortBy = sort;
  const order = searchParams.get("order");
  if (order === "asc" || order === "desc") filters.sortOrder = order;
  return filters;
}

export function keycapFiltersToParams(filters: KeycapFilterState): URLSearchParams {
  const params = new URLSearchParams();
  if (filters.profile) params.set("profile", filters.profile);
  if (filters.material) params.set("material", filters.material);
  if (filters.brand) params.set("brand", filters.brand);
  if (filters.minPrice != null) params.set("minPrice", String(filters.minPrice));
  if (filters.maxPrice != null) params.set("maxPrice", String(filters.maxPrice));
  if (filters.sortBy !== "name") params.set("sort", filters.sortBy);
  if (filters.sortOrder !== "asc") params.set("order", filters.sortOrder);
  return params;
}

export function buildKeycapUrl(filters: Partial<KeycapFilterState>): string {
  const params = new URLSearchParams();
  if (filters.profile) params.set("profile", filters.profile);
  if (filters.material) params.set("material", filters.material);
  if (filters.brand) params.set("brand", filters.brand);
  if (filters.minPrice != null) params.set("minPrice", String(filters.minPrice));
  if (filters.maxPrice != null) params.set("maxPrice", String(filters.maxPrice));
  const qs = params.toString();
  return `/keycaps${qs ? `?${qs}` : ""}`;
}

// ── Accessory filter params ──

export const DEFAULT_ACCESSORY_FILTERS: AccessoryFilterState = {
  subcategory: null,
  brand: null,
  minPrice: null,
  maxPrice: null,
  sortBy: "name",
  sortOrder: "asc",
};

export function parseAccessoryParams(searchParams: URLSearchParams): Partial<AccessoryFilterState> {
  const filters: Partial<AccessoryFilterState> = {};
  const subcategory = searchParams.get("subcategory");
  if (subcategory) filters.subcategory = subcategory;
  const brand = searchParams.get("brand");
  if (brand) filters.brand = brand;
  const minPrice = searchParams.get("minPrice");
  if (minPrice) { const val = parseInt(minPrice, 10); if (!isNaN(val)) filters.minPrice = val; }
  const maxPrice = searchParams.get("maxPrice");
  if (maxPrice) { const val = parseInt(maxPrice, 10); if (!isNaN(val)) filters.maxPrice = val; }
  const sort = searchParams.get("sort");
  if (sort) filters.sortBy = sort;
  const order = searchParams.get("order");
  if (order === "asc" || order === "desc") filters.sortOrder = order;
  return filters;
}

export function accessoryFiltersToParams(filters: AccessoryFilterState): URLSearchParams {
  const params = new URLSearchParams();
  if (filters.subcategory) params.set("subcategory", filters.subcategory);
  if (filters.brand) params.set("brand", filters.brand);
  if (filters.minPrice != null) params.set("minPrice", String(filters.minPrice));
  if (filters.maxPrice != null) params.set("maxPrice", String(filters.maxPrice));
  if (filters.sortBy !== "name") params.set("sort", filters.sortBy);
  if (filters.sortOrder !== "asc") params.set("order", filters.sortOrder);
  return params;
}

export function buildAccessoryUrl(filters: Partial<AccessoryFilterState>): string {
  const params = new URLSearchParams();
  if (filters.subcategory) params.set("subcategory", filters.subcategory);
  if (filters.brand) params.set("brand", filters.brand);
  if (filters.minPrice != null) params.set("minPrice", String(filters.minPrice));
  if (filters.maxPrice != null) params.set("maxPrice", String(filters.maxPrice));
  const qs = params.toString();
  return `/accessories${qs ? `?${qs}` : ""}`;
}
