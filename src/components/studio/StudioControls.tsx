"use client";

import { useState, useCallback, useEffect, type ReactNode } from "react";
import { cn } from "@/lib/utils";
import { StudioAccordion } from "./StudioAccordion";
import type { KeyboardViewerConfig } from "@/lib/keyboard3d";

// ─── Shared Sub-Components ────────────────────────────────────────

interface StudioColorPickerProps {
  label: string;
  value: string;
  onChange: (color: string) => void;
}

export function StudioColorPicker({ label, value, onChange }: StudioColorPickerProps) {
  const [textValue, setTextValue] = useState(value);

  // Sync text when parent value changes externally
  useEffect(() => {
    setTextValue(value);
  }, [value]);

  return (
    <div>
      <label className="text-[10px] font-semibold text-text-muted uppercase tracking-wider mb-1.5 block">
        {label}
      </label>
      <div className="flex items-center gap-2">
        <label className="relative w-8 h-8 rounded-lg overflow-hidden border border-white/10 cursor-pointer group shrink-0">
          <input
            type="color"
            value={value}
            onChange={(e) => onChange(e.target.value)}
            className="absolute inset-0 w-full h-full cursor-pointer opacity-0"
          />
          <div className="w-full h-full" style={{ backgroundColor: value }} />
          <div className="absolute inset-0 opacity-0 group-hover:opacity-100 bg-white/10 transition-opacity duration-150" />
        </label>
        <input
          type="text"
          value={textValue}
          onChange={(e) => {
            const v = e.target.value;
            setTextValue(v);
            if (/^#[0-9a-fA-F]{6}$/.test(v)) {
              onChange(v);
            }
          }}
          onBlur={() => {
            if (!/^#[0-9a-fA-F]{6}$/.test(textValue)) {
              setTextValue(value);
            }
          }}
          className="flex-1 px-2.5 py-1.5 text-xs font-mono bg-white/[0.04] border border-white/[0.08] rounded-lg text-text-primary placeholder-text-muted focus:outline-none focus:border-accent/40 transition-colors duration-150"
          placeholder="#000000"
          maxLength={7}
        />
      </div>
    </div>
  );
}

interface StudioSelectProps {
  label: string;
  value: string;
  options: { value: string; label: string }[];
  onChange: (value: string) => void;
}

