"use client";

import { useMemo } from "react";
import * as THREE from "three";
import { RoundedBox } from "@react-three/drei";
import type { MaterialPreset, CaseFinishModifier } from "./materialPresets";
import { CASE_FINISHES, PLATE_MATERIALS } from "./materialPresets";
import type { NormalMapType } from "./proceduralTextures";
import { getNormalMap } from "./proceduralTextures";
import { CableGeometry, WirelessSwitch, BluetoothLED } from "./CableGeometry";

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
  caseFinish?: "glossy" | "matte" | "satin";
  connectionType?: "wired" | "wireless" | "bluetooth";
  cableColor?: string;
  plateMaterial?: "aluminum" | "brass" | "polycarbonate" | "fr4" | "pom";
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
  caseFinish = "glossy",
  connectionType,
  cableColor,
  plateMaterial = "aluminum",
}: CaseGeometryProps) {
  const normalMap = useMemo(() => getNormalMap(normalMapType), [normalMapType]);

  // Apply case finish modifier to material properties
  const finishMod: CaseFinishModifier = CASE_FINISHES[caseFinish] || CASE_FINISHES.glossy;

  const normalScale = useMemo(() => {
    let base: [number, number];
    if (normalMapType === "brushed-aluminum") base = [0.3, 0.3];
    else if (normalMapType === "brass") base = [0.25, 0.25];
    else if (normalMapType === "wood-grain") base = [0.5, 0.5];
    else base = [0.15, 0.15];
    return new THREE.Vector2(
      base[0] * finishMod.normalScaleMultiplier,
      base[1] * finishMod.normalScaleMultiplier
    );
  }, [normalMapType, finishMod.normalScaleMultiplier]);

  // Compute finish-adjusted material values
  const caseMetalness = materialPreset.metalness * finishMod.metalnessMultiplier;
  const caseRoughness = finishMod.roughnessOverride ?? materialPreset.roughness;
  const caseClearcoat = finishMod.clearcoat || (materialPreset.clearcoat || 0);
  const caseClearcoatRoughness = finishMod.clearcoatRoughness || (materialPreset.clearcoatRoughness || 0);
  const caseEnvMapIntensity = finishMod.envMapIntensity;

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

  const usbPortZ = -depth / 2;

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
          metalness={caseMetalness}
          roughness={caseRoughness}
          clearcoat={caseClearcoat}
          clearcoatRoughness={caseClearcoatRoughness}
          reflectivity={materialPreset.reflectivity || 0.5}
          envMapIntensity={caseEnvMapIntensity}
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
          metalness={caseMetalness}
          roughness={caseRoughness + 0.05}
          clearcoat={caseClearcoat}
          envMapIntensity={caseEnvMapIntensity * 0.75}
          normalMap={normalMap}
          normalScale={normalScale}
        />
      </RoundedBox>

      {/* ── Plate ── */}
      {(() => {
        const plateMat = PLATE_MATERIALS[plateMaterial] || PLATE_MATERIALS.aluminum;
        return (
          <RoundedBox
            args={[width - 0.6, plateThickness, depth - 0.4]}
            radius={0.05}
            smoothness={2}
            position={[0, 0, 0]}
          >
            <meshPhysicalMaterial
              color={plateColor}
              metalness={plateMat.metalness}
              roughness={plateMat.roughness}
              clearcoat={plateMat.clearcoat || 0}
              clearcoatRoughness={plateMat.clearcoatRoughness || 0}
              envMapIntensity={0.6}
            />
          </RoundedBox>
        );
      })()}

      {/* ── Enhanced USB-C Port ── */}
      <EnhancedUSBCPort height={height} depth={depth} />

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

      {/* ── Bottom Case Screws ── */}
      <BottomScrews width={width} depth={depth} height={height} />

      {/* ── RGB Underglow Strips ── */}
      {hasRGB && <UnderglowStrips width={width} depth={depth} height={height} color={rgbColor} />}

      {/* ── Cable / Wireless Toggle ── */}
      {connectionType === "wired" && (
        <CableGeometry
          caseWidth={width}
          caseDepth={depth}
          caseHeight={height}
          cableColor={cableColor}
          usbPortZ={usbPortZ}
        />
      )}
      {(connectionType === "wireless" || connectionType === "bluetooth") && (
        <WirelessSwitch caseWidth={width} caseHeight={height} caseDepth={depth} />
      )}
      {connectionType === "bluetooth" && (
        <BluetoothLED caseWidth={width} caseHeight={height} caseDepth={depth} />
      )}
    </group>
  );
}

