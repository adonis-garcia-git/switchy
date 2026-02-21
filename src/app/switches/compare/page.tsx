"use client";

import { useSearchParams } from "next/navigation";
import { useQuery } from "convex/react";
import Link from "next/link";
import { api } from "../../../../convex/_generated/api";
import { Id } from "../../../../convex/_generated/dataModel";
import { Navigation } from "@/components/Navigation";
import { SwitchComparison } from "@/components/SwitchComparison";

export default function ComparePage() {
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
      <Navigation />
      <main className="max-w-6xl mx-auto px-4 py-8">
        <Link
          href="/switches"
          className="text-sm text-text-muted hover:text-accent transition-colors mb-6 inline-block"
        >
          ← Back to Switches
        </Link>

        <h1 className="text-2xl font-bold mb-6">Switch Comparison</h1>

        {loading ? (
          <div className="flex items-center justify-center py-24">
            <div className="w-8 h-8 border-2 border-accent/30 border-t-accent rounded-full animate-spin" />
          </div>
        ) : (
          <>
            <SwitchComparison switches={switches as never[]} />
            {switches.length > 0 && (
              <div className="mt-8 text-center">
                <Link
                  href={`/advisor?q=${encodeURIComponent(
                    `I'm choosing between ${switches.map((s) => `${s.brand} ${s.name}`).join(" and ")}. What build would you recommend?`
                  )}`}
                  className="inline-block px-5 py-2.5 rounded-lg bg-accent text-bg-primary font-semibold text-sm hover:bg-accent-hover transition-colors"
                >
                  Use in Build Advisor
                </Link>
              </div>
            )}
          </>
        )}
      </main>
    </div>
  );
}
