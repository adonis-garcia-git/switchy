"use client";

import { useState, useCallback, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { KeyboardViewer3D } from "@/components/3d/KeyboardViewer3D";
import { StudioSidebar } from "@/components/studio/StudioSidebar";
import { StudioActionBar } from "@/components/studio/StudioActionBar";
import { StudioMobileDrawer } from "@/components/studio/StudioMobileDrawer";
import { StudioControls } from "@/components/studio/StudioControls";
import { StudioPresetGallery } from "@/components/studio/StudioPresetGallery";
import { ToastContainer } from "@/components/ui/Toast";
import { Tabs } from "@/components/ui/Tabs";
import { useToast } from "@/hooks/useToast";
import { DEFAULT_VIEWER_CONFIG } from "@/lib/keyboard3d";
import { decodeStudioConfig } from "@/lib/studioShare";
import { KeyboardCustomizer } from "@/components/builder/KeyboardCustomizer";
import type { KeyboardViewerConfig } from "@/lib/keyboard3d";
import type { CustomizerInteractiveProps } from "@/components/builder/KeyboardCustomizer";
import type { PerKeyOverrides } from "@/lib/keyCustomization";

type StudioMode = "scene" | "customize";

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

  const [studioMode, setStudioMode] = useState<StudioMode>("scene");
  const [customizerProps, setCustmizerProps] = useState<CustomizerInteractiveProps | null>(null);

  const handleConfigUpdate = useCallback((update: Partial<KeyboardViewerConfig>) => {
    setConfig((prev) => ({ ...prev, ...update }));
  }, []);

  // Determine auto-rotate: rotate in scene mode when not customizing or in freeform
  const autoRotate = studioMode === "scene" && !customizerProps && config.cameraPreset !== "freeform";

  // Active viewer config: use customizer's merged config when in per-key mode
  const viewerConfig = customizerProps?.config ?? config;

  // Handle mode change — clear customizer props when switching to scene
  const handleModeChange = useCallback((mode: StudioMode) => {
    setStudioMode(mode);
    if (mode === "scene") {
      setCustmizerProps(null);
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
          customizeMode={studioMode === "customize"}
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
          customizeMode={studioMode === "customize"}
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
        className="hidden lg:block absolute inset-0 pointer-events-none"
        style={{
          background: `radial-gradient(ellipse 50% 70% at 20% 50%, rgba(0,0,0,0.65) 0%, rgba(0,0,0,0.25) 55%, transparent 100%)`,
        }}
      />

      {/* ── Desktop: Sidebar (floats above 3D scene) ── */}
      <div className="hidden lg:flex flex-col relative z-10 w-[320px] h-full px-5 py-5">
        <div className="flex-1 overflow-hidden flex flex-col">
          <StudioSidebar
            config={config}
            studioMode={studioMode}
            onModeChange={handleModeChange}
            onConfigUpdate={handleConfigUpdate}
            onCustomizerPropsChange={setCustmizerProps}
          />
        </div>

        {/* Desktop action bar */}
        <div className="shrink-0 pt-4 border-t border-white/[0.06]">
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
                { label: "Design", value: "scene" },
                { label: "Per-Key", value: "customize" },
              ]}
              activeTab={studioMode}
              onChange={(v) => handleModeChange(v as StudioMode)}
              className="bg-black/20 border-white/[0.08]"
            />
          </div>

          {studioMode === "scene" ? (
            <div className="space-y-4">
              <StudioControls config={config} onUpdate={handleConfigUpdate} />
              <div className="border-t border-white/[0.06] pt-4">
                <StudioPresetGallery
                  activeColorway={config.colorway}
                  onApply={handleConfigUpdate}
                />
              </div>
            </div>
          ) : (
            <KeyboardCustomizer
              viewerConfig={config}
              onOverridesChange={handleMobileOverridesChange}
              externalViewer
              onInteractivePropsChange={setCustmizerProps}
            />
          )}
        </StudioMobileDrawer>
      </div>

      {/* Toast notifications */}
      <ToastContainer toasts={toasts} onDismiss={dismissToast} />
    </div>
  );
}
