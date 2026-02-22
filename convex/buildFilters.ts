// Pre-filter database products based on user preferences to reduce AI token usage.
// Cuts context from ~20K tokens (full dump) to ~5-8K tokens (relevant subset).

export interface FilterCriteria {
  soundPreference?: string;
  size?: string;
  budget?: number;
  switchType?: string;
  wireless?: boolean;
  hotSwap?: boolean;
  keycapMaterial?: string;
}

// Sound preferences map to compatible switch types
const SOUND_TO_SWITCH_TYPE: Record<string, string[]> = {
  thocky: ["linear"],
  clacky: ["tactile", "clicky"],
  creamy: ["linear"],
  poppy: ["linear"],
  silent: ["linear"],
  muted: ["linear"],
};

// Sound preferences map to switch sound character field
const SOUND_TO_CHARACTER: Record<string, string[]> = {
  thocky: ["thocky", "creamy"],
  clacky: ["clacky", "crisp"],
  creamy: ["creamy", "thocky"],
  poppy: ["poppy", "crisp"],
  silent: ["muted"],
  muted: ["muted"],
};

/**
 * Extract filter criteria from a free-text user prompt via keyword matching.
 * Replaces the need for an AI call just to understand user intent.
 */
export function extractCriteriaFromPrompt(prompt: string): FilterCriteria {
  const lower = prompt.toLowerCase();
  const criteria: FilterCriteria = {};

  // Sound preference
  const sounds = [
    "thocky",
    "clacky",
    "creamy",
    "poppy",
    "silent",
    "muted",
    "quiet",
  ];
  for (const sound of sounds) {
    if (lower.includes(sound)) {
      criteria.soundPreference = sound === "quiet" ? "silent" : sound;
      break;
    }
  }

  // Keyboard size
  const sizePatterns: [RegExp, string][] = [
    [/\b60\s*%/, "60%"],
    [/\b65\s*%/, "65%"],
    [/\b75\s*%/, "75%"],
    [/\btkl\b|tenkeyless/i, "TKL"],
    [/\bfull[\s-]*size/i, "Full Size"],
  ];
  for (const [pattern, size] of sizePatterns) {
    if (pattern.test(lower)) {
      criteria.size = size;
      break;
    }
  }

  // Budget extraction
  const budgetPatterns = [
    /under\s*\$?\s*(\d+)/i,
    /budget\s*(?:of|:)?\s*\$?\s*(\d+)/i,
    /\$(\d+)\s*(?:budget|max|limit|or less|or under)/i,
    /(\d+)\s*(?:dollar|usd)/i,
  ];
  for (const pattern of budgetPatterns) {
    const match = lower.match(pattern);
    if (match) {
      criteria.budget = parseInt(match[1]);
      break;
    }
  }

  // Explicit switch type
  if (lower.includes("linear")) criteria.switchType = "linear";
  else if (lower.includes("tactile")) criteria.switchType = "tactile";
  else if (lower.includes("clicky")) criteria.switchType = "clicky";

  // Feature preferences
  if (lower.includes("wireless") || lower.includes("bluetooth"))
    criteria.wireless = true;
  if (
    lower.includes("hot-swap") ||
    lower.includes("hotswap") ||
    lower.includes("hot swap")
  )
    criteria.hotSwap = true;

  // Keycap material
  if (lower.includes("pbt")) criteria.keycapMaterial = "PBT";
  else if (lower.includes("abs")) criteria.keycapMaterial = "ABS";
  else if (lower.includes("pom")) criteria.keycapMaterial = "POM";

  return criteria;
}

/**
 * Extract filter criteria from questionnaire answers.
 * Maps answer IDs to structured criteria.
 */
export function extractCriteriaFromAnswers(
  answers: { questionId: string; value: unknown }[]
): FilterCriteria {
  const criteria: FilterCriteria = {};

  for (const answer of answers) {
    const val = String(answer.value);
    switch (answer.questionId) {
      case "sound":
        criteria.soundPreference = val;
        break;
      case "size": {
        // Normalize size IDs to display values
        const sizeMap: Record<string, string> = {
          "60": "60%",
          "65": "65%",
          "75": "75%",
          tkl: "TKL",
          full: "Full Size",
        };
        criteria.size = sizeMap[val] || val;
        break;
      }
      case "budget":
        criteria.budget = Number(answer.value);
        break;
      case "keycap_material":
        if (val !== "no-preference") {
          criteria.keycapMaterial = val.toUpperCase();
        }
        break;
      case "priorities": {
        const priorities = Array.isArray(answer.value)
          ? answer.value
          : [answer.value];
        if (priorities.includes("wireless")) criteria.wireless = true;
        break;
      }
    }
  }

  return criteria;
}

