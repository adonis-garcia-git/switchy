export const SWITCH_TYPE_COLORS = {
  linear: { bg: "bg-linear/15", text: "text-linear", border: "border-linear/25", hex: "#EF4444" },
  tactile: { bg: "bg-tactile/15", text: "text-tactile", border: "border-tactile/25", hex: "#F59E0B" },
  clicky: { bg: "bg-clicky/15", text: "text-clicky", border: "border-clicky/25", hex: "#3B82F6" },
} as const;

export const SOUND_CHARACTER_LABELS: Record<string, string> = {
  thocky: "Thocky",
  clacky: "Clacky",
  creamy: "Creamy",
  poppy: "Poppy",
  muted: "Muted",
  crisp: "Crisp",
};

export const LOADING_MESSAGES = [
  "Lubing the switches...",
  "Testing the plate flex...",
  "Foam modding the case...",
  "Sound testing your build...",
  "Comparing spring weights...",
  "Checking group buy status...",
  "Measuring actuation force...",
  "Tuning the stabilizers...",
  "Applying band-aid mod...",
  "Filming the switches...",
];

export const PLACEHOLDER_QUERIES = [
  "I want a deep thocky 65% board for office use, under $300",
  "Best budget first custom keyboard for a college student who games",
  "Something that sounds like rain on a wooden desk, very quiet",
  "Clacky and loud 75% for maximum typing satisfaction",
  "I have a Keychron Q1 and want to make it sound more creamy",
  "What's a good tactile switch that isn't mushy? I type a lot of code",
];

export const ACCESSORY_SUBCATEGORIES = [
  { value: "stabilizer", label: "Stabilizers" },
  { value: "spring", label: "Springs" },
  { value: "lube", label: "Lubricants" },
  { value: "film", label: "Switch Films" },
  { value: "foam", label: "Foam & Dampening" },
  { value: "tool", label: "Tools" },
  { value: "cable", label: "Cables" },
  { value: "deskmat", label: "Desk Mats" },
  { value: "wrist-rest", label: "Wrist Rests" },
  { value: "cover", label: "Covers & Cases" },
  { value: "keyboard-parts", label: "Keyboard Parts" },
] as const;

export const KEYCAP_PROFILES = [
  "Cherry", "SA", "MT3", "DSA", "OEM", "KAT", "XDA", "ASA",
] as const;

export const KEYCAP_MATERIALS = [
  "PBT", "ABS", "POM",
] as const;

export const GROUP_BUY_LISTING_STATUS_COLORS = {
  upcoming: { bg: "bg-blue-500/15", text: "text-blue-400", border: "border-blue-500/25", label: "Upcoming" },
  live: { bg: "bg-emerald-500/15", text: "text-emerald-400", border: "border-emerald-500/25", label: "Live" },
  ended: { bg: "bg-zinc-500/15", text: "text-zinc-400", border: "border-zinc-500/25", label: "Ended" },
  shipped: { bg: "bg-purple-500/15", text: "text-purple-400", border: "border-purple-500/25", label: "Shipped" },
} as const;

export const GROUP_BUY_PRODUCT_TYPES = [
  { value: "keyboard", label: "Keyboards" },
  { value: "switches", label: "Switches" },
  { value: "keycaps", label: "Keycaps" },
  { value: "accessories", label: "Accessories" },
] as const;

// ── Glossary shared color maps ──

export const GLOSSARY_CATEGORY_COLORS: Record<string, string> = {
  switches: "bg-linear/10 text-linear border-linear/20",
  sound: "bg-accent/10 text-accent border-accent/20",
  keycaps: "bg-amber-600/10 text-amber-500 border-amber-600/20",
  cases: "bg-orange-800/10 text-orange-300 border-orange-800/20",
  mounting: "bg-emerald-600/10 text-emerald-400 border-emerald-600/20",
  mods: "bg-rose-600/10 text-rose-400 border-rose-600/20",
  layouts: "bg-violet-600/10 text-violet-400 border-violet-600/20",
  general: "bg-bg-elevated text-text-secondary border-border-default",
};

export const GLOSSARY_DIFFICULTY_COLORS: Record<string, { bg: string; text: string }> = {
  beginner: { bg: "bg-emerald-500/10 border-emerald-500/20", text: "text-emerald-400" },
  intermediate: { bg: "bg-amber-500/10 border-amber-500/20", text: "text-amber-400" },
  advanced: { bg: "bg-red-500/10 border-red-500/20", text: "text-red-400" },
};

// App-wide numeric constants
export const MAX_COMPARE_SWITCHES = 3;
export const SHARE_SLUG_LENGTH = 12;
export const IMAGE_POLL_INTERVAL_MS = 2000;
export const IMAGE_POLL_MAX_ATTEMPTS = 30;
export const SUGGESTION_ROTATION_MS = 4000;
export const AI_MAX_TOKENS = 2000;
export const DEFAULT_PAGE_LIMIT = 200;
export const VENDOR_LINKS_PAGE_LIMIT = 500;

// ── Keyboard size ordering & display labels ──

export const SIZE_SORT_ORDER = [
  "40%", "60%", "65%", "75%", "TKL", "96%", "1800", "100%",
] as const;

export const SIZE_DISPLAY_LABELS: Record<string, string> = {
  "1800": "1800 Compact",
  "100%": "Full-size",
};

/** Sort keyboard sizes in logical order (small → large) */
export function sortSizes(sizes: string[]): string[] {
  return [...sizes].sort((a, b) => {
    const ai = SIZE_SORT_ORDER.indexOf(a as (typeof SIZE_SORT_ORDER)[number]);
    const bi = SIZE_SORT_ORDER.indexOf(b as (typeof SIZE_SORT_ORDER)[number]);
    return (ai === -1 ? 999 : ai) - (bi === -1 ? 999 : bi);
  });
}
