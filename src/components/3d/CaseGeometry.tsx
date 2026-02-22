"use client";

import { useMemo } from "react";
import * as THREE from "three";
import { RoundedBox } from "@react-three/drei";
import type { MaterialPreset } from "./materialPresets";
import type { NormalMapType } from "./proceduralTextures";
import { getNormalMap } from "./proceduralTextures";

export type MountingStyle = "gasket" | "top-mount" | "tray-mount" | "plate-mount";

interface CaseGeometryProps {
  width: number;
  depth: number;
  height: number;
  color: string;
  plateColor: string;
  materialPreset: MaterialPreset;
  normalMapType?: NormalMapType;
  mountingStyle?: MountingStyle;
  hasRGB: boolean;
  rgbColor: string;
}

export function CaseGeometry({
  width,
  depth,
  height,
  color,
  plateColor,
  materialPreset,
  normalMapType = "none",
  mountingStyle = "gasket",
  hasRGB,
  rgbColor,
}: CaseGeometryProps) {
  const normalMap = useMemo(() => getNormalMap(normalMapType), [normalMapType]);
  const normalScale = useMemo(() => {
    if (normalMapType === "brushed-aluminum") return new THREE.Vector2(0.3, 0.3);
    if (normalMapType === "brass") return new THREE.Vector2(0.25, 0.25);
    if (normalMapType === "wood-grain") return new THREE.Vector2(0.5, 0.5);
    return new THREE.Vector2(0.15, 0.15);
  }, [normalMapType]);

  const bezelWidth = width + 0.3;
  const bezelDepth = depth + 0.2;
  const bezelHeight = 0.25;
  const plateThickness = 0.15;

  // Rubber feet positions (corners)
  const feetInset = 0.8;
  const feetPositions: [number, number, number][] = [
    [-width / 2 + feetInset, -height + 0.05, -depth / 2 + feetInset],
    [width / 2 - feetInset, -height + 0.05, -depth / 2 + feetInset],
    [-width / 2 + feetInset, -height + 0.05, depth / 2 - feetInset],
    [width / 2 - feetInset, -height + 0.05, depth / 2 - feetInset],
  ];

  // Rear feet slightly taller for typing angle
  const rearFeetExtraHeight = 0.08;

  return (
    <group>
      {/* ── Main Case Body ── */}
      <RoundedBox
        args={[width, height, depth]}
        radius={0.3}
        smoothness={4}
        position={[0, -height / 2, 0]}
      >
        <meshPhysicalMaterial
          color={color}
          metalness={materialPreset.metalness}
          roughness={materialPreset.roughness}
          clearcoat={materialPreset.clearcoat || 0}
          clearcoatRoughness={materialPreset.clearcoatRoughness || 0}
          reflectivity={materialPreset.reflectivity || 0.5}
          envMapIntensity={0.8}
          normalMap={normalMap}
          normalScale={normalScale}
        />
      </RoundedBox>

      {/* ── Bezel Lip ── */}
      <RoundedBox
        args={[bezelWidth, bezelHeight, bezelDepth]}
        radius={0.08}
        smoothness={3}
        position={[0, bezelHeight / 2 - 0.02, 0]}
      >
        <meshPhysicalMaterial
          color={color}
          metalness={materialPreset.metalness}
          roughness={materialPreset.roughness + 0.05}
          clearcoat={materialPreset.clearcoat || 0}
          envMapIntensity={0.6}
          normalMap={normalMap}
          normalScale={normalScale}
        />
      </RoundedBox>

      {/* ── Plate ── */}
      <RoundedBox
        args={[width - 0.6, plateThickness, depth - 0.4]}
        radius={0.05}
        smoothness={2}
        position={[0, 0, 0]}
      >
        <meshPhysicalMaterial
          color={plateColor}
          metalness={0.85}
          roughness={0.2}
          envMapIntensity={0.6}
        />
      </RoundedBox>

      {/* ── USB-C Port ── */}
      <mesh position={[0, -height * 0.35, -depth / 2 - 0.01]}>
        <boxGeometry args={[0.9, 0.35, 0.3]} />
        <meshPhysicalMaterial
          color="#1a1a1a"
          metalness={0.4}
          roughness={0.6}
        />
      </mesh>
      {/* USB-C metal housing */}
      <mesh position={[0, -height * 0.35, -depth / 2 + 0.05]}>
        <boxGeometry args={[1.1, 0.5, 0.15]} />
        <meshPhysicalMaterial
          color="#888888"
          metalness={0.9}
          roughness={0.2}
        />
      </mesh>

      {/* ── Rubber Feet ── */}
      {feetPositions.map((pos, i) => {
        const isRear = pos[2] < 0;
        const feetH = 0.12 + (isRear ? rearFeetExtraHeight : 0);
        return (
          <mesh key={`foot-${i}`} position={[pos[0], pos[1] - feetH / 2, pos[2]]}>
            <cylinderGeometry args={[0.3, 0.35, feetH, 12]} />
            <meshPhysicalMaterial
              color="#222222"
              metalness={0}
              roughness={0.9}
            />
          </mesh>
        );
      })}

      {/* ── Mounting Style Indicators ── */}
      {mountingStyle === "gasket" && (
        <GasketStrips width={bezelWidth} depth={bezelDepth} bezelHeight={bezelHeight} />
      )}
      {mountingStyle === "top-mount" && (
        <TopMountScrews width={bezelWidth} depth={bezelDepth} bezelHeight={bezelHeight} />
      )}
      {mountingStyle === "tray-mount" && (
        <TrayMountStandoffs width={width} depth={depth} />
      )}

      {/* ── Weight Block (aluminum/brass cases) ── */}
      {(materialPreset.metalness > 0.5) && (
        <mesh position={[0, -height + 0.15, 0]}>
          <boxGeometry args={[width * 0.5, 0.2, depth * 0.3]} />
          <meshPhysicalMaterial
            color={materialPreset.metalness > 0.9 ? "#c4a052" : "#b0b0b0"}
            metalness={1.0}
            roughness={0.15}
            reflectivity={0.9}
          />
        </mesh>
      )}

      {/* ── RGB Underglow Strips ── */}
      {hasRGB && <UnderglowStrips width={width} depth={depth} height={height} color={rgbColor} />}
    </group>
  );
}

