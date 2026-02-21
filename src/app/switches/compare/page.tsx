"use client";

import { Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { useQuery } from "convex/react";
import Link from "next/link";
import { api } from "../../../../convex/_generated/api";
import { Id } from "../../../../convex/_generated/dataModel";
import { SwitchComparison } from "@/components/SwitchComparison";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";

function CompareContent() {
  const searchParams = useSearchParams();
  const idsParam = searchParams.get("ids") || "";
  const ids = idsParam.split(",").filter(Boolean);

  const switch1 = useQuery(
    api.switches.getById,
    ids[0] ? { id: ids[0] as Id<"switches"> } : "skip"
  );
  const switch2 = useQuery(
    api.switches.getById,
    ids[1] ? { id: ids[1] as Id<"switches"> } : "skip"
  );
  const switch3 = useQuery(
    api.switches.getById,
    ids[2] ? { id: ids[2] as Id<"switches"> } : "skip"
  );

  const switches = [switch1, switch2, switch3].filter(
    (s): s is NonNullable<typeof s> => s != null
  );

  const loading = ids.some((_, i) => {
    const s = [switch1, switch2, switch3][i];
    return s === undefined;
  });

  return (
    <div className="min-h-screen">
      <main className="max-w-6xl mx-auto px-4 lg:px-8 py-8">
        {/* Back link */}
        <Link
          href="/switches"
          className="inline-flex items-center gap-1.5 text-sm text-text-muted hover:text-accent transition-colors duration-150 mb-6 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/40 rounded"
        >
          <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
          </svg>
          Back to Switches
        </Link>

        {/* Header */}
        <div className="flex items-center gap-3 mb-8">
          <h1 className="font-[family-name:var(--font-outfit)] text-2xl font-bold text-text-primary tracking-tight">
            Switch Comparison
          </h1>
          <Badge variant="info" size="sm">
            {switches.length}
          </Badge>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-24">
            <div className="w-8 h-8 border-2 border-accent/30 border-t-accent rounded-full animate-spin" />
          </div>
        ) : (
          <>
            <SwitchComparison switches={switches as never[]} />

            {switches.length > 0 && (
              <div className="mt-10 flex justify-center">
                <Link
                  href={`/advisor?q=${encodeURIComponent(
                    `I'm choosing between ${switches.map((s) => `${s.brand} ${s.name}`).join(" and ")}. What build would you recommend?`
                  )}`}
                >
                  <Button size="lg">
                    <span className="flex items-center gap-2">
                      Use in Build Advisor
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M13 7l5 5m0 0l-5 5m5-5H6" />
                      </svg>
                    </span>
                  </Button>
                </Link>
              </div>
            )}
          </>
        )}
      </main>
    </div>
  );
}

export default function ComparePage() {
  return (
    <Suspense
      fallback={
        <div className="flex items-center justify-center py-24">
          <div className="w-8 h-8 border-2 border-accent/30 border-t-accent rounded-full animate-spin" />
        </div>
      }
    >
      <CompareContent />
    </Suspense>
  );
}
