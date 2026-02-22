"use client";

import { useRef } from "react";
import { useFrame, useThree } from "@react-three/fiber";
import { Environment } from "@react-three/drei";
import * as THREE from "three";

// ─── Environment Presets ────────────────────────────────────────────

export type EnvironmentPresetName = "studio" | "city" | "sunset" | "dawn" | "apartment" | "warehouse";

interface EnvironmentTuning {
  preset: "studio" | "city" | "sunset" | "dawn" | "apartment" | "warehouse";
  environmentIntensity: number;
  ambientIntensity: number;
  keyLightIntensity: number;
  keyLightColor: string;
  fillLightIntensity: number;
  fillLightColor: string;
  rimLightIntensity: number;
  rimLightColor: string;
}

const ENV_TUNING: Record<EnvironmentPresetName, EnvironmentTuning> = {
  studio: {
    preset: "studio",
    environmentIntensity: 0.25,
    ambientIntensity: 0.2,
    keyLightIntensity: 0.7,
    keyLightColor: "#fff5e6",
    fillLightIntensity: 0.25,
    fillLightColor: "#e0e8ff",
    rimLightIntensity: 0.15,
    rimLightColor: "#ffd4a0",
  },
  city: {
    preset: "city",
    environmentIntensity: 0.5,
    ambientIntensity: 0.25,
    keyLightIntensity: 1.0,
    keyLightColor: "#ffeedd",
    fillLightIntensity: 0.5,
    fillLightColor: "#c8d8f0",
    rimLightIntensity: 0.2,
    rimLightColor: "#ffe0b0",
  },
  sunset: {
    preset: "sunset",
    environmentIntensity: 0.6,
    ambientIntensity: 0.2,
    keyLightIntensity: 1.4,
    keyLightColor: "#ffccaa",
    fillLightIntensity: 0.3,
    fillLightColor: "#8899cc",
    rimLightIntensity: 0.4,
    rimLightColor: "#ffaa66",
  },
  dawn: {
    preset: "dawn",
    environmentIntensity: 0.45,
    ambientIntensity: 0.35,
    keyLightIntensity: 0.9,
    keyLightColor: "#ffe8d0",
    fillLightIntensity: 0.5,
    fillLightColor: "#d0dff0",
    rimLightIntensity: 0.25,
    rimLightColor: "#ffd0a0",
  },
  apartment: {
    preset: "apartment",
    environmentIntensity: 0.35,
    ambientIntensity: 0.4,
    keyLightIntensity: 0.8,
    keyLightColor: "#ffe6cc",
    fillLightIntensity: 0.45,
    fillLightColor: "#dde4f0",
    rimLightIntensity: 0.2,
    rimLightColor: "#ffc880",
  },
  warehouse: {
    preset: "warehouse",
    environmentIntensity: 0.3,
    ambientIntensity: 0.2,
    keyLightIntensity: 1.5,
    keyLightColor: "#fff0d0",
    fillLightIntensity: 0.3,
    fillLightColor: "#bbccdd",
    rimLightIntensity: 0.4,
    rimLightColor: "#ffd888",
  },
};

// ─── Camera Presets ─────────────────────────────────────────────────

export type CameraPresetName = "default" | "top-down" | "hero" | "side" | "closeup" | "freeform";

interface CameraPreset {
  position: [number, number, number];
  fov: number;
}

const CAMERA_PRESETS: Record<CameraPresetName, CameraPreset> = {
  default: { position: [0, 20, 38], fov: 30 },
  "top-down": { position: [0, 18, 2], fov: 28 },
  hero: { position: [8, 6, 10], fov: 32 },
  side: { position: [16, 4, 0], fov: 28 },
  closeup: { position: [3, 4, 6], fov: 35 },
};

// ─── Scene Environment Component ────────────────────────────────────

interface SceneEnvironmentProps {
  environment?: EnvironmentPresetName;
  showDesk?: boolean;
  deskColor?: string;
  cameraPreset?: CameraPresetName;
}

export function SceneEnvironment({
  environment = "studio",
  showDesk = false,
  deskColor = "#2a2520",
  cameraPreset = "default",
}: SceneEnvironmentProps) {
  const tuning = ENV_TUNING[environment];

  return (
    <>
      {/* Lighting */}
      <ambientLight intensity={tuning.ambientIntensity} />
      <directionalLight
        position={[8, 12, 5]}
        intensity={tuning.keyLightIntensity}
        color={tuning.keyLightColor}
        castShadow
        shadow-mapSize={1024}
      />
      <directionalLight
        position={[-6, 8, -3]}
        intensity={tuning.fillLightIntensity}
        color={tuning.fillLightColor}
      />
      <directionalLight
        position={[0, 2, -10]}
        intensity={tuning.rimLightIntensity}
        color={tuning.rimLightColor}
      />

      {/* HDRI Environment */}
      <Environment
        preset={tuning.preset}
        environmentIntensity={tuning.environmentIntensity}
      />


      {/* Desk Surface */}
      {showDesk && <DeskSurface color={deskColor} />}

      {/* Camera Transition Controller */}
      <CameraController preset={cameraPreset} />
    </>
  );
}

// ─── Desk Surface ───────────────────────────────────────────────────

function DeskSurface({ color }: { color: string }) {
  return (
    <mesh position={[0, -1.25, 0]} rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
      <planeGeometry args={[40, 40]} />
      <meshPhysicalMaterial
        color={color}
        roughness={0.7}
        metalness={0}
        envMapIntensity={0.2}
      />
    </mesh>
  );
}

// ─── Camera Controller (smooth lerp transitions) ────────────────────
// Only actively moves the camera when transitioning between presets.
// Once the transition completes (or if preset is "default"), it yields
// full control to OrbitControls so auto-rotate and user drag work.

function CameraController({ preset }: { preset: CameraPresetName }) {
  const { camera } = useThree();
  const prevPreset = useRef(preset);
  const transitioning = useRef(false);

  // Detect preset changes — freeform never triggers a transition
  if (prevPreset.current !== preset) {
    prevPreset.current = preset;
    transitioning.current = preset !== "freeform";
  }

  useFrame(() => {
    if (!transitioning.current) return;

    const target = CAMERA_PRESETS[preset];
    if (!target) return; // freeform has no entry

    const targetPos = new THREE.Vector3(...target.position);

    camera.position.lerp(targetPos, 0.06);

    if (camera instanceof THREE.PerspectiveCamera) {
      camera.fov = THREE.MathUtils.lerp(camera.fov, target.fov, 0.06);
      camera.updateProjectionMatrix();
    }

    // Stop transitioning once close enough
    if (camera.position.distanceTo(targetPos) < 0.05) {
      camera.position.copy(targetPos);
      if (camera instanceof THREE.PerspectiveCamera) {
        camera.fov = target.fov;
        camera.updateProjectionMatrix();
      }
      transitioning.current = false;
    }
  });

  return null;
}
