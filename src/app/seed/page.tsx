"use client";

import { useState } from "react";
import { useMutation, useQuery } from "convex/react";
import { api } from "../../../convex/_generated/api";
import switchesData from "@/data/switches.json";
import componentsData from "@/data/components.json";
import keyboardsData from "@/data/keyboards.json";
import glossaryData from "@/data/glossary.json";
import vendorLinksData from "@/data/vendorLinks.json";

export default function SeedPage() {
  const [status, setStatus] = useState<string>("");
  const [loading, setLoading] = useState(false);
  const seedAll = useMutation(api.seed.seedAll);
  const clearAll = useMutation(api.seed.clearAll);
  const seedGlossary = useMutation(api.glossary.seed);
  const seedVendorLinks = useMutation(api.vendorLinks.seed);

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
      setStatus(
        `Error: ${err instanceof Error ? err.message : "Unknown error"}`
      );
    } finally {
      setLoading(false);
    }
  };

  const handleSeedGlossary = async () => {
    setLoading(true);
    setStatus("Seeding glossary terms...");
    try {
      const count = await seedGlossary({
        terms: glossaryData,
      });
      setStatus(
        count > 0
          ? `Done! Added ${count} glossary terms.`
          : "Glossary terms already exist. No new terms added."
      );
    } catch (err) {
      setStatus(
        `Error: ${err instanceof Error ? err.message : "Unknown error"}`
      );
    } finally {
      setLoading(false);
    }
  };

  const handleSeedVendorLinks = async () => {
    setLoading(true);
    setStatus("Seeding vendor links...");
    try {
      const count = await seedVendorLinks({
        links: vendorLinksData as any,
      });
      setStatus(
        count > 0
          ? `Done! Added ${count} vendor links.`
          : "Vendor links already exist. No new links added."
      );
    } catch (err) {
      setStatus(
        `Error: ${err instanceof Error ? err.message : "Unknown error"}`
      );
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
      const glossaryCount = await seedGlossary({
        terms: glossaryData,
      });
      const vendorLinksCount = await seedVendorLinks({
        links: vendorLinksData as any,
      });
      setStatus(
        `Done! Added ${result.switchesAdded} switches, ${result.componentsAdded} components, ${result.keyboardsAdded} keyboards, ${glossaryCount} glossary terms, ${vendorLinksCount} vendor links.`
      );
    } catch (err) {
      setStatus(
        `Error: ${err instanceof Error ? err.message : "Unknown error"}`
      );
    } finally {
      setLoading(false);
    }
  };

  const handleClear = async () => {
    setLoading(true);
    setStatus("Clearing database...");
    try {
      await clearAll({});
      setStatus("Database cleared (switches, components, keyboards, glossary terms, vendor links).");
    } catch (err) {
      setStatus(
        `Error: ${err instanceof Error ? err.message : "Unknown error"}`
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen">
      <main className="max-w-xl mx-auto px-4 py-16 text-center">
        <h1 className="text-2xl font-bold mb-6">Database Seed</h1>
        <p className="text-text-muted mb-8">
          Use these buttons to seed or clear the database. Seed is idempotent —
          it won&apos;t duplicate data if it already exists.
        </p>

        <div className="space-y-4 mb-8">
          <div className="flex gap-4 justify-center">
            <button
              onClick={handleSeedEverything}
              disabled={loading}
              className="px-6 py-2.5 rounded-lg bg-accent text-bg-primary font-semibold hover:bg-accent-hover transition-colors disabled:opacity-50"
            >
              {loading ? "Working..." : "Seed Everything"}
            </button>
            <button
              onClick={handleClear}
              disabled={loading}
              className="px-6 py-2.5 rounded-lg border border-red-500/30 text-red-400 font-semibold hover:bg-red-500/10 transition-colors disabled:opacity-50"
            >
              Clear Database
            </button>
          </div>

          <div className="flex gap-3 justify-center flex-wrap">
            <button
              onClick={handleSeed}
              disabled={loading}
              className="px-4 py-2 rounded-lg border border-border-primary text-text-secondary font-medium hover:bg-bg-surface transition-colors disabled:opacity-50 text-sm"
            >
              Seed Core Data
            </button>
            <button
              onClick={handleSeedGlossary}
              disabled={loading}
              className="px-4 py-2 rounded-lg border border-border-primary text-text-secondary font-medium hover:bg-bg-surface transition-colors disabled:opacity-50 text-sm"
            >
              Seed Glossary
            </button>
            <button
              onClick={handleSeedVendorLinks}
              disabled={loading}
              className="px-4 py-2 rounded-lg border border-border-primary text-text-secondary font-medium hover:bg-bg-surface transition-colors disabled:opacity-50 text-sm"
            >
              Seed Vendor Links
            </button>
          </div>
        </div>

        <div className="bg-bg-surface rounded-lg p-4 mb-6 text-sm text-text-secondary text-left">
          <h3 className="font-semibold text-text-primary mb-2">Data Counts</h3>
          <ul className="space-y-1">
            <li>Switches: {switchesData.length}</li>
            <li>Components: {componentsData.length}</li>
            <li>Keyboards: {keyboardsData.length}</li>
            <li>Glossary Terms: {glossaryData.length}</li>
            <li>Vendor Links: {vendorLinksData.length}</li>
          </ul>
        </div>

        {status && (
          <p className="text-sm text-text-secondary bg-bg-surface rounded-lg p-4">
            {status}
          </p>
        )}
      </main>
    </div>
  );
}
