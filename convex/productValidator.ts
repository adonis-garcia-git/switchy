// Validate AI-recommended products against the actual database.
// Fuzzy-matches names, corrects prices, and attaches real product IDs for deep linking.

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
 * Corrects names and prices for keyboard kits and switches.
 * Returns the validated build + match metadata.
 */
export function validateBuild(
  build: Record<string, unknown>,
  switches: Record<string, unknown>[],
  keyboards: Record<string, unknown>[]
): {
  validatedBuild: Record<string, unknown>;
  matches: {
    keyboard: ProductMatch | null;
    switches: ProductMatch | null;
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

      // Correct name and price for high-confidence matches
      if (match.score >= 0.6) {
        const productMeta = {
          matchedId: String(k._id),
          imageUrl: k.imageUrl ? String(k.imageUrl) : undefined,
          detailUrl: `/keyboards/${k._id}`,
          productUrl: k.productUrl ? String(k.productUrl) : undefined,
        };
        const realPrice = Number(k.priceUsd);
        if (
          realPrice &&
          Math.abs(realPrice - Number(components.keyboardKit.price)) > 5
        ) {
          matches.keyboard.priceCorrection = realPrice;
          validatedComponents.keyboardKit = {
            ...components.keyboardKit,
            name: matchedName,
            price: realPrice,
            ...productMeta,
          };
        } else {
          validatedComponents.keyboardKit = {
            ...components.keyboardKit,
            name: matchedName,
            ...productMeta,
          };
        }
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
        const productMeta = {
          matchedId: String(s._id),
          imageUrl: s.imageUrl ? String(s.imageUrl) : undefined,
          detailUrl: `/switches/${s._id}`,
          productUrl: s.productUrl ? String(s.productUrl) : undefined,
        };
        const realPrice = Number(s.pricePerSwitch);
        if (
          realPrice &&
          Math.abs(realPrice - Number(components.switches.priceEach)) > 0.05
        ) {
          matches.switches.priceCorrection = realPrice;
          validatedComponents.switches = {
            ...components.switches,
            name: matchedName,
            priceEach: realPrice,
            ...productMeta,
          };
        } else {
          validatedComponents.switches = {
            ...components.switches,
            name: matchedName,
            ...productMeta,
          };
        }
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
