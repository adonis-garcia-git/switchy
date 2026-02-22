"use client";

import { useState, useCallback, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { KeyboardViewer3D } from "@/components/3d/KeyboardViewer3D";
import { StudioSidebar } from "@/components/studio/StudioSidebar";
import { StudioActionBar } from "@/components/studio/StudioActionBar";
import { StudioMobileDrawer } from "@/components/studio/StudioMobileDrawer";
import { StudioControls } from "@/components/studio/StudioControls";
import { StudioPresetGalleryFull } from "@/components/studio/StudioPresetGallery";
import { StudioSceneOverlay } from "@/components/studio/StudioSceneOverlay";
import { ToastContainer } from "@/components/ui/Toast";
import { Tabs } from "@/components/ui/Tabs";
import { useToast } from "@/hooks/useToast";
import { DEFAULT_VIEWER_CONFIG } from "@/lib/keyboard3d";
import { decodeStudioConfig } from "@/lib/studioShare";
import { KeyboardCustomizer } from "@/components/builder/KeyboardCustomizer";
import type { KeyboardViewerConfig } from "@/lib/keyboard3d";
import type { CustomizerInteractiveProps } from "@/components/builder/KeyboardCustomizer";
import type { PerKeyOverrides } from "@/lib/keyCustomization";
import type { StudioMode } from "@/components/studio/StudioSidebar";

export default function StudioPage() {
  return (
    <Suspense fallback={<div className="min-h-[calc(100vh-4rem)]" />}>
      <StudioPageInner />
    </Suspense>
  );
}

function StudioPageInner() {
  const searchParams = useSearchParams();
  const { toasts, showToast, dismissToast } = useToast();

  // Initialize config from URL or defaults
  const [config, setConfig] = useState<KeyboardViewerConfig>(() => {
    const encoded = searchParams.get("c");
    if (encoded) {
      const decoded = decodeStudioConfig(encoded);
      return { ...DEFAULT_VIEWER_CONFIG, ...decoded };
    }
    return { ...DEFAULT_VIEWER_CONFIG };
  });

  const [studioMode, setStudioMode] = useState<StudioMode>("design");
  const [customizerProps, setCustomizerProps] = useState<CustomizerInteractiveProps | null>(null);

  const handleConfigUpdate = useCallback((update: Partial<KeyboardViewerConfig>) => {
    setConfig((prev) => ({ ...prev, ...update }));
  }, []);

  // Determine auto-rotate: rotate when not in per-key mode and not in freeform
  const autoRotate = !customizerProps && config.cameraPreset !== "freeform";

  // Active viewer config: use customizer's merged config when in per-key mode
  const viewerConfig = customizerProps?.config ?? config;

  // Handle mode change — clear customizer props when switching away from per-key
  const handleModeChange = useCallback((mode: StudioMode) => {
    setStudioMode(mode);
    if (mode !== "perkey") {
      setCustomizerProps(null);
    }
  }, []);

  // Mobile overrides change handler
  const handleMobileOverridesChange = useCallback((overrides: PerKeyOverrides) => {
    handleConfigUpdate({ perKeyOverrides: overrides });
  }, [handleConfigUpdate]);

  return (
    <div className="relative h-[calc(100vh-4rem)] overflow-hidden">
      {/* ── Mobile: compact 3D viewer at top ── */}
      <div className="lg:hidden h-[55vh]">
        <KeyboardViewer3D
          config={viewerConfig}
          height="100%"
          autoRotate={autoRotate}
          className="rounded-none border-0"
          customizeMode={!!customizerProps}
          {...(customizerProps ? {
            interactive: true,
            selectionMode: customizerProps.selectionMode,
            selectedKeys: customizerProps.selectedKeys,
            onKeySelect: customizerProps.onKeySelect,
            onKeyPaint: customizerProps.onKeyPaint,
          } : {})}
        />
      </div>

      {/* ── Desktop: 3D viewer as full-page background ── */}
      <div className="hidden lg:block absolute inset-0">
        <KeyboardViewer3D
          config={viewerConfig}
          height="100%"
          autoRotate={autoRotate}
          className="rounded-none border-0"
          customizeMode={!!customizerProps}
          {...(customizerProps ? {
            interactive: true,
            selectionMode: customizerProps.selectionMode,
            selectedKeys: customizerProps.selectedKeys,
            onKeySelect: customizerProps.onKeySelect,
            onKeyPaint: customizerProps.onKeyPaint,
          } : {})}
        />
      </div>

      {/* ── Desktop: radial vignette for sidebar readability ── */}
      <div
        className="hidden lg:block absolute inset-0 pointer-events-none studio-vignette"
      />

      {/* ── Desktop: Scene overlay (top-right) ── */}
      <div className="hidden lg:block absolute top-4 right-5 z-20">
        <StudioSceneOverlay config={config} onUpdate={handleConfigUpdate} />
      </div>

      {/* ── Desktop: Sidebar (floats above 3D scene) ── */}
      <div className="hidden lg:flex flex-col relative z-10 w-[320px] h-full px-5 py-5">
        <div className="flex-1 overflow-hidden flex flex-col">
          <StudioSidebar
            config={config}
            studioMode={studioMode}
            onModeChange={handleModeChange}
            onConfigUpdate={handleConfigUpdate}
            onCustomizerPropsChange={setCustomizerProps}
          />
        </div>

        {/* Desktop action bar */}
        <div className="shrink-0 pt-4 border-t border-border-subtle">
          <StudioActionBar
            config={config}
            onShareToast={() => showToast({ message: "Link copied to clipboard!", variant: "success" })}
            onOverridesExcludedToast={() => showToast({ message: "Per-key customizations excluded (too many keys). Apply them in the builder.", variant: "info" })}
          />
        </div>
      </div>

      {/* ── Mobile: Bottom drawer with controls ── */}
      <div className="lg:hidden">
        <StudioMobileDrawer
          actionBar={
            <StudioActionBar
              config={config}
              onShareToast={() => showToast({ message: "Link copied!", variant: "success" })}
              onOverridesExcludedToast={() => showToast({ message: "Per-key customizations excluded from share link.", variant: "info" })}
            />
          }
        >
          {/* Mobile mode toggle */}
          <div className="mb-4">
            <Tabs
              tabs={[
                { label: "Design", value: "design" },
                { label: "Presets", value: "presets" },
                { label: "Per-Key", value: "perkey" },
              ]}
              activeTab={studioMode}
              onChange={(v) => handleModeChange(v as StudioMode)}
              className="bg-bg-tint border-border-default"
            />
          </div>

          {studioMode === "design" && (
            <StudioControls config={config} onUpdate={handleConfigUpdate} />
          )}
          {studioMode === "presets" && (
            <StudioPresetGalleryFull
              activeColorway={config.colorway}
              onApply={handleConfigUpdate}
            />
          )}
          {studioMode === "perkey" && (
            <KeyboardCustomizer
              viewerConfig={config}
              onOverridesChange={handleMobileOverridesChange}
              externalViewer
              onInteractivePropsChange={setCustomizerProps}
            />
          )}
        </StudioMobileDrawer>
      </div>

      {/* Toast notifications */}
      <ToastContainer toasts={toasts} onDismiss={dismissToast} />
    </div>
  );
}
