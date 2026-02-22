"use client";

import { Suspense, useMemo, useEffect, useRef } from "react";
import { Canvas, useThree, useFrame } from "@react-three/fiber";
import { OrbitControls, ContactShadows } from "@react-three/drei";
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
  customizeMode?: boolean;
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

// Camera positions
const INTRO_POSITION = new THREE.Vector3(0, 14, 24);   // starts zoomed in
const DEFAULT_TARGET = new THREE.Vector3(0, 0, 0);
const DEFAULT_POSITION = new THREE.Vector3(0, 20, 38);
const CUSTOMIZE_TARGET = new THREE.Vector3(5, 0, 0);
const CUSTOMIZE_POSITION = new THREE.Vector3(5, 22, 42);

/**
 * Intro dolly: starts camera zoomed-in and eases out to the default resting
 * position. Fires once on mount, cancels if the user touches the canvas.
 */
function IntroAnimation({
  controlsRef,
}: {
  controlsRef: React.RefObject<any>;
}) {
  const { camera, gl } = useThree();
  const animating = useRef(true);

  // Set camera to zoomed-in start position on mount
  useEffect(() => {
    camera.position.copy(INTRO_POSITION);
    if (controlsRef.current) controlsRef.current.update();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // Cancel on user interaction
  useEffect(() => {
    const canvas = gl.domElement;
    const cancel = () => { animating.current = false; };
    canvas.addEventListener("pointerdown", cancel);
    canvas.addEventListener("wheel", cancel);
    return () => {
      canvas.removeEventListener("pointerdown", cancel);
      canvas.removeEventListener("wheel", cancel);
    };
  }, [gl]);

  useFrame(() => {
    if (!animating.current) return;
    const controls = controlsRef.current;
    if (!controls) return;

    camera.position.lerp(DEFAULT_POSITION, 0.025);
    controls.update();

    if (camera.position.distanceTo(DEFAULT_POSITION) < 0.05) {
      camera.position.copy(DEFAULT_POSITION);
      controls.update();
      animating.current = false;
    }
  });

  return null;
}

/**
 * One-shot camera transition that animates to a goal, then releases control.
 * If the user drags/scrolls mid-animation, the animation cancels immediately.
 */
function CustomizeModeController({
  active,
  controlsRef,
}: {
  active: boolean;
  controlsRef: React.RefObject<any>;
}) {
  const { camera, gl } = useThree();
  const targetGoal = useRef(DEFAULT_TARGET.clone());
  const positionGoal = useRef(DEFAULT_POSITION.clone());
  const animating = useRef(false);
  const prevActive = useRef(active);

  // Kick off animation when `active` changes
  useEffect(() => {
    if (active !== prevActive.current) {
      prevActive.current = active;
      animating.current = true;

      if (active) {
        targetGoal.current.copy(CUSTOMIZE_TARGET);
        positionGoal.current.copy(CUSTOMIZE_POSITION);
      } else {
        targetGoal.current.copy(DEFAULT_TARGET);
        positionGoal.current.copy(DEFAULT_POSITION);
      }
    }
  }, [active]);

  // Cancel animation if user interacts (mousedown / touchstart / wheel)
  useEffect(() => {
    const canvas = gl.domElement;
    const cancel = () => { animating.current = false; };
    canvas.addEventListener("pointerdown", cancel);
    canvas.addEventListener("wheel", cancel);
    return () => {
      canvas.removeEventListener("pointerdown", cancel);
      canvas.removeEventListener("wheel", cancel);
    };
  }, [gl]);

  useFrame(() => {
    if (!animating.current) return;
    const controls = controlsRef.current;
    if (!controls) return;

    const lerpFactor = 0.04;

    controls.target.lerp(targetGoal.current, lerpFactor);
    camera.position.lerp(positionGoal.current, lerpFactor);
    controls.update();

    // Stop once close enough (< 0.05 units on both)
    const targetDist = controls.target.distanceTo(targetGoal.current);
    const posDist = camera.position.distanceTo(positionGoal.current);
    if (targetDist < 0.05 && posDist < 0.05) {
      controls.target.copy(targetGoal.current);
      camera.position.copy(positionGoal.current);
      controls.update();
      animating.current = false;
    }
  });

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
  customizeMode = false,
}: KeyboardSceneProps) {
  // Always animate — idle floating, RGB, interactions all need continuous rendering
  const frameloop = "always" as const;
  const controlsRef = useRef<any>(null);

  return (
    <Canvas
      dpr={[1, 2]}
      frameloop={frameloop}
      camera={{ position: [0, 14, 24], fov: 30 }}
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

      {/* ── Contact Shadows for natural grounding ── */}
      <ContactShadows
        position={[0, -1.3, 0]}
        opacity={0.4}
        blur={2.5}
        scale={40}
        far={4}
        resolution={256}
        color="#000000"
      />

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

      {/* Intro dolly: zoomed-in → default on mount */}
      <IntroAnimation controlsRef={controlsRef} />

      {/* Smooth camera transition for customize mode */}
      <CustomizeModeController active={customizeMode} controlsRef={controlsRef} />

      <OrbitControls
        ref={controlsRef}
        autoRotate={autoRotate}
        autoRotateSpeed={0.3}
        enablePan={false}
        target={[0, 0, 0]}
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
