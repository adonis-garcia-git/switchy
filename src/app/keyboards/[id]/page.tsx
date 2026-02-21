"use client";

import { useParams, useRouter } from "next/navigation";
import { useQuery } from "convex/react";
import { api } from "../../../../convex/_generated/api";
import { Id } from "../../../../convex/_generated/dataModel";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Skeleton } from "@/components/ui/Skeleton";
import { formatPriceWhole } from "@/lib/utils";

export default function KeyboardDetailPage() {
  const params = useParams();
  const router = useRouter();
  const keyboard = useQuery(api.keyboards.getById, {
    id: params.id as Id<"keyboards">,
  });

  if (keyboard === undefined) {
    return (
      <div className="p-6 lg:p-8 max-w-4xl mx-auto space-y-4">
        <Skeleton variant="text" className="w-48 h-8" />
        <Skeleton variant="card" className="h-64" />
      </div>
    );
  }

  if (!keyboard) {
    return (
      <div className="p-6 lg:p-8 max-w-4xl mx-auto text-center py-16">
        <p className="text-text-muted">Keyboard not found.</p>
        <Button variant="ghost" onClick={() => router.push("/keyboards")} className="mt-4">
          Back to Keyboards
        </Button>
      </div>
    );
  }

  return (
    <div className="p-6 lg:p-8 max-w-4xl mx-auto">
      <button
        onClick={() => router.push("/keyboards")}
        className="text-sm text-text-muted hover:text-text-primary mb-6 inline-flex items-center gap-1"
      >
        ← Back to Keyboards
      </button>

      <div className="rounded-xl border border-border-default bg-bg-surface overflow-hidden">
        <div className="p-6 border-b border-border-subtle">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-sm text-text-muted">{keyboard.brand}</p>
              <h1 className="text-2xl font-bold text-text-primary">{keyboard.name}</h1>
            </div>
            <div className="text-right">
              <p className="text-3xl font-bold font-mono text-accent">
                {formatPriceWhole(keyboard.priceUsd)}
              </p>
              <span className={keyboard.inStock ? "text-emerald-400 text-sm" : "text-text-muted text-sm"}>
                {keyboard.inStock ? "In Stock" : "Out of Stock"}
              </span>
            </div>
          </div>
        </div>

        <div className="p-6 grid grid-cols-1 sm:grid-cols-2 gap-6">
          <div className="space-y-4">
            <div>
              <p className="text-xs text-text-muted uppercase tracking-wider mb-1">Size</p>
              <p className="text-text-primary font-medium">{keyboard.size}</p>
            </div>
            <div>
              <p className="text-xs text-text-muted uppercase tracking-wider mb-1">Mounting Style</p>
              <p className="text-text-primary font-medium">{keyboard.mountingStyle}</p>
            </div>
            <div>
              <p className="text-xs text-text-muted uppercase tracking-wider mb-1">Plate Material</p>
              <p className="text-text-primary font-medium">{keyboard.plateMaterial}</p>
            </div>
            <div>
              <p className="text-xs text-text-muted uppercase tracking-wider mb-1">Case Material</p>
              <p className="text-text-primary font-medium">{keyboard.caseMaterial}</p>
            </div>
          </div>

          <div className="space-y-4">
            <div>
              <p className="text-xs text-text-muted uppercase tracking-wider mb-2">Features</p>
              <div className="flex flex-wrap gap-2">
                <Badge variant={keyboard.hotSwap ? "success" : "default"} size="md">
                  {keyboard.hotSwap ? "Hot-swap" : "Soldered"}
                </Badge>
                <Badge variant={keyboard.wireless ? "info" : "default"} size="md">
                  {keyboard.wireless ? "Wireless" : "Wired Only"}
                </Badge>
                <Badge variant={keyboard.rgb ? "info" : "default"} size="md">
                  {keyboard.rgb ? "RGB" : "No RGB"}
                </Badge>
              </div>
            </div>
          </div>
        </div>

        {keyboard.notes && (
          <div className="px-6 pb-6">
            <p className="text-xs text-text-muted uppercase tracking-wider mb-2">Notes</p>
            <p className="text-sm text-text-secondary">{keyboard.notes}</p>
          </div>
        )}

        <div className="px-6 pb-6">
          <Button
            onClick={() => router.push(`/advisor?q=${encodeURIComponent(`Build a custom keyboard using the ${keyboard.brand} ${keyboard.name} as the base kit`)}`)}
          >
            Use in Build Advisor
          </Button>
        </div>
      </div>
    </div>
  );
}
