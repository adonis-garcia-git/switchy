"use client";

import { SWITCH_TYPE_COLORS } from "@/lib/constants";
import { cn, formatPrice } from "@/lib/utils";
import { SoundProfile } from "./SoundProfile";

interface SwitchData {
  _id: string;
  brand: string;
  name: string;
  type: "linear" | "tactile" | "clicky";
  actuationForceG: number;
  bottomOutForceG: number;
  actuationMm: number;
  totalTravelMm: number;
  stemMaterial: string;
  housingMaterial: string;
  springType: string;
  factoryLubed: boolean;
  longPole: boolean;
  soundPitch: "low" | "mid" | "high";
  soundCharacter: string;
  soundVolume: "quiet" | "medium" | "loud";
  pricePerSwitch: number;
  communityRating: number;
  popularFor: string[];
  notes: string;
}

interface SwitchComparisonProps {
  switches: SwitchData[];
}

function CompareRow({
  label,
  values,
  highlight,
  mono,
}: {
  label: string;
  values: (string | number | boolean)[];
  highlight?: "min" | "max";
  mono?: boolean;
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
    <div className="grid gap-4" style={{ gridTemplateColumns: `160px repeat(${values.length}, 1fr)` }}>
      <div className="text-xs text-text-muted uppercase tracking-wider py-2 flex items-center">
        {label}
      </div>
      {values.map((val, i) => (
        <div
          key={i}
          className={cn(
            "py-2 px-3 rounded",
            i === bestIndex && "bg-accent-dim/50",
            mono && "font-mono"
          )}
        >
          <span
            className={cn(
              "text-sm",
              i === bestIndex ? "text-accent font-semibold" : "text-text-primary"
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
      <div className="text-center py-12 text-text-muted">
        Select switches to compare
      </div>
    );
  }

  return (
    <div className="space-y-1">
      {/* Header */}
      <div
        className="grid gap-4 mb-4"
        style={{ gridTemplateColumns: `160px repeat(${switches.length}, 1fr)` }}
      >
        <div />
        {switches.map((sw) => {
          const colors = SWITCH_TYPE_COLORS[sw.type];
          return (
            <div key={sw._id} className="text-center p-3 rounded-lg bg-bg-surface border border-border-subtle">
              <p className="text-xs text-text-muted">{sw.brand}</p>
              <p className="font-semibold text-text-primary">{sw.name}</p>
              <span
                className={cn(
                  "inline-block mt-1 px-2 py-0.5 rounded text-xs font-semibold border",
                  colors.bg,
                  colors.text,
                  colors.border
                )}
              >
                {sw.type}
              </span>
            </div>
          );
        })}
      </div>

      {/* Specs */}
      <div className="space-y-px rounded-lg overflow-hidden border border-border-subtle">
        <div className="bg-bg-surface/50 px-2">
          <CompareRow
            label="Actuation Force"
            values={switches.map((s) => `${s.actuationForceG}g`)}
          />
        </div>
        <div className="bg-bg-elevated/30 px-2">
          <CompareRow
            label="Bottom Out"
            values={switches.map((s) => `${s.bottomOutForceG}g`)}
          />
        </div>
        <div className="bg-bg-surface/50 px-2">
          <CompareRow
            label="Actuation Point"
            values={switches.map((s) => `${s.actuationMm}mm`)}
          />
        </div>
        <div className="bg-bg-elevated/30 px-2">
          <CompareRow
            label="Total Travel"
            values={switches.map((s) => `${s.totalTravelMm}mm`)}
          />
        </div>
        <div className="bg-bg-surface/50 px-2">
          <CompareRow
            label="Stem Material"
            values={switches.map((s) => s.stemMaterial)}
          />
        </div>
        <div className="bg-bg-elevated/30 px-2">
          <CompareRow
            label="Housing"
            values={switches.map((s) => s.housingMaterial)}
          />
        </div>
        <div className="bg-bg-surface/50 px-2">
          <CompareRow
            label="Spring Type"
            values={switches.map((s) => s.springType)}
          />
        </div>
        <div className="bg-bg-elevated/30 px-2">
          <CompareRow
            label="Factory Lubed"
            values={switches.map((s) => s.factoryLubed)}
          />
        </div>
        <div className="bg-bg-surface/50 px-2">
          <CompareRow
            label="Long Pole"
            values={switches.map((s) => s.longPole)}
          />
        </div>
        <div className="bg-bg-elevated/30 px-2">
          <CompareRow
            label="Price"
            values={switches.map((s) => s.pricePerSwitch)}
            highlight="min"
            mono
          />
        </div>
        <div className="bg-bg-surface/50 px-2">
          <CompareRow
            label="Rating"
            values={switches.map((s) => s.communityRating)}
            highlight="max"
            mono
          />
        </div>
      </div>

      {/* Sound Profiles */}
      <div className="mt-6">
        <h3 className="text-sm font-semibold text-text-muted uppercase tracking-wider mb-3">
          Sound Profiles
        </h3>
        <div
          className="grid gap-4"
          style={{ gridTemplateColumns: `repeat(${switches.length}, 1fr)` }}
        >
          {switches.map((sw) => (
            <div
              key={sw._id}
              className="p-4 rounded-lg bg-bg-surface border border-border-subtle"
            >
              <p className="text-xs text-text-muted mb-2">{sw.brand} {sw.name}</p>
              <SoundProfile
                pitch={sw.soundPitch}
                volume={sw.soundVolume}
                character={sw.soundCharacter}
              />
            </div>
          ))}
        </div>
      </div>

      {/* Notes */}
      <div className="mt-6">
        <h3 className="text-sm font-semibold text-text-muted uppercase tracking-wider mb-3">
          Community Notes
        </h3>
        <div
          className="grid gap-4"
          style={{ gridTemplateColumns: `repeat(${switches.length}, 1fr)` }}
        >
          {switches.map((sw) => (
            <div
              key={sw._id}
              className="p-4 rounded-lg bg-bg-surface border border-border-subtle"
            >
              <p className="text-xs text-text-muted mb-1">{sw.brand} {sw.name}</p>
              <p className="text-sm text-text-secondary">{sw.notes}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