// ─── Enhanced USB-C Port ─────────────────────────────────────────────

function EnhancedUSBCPort({ height, depth }: { height: number; depth: number }) {
  const y = -height * 0.35;
  const z = -depth / 2;

  return (
    <group position={[0, y, z]}>
      {/* Outer metallic housing */}
      <mesh position={[0, 0, 0.05]}>
        <boxGeometry args={[1.2, 0.55, 0.2]} />
        <meshPhysicalMaterial
          color="#999999"
          metalness={0.92}
          roughness={0.15}
          reflectivity={0.8}
        />
      </mesh>

      {/* Inner dark cavity */}
      <mesh position={[0, 0, -0.02]}>
        <boxGeometry args={[0.85, 0.32, 0.25]} />
        <meshPhysicalMaterial
          color="#0a0a0a"
          metalness={0.2}
          roughness={0.8}
        />
      </mesh>

      {/* Center tongue / pin block (USB-C characteristic) */}
      <mesh position={[0, -0.02, -0.03]}>
        <boxGeometry args={[0.65, 0.08, 0.2]} />
        <meshPhysicalMaterial
          color="#c9a84c"
          metalness={0.95}
          roughness={0.1}
          reflectivity={0.9}
        />
      </mesh>

      {/* 5 individual gold contact pins */}
      {[-0.24, -0.12, 0, 0.12, 0.24].map((xOff, i) => (
        <mesh key={`pin-${i}`} position={[xOff, 0.04, -0.04]}>
          <boxGeometry args={[0.06, 0.03, 0.12]} />
          <meshPhysicalMaterial
            color="#d4af37"
            metalness={0.95}
            roughness={0.08}
          />
        </mesh>
      ))}

      {/* Port chamfer ring */}
      <mesh position={[0, 0, -0.05]} rotation={[Math.PI / 2, 0, 0]}>
        <torusGeometry args={[0.48, 0.03, 6, 16]} />
        <meshPhysicalMaterial
          color="#777777"
          metalness={0.85}
          roughness={0.2}
        />
      </mesh>
    </group>
  );
}

// ─── Bottom Case Screws (Phillips-head) ──────────────────────────────

function BottomScrews({ width, depth, height }: { width: number; depth: number; height: number }) {
  const y = -height + 0.02;
  const positions: [number, number][] = [
    [-width * 0.35, -depth * 0.35],
    [width * 0.35, -depth * 0.35],
    [-width * 0.35, depth * 0.35],
    [width * 0.35, depth * 0.35],
    [0, -depth * 0.38],
    [0, depth * 0.38],
    [-width * 0.18, 0],
    [width * 0.18, 0],
  ];

  return (
    <group>
      {positions.map(([x, z], i) => (
        <group key={`bscrew-${i}`} position={[x, y, z]}>
          {/* Screw head body */}
          <mesh rotation={[-Math.PI / 2, 0, 0]}>
            <cylinderGeometry args={[0.15, 0.15, 0.06, 10]} />
            <meshPhysicalMaterial
              color="#555555"
              metalness={0.9}
              roughness={0.25}
            />
          </mesh>
          {/* Phillips cross slot - horizontal bar */}
          <mesh position={[0, -0.025, 0]} rotation={[-Math.PI / 2, 0, 0]}>
            <boxGeometry args={[0.18, 0.03, 0.02]} />
            <meshPhysicalMaterial color="#333333" metalness={0.7} roughness={0.4} />
          </mesh>
          {/* Phillips cross slot - vertical bar */}
          <mesh position={[0, -0.025, 0]} rotation={[-Math.PI / 2, 0, 0]}>
            <boxGeometry args={[0.03, 0.18, 0.02]} />
            <meshPhysicalMaterial color="#333333" metalness={0.7} roughness={0.4} />
          </mesh>
        </group>
      ))}
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
