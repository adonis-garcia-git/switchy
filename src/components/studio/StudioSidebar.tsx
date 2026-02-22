"use client";

import { useCallback } from "react";
import { Tabs } from "@/components/ui/Tabs";
import { StudioControls } from "./StudioControls";
import { StudioPresetGallery } from "./StudioPresetGallery";
import { KeyboardCustomizer } from "@/components/builder/KeyboardCustomizer";
import type { KeyboardViewerConfig } from "@/lib/keyboard3d";
import type { CustomizerInteractiveProps } from "@/components/builder/KeyboardCustomizer";
import type { PerKeyOverrides } from "@/lib/keyCustomization";

type StudioMode = "scene" | "customize";

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
            { label: "Design", value: "scene" },
            { label: "Per-Key", value: "customize" },
          ]}
          activeTab={studioMode}
          onChange={(v) => onModeChange(v as StudioMode)}
          className="bg-black/20 border-white/[0.08]"
        />
      </div>

      {/* Mode content */}
      <div className="flex-1 overflow-y-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        {studioMode === "scene" ? (
          <div className="space-y-4">
            <StudioControls config={config} onUpdate={onConfigUpdate} />
            <div className="border-t border-white/[0.06] pt-4">
              <StudioPresetGallery
                activeColorway={config.colorway}
                onApply={onConfigUpdate}
              />
            </div>
          </div>
        ) : (
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
