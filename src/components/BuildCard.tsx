"use client";

import { useState } from "react";
import { cn, formatPrice, formatPriceWhole } from "@/lib/utils";
import { VendorLinksSection } from "./VendorLinks";
import { BuildImagePreview } from "./BuildImagePreview";

interface BuildComponent {
  name: string;
  price: number;
  reason: string;
  quantity?: number;
  priceEach?: number;
}

interface BuildMod {
  mod: string;
  cost: number;
  effect: string;
  difficulty: string;
}

interface BuildData {
  buildName: string;
  summary: string;
  components: {
    keyboardKit?: BuildComponent;
    switches?: BuildComponent & { quantity: number; priceEach: number };
    keycaps?: BuildComponent;
    stabilizers?: BuildComponent;
  };
  recommendedMods: BuildMod[];
  estimatedTotal: number;
  soundProfileExpected: string;
  buildDifficulty: string;
  notes: string;
  rawResponse?: string;
}

interface BuildCardProps {
  build: BuildData;
  onSave?: () => void;
  onTweak?: (tweakType: string) => void;
  saving?: boolean;
  showActions?: boolean;
  // v2 props
  id?: string;
  imageUrl?: string;
  isPublic?: boolean;
  shareSlug?: string;
  onShare?: () => void;
  onVisualize?: () => void;
  generating?: boolean;
}

const DIFFICULTY_COLORS: Record<string, string> = {
  "beginner-friendly": "text-green-400 bg-green-500/15 border-green-500/30",
  intermediate: "text-amber-400 bg-amber-500/15 border-amber-500/30",
  advanced: "text-red-400 bg-red-500/15 border-red-500/30",
};

const MOD_DIFFICULTY_COLORS: Record<string, string> = {
  easy: "text-green-400",
  medium: "text-amber-400",
  hard: "text-red-400",
};

function ComponentRow({
  label,
  component,
}: {
  label: string;
  component: BuildComponent & { quantity?: number; priceEach?: number };
}) {
  if (!component) return null;
  const totalPrice =
    component.quantity && component.priceEach
      ? component.quantity * component.priceEach
      : component.price;

  return (
    <div>
      <div className="flex items-start gap-3 p-3 rounded-lg bg-bg-primary border border-border-subtle">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <span className="text-[10px] text-text-muted uppercase tracking-wider font-medium">
              {label}
            </span>
          </div>
          <p className="font-medium text-text-primary text-sm">{component.name}</p>
          {component.quantity && (
            <p className="text-xs text-text-muted font-mono mt-0.5">
              {component.quantity}x @ {formatPrice(component.priceEach || 0)} each
            </p>
          )}
          <p className="text-xs text-text-secondary mt-1 leading-relaxed">{component.reason}</p>
        </div>
        <span className="font-mono text-accent font-semibold whitespace-nowrap text-sm">
          {formatPriceWhole(totalPrice)}
        </span>
      </div>
      <VendorLinksSection productName={component.name} />
    </div>
  );
}

function buildToMarkdown(build: BuildData): string {
  const lines: string[] = [];
  lines.push(`# ${build.buildName}`);
  lines.push("");
  lines.push(build.summary);
  lines.push("");
  lines.push("## Components");
  lines.push("");

  const components = build.components;
  if (components.keyboardKit) {
    lines.push(`- **Keyboard Kit:** ${components.keyboardKit.name} — ${formatPriceWhole(components.keyboardKit.price)}`);
  }
  if (components.switches) {
    const sw = components.switches;
    const total = sw.quantity && sw.priceEach ? sw.quantity * sw.priceEach : sw.price;
    lines.push(`- **Switches:** ${sw.name} (${sw.quantity}x @ ${formatPrice(sw.priceEach || 0)}) — ${formatPriceWhole(total)}`);
  }
  if (components.keycaps) {
    lines.push(`- **Keycaps:** ${components.keycaps.name} — ${formatPriceWhole(components.keycaps.price)}`);
  }
  if (components.stabilizers) {
    lines.push(`- **Stabilizers:** ${components.stabilizers.name} — ${formatPriceWhole(components.stabilizers.price)}`);
  }

  if (build.recommendedMods && build.recommendedMods.length > 0) {
    lines.push("");
    lines.push("## Recommended Mods");
    lines.push("");
    for (const mod of build.recommendedMods) {
      lines.push(`- ${mod.mod} (+${formatPriceWhole(mod.cost)}) — ${mod.effect}`);
    }
  }

  lines.push("");
  lines.push(`**Estimated Total:** ${formatPriceWhole(build.estimatedTotal)}`);
  if (build.soundProfileExpected) {
    lines.push(`**Sound Profile:** ${build.soundProfileExpected}`);
  }
  lines.push(`**Difficulty:** ${build.buildDifficulty}`);

  if (build.notes) {
    lines.push("");
    lines.push(`> ${build.notes}`);
  }

  return lines.join("\n");
}

