"use client";

import { useParams, useRouter } from "next/navigation";
import { useQuery } from "convex/react";
import { api } from "../../../../../convex/_generated/api";
import { BuildCard } from "@/components/BuildCard";
import { BuildImagePreview } from "@/components/BuildImagePreview";
import { Button } from "@/components/ui/Button";
import { Skeleton } from "@/components/ui/Skeleton";

export default function SharedBuildPage() {
  const params = useParams();
  const router = useRouter();
  const slug = params.slug as string;

  const build = useQuery(api.savedBuilds.getByShareSlug, { slug });

  if (build === undefined) {
    return (
      <div className="p-6 lg:p-8 max-w-3xl mx-auto space-y-4">
        <Skeleton variant="text" className="w-64 h-8" />
        <Skeleton variant="card" className="h-96" />
      </div>
    );
  }

  if (!build) {
    return (
      <div className="p-6 lg:p-8 max-w-3xl mx-auto text-center py-16">
        <h1 className="text-2xl font-bold text-text-primary mb-2">Build Not Found</h1>
        <p className="text-text-muted mb-6">This build may have been made private or deleted.</p>
        <Button onClick={() => router.push("/")}>Go Home</Button>
      </div>
    );
  }

  return (
    <div className="p-6 lg:p-8 max-w-3xl mx-auto">
      <div className="mb-6">
        <p className="text-sm text-text-muted mb-1">Shared Build</p>
        <h1 className="text-2xl font-bold text-text-primary">{build.buildName}</h1>
      </div>

      {build.imageUrl && (
        <div className="mb-6">
          <BuildImagePreview imageUrl={build.imageUrl} />
        </div>
      )}

      <BuildCard build={build as never} showActions={false} imageUrl={build.imageUrl} />

      <div className="mt-6 text-center">
        <Button
          onClick={() => router.push(`/advisor?q=${encodeURIComponent(`Build something similar to: ${build.summary}`)}`)}
        >
          Build Something Like This
        </Button>
      </div>
    </div>
  );
}
