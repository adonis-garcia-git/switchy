"use client";

import { cn, formatPrice, formatPriceWhole } from "@/lib/utils";

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
    <div className="flex items-start gap-3 p-3 rounded-lg bg-bg-primary/50">
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-1">
          <span className="text-xs text-text-muted uppercase tracking-wider">
            {label}
          </span>
        </div>
        <p className="font-medium text-text-primary">{component.name}</p>
        {component.quantity && (
          <p className="text-xs text-text-muted font-mono mt-0.5">
            {component.quantity}x @ {formatPrice(component.priceEach || 0)} each
          </p>
        )}
        <p className="text-xs text-text-secondary mt-1">{component.reason}</p>
      </div>
      <span className="font-mono text-accent font-semibold whitespace-nowrap">
        {formatPriceWhole(totalPrice)}
      </span>
    </div>
  );
}

export function BuildCard({
  build,
  onSave,
  onTweak,
  saving,
  showActions = true,
}: BuildCardProps) {
  if (build.rawResponse) {
    return (
      <div className="rounded-xl border border-border-default bg-bg-surface p-6">
        <h2 className="text-xl font-bold text-text-primary mb-2">
          {build.buildName}
        </h2>
        <p className="text-text-secondary whitespace-pre-wrap">
          {build.rawResponse}
        </p>
      </div>
    );
  }

  return (
    <div className="rounded-xl border border-border-default bg-bg-surface overflow-hidden">
      {/* Header */}
      <div className="p-6 border-b border-border-subtle">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h2 className="text-xl font-bold text-text-primary">
              {build.buildName}
            </h2>
            <p className="text-text-secondary mt-1">{build.summary}</p>
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
          <div className="mt-3 px-3 py-2 rounded-lg bg-accent-dim/50 border border-accent/20">
            <span className="text-xs text-accent uppercase tracking-wider font-semibold">
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
        <h3 className="text-sm font-semibold text-text-muted uppercase tracking-wider mb-3">
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
          <h3 className="text-sm font-semibold text-text-muted uppercase tracking-wider mb-3">
            Recommended Mods
          </h3>
          <div className="space-y-2">
            {build.recommendedMods.map((mod, i) => (
              <div
                key={i}
                className="flex items-center justify-between p-2.5 rounded-lg bg-bg-primary/50"
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
          <p className="text-sm text-text-secondary italic">{build.notes}</p>
        </div>
      )}

      {/* Actions */}
      {showActions && (
        <div className="px-6 pb-6 flex flex-wrap gap-2">
          {onSave && (
            <button
              onClick={onSave}
              disabled={saving}
              className="px-4 py-2 rounded-lg bg-accent text-bg-primary font-medium text-sm hover:bg-accent-hover transition-colors disabled:opacity-50"
            >
              {saving ? "Saving..." : "Save Build"}
            </button>
          )}
          {onTweak && (
            <>
              <button
                onClick={() => onTweak("Make it cheaper")}
                className="px-3 py-2 rounded-lg border border-border-default text-text-secondary text-sm hover:text-text-primary hover:border-border-default/60 transition-colors"
              >
                Make it cheaper
              </button>
              <button
                onClick={() => onTweak("Make it thockier")}
                className="px-3 py-2 rounded-lg border border-border-default text-text-secondary text-sm hover:text-text-primary hover:border-border-default/60 transition-colors"
              >
                Make it thockier
              </button>
              <button
                onClick={() => onTweak("Make it wireless")}
                className="px-3 py-2 rounded-lg border border-border-default text-text-secondary text-sm hover:text-text-primary hover:border-border-default/60 transition-colors"
              >
                Make it wireless
              </button>
            </>
          )}
        </div>
      )}
    </div>
  );
}
