import * as fs from "fs";
import * as path from "path";
import Anthropic from "@anthropic-ai/sdk";
import { CHECKPOINT_DIR } from "./config";
import { chunk, sleep, log, logError } from "./utils";

interface EnrichedSwitch {
  brand: string;
  name: string;
  slug: string;
  type: string;
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
  soundPitch?: string;
  soundCharacter?: string;
  soundVolume?: string;
  communityRating?: number;
  popularFor?: string[];
  notes?: string;
  commonlyComparedTo?: string[];
  imageUrl?: string;
  productUrl?: string;
}

const ENRICHMENT_FIELDS = [
  "soundPitch",
  "soundCharacter",
  "soundVolume",
  "communityRating",
  "popularFor",
  "notes",
  "commonlyComparedTo",
  "stemMaterial",
  "housingMaterial",
  "springType",
  "factoryLubed",
  "longPole",
  "bottomOutForceG",
];

async function enrichBatch(
  client: Anthropic,
  switches: EnrichedSwitch[]
): Promise<EnrichedSwitch[]> {
  const switchSummaries = switches.map((sw) => ({
    name: `${sw.brand} ${sw.name}`,
    type: sw.type,
    actuationForce: sw.actuationForceG,
    price: sw.pricePerSwitch,
    existingData: Object.fromEntries(
      ENRICHMENT_FIELDS.filter((f) => (sw as unknown as Record<string, unknown>)[f] != null).map((f) => [f, (sw as unknown as Record<string, unknown>)[f]])
    ),
  }));

  const prompt = `You are a mechanical keyboard switch expert. For each switch below, fill in the missing fields based on your knowledge. If you're not confident about a value, omit it.

Switches to enrich:
${JSON.stringify(switchSummaries, null, 2)}

For each switch, provide a JSON object with these fields (only include fields you're confident about):
- soundPitch: "low" | "mid" | "high"
- soundCharacter: "thocky" | "clacky" | "creamy" | "poppy" | "muted" | "crisp"
- soundVolume: "quiet" | "medium" | "loud"
- communityRating: number 1-5 (how well-regarded by the community)
- popularFor: string[] (e.g. ["gaming", "typing", "budget builds"])
- notes: string (1-2 sentence community consensus)
- commonlyComparedTo: string[] (other switch names commonly compared)
- stemMaterial: string (e.g. "POM", "Nylon", "UHMWPE")
- housingMaterial: string (e.g. "Nylon", "Polycarbonate", "PC/Nylon blend")
- springType: string (e.g. "Gold-plated steel", "Stainless steel", "Progressive")
- factoryLubed: boolean
- longPole: boolean
- bottomOutForceG: number

Respond with a JSON array of objects, one per switch, in the same order. Each object should have a "name" field matching the input and only the fields you're adding/updating.`;

  const response = await client.messages.create({
    model: "claude-sonnet-4-6",
    max_tokens: 8192,
    messages: [{ role: "user", content: prompt }],
  });

  const text = response.content[0].type === "text" ? response.content[0].text : "";

  // Extract JSON from response
  const jsonMatch = text.match(/\[[\s\S]*\]/);
  if (!jsonMatch) {
    logError("enrich", "Failed to parse AI response");
    return switches;
  }

  try {
    const enrichments = JSON.parse(jsonMatch[0]) as Record<string, unknown>[];

    return switches.map((sw, i) => {
      const enrichment = enrichments[i] || {};
      const enriched = { ...sw };

      for (const field of ENRICHMENT_FIELDS) {
        if ((enriched as Record<string, unknown>)[field] == null && enrichment[field] != null) {
          (enriched as Record<string, unknown>)[field] = enrichment[field];
        }
      }

      return enriched;
    });
  } catch (error) {
    logError("enrich", `JSON parse error: ${error instanceof Error ? error.message : String(error)}`);
    return switches;
  }
}

async function main(): Promise<void> {
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    console.error("ANTHROPIC_API_KEY environment variable required");
    process.exit(1);
  }

  const client = new Anthropic({ apiKey });
  const inputFile = path.resolve(CHECKPOINT_DIR, "switches.json");
  const outputFile = path.resolve(CHECKPOINT_DIR, "switches-enriched.json");

  if (!fs.existsSync(inputFile)) {
    console.error("switches.json not found. Run normalizer first.");
    process.exit(1);
  }

  const switches: EnrichedSwitch[] = JSON.parse(fs.readFileSync(inputFile, "utf-8"));

  // Find switches that need enrichment
  const needsEnrichment = switches.filter((sw) =>
    ENRICHMENT_FIELDS.some((f) => (sw as unknown as Record<string, unknown>)[f] == null)
  );

  log("enrich", `${needsEnrichment.length}/${switches.length} switches need enrichment`);

  const batches = chunk(needsEnrichment, 15);
  const enrichedMap = new Map<string, EnrichedSwitch>();

  // Load existing checkpoint if resuming
  const checkpointFile = path.resolve(CHECKPOINT_DIR, "enrich-checkpoint.json");
  let startBatch = 0;
  if (fs.existsSync(checkpointFile)) {
    const checkpoint = JSON.parse(fs.readFileSync(checkpointFile, "utf-8"));
    for (const sw of checkpoint.enriched as EnrichedSwitch[]) {
      enrichedMap.set(sw.slug, sw);
    }
    startBatch = checkpoint.nextBatch || 0;
    log("enrich", `Resuming from batch ${startBatch} (${enrichedMap.size} already enriched)`);
  }

  // Process 3 batches concurrently
  for (let i = startBatch; i < batches.length; i += 3) {
    const concurrentBatches = batches.slice(i, i + 3);
    try {
      const results = await Promise.all(
        concurrentBatches.map((batch) => enrichBatch(client, batch))
      );

      for (const result of results) {
        for (const sw of result) {
          enrichedMap.set(sw.slug, sw);
        }
      }
    } catch (error) {
      logError("enrich", `Batch ${i} failed: ${error instanceof Error ? error.message : String(error)}`);
      // Save checkpoint and continue
    }

    const processed = Math.min(i + 3, batches.length);
    const switchesDone = enrichedMap.size;
    log("enrich", `Batch ${processed}/${batches.length} (${switchesDone} switches enriched)`);

    // Save checkpoint every 10 rounds
    if ((i - startBatch) % 30 === 27 || i + 3 >= batches.length) {
      fs.writeFileSync(checkpointFile, JSON.stringify({
        nextBatch: Math.min(i + 3, batches.length),
        enriched: Array.from(enrichedMap.values()),
      }));
      log("enrich", "Checkpoint saved");
    }

    if (i + 3 < batches.length) await sleep(1000);
  }

  // Merge enriched data back
  const finalSwitches = switches.map((sw) => enrichedMap.get(sw.slug) || sw);

  fs.writeFileSync(outputFile, JSON.stringify(finalSwitches, null, 2));
  log("enrich", `Saved enriched data to ${outputFile}`);

  // Clean up checkpoint
  if (fs.existsSync(checkpointFile)) fs.unlinkSync(checkpointFile);

  const enrichedCount = finalSwitches.filter((sw) =>
    ENRICHMENT_FIELDS.every((f) => (sw as unknown as Record<string, unknown>)[f] != null)
  ).length;
  console.log(`\n=== Enrichment Summary ===`);
  console.log(`Fully enriched: ${enrichedCount}/${switches.length}`);
}

main().catch(console.error);
