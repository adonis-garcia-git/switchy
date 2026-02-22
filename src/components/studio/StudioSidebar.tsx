"use client";

import { useCallback } from "react";
import { Tabs } from "@/components/ui/Tabs";
import { StudioControls } from "./StudioControls";
import { StudioPresetGalleryFull } from "./StudioPresetGallery";
import { KeyboardCustomizer } from "@/components/builder/KeyboardCustomizer";
import type { KeyboardViewerConfig } from "@/lib/keyboard3d";
import type { CustomizerInteractiveProps } from "@/components/builder/KeyboardCustomizer";
import type { PerKeyOverrides } from "@/lib/keyCustomization";

export type StudioMode = "design" | "presets" | "perkey";

interface StudioSidebarProps {
  config: KeyboardViewerConfig;
  studioMode: StudioMode;
  onModeChange: (mode: StudioMode) => void;
  onConfigUpdate: (update: Partial<KeyboardViewerConfig>) => void;
  onCustomizerPropsChange: (props: CustomizerInteractiveProps | null) => void;
}

export function StudioSidebar({
  config,
  studioMode,
  onModeChange,
  onConfigUpdate,
  onCustomizerPropsChange,
}: StudioSidebarProps) {
  const handleOverridesChange = useCallback((overrides: PerKeyOverrides) => {
    onConfigUpdate({ perKeyOverrides: overrides });
  }, [onConfigUpdate]);

  return (
    <div className="flex flex-col h-full">
      {/* Header + Mode Toggle */}
      <div className="shrink-0 mb-4">
        <h1 className="text-lg font-bold text-text-primary font-[family-name:var(--font-outfit)] mb-3 tracking-tight">
          Design Studio
        </h1>
        <Tabs
          tabs={[
            { label: "Design", value: "design" },
            { label: "Presets", value: "presets" },
            { label: "Per-Key", value: "perkey" },
          ]}
          activeTab={studioMode}
          onChange={(v) => onModeChange(v as StudioMode)}
          className="bg-black/20 border-white/[0.08]"
        />
      </div>

      {/* Mode content */}
      <div className="flex-1 overflow-y-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        {studioMode === "design" && (
          <StudioControls config={config} onUpdate={onConfigUpdate} />
        )}
        {studioMode === "presets" && (
          <StudioPresetGalleryFull
            activeColorway={config.colorway}
            onApply={onConfigUpdate}
          />
        )}
        {studioMode === "perkey" && (
          <KeyboardCustomizer
            viewerConfig={config}
            onOverridesChange={handleOverridesChange}
            externalViewer
            onInteractivePropsChange={onCustomizerPropsChange}
          />
        )}
      </div>
    </div>
  );
}
