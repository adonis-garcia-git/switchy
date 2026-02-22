export function cn(...classes: (string | boolean | undefined | null)[]) {
  return classes.filter(Boolean).join(" ");
}

export function formatPrice(price: number): string {
  return `$${price.toFixed(2)}`;
}

export function formatPriceWhole(price: number): string {
  return `$${Math.round(price)}`;
}

export function daysUntil(dateStr: string): number {
  const target = new Date(dateStr);
  const now = new Date();
  const diff = target.getTime() - now.getTime();
  return Math.ceil(diff / (1000 * 60 * 60 * 24));
}

export function getRandomItem<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

export function generatePurchaseUrl(brand: string, name: string, type: "switch" | "keyboard"): string {
  const query = encodeURIComponent(`${brand} ${name} mechanical ${type}`);
  return `https://www.amazon.com/s?k=${query}`;
}

export function generateGoogleSearchUrl(brand: string, name: string, type: "switch" | "keyboard"): string {
  const query = encodeURIComponent(`${brand} ${name} mechanical ${type} buy`);
  return `https://www.google.com/search?q=${query}`;
}

export function monthsUntil(dateStr: string): number {
  const target = new Date(dateStr);
  const now = new Date();
  const months = (target.getFullYear() - now.getFullYear()) * 12 + (target.getMonth() - now.getMonth());
  return Math.max(0, months);
}
