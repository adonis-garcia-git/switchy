"use client";

import { useState } from "react";
import Link from "next/link";
import { useQuery, useMutation, useAction } from "convex/react";
import { useUser, SignInButton } from "@clerk/nextjs";
import { api } from "../../../convex/_generated/api";
import { Id } from "../../../convex/_generated/dataModel";
import { BuildCard } from "@/components/BuildCard";
import { BuildCardCompact } from "@/components/BuildCardCompact";
import { Button } from "@/components/ui/Button";
import { Modal } from "@/components/ui/Modal";
import { KeyboardViewer3D } from "@/components/3d/KeyboardViewer3D";
import { buildDataToViewerConfig } from "@/lib/keyboard3d";
import type { BuildData } from "@/lib/types";

export default function BuildsPage() {
  const { isSignedIn } = useUser();
  const builds = useQuery(api.savedBuilds.listByUser, {});
  const removeBuild = useMutation(api.savedBuilds.remove);
  const togglePublic = useMutation(api.savedBuilds.togglePublic);
  const generateImage = useAction(api.imageGeneration.generateBuildImage);
  const [generatingId, setGeneratingId] = useState<string | null>(null);
  const [viewer3DId, setViewer3DId] = useState<string | null>(null);
  const [expandedBuildId, setExpandedBuildId] = useState<string | null>(null);

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
      <div className="p-6 lg:p-8">
        <div className="max-w-md mx-auto py-20 text-center">
          <div className="rounded-xl border border-border-default bg-bg-surface shadow-surface p-8">
            <h1 className="text-2xl font-bold text-text-primary font-[family-name:var(--font-outfit)] tracking-tight mb-3">
              My Builds
            </h1>
            <p className="text-sm text-text-muted mb-6 leading-relaxed">
              Sign in to save and view your build recommendations.
            </p>
            <SignInButton mode="modal">
              <Button>Sign In</Button>
            </SignInButton>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 lg:p-8">
      <main className="max-w-5xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-2xl font-bold text-text-primary font-[family-name:var(--font-outfit)] tracking-tight">
            My Builds
          </h1>
          <Link href="/builder">
            <Button size="sm">
              <svg className="w-4 h-4 mr-1.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              New Build
            </Button>
          </Link>
        </div>

        {builds === undefined ? (
          <div className="flex items-center justify-center py-24">
            <div className="w-8 h-8 border-2 border-accent/30 border-t-accent rounded-full animate-spin" />
          </div>
        ) : builds.length === 0 ? (
          <div className="text-center py-20 rounded-xl border border-border-subtle bg-bg-surface/50">
            <p className="text-text-muted mb-2">No saved builds yet.</p>
            <p className="text-sm text-text-muted/60">
              Use the{" "}
              <Link href="/builder" className="text-accent hover:text-accent-hover transition-colors duration-150">
                AI Builder
              </Link>{" "}
              to generate and save recommendations.
            </p>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {builds.map((build: any) => (
                <BuildCardCompact
                  key={build._id}
                  build={build}
                  onClick={() => setExpandedBuildId(build._id)}
                />
              ))}
            </div>

            {expandedBuildId && (() => {
              const build = builds.find((b: any) => b._id === expandedBuildId);
              if (!build) return null;
              return (
                <Modal isOpen onClose={() => setExpandedBuildId(null)} title={build.buildName} size="lg">
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
                  <div className="flex items-center gap-3 mt-4 px-1">
                    <button
                      onClick={() => setViewer3DId(build._id)}
                      className="text-sm text-text-secondary hover:text-accent transition-colors duration-150 focus-visible:outline-none focus-visible:text-accent"
                    >
                      3D View
                    </button>
                    <button
                      onClick={() => removeBuild({ id: build._id as Id<"builds"> })}
                      className="text-sm text-text-muted hover:text-red-400 active:text-red-500 transition-colors duration-150 focus-visible:outline-none focus-visible:text-red-400"
                    >
                      Delete
                    </button>
                  </div>
                  {viewer3DId === build._id && (
                    <div className="mt-4">
                      <KeyboardViewer3D
                        config={buildDataToViewerConfig(build as unknown as BuildData)}
                        height="400px"
                        autoRotate
                      />
                    </div>
                  )}
                </Modal>
              );
            })()}
          </>
        )}
      </main>
    </div>
  );
}
