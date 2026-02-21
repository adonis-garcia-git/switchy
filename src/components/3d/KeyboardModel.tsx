"use client";

import { useMemo, useRef } from "react";
import * as THREE from "three";
import { RoundedBox } from "@react-three/drei";
import type { KeyboardViewerConfig } from "@/lib/keyboard3d";
import { CASE_MATERIALS, PLATE_MATERIALS, KEYCAP_MATERIALS } from "./materialPresets";

// Standard MX spacing: 19.05mm = 0.01905m, we work in cm-scale (1 unit = ~1cm)
const UNIT = 1.905; // 1u in our coordinate system
const KEYCAP_SIZE = 1.7; // slightly smaller than 1u for gap
const KEYCAP_HEIGHT = 0.8;
const GAP = UNIT - KEYCAP_SIZE;

// Row profiles - slight height variation per row for realism
const ROW_HEIGHTS = [0.9, 0.85, 0.8, 0.78, 0.75];

interface KeyDef {
  x: number;
  y: number;
  w: number; // width in units
  row: number;
  isModifier: boolean;
}

function generateLayout(size: KeyboardViewerConfig["size"]): KeyDef[] {
  const keys: KeyDef[] = [];

  // Row 0: Number row (Esc, 1-=, Backspace)
  const row0: [number, boolean][] = [
    [1, false], // Esc/`
    [1, false], [1, false], [1, false], [1, false], [1, false],
    [1, false], [1, false], [1, false], [1, false], [1, false],
    [1, false], [1, false],
    [2, true], // Backspace
  ];

  // Row 1: Tab row
  const row1: [number, boolean][] = [
    [1.5, true], // Tab
    [1, false], [1, false], [1, false], [1, false], [1, false],
    [1, false], [1, false], [1, false], [1, false], [1, false],
    [1, false], [1, false],
    [1.5, true], // Backslash
  ];

  // Row 2: Caps row
  const row2: [number, boolean][] = [
    [1.75, true], // Caps
    [1, false], [1, false], [1, false], [1, false], [1, false],
    [1, false], [1, false], [1, false], [1, false], [1, false],
    [1, false],
    [2.25, true], // Enter
  ];

  // Row 3: Shift row
  const row3: [number, boolean][] = [
    [2.25, true], // LShift
    [1, false], [1, false], [1, false], [1, false], [1, false],
    [1, false], [1, false], [1, false], [1, false], [1, false],
    [2.75, true], // RShift (narrower on 65%)
  ];

  // Row 4: Bottom row
  const row4_60: [number, boolean][] = [
    [1.25, true], [1.25, true], [1.25, true], // Ctrl, Win, Alt
    [6.25, true], // Space
    [1.25, true], [1.25, true], [1.25, true], [1.25, true], // Alt, Win, Menu, Ctrl
  ];

  const rows = [row0, row1, row2, row3, row4_60];

  // Adjust for 65%: add extra column on right side
  if (size === "65" || size === "75" || size === "tkl" || size === "full") {
    // Row 3 shift shrinks, add arrow-like key
    rows[3] = [
      [2.25, true],
      [1, false], [1, false], [1, false], [1, false], [1, false],
      [1, false], [1, false], [1, false], [1, false], [1, false],
      [1.75, true], // Narrower RShift
      [1, true], // Extra key (arrow up area)
    ];
    // Bottom row for 65%
    rows[4] = [
      [1.25, true], [1.25, true], [1.25, true],
      [6.25, true],
      [1.25, true], [1.25, true],
      [1, true], [1, true], [1, true], // Arrow cluster
    ];
    // Add extra key to row 0
    rows[0] = [...row0, [1, true]]; // Delete
  }

  if (size === "75") {
    // F-row on top
    const fRow: [number, boolean][] = [
      [1, true], // Esc
      [1, true], [1, true], [1, true], [1, true], // F1-F4
      [1, true], [1, true], [1, true], [1, true], // F5-F8
      [1, true], [1, true], [1, true], [1, true], // F9-F12
      [1, true], // Delete/Print
    ];
    rows.unshift(fRow);
  }

  if (size === "tkl") {
    // F-row
    const fRow: [number, boolean][] = [
      [1, true],
      [1, true], [1, true], [1, true], [1, true],
      [1, true], [1, true], [1, true], [1, true],
      [1, true], [1, true], [1, true], [1, true],
    ];
    rows.unshift(fRow);

    // Add nav cluster (3 keys) to rows 1-4
    for (let r = 1; r <= 4; r++) {
      rows[r] = [...rows[r], [1, true], [1, true], [1, true]];
    }
  }

  if (size === "full") {
    // F-row
    const fRow: [number, boolean][] = [
      [1, true],
      [1, true], [1, true], [1, true], [1, true],
      [1, true], [1, true], [1, true], [1, true],
      [1, true], [1, true], [1, true], [1, true],
    ];
    rows.unshift(fRow);

    // Nav cluster + numpad on rows
    for (let r = 1; r <= 4; r++) {
      rows[r] = [...rows[r], [1, true], [1, true], [1, true]];
    }

    // Add numpad (4 keys wide) to right side of rows 1-5
    const numpadAdditions = [
      [[1, true], [1, true], [1, true], [1, true]], // Num, /, *, -
      [[1, false], [1, false], [1, false], [1, true]], // 7,8,9,+
      [[1, false], [1, false], [1, false]], // 4,5,6
      [[1, false], [1, false], [1, false], [1, true]], // 1,2,3,Enter
      [[2, false], [1, false]], // 0, .
    ];
    for (let r = 0; r < numpadAdditions.length && r < rows.length; r++) {
      rows[r] = [...rows[r], ...numpadAdditions[r] as [number, boolean][]];
    }
  }

  // Convert to KeyDef array
  rows.forEach((row, rowIdx) => {
    let xPos = 0;
    row.forEach(([w, isMod]) => {
      keys.push({
        x: xPos + (w * UNIT) / 2,
        y: rowIdx,
        w,
        row: Math.min(rowIdx, ROW_HEIGHTS.length - 1),
        isModifier: isMod,
      });
      xPos += w * UNIT;
    });
  });

  return keys;
}

