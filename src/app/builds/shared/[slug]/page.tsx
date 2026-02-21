"use client";

import { useParams, useRouter } from "next/navigation";
import { useQuery } from "convex/react";
import { api } from "../../../../../convex/_generated/api";
import { BuildCard } from "@/components/BuildCard";
import { BuildImagePreview } from "@/components/BuildImagePreview";
import { Button } from "@/components/ui/Button";
import { Skeleton } from "@/components/ui/Skeleton";
import { KeyboardViewer3D } from "@/components/3d/KeyboardViewer3D";
import { buildDataToViewerConfig } from "@/lib/keyboard3d";
import type { BuildData } from "@/lib/types";

export default function SharedBuildPage() {
  const params = useParams();
  const router = useRouter();
  const slug = params.slug as string;

  const build = useQuery(api.savedBuilds.getByShareSlug, { slug });

  if (build === undefined) {
    return (
      <div className="p-6 lg:p-8 max-w-3xl mx-auto space-y-4">
        <Skeleton variant="text" className="w-32 h-4" />
        <Skeleton variant="text" className="w-64 h-8" />
        <Skeleton variant="card" className="h-96" />
      </div>
    );
  }

  if (!build) {
    return (
      <div className="p-6 lg:p-8 max-w-3xl mx-auto text-center py-20">
        <h1 className="text-2xl font-bold text-text-primary font-[family-name:var(--font-outfit)] tracking-tight mb-2">
          Build Not Found
        </h1>
        <p className="text-sm text-text-muted mb-6">This build may have been made private or deleted.</p>
        <Button onClick={() => router.push("/")}>Go Home</Button>
      </div>
    );
  }

  return (
    <div className="p-6 lg:p-8 max-w-3xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <p className="text-xs uppercase tracking-wider text-text-muted mb-1">Shared Build</p>
        <h1 className="text-2xl lg:text-3xl font-bold text-text-primary font-[family-name:var(--font-outfit)] tracking-tight">
          {build.buildName}
        </h1>
      </div>

      {/* Interactive 3D Viewer */}
      <div className="mb-6">
        <KeyboardViewer3D
          config={buildDataToViewerConfig(build as unknown as BuildData)}
          height="320px"
          autoRotate
          fallback={
            build.imageUrl ? <BuildImagePreview imageUrl={build.imageUrl} /> : undefined
          }
        />
      </div>

      {/* AI-generated image as collapsible section */}
      {build.imageUrl && (
        <details className="mb-6 group">
          <summary className="text-xs text-text-muted cursor-pointer hover:text-text-secondary transition-colors duration-150 select-none">
            View product shot
          </summary>
          <div className="mt-3">
            <BuildImagePreview imageUrl={build.imageUrl} />
          </div>
        </details>
      )}

      <BuildCard build={build as never} showActions={false} imageUrl={build.imageUrl} />

      <div className="mt-8 flex items-center justify-center gap-4">
        <Button
          onClick={() => router.push(`/advisor?q=${encodeURIComponent(`Build something similar to: ${build.summary}`)}`)}
        >
          Build Something Like This
        </Button>
        <Button
          variant="ghost"
          onClick={() => router.push("/")}
        >
          Back to Home
        </Button>
      </div>
    </div>
  );
}
