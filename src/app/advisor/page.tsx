"use client";

import { useState, useEffect, useCallback } from "react";
import { useSearchParams } from "next/navigation";
import { useAction, useMutation } from "convex/react";
import { useUser } from "@clerk/nextjs";
import { api } from "../../../convex/_generated/api";
import { Navigation } from "@/components/Navigation";
import { BuildCard } from "@/components/BuildCard";
import { LOADING_MESSAGES, PLACEHOLDER_QUERIES } from "@/lib/constants";
import { getRandomItem } from "@/lib/utils";

export default function AdvisorPage() {
  const searchParams = useSearchParams();
  const initialQuery = searchParams.get("q") || "";
  const { isSignedIn } = useUser();

  const [query, setQuery] = useState(initialQuery);
  const [loading, setLoading] = useState(false);
  const [loadingMessage, setLoadingMessage] = useState("");
  const [build, setBuild] = useState<Record<string, unknown> | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  const generateBuild = useAction(api.builds.generateBuild);
  const saveBuild = useMutation(api.savedBuilds.save);

  // Auto-submit if query came from URL
  const handleGenerate = useCallback(
    async (queryText: string) => {
      if (!queryText.trim()) return;
      setLoading(true);
      setError(null);
      setSaved(false);
      setLoadingMessage(getRandomItem(LOADING_MESSAGES));

      const messageInterval = setInterval(() => {
        setLoadingMessage(getRandomItem(LOADING_MESSAGES));
      }, 2500);

      try {
        const previousBuild = build ? JSON.stringify(build) : undefined;
        const result = await generateBuild({
          query: queryText,
          previousBuild,
        });
        setBuild(result);
      } catch (err) {
        setError(
          err instanceof Error ? err.message : "Failed to generate build"
        );
      } finally {
        setLoading(false);
        clearInterval(messageInterval);
      }
    },
    [generateBuild, build]
  );

  useEffect(() => {
    if (initialQuery && !build && !loading) {
      handleGenerate(initialQuery);
    }
    // Only run on mount
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    handleGenerate(query);
  };

  const handleTweak = (tweakType: string) => {
    setQuery(tweakType);
    handleGenerate(tweakType);
  };

  const handleSave = async () => {
    if (!build || !isSignedIn) return;
    setSaving(true);
    try {
      await saveBuild({
        query,
        buildName: (build.buildName as string) || "Untitled Build",
        summary: (build.summary as string) || "",
        components: build.components || {},
        recommendedMods: build.recommendedMods || [],
        estimatedTotal: (build.estimatedTotal as number) || 0,
        soundProfileExpected: (build.soundProfileExpected as string) || "",
        buildDifficulty: (build.buildDifficulty as string) || "intermediate",
        notes: (build.notes as string) || "",
      });
      setSaved(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to save build");
    } finally {
      setSaving(false);
    }
  };

  const [placeholderIndex, setPlaceholderIndex] = useState(0);
  useEffect(() => {
    const interval = setInterval(() => {
      setPlaceholderIndex((i) => (i + 1) % PLACEHOLDER_QUERIES.length);
    }, 4000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="min-h-screen">
      <Navigation />
      <main className="max-w-3xl mx-auto px-4 py-8">
        <h1 className="text-2xl font-bold mb-6">Build Advisor</h1>

        <form onSubmit={handleSubmit} className="mb-8">
          <textarea
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder={PLACEHOLDER_QUERIES[placeholderIndex]}
            rows={3}
            className="w-full bg-bg-surface border border-border-default rounded-xl px-5 py-4 text-lg text-text-primary placeholder:text-text-muted/50 resize-none focus:border-accent/50 transition-colors mb-3"
          />
          <button
            type="submit"
            disabled={loading || !query.trim()}
            className="px-6 py-2.5 rounded-lg bg-accent text-bg-primary font-semibold hover:bg-accent-hover transition-colors disabled:opacity-30"
          >
            {loading ? "Generating..." : "Build My Board"}
          </button>
        </form>

        {loading && (
          <div className="flex flex-col items-center justify-center py-16">
            <div className="w-8 h-8 border-2 border-accent/30 border-t-accent rounded-full animate-spin mb-4" />
            <p className="text-text-secondary animate-pulse">
              {loadingMessage}
            </p>
          </div>
        )}

        {error && (
          <div className="rounded-lg border border-red-500/30 bg-red-500/10 p-4 mb-6">
            <p className="text-sm text-red-400">{error}</p>
          </div>
        )}

        {build && !loading && (
          <div className="space-y-4">
            <BuildCard
              build={build as never}
              onSave={isSignedIn && !saved ? handleSave : undefined}
              onTweak={handleTweak}
              saving={saving}
            />
            {saved && (
              <p className="text-sm text-green-400 text-center">
                Build saved to your collection!
              </p>
            )}
            <div className="text-center">
              <button
                onClick={() => {
                  setBuild(null);
                  setQuery("");
                  setSaved(false);
                }}
                className="text-sm text-text-muted hover:text-text-secondary transition-colors"
              >
                Start fresh
              </button>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