/**
 * Filter switches to only those relevant to the user's preferences.
 * Uses graceful degradation: if filtering would leave too few options, keeps the broader set.
 */
export function filterSwitches(
  switches: Record<string, unknown>[],
  criteria: FilterCriteria
): Record<string, unknown>[] {
  let filtered = [...switches];

  // Filter by switch type implied by sound preference
  if (criteria.soundPreference && SOUND_TO_SWITCH_TYPE[criteria.soundPreference]) {
    const validTypes = SOUND_TO_SWITCH_TYPE[criteria.soundPreference];
    const byType = filtered.filter((s) =>
      validTypes.includes(String(s.type))
    );
    if (byType.length >= 5) filtered = byType;
  }

  // Filter by explicit switch type
  if (criteria.switchType) {
    const byType = filtered.filter(
      (s) => String(s.type) === criteria.switchType
    );
    if (byType.length >= 5) filtered = byType;
  }

  // Filter by sound character
  if (criteria.soundPreference && SOUND_TO_CHARACTER[criteria.soundPreference]) {
    const validChars = SOUND_TO_CHARACTER[criteria.soundPreference];
    const byChar = filtered.filter((s) =>
      validChars.includes(String(s.soundCharacter))
    );
    // Only apply if we still have enough variety
    if (byChar.length >= 3) filtered = byChar;
  }

  // Filter by budget (heuristic: switch cost < 30% of total budget, ~70 switches)
  if (criteria.budget) {
    const maxPricePerSwitch = (criteria.budget * 0.3) / 70;
    const byBudget = filtered.filter(
      (s) => Number(s.pricePerSwitch) <= maxPricePerSwitch
    );
    if (byBudget.length >= 3) filtered = byBudget;
  }

  // Sort by community rating (higher first)
  filtered.sort(
    (a, b) =>
      (Number(b.communityRating) || 0) - (Number(a.communityRating) || 0)
  );

  // Cap at 30 to keep token count manageable
  return filtered.slice(0, 30);
}

/**
 * Filter keyboards to only those matching user preferences.
 */
export function filterKeyboards(
  keyboards: Record<string, unknown>[],
  criteria: FilterCriteria
): Record<string, unknown>[] {
  let filtered = [...keyboards];

  // Filter by size
  if (criteria.size) {
    const normalizedSize = criteria.size.toLowerCase().replace("%", "");
    const bySize = filtered.filter((k) => {
      const kSize = String(k.size).toLowerCase().replace("%", "");
      return kSize === normalizedSize || kSize.includes(normalizedSize);
    });
    if (bySize.length >= 2) filtered = bySize;
  }

  // Filter by budget (keyboard should be < 60% of total budget)
  if (criteria.budget) {
    const maxPrice = criteria.budget * 0.6;
    const byBudget = filtered.filter(
      (k) => Number(k.priceUsd) <= maxPrice
    );
    if (byBudget.length >= 2) filtered = byBudget;
  }

  // Filter by wireless preference
  if (criteria.wireless) {
    const byWireless = filtered.filter((k) => k.wireless === true);
    if (byWireless.length >= 2) filtered = byWireless;
  }

  // Filter by hot-swap preference
  if (criteria.hotSwap) {
    const byHotSwap = filtered.filter((k) => k.hotSwap === true);
    if (byHotSwap.length >= 2) filtered = byHotSwap;
  }

  // Cap at 15
  return filtered.slice(0, 15);
}

/**
 * Filter components by relevance. Components are small (34 items) so we return all.
 */
export function filterComponents(
  components: Record<string, unknown>[],
  _criteria: FilterCriteria
): Record<string, unknown>[] {
  // Components describe acoustic properties and mods — all are useful context.
  // At 34 items this is minimal token cost, so no filtering needed.
  return components;
}
