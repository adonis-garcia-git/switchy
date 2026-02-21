"use client";

import { SWITCH_TYPE_COLORS } from "@/lib/constants";
import { cn, formatPrice } from "@/lib/utils";
import { SoundProfile } from "./SoundProfile";
import { Badge } from "./ui/Badge";

interface SwitchData {
  _id: string;
  brand: string;
  name: string;
  type: "linear" | "tactile" | "clicky";
  actuationForceG: number;
  bottomOutForceG?: number;
  actuationMm: number;
  totalTravelMm: number;
  stemMaterial?: string;
  housingMaterial?: string;
  springType?: string;
  factoryLubed?: boolean;
  longPole?: boolean;
  soundPitch?: "low" | "mid" | "high";
  soundCharacter?: string;
  soundVolume?: "quiet" | "medium" | "loud";
  pricePerSwitch: number;
  communityRating?: number;
  popularFor?: string[];
  notes?: string;
}

interface SwitchComparisonProps {
  switches: SwitchData[];
}

function CompareRow({
  label,
  values,
  highlight,
  mono,
  isAlt,
}: {
  label: string;
  values: (string | number | boolean)[];
  highlight?: "min" | "max";
  mono?: boolean;
  isAlt?: boolean;
}) {
  let bestIndex = -1;
  if (highlight && typeof values[0] === "number") {
    const nums = values as number[];
    if (highlight === "min") {
      bestIndex = nums.indexOf(Math.min(...nums));
    } else {
      bestIndex = nums.indexOf(Math.max(...nums));
    }
  }

  return (
    <div
      className={cn(
        "grid gap-0",
        isAlt ? "bg-bg-elevated/40" : "bg-transparent"
      )}
      style={{
        gridTemplateColumns: `180px repeat(${values.length}, 1fr)`,
      }}
    >
      <div className="text-xs text-text-muted uppercase tracking-wider py-3 px-4 flex items-center border-r border-border-subtle">
        {label}
      </div>
      {values.map((val, i) => (
        <div
          key={i}
          className={cn(
            "py-3 px-4 flex items-center",
            i < values.length - 1 && "border-r border-border-subtle",
            i === bestIndex && "bg-accent-dim/30"
          )}
        >
          <span
            className={cn(
              "text-sm",
              mono && "font-mono",
              i === bestIndex
                ? "text-accent font-semibold"
                : "text-text-primary"
            )}
          >
            {typeof val === "boolean" ? (val ? "Yes" : "No") : val}
          </span>
        </div>
      ))}
    </div>
  );
}

export function SwitchComparison({ switches }: SwitchComparisonProps) {
  if (switches.length === 0) {
    return (
      <div className="text-center py-16 text-text-muted">
        Select switches to compare
      </div>
    );
  }

  const specs: {
    label: string;
    values: (string | number | boolean)[];
    highlight?: "min" | "max";
    mono?: boolean;
  }[] = [
    {
      label: "Actuation Force",
      values: switches.map((s) => `${s.actuationForceG}g`),
    },
    {
      label: "Bottom Out Force",
      values: switches.map((s) => s.bottomOutForceG != null ? `${s.bottomOutForceG}g` : "N/A"),
    },
    {
      label: "Actuation Point",
      values: switches.map((s) => `${s.actuationMm}mm`),
    },
    {
      label: "Total Travel",
      values: switches.map((s) => `${s.totalTravelMm}mm`),
    },
    {
      label: "Stem Material",
      values: switches.map((s) => s.stemMaterial ?? "N/A"),
    },
    {
      label: "Housing",
      values: switches.map((s) => s.housingMaterial ?? "N/A"),
    },
    {
      label: "Spring Type",
      values: switches.map((s) => s.springType ?? "N/A"),
    },
    {
      label: "Factory Lubed",
      values: switches.map((s) => s.factoryLubed != null ? s.factoryLubed : "N/A"),
    },
    {
      label: "Long Pole",
      values: switches.map((s) => s.longPole != null ? s.longPole : "N/A"),
    },
    {
      label: "Price",
      values: switches.map((s) => s.pricePerSwitch),
      highlight: "min" as const,
      mono: true,
    },
    {
      label: "Rating",
      values: switches.map((s) => s.communityRating ?? 0),
      highlight: "max" as const,
      mono: true,
    },
  ];

  return (
    <div className="space-y-8">
      {/* Column headers */}
      <div
        className="grid gap-0"
        style={{
          gridTemplateColumns: `180px repeat(${switches.length}, 1fr)`,
        }}
      >
        <div />
        {switches.map((sw) => (
          <div
            key={sw._id}
            className="text-center p-4 bg-bg-surface rounded-xl border border-border-subtle mx-1"
          >
            <p className="text-[10px] text-text-muted uppercase tracking-wider mb-1">
              {sw.brand}
            </p>
            <p className="font-[family-name:var(--font-outfit)] font-semibold text-text-primary tracking-tight">
              {sw.name}
            </p>
            <div className="mt-2">
              <Badge variant={sw.type} size="sm">
                {sw.type}
              </Badge>
            </div>
          </div>
        ))}
      </div>

      {/* Specs table */}
      <div className="rounded-xl overflow-hidden border border-border-default">
        <div className="divide-y divide-border-subtle">
          {specs.map((spec, idx) => (
            <CompareRow
              key={spec.label}
              label={spec.label}
              values={
                spec.mono && spec.highlight
                  ? spec.values.map((v) =>
                      typeof v === "number"
                        ? spec.label === "Price"
                          ? formatPrice(v)
                          : `${v.toFixed(1)}/5.0`
                        : v
                    )
                  : spec.values
              }
              highlight={spec.highlight}
              mono={spec.mono}
              isAlt={idx % 2 === 1}
            />
          ))}
        </div>
      </div>

      {/* Sound Profiles */}
      <div>
        <h3 className="font-[family-name:var(--font-outfit)] text-sm font-semibold text-text-secondary uppercase tracking-wider mb-4">
          Sound Profiles
        </h3>
        <div
          className="grid gap-4"
          style={{
            gridTemplateColumns: `repeat(${switches.length}, 1fr)`,
          }}
        >
          {switches.map((sw) => (
            <div
              key={sw._id}
              className="p-4 rounded-xl bg-bg-surface border border-border-subtle"
            >
              <p className="text-xs text-text-muted mb-3">
                {sw.brand} {sw.name}
              </p>
              {sw.soundPitch && sw.soundVolume && sw.soundCharacter ? (
                <SoundProfile
                  pitch={sw.soundPitch}
                  volume={sw.soundVolume}
                  character={sw.soundCharacter}
                />
              ) : (
                <p className="text-xs text-text-muted italic">No sound data</p>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Notes */}
      {switches.some((sw) => sw.notes) && (
        <div>
          <h3 className="font-[family-name:var(--font-outfit)] text-sm font-semibold text-text-secondary uppercase tracking-wider mb-4">
            Community Notes
          </h3>
          <div
            className="grid gap-4"
            style={{
              gridTemplateColumns: `repeat(${switches.length}, 1fr)`,
            }}
          >
            {switches.map((sw) => (
              <div
                key={sw._id}
                className="p-4 rounded-xl bg-bg-surface border border-border-subtle"
              >
                <p className="text-xs text-text-muted mb-2">
                  {sw.brand} {sw.name}
                </p>
                <p className="text-sm text-text-secondary leading-relaxed">
                  {sw.notes || "No notes available"}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