export function BuildCard({
  build,
  onSave,
  onTweak,
  saving,
  showActions = true,
  id,
  imageUrl,
  isPublic,
  shareSlug,
  onShare,
  onVisualize,
  generating,
}: BuildCardProps) {
  const [copied, setCopied] = useState<"link" | "markdown" | null>(null);

  const copyToClipboard = (text: string, type: "link" | "markdown") => {
    navigator.clipboard.writeText(text);
    setCopied(type);
    setTimeout(() => setCopied(null), 2000);
  };

  if (build.rawResponse) {
    return (
      <div className="rounded-xl border border-border-default bg-bg-surface p-6 shadow-surface">
        <h2 className="text-xl font-bold text-text-primary mb-2 font-[family-name:var(--font-outfit)] tracking-tight">
          {build.buildName}
        </h2>
        <p className="text-text-secondary whitespace-pre-wrap text-sm leading-relaxed">
          {build.rawResponse}
        </p>
      </div>
    );
  }

  return (
    <div className="rounded-xl border border-border-default bg-bg-surface overflow-hidden shadow-surface">
      {/* Build Visualization */}
      {imageUrl && (
        <div className="p-4 pb-0">
          <BuildImagePreview imageUrl={imageUrl} />
        </div>
      )}

      {/* Header */}
      <div className="p-6 border-b border-border-subtle">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h2 className="text-xl font-bold text-text-primary font-[family-name:var(--font-outfit)] tracking-tight">
              {build.buildName}
            </h2>
            <p className="text-text-secondary mt-1 text-sm leading-relaxed">{build.summary}</p>
          </div>
          <div className="text-right shrink-0">
            <p className="text-2xl font-bold font-mono text-accent">
              {formatPriceWhole(build.estimatedTotal)}
            </p>
            <span
              className={cn(
                "inline-block mt-1 px-2 py-0.5 rounded text-xs font-medium border",
                DIFFICULTY_COLORS[build.buildDifficulty] ||
                  DIFFICULTY_COLORS.intermediate
              )}
            >
              {build.buildDifficulty}
            </span>
          </div>
        </div>
        {build.soundProfileExpected && (
          <div className="mt-3 px-3 py-2.5 rounded-lg bg-accent-dim border border-accent/20">
            <span className="text-[10px] text-accent uppercase tracking-wider font-semibold">
              Expected Sound
            </span>
            <p className="text-sm text-text-primary mt-0.5">
              {build.soundProfileExpected}
            </p>
          </div>
        )}
      </div>

      {/* Components */}
      <div className="p-6 space-y-2">
        <h3 className="text-xs font-semibold text-text-muted uppercase tracking-wider mb-3 font-[family-name:var(--font-outfit)]">
          Components
        </h3>
        {build.components.keyboardKit && (
          <ComponentRow
            label="Keyboard Kit"
            component={build.components.keyboardKit}
          />
        )}
        {build.components.switches && (
          <ComponentRow
            label="Switches"
            component={build.components.switches}
          />
        )}
        {build.components.keycaps && (
          <ComponentRow label="Keycaps" component={build.components.keycaps} />
        )}
        {build.components.stabilizers && (
          <ComponentRow
            label="Stabilizers"
            component={build.components.stabilizers}
          />
        )}
      </div>

      {/* Mods */}
      {build.recommendedMods && build.recommendedMods.length > 0 && (
        <div className="px-6 pb-6">
          <h3 className="text-xs font-semibold text-text-muted uppercase tracking-wider mb-3 font-[family-name:var(--font-outfit)]">
            Recommended Mods
          </h3>
          <div className="space-y-2">
            {build.recommendedMods.map((mod, i) => (
              <div
                key={i}
                className="flex items-center justify-between p-3 rounded-lg bg-bg-primary border border-border-subtle"
              >
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium text-text-primary">
                      {mod.mod}
                    </span>
                    <span
                      className={cn(
                        "text-[10px] uppercase font-semibold",
                        MOD_DIFFICULTY_COLORS[mod.difficulty] || "text-text-muted"
                      )}
                    >
                      {mod.difficulty}
                    </span>
                  </div>
                  <p className="text-xs text-text-secondary mt-0.5">
                    {mod.effect}
                  </p>
                </div>
                <span className="font-mono text-sm text-text-secondary ml-3">
                  +{formatPriceWhole(mod.cost)}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Notes */}
      {build.notes && (
        <div className="px-6 pb-6">
          <p className="text-sm text-text-secondary italic leading-relaxed">{build.notes}</p>
        </div>
      )}

      {/* Actions */}
      {showActions && (
        <div className="px-6 pb-6 flex flex-wrap gap-2">
          {onSave && (
            <button
              onClick={onSave}
              disabled={saving}
              className="px-4 py-2 rounded-lg bg-accent text-bg-primary font-semibold text-sm hover:bg-accent-hover shadow-[0_1px_8px_rgba(232,89,12,0.15)] transition-[background-color,transform] duration-150 disabled:opacity-40 disabled:cursor-not-allowed active:scale-[0.97] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/40 focus-visible:ring-offset-2 focus-visible:ring-offset-bg-primary"
            >
              {saving ? "Saving..." : "Save Build"}
            </button>
          )}
          {onTweak && (
            <>
              <button
                onClick={() => onTweak("Make it cheaper")}
                className="px-3 py-2 rounded-lg border border-border-default bg-bg-elevated text-text-secondary text-sm hover:text-text-primary hover:border-border-accent transition-[border-color,color] duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/40 active:scale-[0.97]"
              >
                Make it cheaper
              </button>
              <button
                onClick={() => onTweak("Make it thockier")}
                className="px-3 py-2 rounded-lg border border-border-default bg-bg-elevated text-text-secondary text-sm hover:text-text-primary hover:border-border-accent transition-[border-color,color] duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/40 active:scale-[0.97]"
              >
                Make it thockier
              </button>
              <button
                onClick={() => onTweak("Make it wireless")}
                className="px-3 py-2 rounded-lg border border-border-default bg-bg-elevated text-text-secondary text-sm hover:text-text-primary hover:border-border-accent transition-[border-color,color] duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/40 active:scale-[0.97]"
              >
                Make it wireless
              </button>
            </>
          )}

          {/* Share */}
          {onShare && (
            isPublic && shareSlug ? (
              <button
                onClick={() => copyToClipboard(`${window.location.origin}/builds/shared/${shareSlug}`, "link")}
                className="px-3 py-2 rounded-lg border border-accent/30 text-accent text-sm hover:bg-accent/10 transition-[background-color] duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/40 active:scale-[0.97]"
              >
                {copied === "link" ? "Copied!" : "Copy Link"}
              </button>
            ) : (
              <button
                onClick={onShare}
                className="px-3 py-2 rounded-lg border border-border-default bg-bg-elevated text-text-secondary text-sm hover:text-text-primary hover:border-border-accent transition-[border-color,color] duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/40 active:scale-[0.97]"
              >
                Share
              </button>
            )
          )}

          {/* Visualize */}
          {id && !imageUrl && onVisualize && (
            <button
              onClick={onVisualize}
              disabled={generating}
              className="px-3 py-2 rounded-lg border border-border-default bg-bg-elevated text-text-secondary text-sm hover:text-text-primary hover:border-border-accent transition-[border-color,color] duration-150 disabled:opacity-40 disabled:cursor-not-allowed focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/40 active:scale-[0.97]"
            >
              {generating ? "Generating..." : "Visualize"}
            </button>
          )}

          {/* Copy Markdown */}
          <button
            onClick={() => copyToClipboard(buildToMarkdown(build), "markdown")}
            className="px-3 py-2 rounded-lg border border-border-default bg-bg-elevated text-text-secondary text-sm hover:text-text-primary hover:border-border-accent transition-[border-color,color] duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/40 active:scale-[0.97]"
          >
            {copied === "markdown" ? "Copied!" : "Copy as Markdown"}
          </button>
        </div>
      )}

      {/* Visualization generator (when no image yet, shown after actions) */}
      {showActions && id && !imageUrl && onVisualize && generating && (
        <div className="px-6 pb-6">
          <BuildImagePreview generating={generating} />
        </div>
      )}
    </div>
  );
}
