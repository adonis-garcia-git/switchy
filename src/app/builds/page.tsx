"use client";

import { useState } from "react";
import Link from "next/link";
import { useQuery, useMutation, useAction } from "convex/react";
import { useUser, SignInButton } from "@clerk/nextjs";
import { api } from "../../../convex/_generated/api";
import { Id } from "../../../convex/_generated/dataModel";
import { BuildCard } from "@/components/BuildCard";

export default function BuildsPage() {
  const { isSignedIn } = useUser();
  const builds = useQuery(api.savedBuilds.listByUser, {});
  const removeBuild = useMutation(api.savedBuilds.remove);
  const togglePublic = useMutation(api.savedBuilds.togglePublic);
  const generateImage = useAction(api.imageGeneration.generateBuildImage);
  const [generatingId, setGeneratingId] = useState<string | null>(null);

  const handleShare = async (buildId: Id<"builds">) => {
    await togglePublic({ id: buildId });
  };

  const handleVisualize = async (buildId: Id<"builds">) => {
    setGeneratingId(buildId);
    try {
      await generateImage({ buildId });
    } catch (e) {
      console.error("Image generation failed:", e);
    } finally {
      setGeneratingId(null);
    }
  };

  if (!isSignedIn) {
    return (
      <div className="min-h-screen">
                <div className="max-w-3xl mx-auto px-4 py-16 text-center">
          <h1 className="text-2xl font-bold mb-4">My Builds</h1>
          <p className="text-text-muted mb-6">
            Sign in to save and view your build recommendations.
          </p>
          <SignInButton mode="modal">
            <button className="px-6 py-2.5 rounded-lg bg-accent text-bg-primary font-semibold hover:bg-accent-hover transition-colors">
              Sign In
            </button>
          </SignInButton>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
            <main className="max-w-3xl mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold">My Builds</h1>
          <Link
            href="/advisor"
            className="px-4 py-2 rounded-lg bg-accent text-bg-primary text-sm font-semibold hover:bg-accent-hover transition-colors"
          >
            + New Build
          </Link>
        </div>

        {builds === undefined ? (
          <div className="flex items-center justify-center py-24">
            <div className="w-8 h-8 border-2 border-accent/30 border-t-accent rounded-full animate-spin" />
          </div>
        ) : builds.length === 0 ? (
          <div className="text-center py-16 text-text-muted">
            <p className="mb-2">No saved builds yet.</p>
            <p className="text-sm">
              Use the{" "}
              <Link href="/advisor" className="text-accent hover:underline">
                Build Advisor
              </Link>{" "}
              to generate and save recommendations.
            </p>
          </div>
        ) : (
          <div className="space-y-6">
            {builds.map((build: any) => (
              <div key={build._id} className="relative">
                <BuildCard
                  build={build as never}
                  showActions={true}
                  id={build._id}
                  imageUrl={build.imageUrl}
                  isPublic={build.isPublic}
                  shareSlug={build.shareSlug}
                  onShare={() => handleShare(build._id as Id<"builds">)}
                  onVisualize={() => handleVisualize(build._id as Id<"builds">)}
                  generating={generatingId === build._id}
                />
                <div className="flex items-center gap-3 mt-2 px-2">
                  <span className="text-xs text-text-muted">
                    Query: &ldquo;{build.query}&rdquo;
                  </span>
                  {build.isPublic && (
                    <span className="text-xs text-accent">Public</span>
                  )}
                  <button
                    onClick={() =>
                      removeBuild({ id: build._id as Id<"builds"> })
                    }
                    className="text-xs text-text-muted hover:text-red-400 transition-colors ml-auto"
                  >
                    Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
