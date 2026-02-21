import { DELAYS, LIMITS } from "./config";

export function randomDelay(range: { min: number; max: number }): number {
  return Math.floor(Math.random() * (range.max - range.min + 1)) + range.min;
}

export async function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export async function withRetry<T>(
  fn: () => Promise<T>,
  label: string,
  maxRetries = LIMITS.maxRetries
): Promise<T> {
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      return await fn();
    } catch (error) {
      const msg = error instanceof Error ? error.message : String(error);
      console.error(`  [Retry ${attempt}/${maxRetries}] ${label}: ${msg}`);
      if (attempt === maxRetries) throw error;
      const delay = LIMITS.retryBaseDelay * Math.pow(2, attempt - 1);
      console.log(`  Waiting ${delay / 1000}s before retry...`);
      await sleep(delay);
    }
  }
  throw new Error("Unreachable");
}

export function chunk<T>(arr: T[], size: number): T[][] {
  const chunks: T[][] = [];
  for (let i = 0; i < arr.length; i += size) {
    chunks.push(arr.slice(i, i + size));
  }
  return chunks;
}

export function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

export function parsePrice(raw: string | number | null | undefined): number | null {
  if (raw == null) return null;
  if (typeof raw === "number") return raw > 0 ? raw : null;
  const cleaned = raw.replace(/[^0-9.]/g, "");
  const num = parseFloat(cleaned);
  return isNaN(num) || num <= 0 ? null : num;
}

export function parseForce(raw: string | null | undefined): number | null {
  if (!raw) return null;
  const match = raw.match(/([\d.]+)\s*g/i);
  return match ? parseFloat(match[1]) : null;
}

export function parseDistance(raw: string | null | undefined): number | null {
  if (!raw) return null;
  const match = raw.match(/([\d.]+)\s*mm/i);
  return match ? parseFloat(match[1]) : null;
}

export function log(category: string, message: string): void {
  const ts = new Date().toISOString().slice(11, 19);
  console.log(`[${ts}] [${category}] ${message}`);
}

export function logError(category: string, message: string): void {
  const ts = new Date().toISOString().slice(11, 19);
  console.error(`[${ts}] [${category}] ERROR: ${message}`);
}
