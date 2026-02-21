"use client";

import { useState } from "react";
import { useMutation } from "convex/react";
import { api } from "../../../convex/_generated/api";
import { Navigation } from "@/components/Navigation";
import switchesData from "@/data/switches.json";
import componentsData from "@/data/components.json";
import keyboardsData from "@/data/keyboards.json";

export default function SeedPage() {
  const [status, setStatus] = useState<string>("");
  const [loading, setLoading] = useState(false);
  const seedAll = useMutation(api.seed.seedAll);
  const clearAll = useMutation(api.seed.clearAll);

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

  const handleClear = async () => {
    setLoading(true);
    setStatus("Clearing database...");
    try {
      await clearAll({});
      setStatus("Database cleared.");
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
      <Navigation />
      <main className="max-w-xl mx-auto px-4 py-16 text-center">
        <h1 className="text-2xl font-bold mb-6">Database Seed</h1>
        <p className="text-text-muted mb-8">
          Use these buttons to seed or clear the database. Seed is idempotent —
          it won&apos;t duplicate data if it already exists.
        </p>
        <div className="flex gap-4 justify-center mb-8">
          <button
            onClick={handleSeed}
            disabled={loading}
            className="px-6 py-2.5 rounded-lg bg-accent text-bg-primary font-semibold hover:bg-accent-hover transition-colors disabled:opacity-50"
          >
            {loading ? "Working..." : "Seed Database"}
          </button>
          <button
            onClick={handleClear}
            disabled={loading}
            className="px-6 py-2.5 rounded-lg border border-red-500/30 text-red-400 font-semibold hover:bg-red-500/10 transition-colors disabled:opacity-50"
          >
            Clear Database
          </button>
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
