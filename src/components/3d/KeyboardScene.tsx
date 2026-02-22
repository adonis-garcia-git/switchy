"use client";

import { Suspense, useMemo, useEffect } from "react";
import { Canvas, useThree } from "@react-three/fiber";
import { OrbitControls } from "@react-three/drei";
import * as THREE from "three";
import { EffectComposer, N8AO, Bloom, ToneMapping } from "@react-three/postprocessing";
import { ToneMappingMode } from "postprocessing";
import { KeyboardModel } from "./KeyboardModel";
import { SceneEnvironment } from "./SceneEnvironment";
import type { KeyboardViewerConfig } from "@/lib/keyboard3d";
import type { SelectionMode } from "@/lib/keyCustomization";

interface KeyboardSceneProps {
  config: KeyboardViewerConfig;
  autoRotate?: boolean;
  compactMode?: boolean;
  interactive?: boolean;
  onKeyPress?: (legend: string) => void;
  selectionMode?: SelectionMode;
  selectedKeys?: Set<string>;
  onKeySelect?: (keyId: string) => void;
  onKeyPaint?: (keyId: string) => void;
}

/**
 * Auto-fits the camera FOV so the keyboard model is fully visible regardless
 * of container aspect ratio. Uses a fixed reference distance (the initial
 * camera position length) to calculate the needed vertical FOV, then clamps
 * it between 30° and 55° to avoid extreme distortion.
 */
function AutoFitCamera({ modelWidth = 28, refDistance = 43 }: { modelWidth?: number; refDistance?: number }) {
  const { camera, size, invalidate } = useThree();

  useEffect(() => {
    if (!(camera instanceof THREE.PerspectiveCamera)) return;

    const aspect = size.width / size.height;
    const targetHalfWidth = (modelWidth * 1.15) / 2; // 15% padding

    // Horizontal half-angle needed to see the full model width
    const neededHalfHFov = Math.atan(targetHalfWidth / refDistance);
    // Convert to vertical FOV
    const neededVFovRad = 2 * Math.atan(Math.tan(neededHalfHFov) / aspect);
    const neededVFovDeg = (neededVFovRad * 180) / Math.PI;

    // Clamp: don't go below base FOV or above 55° (avoids fish-eye distortion)
    const newFov = Math.max(30, Math.min(neededVFovDeg, 55));

    if (Math.abs(camera.fov - newFov) > 0.5) {
      camera.fov = newFov;
      camera.updateProjectionMatrix();
      invalidate();
    }
  }, [camera, size, modelWidth, refDistance, invalidate]);

  return null;
}

export function KeyboardScene({
  config,
  autoRotate = false,
  compactMode = false,
  interactive = false,
  onKeyPress,
  selectionMode,
  selectedKeys,
  onKeySelect,
  onKeyPaint,
}: KeyboardSceneProps) {
  // Continuous rendering when RGB is animating or interactive
  const needsAnimation = useMemo(() => {
    if (interactive || selectionMode) return true;
    if (config.hasRGB && config.rgbMode && config.rgbMode !== "static") return true;
    if (config.cameraPreset && config.cameraPreset !== "default") return true;
    return false;
  }, [interactive, selectionMode, config.hasRGB, config.rgbMode, config.cameraPreset]);

  const frameloop = needsAnimation || autoRotate ? "always" : "demand";

  return (
    <Canvas
      dpr={[1, 2]}
      frameloop={frameloop}
      camera={{ position: [0, 20, 38], fov: 30 }}
      gl={{ antialias: true, alpha: true }}
      onCreated={({ gl }) => { gl.toneMapping = THREE.NoToneMapping; }}
      style={{ background: "transparent" }}
    >
      <Suspense fallback={null}>
        <KeyboardModel
          config={config}
          interactive={interactive}
          onKeyPress={onKeyPress}
          selectionMode={selectionMode}
          selectedKeys={selectedKeys}
          onKeySelect={onKeySelect}
          onKeyPaint={onKeyPaint}
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
            luminanceThreshold={0.9}
            luminanceSmoothing={0.4}
            intensity={0.2}
          />
          <ToneMapping mode={ToneMappingMode.ACES_FILMIC} />
        </EffectComposer>
      ) : (
        <EffectComposer>
          <N8AO
            aoRadius={0.4}
            intensity={1.0}
            distanceFalloff={0.4}
          />
          <Bloom
            mipmapBlur
            luminanceThreshold={0.9}
            luminanceSmoothing={0.4}
            intensity={0.35}
          />
          <ToneMapping mode={ToneMappingMode.ACES_FILMIC} />
        </EffectComposer>
      )}

      {/* Auto-fit FOV to container aspect ratio */}
      <AutoFitCamera />

      <OrbitControls
        autoRotate={autoRotate}
        autoRotateSpeed={0.8}
        enablePan={false}
        target={[-6, 0, 0]}
        minPolarAngle={Math.PI * 0.15}
        maxPolarAngle={Math.PI * 0.48}
        minDistance={12}
        maxDistance={45}
        enableDamping
        dampingFactor={0.05}
      />
    </Canvas>
  );
}
