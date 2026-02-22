"use client";

import { Suspense, useMemo } from "react";
import { Canvas } from "@react-three/fiber";
import { OrbitControls } from "@react-three/drei";
import * as THREE from "three";
import { EffectComposer, N8AO, Bloom, ToneMapping } from "@react-three/postprocessing";
import { ToneMappingMode } from "postprocessing";
import { KeyboardModel } from "./KeyboardModel";
import { SceneEnvironment } from "./SceneEnvironment";
import type { KeyboardViewerConfig } from "@/lib/keyboard3d";

interface KeyboardSceneProps {
  config: KeyboardViewerConfig;
  autoRotate?: boolean;
  compactMode?: boolean;
  interactive?: boolean;
  onKeyPress?: (legend: string) => void;
}

export function KeyboardScene({
  config,
  autoRotate = false,
  compactMode = false,
  interactive = false,
  onKeyPress,
}: KeyboardSceneProps) {
  // Continuous rendering when RGB is animating or interactive
  const needsAnimation = useMemo(() => {
    if (interactive) return true;
    if (config.hasRGB && config.rgbMode && config.rgbMode !== "static") return true;
    if (config.cameraPreset && config.cameraPreset !== "default") return true;
    return false;
  }, [interactive, config.hasRGB, config.rgbMode, config.cameraPreset]);

  const frameloop = needsAnimation || autoRotate ? "always" : "demand";

  return (
    <Canvas
      dpr={[1, 2]}
      frameloop={frameloop}
      camera={{ position: [0, 8, 14], fov: 30 }}
      gl={{ antialias: true, alpha: true }}
      onCreated={({ gl }) => { gl.toneMapping = THREE.NoToneMapping; }}
      style={{ background: "transparent" }}
    >
      <Suspense fallback={null}>
        <KeyboardModel
          config={config}
          interactive={interactive}
          onKeyPress={onKeyPress}
        />

        {/* Scene environment with lighting, HDRI, desk, camera controller */}
        <SceneEnvironment
          environment={config.environment || "studio"}
          showDesk={config.showDesk}
          deskColor={config.deskColor}
          cameraPreset={config.cameraPreset || "default"}
        />
      </Suspense>

      {/* ── Post-Processing Pipeline (Phase 1) ── */}
      {compactMode ? (
        <EffectComposer>
          <Bloom
            mipmapBlur
            luminanceThreshold={0.8}
            luminanceSmoothing={0.3}
            intensity={0.4}
          />
          <ToneMapping mode={ToneMappingMode.ACES_FILMIC} />
        </EffectComposer>
      ) : (
        <EffectComposer>
          <N8AO
            aoRadius={0.5}
            intensity={1.5}
            distanceFalloff={0.5}
          />
          <Bloom
            mipmapBlur
            luminanceThreshold={0.8}
            luminanceSmoothing={0.3}
            intensity={0.8}
          />
          <ToneMapping mode={ToneMappingMode.ACES_FILMIC} />
        </EffectComposer>
      )}

      <OrbitControls
        autoRotate={autoRotate}
        autoRotateSpeed={0.8}
        enablePan={false}
        minPolarAngle={Math.PI * 0.15}
        maxPolarAngle={Math.PI * 0.48}
        minDistance={8}
        maxDistance={25}
        enableDamping
        dampingFactor={0.05}
      />
    </Canvas>
  );
}
