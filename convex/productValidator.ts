// Validate AI-recommended products against the actual database.
// Fuzzy-matches names, corrects prices, and attaches real product IDs,
// imageUrls, productUrls, and detailUrls for deep linking.

interface ProductMatch {
  originalName: string;
  matchedName: string;
  matchedId?: string;
  confidence: number;
  priceCorrection?: number;
}

function normalizeForComparison(name: string): string {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, "")
    .replace(/\s+/g, " ")
    .trim();
}

/**
 * Token-based similarity (Jaccard index) with containment bonus.
 * Fast and effective for product names like "Gateron Oil King" vs "gateron oil kings".
 */
function similarity(a: string, b: string): number {
  const normA = normalizeForComparison(a);
  const normB = normalizeForComparison(b);

  if (normA === normB) return 1;

  // Containment check — one name contains the other
  if (normA.includes(normB) || normB.includes(normA)) return 0.85;

  // Token-based Jaccard similarity
  const tokensA = new Set(normA.split(" "));
  const tokensB = new Set(normB.split(" "));
  const intersection = new Set([...tokensA].filter((t) => tokensB.has(t)));
  const union = new Set([...tokensA, ...tokensB]);

  return intersection.size / union.size;
}

function findBestMatch(
  name: string,
  products: Record<string, unknown>[],
  nameField: (p: Record<string, unknown>) => string
): { product: Record<string, unknown>; score: number } | null {
  let bestProduct: Record<string, unknown> | null = null;
  let bestScore = 0;

  for (const product of products) {
    const productName = nameField(product);
    const score = similarity(name, productName);
    if (score > bestScore) {
      bestScore = score;
      bestProduct = product;
    }
  }

  // Minimum 0.4 similarity to count as a match
  return bestProduct && bestScore >= 0.4
    ? { product: bestProduct, score: bestScore }
    : null;
}

/**
 * Validate a build recommendation against real database products.
 * Corrects names and prices for keyboard kits, switches, and keycaps.
 * Attaches imageUrl, productUrl, and detailUrl from matched DB records.
 */
export function validateBuild(
  build: Record<string, unknown>,
  switches: Record<string, unknown>[],
  keyboards: Record<string, unknown>[],
  keycaps?: Record<string, unknown>[]
): {
  validatedBuild: Record<string, unknown>;
  matches: {
    keyboard: ProductMatch | null;
    switches: ProductMatch | null;
    keycaps: ProductMatch | null;
  };
} {
  const components = build.components as Record<
    string,
    Record<string, unknown>
  >;
  const validatedComponents = { ...components };
  const matches = {
    keyboard: null as ProductMatch | null,
    switches: null as ProductMatch | null,
    keycaps: null as ProductMatch | null,
  };

  // Validate keyboard kit
  if (components.keyboardKit?.name) {
    const kitName = String(components.keyboardKit.name);
    const match = findBestMatch(
      kitName,
      keyboards,
      (k) => `${k.brand} ${k.name}`
    );
    if (match) {
      const k = match.product;
      const matchedName = `${k.brand} ${k.name}`;
      matches.keyboard = {
        originalName: kitName,
        matchedName,
        matchedId: String(k._id),
        confidence: match.score,
      };

      if (match.score >= 0.6) {
        const realPrice = Number(k.priceUsd);
        const patchFields: Record<string, unknown> = {
          ...components.keyboardKit,
          name: matchedName,
          matchedId: String(k._id),
          detailUrl: `/keyboards/${String(k._id)}`,
        };

        // Attach image and product URLs from DB if available
        if (k.imageUrl) patchFields.imageUrl = k.imageUrl;
        if (k.productUrl) patchFields.productUrl = k.productUrl;

        if (
          realPrice &&
          Math.abs(realPrice - Number(components.keyboardKit.price)) > 5
        ) {
          matches.keyboard.priceCorrection = realPrice;
          patchFields.price = realPrice;
        }

        validatedComponents.keyboardKit = patchFields;
      }
    }
  }

  // Validate switches
  if (components.switches?.name) {
    const switchName = String(components.switches.name);
    const match = findBestMatch(
      switchName,
      switches,
      (s) => `${s.brand} ${s.name}`
    );
    if (match) {
      const s = match.product;
      const matchedName = `${s.brand} ${s.name}`;
      matches.switches = {
        originalName: switchName,
        matchedName,
        matchedId: String(s._id),
        confidence: match.score,
      };

      if (match.score >= 0.6) {
        const realPrice = Number(s.pricePerSwitch);
        const patchFields: Record<string, unknown> = {
          ...components.switches,
          name: matchedName,
          matchedId: String(s._id),
          detailUrl: `/switches/${String(s._id)}`,
        };

        // Attach image and product URLs from DB if available
        if (s.imageUrl) patchFields.imageUrl = s.imageUrl;
        if (s.productUrl) patchFields.productUrl = s.productUrl;

        if (
          realPrice &&
          Math.abs(realPrice - Number(components.switches.priceEach)) > 0.05
        ) {
          matches.switches.priceCorrection = realPrice;
          patchFields.priceEach = realPrice;
        }

        validatedComponents.switches = patchFields;
      }
    }
  }

  // Validate keycaps
  if (components.keycaps?.name && keycaps && keycaps.length > 0) {
    const keycapName = String(components.keycaps.name);
    const match = findBestMatch(
      keycapName,
      keycaps,
      (kc) => `${kc.brand} ${kc.name}`
    );
    if (match) {
      const kc = match.product;
      const matchedName = `${kc.brand} ${kc.name}`;
      matches.keycaps = {
        originalName: keycapName,
        matchedName,
        matchedId: String(kc._id),
        confidence: match.score,
      };

      if (match.score >= 0.6) {
        const realPrice = Number(kc.priceUsd);
        const patchFields: Record<string, unknown> = {
          ...components.keycaps,
          name: matchedName,
          matchedId: String(kc._id),
          detailUrl: `/keycaps/${String(kc._id)}`,
        };

        // Attach image and product URLs from DB if available
        if (kc.imageUrl) patchFields.imageUrl = kc.imageUrl;
        if (kc.productUrl) patchFields.productUrl = kc.productUrl;

        if (
          realPrice &&
          Math.abs(realPrice - Number(components.keycaps.price)) > 5
        ) {
          matches.keycaps.priceCorrection = realPrice;
          patchFields.price = realPrice;
        }

        validatedComponents.keycaps = patchFields;
      }
    }
  }

  // Recalculate total if any component prices were corrected
  const kit = validatedComponents.keyboardKit as Record<string, unknown>;
  const sw = validatedComponents.switches as Record<string, unknown>;
  const caps = validatedComponents.keycaps as Record<string, unknown>;
  const stabs = validatedComponents.stabilizers as Record<string, unknown>;
  const mods = (build.recommendedMods as Record<string, unknown>[]) || [];

  const recalculatedTotal =
    Number(kit.price) +
    Number(sw.priceEach) * Number(sw.quantity) +
    Number(caps.price) +
    Number(stabs.price) +
    mods.reduce((sum, m) => sum + Number(m.cost || 0), 0);

  return {
    validatedBuild: {
      ...build,
      components: validatedComponents,
      estimatedTotal: Math.round(recalculatedTotal * 100) / 100,
    },
    matches,
  };
}