function Keycap({
  position,
  width,
  height,
  color,
  material,
}: {
  position: [number, number, number];
  width: number;
  height: number;
  color: string;
  material: KeyboardViewerConfig["keycapMaterial"];
}) {
  const preset = KEYCAP_MATERIALS[material] || KEYCAP_MATERIALS.pbt;

  return (
    <RoundedBox
      args={[width, height, KEYCAP_SIZE]}
      radius={0.12}
      smoothness={4}
      position={position}
    >
      <meshPhysicalMaterial
        color={color}
        metalness={preset.metalness}
        roughness={preset.roughness}
        clearcoat={preset.clearcoat || 0}
        clearcoatRoughness={preset.clearcoatRoughness || 0}
        envMapIntensity={0.5}
      />
    </RoundedBox>
  );
}

interface KeyboardModelProps {
  config: KeyboardViewerConfig;
}

export function KeyboardModel({ config }: KeyboardModelProps) {
  const groupRef = useRef<THREE.Group>(null);

  const layout = useMemo(() => generateLayout(config.size), [config.size]);

  // Calculate bounds for centering
  const bounds = useMemo(() => {
    let maxX = 0;
    let maxY = 0;
    layout.forEach((key) => {
      const right = key.x + (key.w * UNIT) / 2;
      if (right > maxX) maxX = right;
      if (key.y > maxY) maxY = key.y;
    });
    return { width: maxX, rows: maxY + 1, depth: (maxY + 1) * UNIT };
  }, [layout]);

  const casePreset = CASE_MATERIALS[config.caseMaterial] || CASE_MATERIALS.aluminum;
  const platePreset = PLATE_MATERIALS[config.plateMaterial] || PLATE_MATERIALS.aluminum;

  const caseWidth = bounds.width + UNIT * 0.6;
  const caseDepth = bounds.depth + UNIT * 0.5;
  const caseHeight = 1.5;
  const plateThickness = 0.15;

  return (
    <group ref={groupRef} position={[-caseWidth / 2, 0, -caseDepth / 2]} rotation={[0.15, 0, 0]}>
      {/* Case body */}
      <RoundedBox
        args={[caseWidth, caseHeight, caseDepth]}
        radius={0.3}
        smoothness={4}
        position={[caseWidth / 2, -caseHeight / 2, caseDepth / 2]}
      >
        <meshPhysicalMaterial
          color={config.caseColor}
          metalness={casePreset.metalness}
          roughness={casePreset.roughness}
          clearcoat={casePreset.clearcoat || 0}
          clearcoatRoughness={casePreset.clearcoatRoughness || 0}
          reflectivity={casePreset.reflectivity || 0.5}
          envMapIntensity={0.8}
        />
      </RoundedBox>

      {/* Plate */}
      <RoundedBox
        args={[caseWidth - 0.6, plateThickness, caseDepth - 0.4]}
        radius={0.05}
        smoothness={2}
        position={[caseWidth / 2, 0, caseDepth / 2]}
      >
        <meshPhysicalMaterial
          color={config.plateColor}
          metalness={platePreset.metalness}
          roughness={platePreset.roughness}
          clearcoat={platePreset.clearcoat || 0}
          envMapIntensity={0.6}
        />
      </RoundedBox>

      {/* RGB underglow */}
      {config.hasRGB && (
        <mesh position={[caseWidth / 2, -caseHeight + 0.05, caseDepth / 2]}>
          <planeGeometry args={[caseWidth - 1, caseDepth - 1]} />
          <meshBasicMaterial
            color={config.rgbColor}
            transparent
            opacity={0.3}
            side={THREE.DoubleSide}
          />
        </mesh>
      )}

      {/* Keycaps */}
      {layout.map((key, i) => {
        const keyWidth = key.w * UNIT - GAP;
        const rowHeight = ROW_HEIGHTS[key.row] || 0.75;
        const yPos = plateThickness / 2 + rowHeight / 2;
        const zPos = key.y * UNIT + UNIT / 2 + UNIT * 0.15;
        const color = key.isModifier ? config.keycapAccentColor : config.keycapColor;

        return (
          <Keycap
            key={i}
            position={[key.x + UNIT * 0.2, yPos, zPos]}
            width={keyWidth}
            height={rowHeight}
            color={color}
            material={config.keycapMaterial}
          />
        );
      })}
    </group>
  );
}