// ─── Mounting Sub-components ────────────────────────────────────────

function GasketStrips({ width, depth, bezelHeight }: { width: number; depth: number; bezelHeight: number }) {
  const stripThickness = 0.06;
  const stripHeight = 0.12;
  const y = bezelHeight * 0.3;
  const color = "#e85050"; // silicone red

  return (
    <group>
      {/* Left & Right strips */}
      <mesh position={[-width / 2 + stripThickness, y, 0]}>
        <boxGeometry args={[stripThickness, stripHeight, depth * 0.85]} />
        <meshStandardMaterial color={color} roughness={0.95} />
      </mesh>
      <mesh position={[width / 2 - stripThickness, y, 0]}>
        <boxGeometry args={[stripThickness, stripHeight, depth * 0.85]} />
        <meshStandardMaterial color={color} roughness={0.95} />
      </mesh>
      {/* Front & Back strips */}
      <mesh position={[0, y, -depth / 2 + stripThickness]}>
        <boxGeometry args={[width * 0.85, stripHeight, stripThickness]} />
        <meshStandardMaterial color={color} roughness={0.95} />
      </mesh>
      <mesh position={[0, y, depth / 2 - stripThickness]}>
        <boxGeometry args={[width * 0.85, stripHeight, stripThickness]} />
        <meshStandardMaterial color={color} roughness={0.95} />
      </mesh>
    </group>
  );
}

function TopMountScrews({ width, depth, bezelHeight }: { width: number; depth: number; bezelHeight: number }) {
  const screwPositions: [number, number][] = [
    [-width * 0.35, -depth * 0.35],
    [width * 0.35, -depth * 0.35],
    [-width * 0.35, depth * 0.35],
    [width * 0.35, depth * 0.35],
    [0, -depth * 0.4],
    [0, depth * 0.4],
  ];

  return (
    <group>
      {screwPositions.map(([x, z], i) => (
        <mesh key={`screw-${i}`} position={[x, bezelHeight + 0.01, z]} rotation={[-Math.PI / 2, 0, 0]}>
          <cylinderGeometry args={[0.12, 0.12, 0.05, 8]} />
          <meshPhysicalMaterial color="#666666" metalness={0.9} roughness={0.3} />
        </mesh>
      ))}
    </group>
  );
}

function TrayMountStandoffs({ width, depth }: { width: number; depth: number }) {
  const positions: [number, number][] = [
    [-width * 0.3, 0],
    [width * 0.3, 0],
    [0, -depth * 0.25],
    [0, depth * 0.25],
    [-width * 0.15, -depth * 0.15],
  ];

  return (
    <group>
      {positions.map(([x, z], i) => (
        <mesh key={`standoff-${i}`} position={[x, 0.08, z]}>
          <cylinderGeometry args={[0.08, 0.08, 0.16, 6]} />
          <meshPhysicalMaterial color="#888888" metalness={0.85} roughness={0.25} />
        </mesh>
      ))}
    </group>
  );
}

// ─── Underglow ──────────────────────────────────────────────────────

function UnderglowStrips({ width, depth, height, color }: { width: number; depth: number; height: number; color: string }) {
  const y = -height + 0.06;
  const stripThick = 0.15;

  return (
    <group>
      {/* Front strip */}
      <mesh position={[0, y, depth / 2 - 0.1]}>
        <boxGeometry args={[width * 0.9, stripThick, 0.12]} />
        <meshStandardMaterial
          emissive={color}
          emissiveIntensity={3.0}
          color="#000000"
          toneMapped={false}
        />
      </mesh>
      {/* Back strip */}
      <mesh position={[0, y, -depth / 2 + 0.1]}>
        <boxGeometry args={[width * 0.9, stripThick, 0.12]} />
        <meshStandardMaterial
          emissive={color}
          emissiveIntensity={3.0}
          color="#000000"
          toneMapped={false}
        />
      </mesh>
      {/* Left strip */}
      <mesh position={[-width / 2 + 0.1, y, 0]}>
        <boxGeometry args={[0.12, stripThick, depth * 0.9]} />
        <meshStandardMaterial
          emissive={color}
          emissiveIntensity={3.0}
          color="#000000"
          toneMapped={false}
        />
      </mesh>
      {/* Right strip */}
      <mesh position={[width / 2 - 0.1, y, 0]}>
        <boxGeometry args={[0.12, stripThick, depth * 0.9]} />
        <meshStandardMaterial
          emissive={color}
          emissiveIntensity={3.0}
          color="#000000"
          toneMapped={false}
        />
      </mesh>
    </group>
  );
}