export function StudioSelect({ label, value, options, onChange }: StudioSelectProps) {
  return (
    <div>
      <label className="text-[10px] font-semibold text-text-muted uppercase tracking-wider mb-1.5 block">
        {label}
      </label>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full px-2.5 py-1.5 text-xs font-medium bg-white/[0.04] border border-white/[0.08] rounded-lg text-text-primary focus:outline-none focus:border-accent/40 transition-colors duration-150 cursor-pointer appearance-none"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 24 24' fill='none' stroke='%23888' stroke-width='2'%3E%3Cpath d='M6 9l6 6 6-6'/%3E%3C/svg%3E")`,
          backgroundRepeat: "no-repeat",
          backgroundPosition: "right 8px center",
          paddingRight: "28px",
        }}
      >
        {options.map((opt) => (
          <option key={opt.value} value={opt.value} className="bg-bg-surface text-text-primary">
            {opt.label}
          </option>
        ))}
      </select>
    </div>
  );
}

interface StudioPillGroupProps {
  label: string;
  value: string;
  options: { value: string; label: string }[];
  onChange: (value: string) => void;
}

export function StudioPillGroup({ label, value, options, onChange }: StudioPillGroupProps) {
  return (
    <div>
      <label className="text-[10px] font-semibold text-text-muted uppercase tracking-wider mb-1.5 block">
        {label}
      </label>
      <div className="flex flex-wrap gap-1">
        {options.map((opt) => (
          <button
            key={opt.value}
            onClick={() => onChange(opt.value)}
            className={cn(
              "px-2.5 py-1 text-[11px] font-semibold rounded-lg transition-[background-color,color,border-color,transform] duration-150",
              "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/40",
              "active:scale-[0.96]",
              value === opt.value
                ? "bg-accent/15 text-accent border border-accent/30"
                : "bg-white/[0.04] text-text-secondary border border-white/[0.06] hover:bg-white/[0.08] hover:text-text-primary"
            )}
          >
            {opt.label}
          </button>
        ))}
      </div>
    </div>
  );
}

interface StudioSliderProps {
  label: string;
  value: number;
  min: number;
  max: number;
  step: number;
  onChange: (value: number) => void;
  formatValue?: (value: number) => string;
}

export function StudioSlider({ label, value, min, max, step, onChange, formatValue }: StudioSliderProps) {
  const displayValue = formatValue ? formatValue(value) : value.toFixed(step < 1 ? 1 : 0);
  const percent = ((value - min) / (max - min)) * 100;

  return (
    <div>
      <div className="flex items-center justify-between mb-1.5">
        <label className="text-[10px] font-semibold text-text-muted uppercase tracking-wider">
          {label}
        </label>
        <span className="text-[10px] font-mono text-text-secondary">{displayValue}</span>
      </div>
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(e) => onChange(parseFloat(e.target.value))}
        className="w-full h-1.5 rounded-full appearance-none cursor-pointer accent-accent bg-white/[0.08]"
        style={{
          background: `linear-gradient(to right, var(--color-accent) 0%, var(--color-accent) ${percent}%, rgba(255,255,255,0.08) ${percent}%, rgba(255,255,255,0.08) 100%)`,
        }}
      />
    </div>
  );
}

interface StudioToggleProps {
  label: string;
  value: boolean;
  onChange: (value: boolean) => void;
}

export function StudioToggle({ label, value, onChange }: StudioToggleProps) {
  return (
    <button
      onClick={() => onChange(!value)}
      className="flex items-center justify-between w-full group focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/40 rounded-lg py-0.5"
    >
      <span className="text-[10px] font-semibold text-text-muted uppercase tracking-wider group-hover:text-text-secondary transition-colors duration-150">
        {label}
      </span>
      <div
        className={cn(
          "relative w-8 h-[18px] rounded-full transition-colors duration-200 shrink-0",
          value ? "bg-accent" : "bg-white/[0.12]"
        )}
      >
        <div
          className={cn(
            "absolute top-[2px] w-[14px] h-[14px] rounded-full bg-white shadow-sm transition-transform duration-200",
            value ? "translate-x-[16px]" : "translate-x-[2px]"
          )}
        />
      </div>
    </button>
  );
}

// ─── Section Icons (inline SVGs) ──────────────────────────────────

const IconLayout = () => (
  <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth={1.5} className="w-full h-full">
    <rect x="2" y="4" width="12" height="8" rx="1.5" />
    <line x1="5" y1="7" x2="11" y2="7" />
    <line x1="4" y1="9" x2="12" y2="9" />
  </svg>
);

const IconCase = () => (
  <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth={1.5} className="w-full h-full">
    <rect x="1.5" y="3" width="13" height="10" rx="2" />
    <path d="M1.5 11h13" />
  </svg>
);

const IconKeycaps = () => (
  <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth={1.5} className="w-full h-full">
    <rect x="3" y="3" width="4" height="4" rx="0.8" />
    <rect x="9" y="3" width="4" height="4" rx="0.8" />
    <rect x="3" y="9" width="4" height="4" rx="0.8" />
    <rect x="9" y="9" width="4" height="4" rx="0.8" />
  </svg>
);

const IconSwitch = () => (
  <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth={1.5} className="w-full h-full">
    <path d="M5 12V8a3 3 0 116 0v4" />
    <rect x="4" y="12" width="8" height="2" rx="0.5" />
  </svg>
);

const IconPlate = () => (
  <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth={1.5} className="w-full h-full">
    <rect x="1" y="6" width="14" height="4" rx="1" />
    <rect x="4" y="7" width="2" height="2" rx="0.3" />
    <rect x="7" y="7" width="2" height="2" rx="0.3" />
    <rect x="10" y="7" width="2" height="2" rx="0.3" />
  </svg>
);

const IconRGB = () => (
  <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth={1.5} className="w-full h-full">
    <circle cx="8" cy="8" r="5.5" />
    <path d="M8 2.5v2M8 11.5v2M2.5 8h2M11.5 8h2" />
  </svg>
);

const IconScene = () => (
  <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth={1.5} className="w-full h-full">
    <circle cx="8" cy="6" r="3" />
    <path d="M2 13l3-4 2 2 3-3.5 4 5.5" />
  </svg>
);

const IconConnect = () => (
  <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth={1.5} className="w-full h-full">
    <path d="M3 8h4" />
    <path d="M9 8h4" />
    <circle cx="8" cy="8" r="1.5" />
  </svg>
);

// ─── Main Controls Component ──────────────────────────────────────

interface StudioControlsProps {
  config: KeyboardViewerConfig;
  onUpdate: (update: Partial<KeyboardViewerConfig>) => void;
}

export function StudioControls({ config, onUpdate }: StudioControlsProps) {
  const update = useCallback(
    <K extends keyof KeyboardViewerConfig>(key: K, value: KeyboardViewerConfig[K]) => {
      onUpdate({ [key]: value } as Partial<KeyboardViewerConfig>);
    },
    [onUpdate]
  );

  return (
    <div className="space-y-0">
      {/* Layout */}
      <StudioAccordion title="Layout" icon={<IconLayout />} defaultOpen>
        <StudioPillGroup
          label="Size"
          value={config.size}
          options={[
            { value: "60", label: "60%" },
            { value: "65", label: "65%" },
            { value: "75", label: "75%" },
            { value: "tkl", label: "TKL" },
            { value: "full", label: "Full" },
          ]}
          onChange={(v) => update("size", v as KeyboardViewerConfig["size"])}
        />
      </StudioAccordion>

      {/* Case */}
      <StudioAccordion title="Case" icon={<IconCase />} defaultOpen>
        <StudioSelect
          label="Material"
          value={config.caseMaterial}
          options={[
            { value: "aluminum", label: "Aluminum" },
            { value: "polycarbonate", label: "Polycarbonate" },
            { value: "plastic", label: "Plastic" },
            { value: "wood", label: "Wood" },
            { value: "brass", label: "Brass" },
          ]}
          onChange={(v) => update("caseMaterial", v as KeyboardViewerConfig["caseMaterial"])}
        />
        <StudioSelect
          label="Finish"
          value={config.caseFinish || "matte"}
          options={[
            { value: "glossy", label: "Glossy" },
            { value: "matte", label: "Matte" },
            { value: "satin", label: "Satin" },
          ]}
          onChange={(v) => update("caseFinish", v as KeyboardViewerConfig["caseFinish"])}
        />
        <StudioColorPicker
          label="Color"
          value={config.caseColor}
          onChange={(v) => update("caseColor", v)}
        />
      </StudioAccordion>

      {/* Keycaps */}
      <StudioAccordion title="Keycaps" icon={<IconKeycaps />} defaultOpen>
        <StudioSelect
          label="Profile"
          value={config.keycapProfile}
          options={[
            { value: "cherry", label: "Cherry" },
            { value: "sa", label: "SA" },
            { value: "dsa", label: "DSA" },
            { value: "mt3", label: "MT3" },
            { value: "oem", label: "OEM" },
            { value: "kat", label: "KAT" },
            { value: "xda", label: "XDA" },
          ]}
          onChange={(v) => update("keycapProfile", v as KeyboardViewerConfig["keycapProfile"])}
        />
        <StudioSelect
          label="Material"
          value={config.keycapMaterial}
          options={[
            { value: "pbt", label: "PBT" },
            { value: "abs", label: "ABS" },
            { value: "pom", label: "POM" },
          ]}
          onChange={(v) => update("keycapMaterial", v as KeyboardViewerConfig["keycapMaterial"])}
        />
        <StudioColorPicker
          label="Color"
          value={config.keycapColor}
          onChange={(v) => update("keycapColor", v)}
        />
        <StudioColorPicker
          label="Accent Color"
          value={config.keycapAccentColor}
          onChange={(v) => update("keycapAccentColor", v)}
        />
        <StudioToggle
          label="Show Legends"
          value={config.showLegends}
          onChange={(v) => update("showLegends", v)}
        />
      </StudioAccordion>

      {/* Switches */}
      <StudioAccordion title="Switches" icon={<IconSwitch />}>
        <StudioColorPicker
          label="Stem Color"
          value={config.switchStemColor || "#E8590C"}
          onChange={(v) => update("switchStemColor", v)}
        />
      </StudioAccordion>

      {/* Plate */}
      <StudioAccordion title="Plate" icon={<IconPlate />}>
        <StudioSelect
          label="Material"
          value={config.plateMaterial}
          options={[
            { value: "aluminum", label: "Aluminum" },
            { value: "brass", label: "Brass" },
            { value: "polycarbonate", label: "Polycarbonate" },
            { value: "fr4", label: "FR4" },
            { value: "pom", label: "POM" },
          ]}
          onChange={(v) => update("plateMaterial", v as KeyboardViewerConfig["plateMaterial"])}
        />
        <StudioColorPicker
          label="Color"
          value={config.plateColor}
          onChange={(v) => update("plateColor", v)}
        />
      </StudioAccordion>

      {/* RGB */}
      <StudioAccordion title="RGB" icon={<IconRGB />}>
        <StudioToggle
          label="Enable RGB"
          value={config.hasRGB}
          onChange={(v) => update("hasRGB", v)}
        />
        {config.hasRGB && (
          <div className="space-y-3 mt-1">
            <StudioSelect
              label="Mode"
              value={config.rgbMode || "static"}
              options={[
                { value: "static", label: "Static" },
                { value: "breathing", label: "Breathing" },
                { value: "rainbow", label: "Rainbow" },
                { value: "wave", label: "Wave" },
                { value: "reactive", label: "Reactive" },
              ]}
              onChange={(v) => update("rgbMode", v as KeyboardViewerConfig["rgbMode"])}
            />
            <StudioColorPicker
              label="Color"
              value={config.rgbColor}
              onChange={(v) => update("rgbColor", v)}
            />
            <StudioColorPicker
              label="Secondary Color"
              value={config.rgbSecondaryColor || "#00ff88"}
              onChange={(v) => update("rgbSecondaryColor", v)}
            />
            <StudioSlider
              label="Speed"
              value={config.rgbSpeed ?? 1.0}
              min={0.1}
              max={3.0}
              step={0.1}
              onChange={(v) => update("rgbSpeed", v)}
              formatValue={(v) => `${v.toFixed(1)}x`}
            />
            <StudioSlider
              label="Brightness"
              value={config.rgbBrightness ?? 1.0}
              min={0}
              max={1}
              step={0.05}
              onChange={(v) => update("rgbBrightness", v)}
              formatValue={(v) => `${Math.round(v * 100)}%`}
            />
          </div>
        )}
      </StudioAccordion>

      {/* Scene */}
      <StudioAccordion title="Scene" icon={<IconScene />}>
        <StudioPillGroup
          label="Environment"
          value={config.environment || "studio"}
          options={[
            { value: "studio", label: "Studio" },
            { value: "city", label: "City" },
            { value: "sunset", label: "Sunset" },
            { value: "dawn", label: "Dawn" },
            { value: "apartment", label: "Apartment" },
            { value: "warehouse", label: "Warehouse" },
          ]}
          onChange={(v) => update("environment", v as KeyboardViewerConfig["environment"])}
        />
        <StudioPillGroup
          label="Camera"
          value={config.cameraPreset || "default"}
          options={[
            { value: "default", label: "Default" },
            { value: "top-down", label: "Top Down" },
            { value: "hero", label: "Hero" },
            { value: "side", label: "Side" },
            { value: "closeup", label: "Closeup" },
            { value: "freeform", label: "Freeform" },
          ]}
          onChange={(v) => update("cameraPreset", v as KeyboardViewerConfig["cameraPreset"])}
        />
        <StudioToggle
          label="Show Desk"
          value={config.showDesk ?? false}
          onChange={(v) => update("showDesk", v)}
        />
        {config.showDesk && (
          <StudioColorPicker
            label="Desk Color"
            value={config.deskColor || "#3d3d3d"}
            onChange={(v) => update("deskColor", v)}
          />
        )}
      </StudioAccordion>

      {/* Connectivity */}
      <StudioAccordion title="Connectivity" icon={<IconConnect />}>
        <StudioPillGroup
          label="Type"
          value={config.connectionType || "wired"}
          options={[
            { value: "wired", label: "Wired" },
            { value: "wireless", label: "Wireless" },
            { value: "bluetooth", label: "Bluetooth" },
          ]}
          onChange={(v) => update("connectionType", v as KeyboardViewerConfig["connectionType"])}
        />
        {(config.connectionType === "wired" || !config.connectionType) && (
          <StudioColorPicker
            label="Cable Color"
            value={config.cableColor || "#1a1a1a"}
            onChange={(v) => update("cableColor", v)}
          />
        )}
      </StudioAccordion>
    </div>
  );
}
