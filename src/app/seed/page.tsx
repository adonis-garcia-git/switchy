"use client";

import { useState } from "react";
import { useMutation } from "convex/react";
import { api } from "../../../convex/_generated/api";
import { Button } from "@/components/ui/Button";
import switchesData from "@/data/switches.json";
import componentsData from "@/data/components.json";
import keyboardsData from "@/data/keyboards.json";
import glossaryData from "@/data/glossary.json";
import vendorLinksData from "@/data/vendorLinks.json";
import affiliateConfigData from "@/data/affiliateConfig.json";
import keycapsData from "@/data/keycaps.json";
import accessoriesData from "@/data/accessories.json";
import sponsorshipsData from "@/data/sponsorships.json";
import groupBuyListingsData from "@/data/groupBuyListings.json";

export default function SeedPage() {
  const [status, setStatus] = useState<string>("");
  const [loading, setLoading] = useState(false);
  const seedAll = useMutation(api.seed.seedAll);
  const clearAll = useMutation(api.seed.clearAll);
  const cleanSwitches = useMutation(api.seed.cleanAndReseedSwitches);
  const seedGlossary = useMutation(api.glossary.seed);
  const cleanGlossary = useMutation(api.glossary.cleanAndReseed);
  const seedVendorLinks = useMutation(api.vendorLinks.seed);
  const seedAffiliateConfig = useMutation(api.affiliateConfig.seed);
  const seedKeycaps = useMutation(api.keycaps.seed);
  const seedAccessories = useMutation(api.accessories.seed);
  const cleanKeyboards = useMutation(api.seed.cleanAndReseedKeyboards);
  const cleanKeycaps = useMutation(api.keycaps.cleanAndReseed);
  const cleanAccessories = useMutation(api.accessories.cleanAndReseed);
  const seedSponsorships = useMutation(api.sponsorships.seed);
  const cleanSponsorships = useMutation(api.sponsorships.cleanAndReseed);
  const seedGroupBuyListings = useMutation(api.groupBuyListings.seed);
  const cleanGroupBuyListings = useMutation(api.groupBuyListings.cleanAndReseed);
  const deduplicateKeyboards = useMutation(api.seed.deduplicateKeyboards);
  const deduplicateKeycaps = useMutation(api.keycaps.deduplicate);
  const deduplicateAccessories = useMutation(api.accessories.deduplicate);

  const handleSeed = async () => {
    setLoading(true);
    setStatus("Seeding database...");
    try {
      const result = await seedAll({
        switches: switchesData,
        components: componentsData,
        keyboards: keyboardsData,
      });
      setStatus(
        `Done! Added ${result.switchesAdded} switches, ${result.componentsAdded} components, ${result.keyboardsAdded} keyboards.`
      );
    } catch (err) {
      setStatus(`Error: ${err instanceof Error ? err.message : "Unknown error"}`);
    } finally {
      setLoading(false);
    }
  };

  const handleSeedGlossary = async () => {
    setLoading(true);
    setStatus("Seeding glossary terms...");
    try {
      const count = await seedGlossary({ terms: glossaryData as any });
      setStatus(count > 0 ? `Done! Added ${count} glossary terms.` : "Glossary terms already exist.");
    } catch (err) {
      setStatus(`Error: ${err instanceof Error ? err.message : "Unknown error"}`);
    } finally {
      setLoading(false);
    }
  };

  const handleSeedVendorLinks = async () => {
    setLoading(true);
    setStatus("Seeding vendor links...");
    try {
      const count = await seedVendorLinks({ links: vendorLinksData as any });
      setStatus(count > 0 ? `Done! Added ${count} vendor links.` : "Vendor links already exist.");
    } catch (err) {
      setStatus(`Error: ${err instanceof Error ? err.message : "Unknown error"}`);
    } finally {
      setLoading(false);
    }
  };

  const handleSeedAffiliateConfig = async () => {
    setLoading(true);
    setStatus("Seeding affiliate config...");
    try {
      const count = await seedAffiliateConfig({ configs: affiliateConfigData });
      setStatus(count > 0 ? `Done! Added ${count} affiliate configs.` : "Affiliate configs already exist.");
    } catch (err) {
      setStatus(`Error: ${err instanceof Error ? err.message : "Unknown error"}`);
    } finally {
      setLoading(false);
    }
  };

  const handleSeedKeycaps = async () => {
    setLoading(true);
    setStatus("Seeding keycaps...");
    try {
      const count = await seedKeycaps({ keycaps: keycapsData as any });
      setStatus(count > 0 ? `Done! Added ${count} keycap sets.` : "Keycaps already exist.");
    } catch (err) {
      setStatus(`Error: ${err instanceof Error ? err.message : "Unknown error"}`);
    } finally {
      setLoading(false);
    }
  };

  const handleSeedAccessories = async () => {
    setLoading(true);
    setStatus("Seeding accessories...");
    try {
      const count = await seedAccessories({ accessories: accessoriesData as any });
      setStatus(count > 0 ? `Done! Added ${count} accessories.` : "Accessories already exist.");
    } catch (err) {
      setStatus(`Error: ${err instanceof Error ? err.message : "Unknown error"}`);
    } finally {
      setLoading(false);
    }
  };

  const handleSeedEverything = async () => {
    setLoading(true);
    setStatus("Seeding all data...");
    try {
      const result = await seedAll({
        switches: switchesData,
        components: componentsData,
        keyboards: keyboardsData,
      });
      const glossaryCount = await seedGlossary({ terms: glossaryData as any });
      const vendorLinksCount = await seedVendorLinks({ links: vendorLinksData as any });
      const affiliateCount = await seedAffiliateConfig({ configs: affiliateConfigData });
      const keycapsCount = await seedKeycaps({ keycaps: keycapsData as any });
      const accessoriesCount = await seedAccessories({ accessories: accessoriesData as any });
      const sponsorshipsCount = await seedSponsorships({ sponsorships: sponsorshipsData as any });
      const gbListingsCount = await seedGroupBuyListings({ listings: groupBuyListingsData as any });
      setStatus(
        `Done! Added ${result.switchesAdded} switches, ${result.componentsAdded} components, ${result.keyboardsAdded} keyboards, ${glossaryCount} glossary terms, ${vendorLinksCount} vendor links, ${affiliateCount} affiliate configs, ${keycapsCount} keycaps, ${accessoriesCount} accessories, ${sponsorshipsCount} sponsorships, ${gbListingsCount} group buy listings.`
      );
    } catch (err) {
      setStatus(`Error: ${err instanceof Error ? err.message : "Unknown error"}`);
    } finally {
      setLoading(false);
    }
  };

  const handleClear = async () => {
    setLoading(true);
    setStatus("Clearing database...");
    try {
      await clearAll({});
      setStatus("Database cleared.");
    } catch (err) {
      setStatus(`Error: ${err instanceof Error ? err.message : "Unknown error"}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen">
      <main className="max-w-xl mx-auto px-4 py-16 text-center">
        <div className="bg-red-500/10 border border-red-500/30 text-red-400 rounded-xl px-4 py-3 mb-6 text-sm font-semibold">
          Development Only — This page should not be accessible in production.
        </div>
        <h1 className="text-2xl font-bold font-[family-name:var(--font-outfit)] tracking-tight mb-6">
          Database Seed
        </h1>
        <p className="text-text-secondary mb-8 leading-relaxed">
          Use these buttons to seed or clear the database. Seed is idempotent —
          it won&apos;t duplicate data if it already exists.
        </p>

        <div className="space-y-4 mb-8">
          <div className="flex gap-4 justify-center">
            <Button onClick={handleSeedEverything} disabled={loading} loading={loading}>
              Seed Everything
            </Button>
            <Button variant="danger" onClick={handleClear} disabled={loading}>
              Clear Database
            </Button>
          </div>

          <div className="flex gap-4 justify-center flex-wrap">
            <Button
              variant="secondary"
              onClick={async () => {
                setLoading(true);
                setStatus("Cleaning & re-seeding switches...");
                try {
                  const result = await cleanSwitches({ switches: switchesData });
                  setStatus(`Done! Deleted ${result.deleted} old switches, added ${result.added} fresh switches.`);
                } catch (err) {
                  setStatus(`Error: ${err instanceof Error ? err.message : "Unknown error"}`);
                } finally {
                  setLoading(false);
                }
              }}
              disabled={loading}
            >
              Clean &amp; Re-seed Switches
            </Button>
            <Button
              variant="secondary"
              onClick={async () => {
                setLoading(true);
                setStatus("Cleaning & re-seeding glossary...");
                try {
                  const result = await cleanGlossary({ terms: glossaryData as any });
                  setStatus(`Done! Deleted ${result.deleted} old terms, added ${result.added} fresh glossary terms with difficulty levels.`);
                } catch (err) {
                  setStatus(`Error: ${err instanceof Error ? err.message : "Unknown error"}`);
                } finally {
                  setLoading(false);
                }
              }}
              disabled={loading}
            >
              Clean &amp; Re-seed Glossary
            </Button>
            <Button
              variant="secondary"
              onClick={async () => {
                setLoading(true);
                setStatus("Cleaning & re-seeding keyboards...");
                try {
                  const result = await cleanKeyboards({ keyboards: keyboardsData });
                  setStatus(`Done! Deleted ${result.deleted} old keyboards, added ${result.added} fresh keyboards.`);
                } catch (err) {
                  setStatus(`Error: ${err instanceof Error ? err.message : "Unknown error"}`);
                } finally {
                  setLoading(false);
                }
              }}
              disabled={loading}
            >
              Clean &amp; Re-seed Keyboards
            </Button>
            <Button
              variant="secondary"
              onClick={async () => {
                setLoading(true);
                setStatus("Cleaning & re-seeding keycaps...");
                try {
                  const result = await cleanKeycaps({ keycaps: keycapsData as any });
                  setStatus(`Done! Deleted ${result.deleted} old keycaps, added ${result.added} fresh keycap sets.`);
                } catch (err) {
                  setStatus(`Error: ${err instanceof Error ? err.message : "Unknown error"}`);
                } finally {
                  setLoading(false);
                }
              }}
              disabled={loading}
            >
              Clean &amp; Re-seed Keycaps
            </Button>
            <Button
              variant="secondary"
              onClick={async () => {
                setLoading(true);
                setStatus("Cleaning & re-seeding accessories...");
                try {
                  const result = await cleanAccessories({ accessories: accessoriesData as any });
                  setStatus(`Done! Deleted ${result.deleted} old accessories, added ${result.added} fresh accessories.`);
                } catch (err) {
                  setStatus(`Error: ${err instanceof Error ? err.message : "Unknown error"}`);
                } finally {
                  setLoading(false);
                }
              }}
              disabled={loading}
            >
              Clean &amp; Re-seed Accessories
            </Button>
            <Button
              variant="secondary"
              onClick={async () => {
                setLoading(true);
                setStatus("Cleaning & re-seeding sponsorships...");
                try {
                  const result = await cleanSponsorships({ sponsorships: sponsorshipsData as any });
                  setStatus(`Done! Deleted ${result.deleted} old sponsorships, added ${result.added} fresh sponsorships.`);
                } catch (err) {
                  setStatus(`Error: ${err instanceof Error ? err.message : "Unknown error"}`);
                } finally {
                  setLoading(false);
                }
              }}
              disabled={loading}
            >
              Clean &amp; Re-seed Sponsorships
            </Button>
            <Button
              variant="secondary"
              onClick={async () => {
                setLoading(true);
                setStatus("Cleaning & re-seeding group buy listings...");
                try {
                  const result = await cleanGroupBuyListings({ listings: groupBuyListingsData as any });
                  setStatus(`Done! Deleted ${result.deleted} old listings, added ${result.added} fresh group buy listings.`);
                } catch (err) {
                  setStatus(`Error: ${err instanceof Error ? err.message : "Unknown error"}`);
                } finally {
                  setLoading(false);
                }
              }}
              disabled={loading}
            >
              Clean &amp; Re-seed Group Buy Listings
            </Button>
          </div>

          <div className="flex gap-3 justify-center flex-wrap">
            <Button
              variant="secondary"
              size="sm"
              onClick={async () => {
                setLoading(true);
                setStatus("Deduplicating keyboards...");
                try {
                  const result = await deduplicateKeyboards({});
                  setStatus(
                    result.duplicatesRemoved > 0
                      ? `Removed ${result.duplicatesRemoved} duplicate keyboards (${result.total} total scanned).`
                      : `No duplicates found among ${result.total - result.duplicatesRemoved} keyboards.`
                  );
                } catch (err) {
                  setStatus(`Error: ${err instanceof Error ? err.message : "Unknown error"}`);
                } finally {
                  setLoading(false);
                }
              }}
              disabled={loading}
            >
              Deduplicate Keyboards
            </Button>
            <Button
              variant="secondary"
              size="sm"
              onClick={async () => {
                setLoading(true);
                setStatus("Deduplicating keycaps...");
                try {
                  const result = await deduplicateKeycaps({});
                  setStatus(
                    result.duplicatesRemoved > 0
                      ? `Removed ${result.duplicatesRemoved} duplicate keycaps (${result.total} total scanned).`
                      : `No duplicates found among ${result.total - result.duplicatesRemoved} keycaps.`
                  );
                } catch (err) {
                  setStatus(`Error: ${err instanceof Error ? err.message : "Unknown error"}`);
                } finally {
                  setLoading(false);
                }
              }}
              disabled={loading}
            >
              Deduplicate Keycaps
            </Button>
            <Button
              variant="secondary"
              size="sm"
              onClick={async () => {
                setLoading(true);
                setStatus("Deduplicating accessories...");
                try {
                  const result = await deduplicateAccessories({});
                  setStatus(
                    result.duplicatesRemoved > 0
                      ? `Removed ${result.duplicatesRemoved} duplicate accessories (${result.total} total scanned).`
                      : `No duplicates found among ${result.total - result.duplicatesRemoved} accessories.`
                  );
                } catch (err) {
                  setStatus(`Error: ${err instanceof Error ? err.message : "Unknown error"}`);
                } finally {
                  setLoading(false);
                }
              }}
              disabled={loading}
            >
              Deduplicate Accessories
            </Button>
          </div>

          <div className="flex gap-3 justify-center flex-wrap">
            <Button variant="secondary" size="sm" onClick={handleSeed} disabled={loading}>
              Seed Core Data
            </Button>
            <Button variant="secondary" size="sm" onClick={handleSeedGlossary} disabled={loading}>
              Seed Glossary
            </Button>
            <Button variant="secondary" size="sm" onClick={handleSeedVendorLinks} disabled={loading}>
              Seed Vendor Links
            </Button>
            <Button variant="secondary" size="sm" onClick={handleSeedAffiliateConfig} disabled={loading}>
              Seed Affiliate Config
            </Button>
            <Button variant="secondary" size="sm" onClick={handleSeedKeycaps} disabled={loading}>
              Seed Keycaps
            </Button>
            <Button variant="secondary" size="sm" onClick={handleSeedAccessories} disabled={loading}>
              Seed Accessories
            </Button>
            <Button variant="secondary" size="sm" onClick={async () => {
              setLoading(true);
              setStatus("Seeding sponsorships...");
              try {
                const count = await seedSponsorships({ sponsorships: sponsorshipsData as any });
                setStatus(count > 0 ? `Done! Added ${count} sponsorships.` : "Sponsorships already exist.");
              } catch (err) {
                setStatus(`Error: ${err instanceof Error ? err.message : "Unknown error"}`);
              } finally {
                setLoading(false);
              }
            }} disabled={loading}>
              Seed Sponsorships
            </Button>
            <Button variant="secondary" size="sm" onClick={async () => {
              setLoading(true);
              setStatus("Seeding group buy listings...");
              try {
                const count = await seedGroupBuyListings({ listings: groupBuyListingsData as any });
                setStatus(count > 0 ? `Done! Added ${count} group buy listings.` : "Group buy listings already exist.");
              } catch (err) {
                setStatus(`Error: ${err instanceof Error ? err.message : "Unknown error"}`);
              } finally {
                setLoading(false);
              }
            }} disabled={loading}>
              Seed Group Buy Listings
            </Button>
          </div>
        </div>

        <div className="bg-bg-surface rounded-xl border border-border-default p-4 mb-6 text-sm text-text-secondary text-left shadow-surface">
          <h3 className="font-semibold text-text-primary mb-2 font-[family-name:var(--font-outfit)]">
            Data Counts
          </h3>
          <ul className="space-y-1.5">
            <li className="flex items-center justify-between">
              <span>Switches</span>
              <span className="font-mono text-accent text-xs">{switchesData.length}</span>
            </li>
            <li className="flex items-center justify-between">
              <span>Components</span>
              <span className="font-mono text-accent text-xs">{componentsData.length}</span>
            </li>
            <li className="flex items-center justify-between">
              <span>Keyboards</span>
              <span className="font-mono text-accent text-xs">{keyboardsData.length}</span>
            </li>
            <li className="flex items-center justify-between">
              <span>Glossary Terms</span>
              <span className="font-mono text-accent text-xs">{glossaryData.length}</span>
            </li>
            <li className="flex items-center justify-between">
              <span>Vendor Links</span>
              <span className="font-mono text-accent text-xs">{vendorLinksData.length}</span>
            </li>
            <li className="flex items-center justify-between">
              <span>Affiliate Configs</span>
              <span className="font-mono text-accent text-xs">{affiliateConfigData.length}</span>
            </li>
            <li className="flex items-center justify-between">
              <span>Keycaps</span>
              <span className="font-mono text-accent text-xs">{keycapsData.length}</span>
            </li>
            <li className="flex items-center justify-between">
              <span>Accessories</span>
              <span className="font-mono text-accent text-xs">{accessoriesData.length}</span>
            </li>
            <li className="flex items-center justify-between">
              <span>Sponsorships</span>
              <span className="font-mono text-accent text-xs">{sponsorshipsData.length}</span>
            </li>
            <li className="flex items-center justify-between">
              <span>Group Buy Listings</span>
              <span className="font-mono text-accent text-xs">{groupBuyListingsData.length}</span>
            </li>
          </ul>
        </div>

        {status && (
          <div className="text-sm text-text-secondary bg-bg-surface rounded-xl border border-border-default p-4 shadow-surface">
            {status}
          </div>
        )}
      </main>
    </div>
  );
}
