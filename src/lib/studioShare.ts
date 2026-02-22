import { DEFAULT_VIEWER_CONFIG } from "./keyboard3d";
import type { KeyboardViewerConfig } from "./keyboard3d";

// Keys to strip — volatile state that shouldn't be shared
const VOLATILE_KEYS: (keyof KeyboardViewerConfig)[] = [
  "selectedKeys",
  "paintMode",
  "selectionMode",
  "interactive",
];

/**
 * Encode a KeyboardViewerConfig into a compact base64url string.
 * Only includes values that differ from DEFAULT_VIEWER_CONFIG.
 * Returns null if perKeyOverrides is too large (>20 keys).
 */
export function encodeStudioConfig(config: KeyboardViewerConfig): {
  encoded: string;
  overridesExcluded: boolean;
} {
  const diff: Record<string, unknown> = {};
  let overridesExcluded = false;

  for (const [key, value] of Object.entries(config)) {
    // Skip volatile state
    if (VOLATILE_KEYS.includes(key as keyof KeyboardViewerConfig)) continue;

    // Skip undefined values
    if (value === undefined) continue;

    // Handle perKeyOverrides separately
    if (key === "perKeyOverrides") {
      const overrides = value as Record<string, unknown>;
      if (Object.keys(overrides).length > 20) {
        overridesExcluded = true;
        continue;
      }
    }

    // Only include if different from default
    const defaultVal = (DEFAULT_VIEWER_CONFIG as unknown as Record<string, unknown>)[key];
    if (JSON.stringify(value) !== JSON.stringify(defaultVal)) {
      diff[key] = value;
    }
  }

  const json = JSON.stringify(diff);
  const encoded = btoa(json)
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=+$/, "");

  return { encoded, overridesExcluded };
}

/**
 * Decode a base64url-encoded studio config string back into a partial config.
 */
export function decodeStudioConfig(encoded: string): Partial<KeyboardViewerConfig> {
  try {
    // Restore base64 padding
    const padded = encoded.replace(/-/g, "+").replace(/_/g, "/");
    const json = atob(padded);
    const parsed = JSON.parse(json);

    // Strip any volatile keys that might have leaked in
    for (const key of VOLATILE_KEYS) {
      delete parsed[key];
    }

    return parsed as Partial<KeyboardViewerConfig>;
  } catch {
    return {};
  }
}
