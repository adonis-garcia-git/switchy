"use client";

import { useRef, useMemo } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";

export type RGBMode = "static" | "breathing" | "rainbow" | "wave" | "reactive";

interface KeyLEDProps {
  position: [number, number, number];
  width: number;
  depth: number;
  color: string;
  secondaryColor?: string;
  mode: RGBMode;
  speed: number;
  brightness: number;
  keyIndex: number;
  totalKeys: number;
  keyX: number; // normalized x position for wave/rainbow effects
  reactiveFlash?: boolean; // true when key was just pressed
}

export function KeyLED({
  position,
  width,
  depth,
  color,
  secondaryColor,
  mode,
  speed,
  brightness,
  keyX,
  reactiveFlash = false,
}: KeyLEDProps) {
  const matRef = useRef<THREE.MeshStandardMaterial>(null);
  const flashRef = useRef(0);
  const colorObj = useMemo(() => new THREE.Color(color), [color]);
  const secondaryObj = useMemo(() => new THREE.Color(secondaryColor || color), [secondaryColor, color]);

  useFrame((state) => {
    const mat = matRef.current;
    if (!mat) return;

    const t = state.clock.elapsedTime * speed;

    // Handle reactive flash decay
    if (reactiveFlash) {
      flashRef.current = 1.0;
    }
    if (flashRef.current > 0) {
      flashRef.current *= 0.92; // decay
      if (flashRef.current < 0.01) flashRef.current = 0;
    }

    let finalColor = colorObj.clone();
    let intensity = brightness;

    switch (mode) {
      case "static":
        // Nothing changes
        break;

      case "breathing": {
        const breathe = (Math.sin(t * 2) + 1) / 2; // 0-1
        intensity = brightness * (0.3 + breathe * 0.7);
        break;
      }

      case "rainbow": {
        const hue = ((t * 0.3 + keyX) % 1 + 1) % 1;
        finalColor.setHSL(hue, 0.9, 0.5);
        break;
      }

      case "wave": {
        const wave = (Math.sin(t * 3 - keyX * Math.PI * 4) + 1) / 2;
        intensity = brightness * (0.15 + wave * 0.85);
        finalColor.lerpColors(secondaryObj, colorObj, wave);
        break;
      }

      case "reactive": {
        // Base dim, bright on flash
        intensity = brightness * (0.15 + flashRef.current * 0.85);
        break;
      }
    }

    // Apply reactive flash boost on top of any mode
    if (flashRef.current > 0 && mode !== "reactive") {
      intensity = Math.min(intensity + flashRef.current * 2, brightness + 2);
    }

    mat.emissive.copy(finalColor);
    mat.emissiveIntensity = intensity;
  });

  return (
    <mesh position={position} rotation={[-Math.PI / 2, 0, 0]}>
      <planeGeometry args={[width * 0.5, depth * 0.5]} />
      <meshStandardMaterial
        ref={matRef}
        emissive={color}
        emissiveIntensity={brightness}
        color="#000000"
        transparent
        opacity={0.9}
        toneMapped={false}
        side={THREE.DoubleSide}
      />
    </mesh>
  );
}

// ─── RGB Layer for all keys ─────────────────────────────────────────

interface RGBLayerProps {
  keys: Array<{
    x: number;
    z: number;
    width: number;
    index: number;
  }>;
  plateY: number;
  mode: RGBMode;
  color: string;
  secondaryColor?: string;
  speed: number;
  brightness: number;
  pressedKeys: Set<number>;
  totalWidth: number;
}

export function RGBLayer({
  keys,
  plateY,
  mode,
  color,
  secondaryColor,
  speed,
  brightness,
  pressedKeys,
  totalWidth,
}: RGBLayerProps) {
  if (mode === "static" && brightness === 0) return null;

  return (
    <group>
      {keys.map((key) => (
        <KeyLED
          key={key.index}
          position={[key.x, plateY + 0.02, key.z]}
          width={key.width}
          depth={1.7}
          color={color}
          secondaryColor={secondaryColor}
          mode={mode}
          speed={speed}
          brightness={brightness}
          keyIndex={key.index}
          totalKeys={keys.length}
          keyX={totalWidth > 0 ? key.x / totalWidth : 0}
          reactiveFlash={pressedKeys.has(key.index)}
        />
      ))}
    </group>
  );
}
