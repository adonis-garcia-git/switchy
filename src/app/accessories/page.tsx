"use client";

import { useQuery } from "convex/react";
import { api } from "../../../convex/_generated/api";

const CATEGORY_LABELS: Record<string, string> = {
  plate: "Plate Materials",
  case: "Case Materials",
  keycapProfile: "Keycap Profiles",
  keycapMaterial: "Keycap Materials",
  mountingStyle: "Mounting Styles",
  mod: "Mods & Accessories",
};

const CATEGORY_ORDER = ["plate", "case", "keycapProfile", "keycapMaterial", "mountingStyle", "mod"];

const PRICE_COLORS: Record<string, string> = {
  budget: "text-green-400 bg-green-500/10",
  mid: "text-amber-400 bg-amber-500/10",
  premium: "text-purple-400 bg-purple-500/10",
};

export default function AccessoriesPage() {
  const components = useQuery(api.components.list, {});

  // Group by category
  const grouped = (components || []).reduce((acc: Record<string, any[]>, comp: any) => {
    const cat = comp.category || "other";
    if (!acc[cat]) acc[cat] = [];
    acc[cat].push(comp);
    return acc;
  }, {});

  return (
    <div className="p-6 lg:p-8">
      <main className="max-w-5xl mx-auto">
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-text-primary font-[family-name:var(--font-outfit)] tracking-tight mb-2">
            Accessories & Components
          </h1>
          <p className="text-sm text-text-secondary leading-relaxed">
            Explore different materials, profiles, and mods that shape your keyboard&apos;s sound and feel.
          </p>
        </div>

        {components === undefined ? (
          <div className="flex items-center justify-center py-24">
            <div className="w-8 h-8 border-2 border-accent/30 border-t-accent rounded-full animate-spin" />
          </div>
        ) : (
          <div className="space-y-10">
            {CATEGORY_ORDER.map((category) => {
              const items = grouped[category];
              if (!items || items.length === 0) return null;
              return (
                <section key={category}>
                  <h2 className="text-lg font-semibold text-text-primary font-[family-name:var(--font-outfit)] tracking-tight mb-4">
                    {CATEGORY_LABELS[category] || category}
                  </h2>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    {items.map((comp: any) => (
                      <div
                        key={comp._id}
                        className="rounded-xl border border-border-subtle bg-bg-surface p-5 shadow-surface hover:border-border-accent hover:glow-accent transition-[border-color,box-shadow] duration-200"
                      >
                        <div className="flex items-start justify-between mb-2">
                          <h3 className="font-semibold text-text-primary font-[family-name:var(--font-outfit)]">
                            {comp.name}
                          </h3>
                          <span className={`text-[10px] font-medium px-2 py-0.5 rounded-full ${PRICE_COLORS[comp.priceRange] || "text-text-muted bg-bg-elevated"}`}>
                            {comp.priceRange}
                          </span>
                        </div>
                        <p className="text-sm text-accent mb-2">{comp.soundEffect}</p>
                        <p className="text-xs text-text-secondary leading-relaxed">{comp.notes}</p>
                      </div>
                    ))}
                  </div>
                </section>
              );
            })}
          </div>
        )}
      </main>
    </div>
  );
}
