"use client";

import { useMemo, useRef, useState, useCallback } from "react";
import * as THREE from "three";
import { useFrame } from "@react-three/fiber";
import type { KeyboardViewerConfig } from "@/lib/keyboard3d";
import { CASE_MATERIALS, KEYCAP_MATERIALS, KEYCAP_PROFILE_MULTIPLIERS } from "./materialPresets";
import { createSculptedKeycap } from "./keycapGeometry";
import { CaseGeometry } from "./CaseGeometry";
import { RGBLayer } from "./RGBController";
import { getNormalMap } from "./proceduralTextures";
import { COLORWAYS, getKeycapColor, getLegendColor } from "./colorways";

// Standard MX spacing: 19.05mm = 0.01905m, we work in cm-scale
const UNIT = 1.905;
const KEYCAP_SIZE = 1.7;
const KEYCAP_HEIGHT = 0.8;
const GAP = UNIT - KEYCAP_SIZE;

// Row profiles - slight height variation per row
const ROW_HEIGHTS = [0.9, 0.85, 0.8, 0.78, 0.75];

// ─── QWERTY Legends ────────────────────────────────────────────────

const LEGENDS_ROW0 = ["`", "1", "2", "3", "4", "5", "6", "7", "8", "9", "0", "-", "=", "\u232B"];
const LEGENDS_ROW1 = ["\u21E5", "Q", "W", "E", "R", "T", "Y", "U", "I", "O", "P", "[", "]", "\\"];
const LEGENDS_ROW2 = ["\u21EA", "A", "S", "D", "F", "G", "H", "J", "K", "L", ";", "'", "\u23CE"];
const LEGENDS_ROW3 = ["\u21E7", "Z", "X", "C", "V", "B", "N", "M", ",", ".", "/", "\u21E7"];
const LEGENDS_ROW4 = ["Ctrl", "\u2318", "Alt", " ", "Alt", "\u2318", "Fn", "Ctrl"];
const LEGENDS_FROW = ["Esc", "F1", "F2", "F3", "F4", "F5", "F6", "F7", "F8", "F9", "F10", "F11", "F12"];
const LEGENDS_65_EXTRA_ROW0 = ["Del"];
const LEGENDS_65_EXTRA_ROW3 = ["\u2191"];
const LEGENDS_65_ROW4 = ["Ctrl", "\u2318", "Alt", " ", "Alt", "\u2318", "\u2190", "\u2193", "\u2192"];
const LEGENDS_NAV = ["Ins", "Hm", "PU", "Del", "End", "PD", "", "\u2191", "", "\u2190", "\u2193", "\u2192"];
const LEGENDS_NUMPAD_R0 = ["NL", "/", "*", "-"];
const LEGENDS_NUMPAD_R1 = ["7", "8", "9", "+"];
const LEGENDS_NUMPAD_R2 = ["4", "5", "6"];
const LEGENDS_NUMPAD_R3 = ["1", "2", "3", "\u23CE"];
const LEGENDS_NUMPAD_R4 = ["0", "."];

// Suppress unused variable warnings — these arrays are used via the layout-specific row selection
void LEGENDS_NAV; void LEGENDS_NUMPAD_R0; void LEGENDS_NUMPAD_R1;
void LEGENDS_NUMPAD_R2; void LEGENDS_NUMPAD_R3; void LEGENDS_NUMPAD_R4;

function getLegendForKey(keyIndex: number, rowIndex: number, size: KeyboardViewerConfig["size"]): string {
  let rows: string[][];

  if (size === "60") {
    rows = [LEGENDS_ROW0, LEGENDS_ROW1, LEGENDS_ROW2, LEGENDS_ROW3, LEGENDS_ROW4];
  } else if (size === "65") {
    rows = [
      [...LEGENDS_ROW0, ...LEGENDS_65_EXTRA_ROW0],
      LEGENDS_ROW1,
      LEGENDS_ROW2,
      [...LEGENDS_ROW3.slice(0, -1), "\u21E7", ...LEGENDS_65_EXTRA_ROW3],
      LEGENDS_65_ROW4,
    ];
  } else if (size === "75") {
    rows = [
      [...LEGENDS_FROW, "Del"],
      [...LEGENDS_ROW0, "Del"],
      LEGENDS_ROW1,
      LEGENDS_ROW2,
      [...LEGENDS_ROW3.slice(0, -1), "\u21E7", "\u2191"],
      LEGENDS_65_ROW4,
    ];
  } else {
    rows = [
      LEGENDS_FROW,
      LEGENDS_ROW0,
      LEGENDS_ROW1,
      LEGENDS_ROW2,
      LEGENDS_ROW3,
      LEGENDS_ROW4,
    ];
  }

  if (rowIndex < rows.length && keyIndex < rows[rowIndex].length) {
    return rows[rowIndex][keyIndex];
  }
  return "";
}

function createLegendTexture(legend: string, keycapColor: string, legendColorOverride?: string): THREE.CanvasTexture | null {
  if (!legend || legend === " ") return null;

  const size = 128;
  const canvas = document.createElement("canvas");
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext("2d");
  if (!ctx) return null;

  ctx.clearRect(0, 0, size, size);

  let textColor: string;
  if (legendColorOverride) {
    textColor = legendColorOverride;
  } else {
    const r = parseInt(keycapColor.slice(1, 3), 16) || 128;
    const g = parseInt(keycapColor.slice(3, 5), 16) || 128;
    const b = parseInt(keycapColor.slice(5, 7), 16) || 128;
    const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
    textColor = luminance > 0.5 ? "rgba(0,0,0,0.7)" : "rgba(255,255,255,0.75)";
  }

  ctx.fillStyle = textColor;
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";

  const fontSize = legend.length === 1 ? 48 : legend.length <= 3 ? 32 : 22;
  ctx.font = `600 ${fontSize}px system-ui, -apple-system, sans-serif`;
  ctx.fillText(legend, size / 2, size / 2);

  const texture = new THREE.CanvasTexture(canvas);
  texture.needsUpdate = true;
  return texture;
}

// ─── Key Definition ─────────────────────────────────────────────────

interface KeyDef {
  x: number;
  y: number;
  w: number;
  row: number;
  isModifier: boolean;
}

function generateLayout(size: KeyboardViewerConfig["size"]): KeyDef[] {
  const keys: KeyDef[] = [];

  const row0: [number, boolean][] = [
    [1, false], [1, false], [1, false], [1, false], [1, false], [1, false],
    [1, false], [1, false], [1, false], [1, false], [1, false], [1, false], [1, false],
    [2, true],
  ];
  const row1: [number, boolean][] = [
    [1.5, true], [1, false], [1, false], [1, false], [1, false], [1, false],
    [1, false], [1, false], [1, false], [1, false], [1, false], [1, false], [1, false],
    [1.5, true],
  ];
  const row2: [number, boolean][] = [
    [1.75, true], [1, false], [1, false], [1, false], [1, false], [1, false],
    [1, false], [1, false], [1, false], [1, false], [1, false], [1, false],
    [2.25, true],
  ];
  const row3: [number, boolean][] = [
    [2.25, true], [1, false], [1, false], [1, false], [1, false], [1, false],
    [1, false], [1, false], [1, false], [1, false], [1, false],
    [2.75, true],
  ];
  const row4_60: [number, boolean][] = [
    [1.25, true], [1.25, true], [1.25, true],
    [6.25, true],
    [1.25, true], [1.25, true], [1.25, true], [1.25, true],
  ];

  const rows = [row0, row1, row2, row3, row4_60];

  if (size === "65" || size === "75" || size === "tkl" || size === "full") {
    rows[3] = [
      [2.25, true], [1, false], [1, false], [1, false], [1, false], [1, false],
      [1, false], [1, false], [1, false], [1, false], [1, false],
      [1.75, true], [1, true],
    ];
    rows[4] = [
      [1.25, true], [1.25, true], [1.25, true],
      [6.25, true],
      [1.25, true], [1.25, true],
      [1, true], [1, true], [1, true],
    ];
    rows[0] = [...row0, [1, true]];
  }

  if (size === "75") {
    const fRow: [number, boolean][] = [
      [1, true], [1, true], [1, true], [1, true], [1, true],
      [1, true], [1, true], [1, true], [1, true],
      [1, true], [1, true], [1, true], [1, true],
      [1, true],
    ];
    rows.unshift(fRow);
  }

  if (size === "tkl") {
    const fRow: [number, boolean][] = [
      [1, true], [1, true], [1, true], [1, true], [1, true],
      [1, true], [1, true], [1, true], [1, true],
      [1, true], [1, true], [1, true], [1, true],
    ];
    rows.unshift(fRow);
    for (let r = 1; r <= 4; r++) {
      rows[r] = [...rows[r], [1, true], [1, true], [1, true]];
    }
  }

  if (size === "full") {
    const fRow: [number, boolean][] = [
      [1, true], [1, true], [1, true], [1, true], [1, true],
      [1, true], [1, true], [1, true], [1, true],
      [1, true], [1, true], [1, true], [1, true],
    ];
    rows.unshift(fRow);
    for (let r = 1; r <= 4; r++) {
      rows[r] = [...rows[r], [1, true], [1, true], [1, true]];
    }
    const numpadAdditions = [
      [[1, true], [1, true], [1, true], [1, true]],
      [[1, false], [1, false], [1, false], [1, true]],
      [[1, false], [1, false], [1, false]],
      [[1, false], [1, false], [1, false], [1, true]],
      [[2, false], [1, false]],
    ];
    for (let r = 0; r < numpadAdditions.length && r < rows.length; r++) {
      rows[r] = [...rows[r], ...numpadAdditions[r] as [number, boolean][]];
    }
  }

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

// ─── Interactive Keycap ─────────────────────────────────────────────

function Keycap({
  position,
  width,
  height,
  color,
  material,
  legend,
  showLegend,
  legendColor,
  profile,
  row,
  widthU,
  interactive,
  onPress,
  onRelease,
  index,
}: {
  position: [number, number, number];
  width: number;
  height: number;
  color: string;
  material: KeyboardViewerConfig["keycapMaterial"];
  legend?: string;
  showLegend?: boolean;
  legendColor?: string;
  profile: KeyboardViewerConfig["keycapProfile"];
  row: number;
  widthU: number;
  interactive?: boolean;
  onPress?: (index: number, legend: string) => void;
  onRelease?: (index: number) => void;
  index: number;
}) {
  const preset = KEYCAP_MATERIALS[material] || KEYCAP_MATERIALS.pbt;
  const groupRef = useRef<THREE.Group>(null);
  const [hovered, setHovered] = useState(false);
  const pressOffset = useRef(0);
  const targetOffset = useRef(0);

  // Sculpted geometry
  const geometry = useMemo(
    () => createSculptedKeycap(profile, row, widthU, KEYCAP_SIZE, height),
    [profile, row, widthU, height],
  );

  // Normal map for keycap material
  const normalMap = useMemo(
    () => (preset.normalMapType ? getNormalMap(preset.normalMapType) : null),
    [preset.normalMapType],
  );
  const normalScale = useMemo(
    () => new THREE.Vector2(preset.normalScale || 0, preset.normalScale || 0),
    [preset.normalScale],
  );

  // Legend texture
  const texture = useMemo(() => {
    if (!showLegend || !legend) return null;
    return createLegendTexture(legend, color, legendColor);
  }, [showLegend, legend, color, legendColor]);

  // Color lerp for smooth transitions
  const currentColor = useRef(new THREE.Color(color));
  const targetColor = useMemo(() => new THREE.Color(color), [color]);

  // Spring animation for key press + color lerp
  useFrame(() => {
    if (!groupRef.current) return;

    // Smooth press animation
    pressOffset.current += (targetOffset.current - pressOffset.current) * 0.2;
    groupRef.current.position.y = position[1] + pressOffset.current;

    // Color lerp
    currentColor.current.lerp(targetColor, 0.08);
  });

  const handlePointerDown = useCallback((e: THREE.Event) => {
    if (!interactive) return;
    (e as { stopPropagation?: () => void }).stopPropagation?.();
    targetOffset.current = -0.08; // 1.5mm press depth
    onPress?.(index, legend || "");
  }, [interactive, onPress, index, legend]);

  const handlePointerUp = useCallback(() => {
    if (!interactive) return;
    targetOffset.current = 0;
    onRelease?.(index);
  }, [interactive, onRelease, index]);

  return (
    <group
      ref={groupRef}
      position={position}
      onPointerDown={handlePointerDown}
      onPointerUp={handlePointerUp}
      onPointerLeave={() => {
        if (interactive) {
          targetOffset.current = 0;
          setHovered(false);
          document.body.style.cursor = "auto";
        }
      }}
      onPointerEnter={() => {
        if (interactive) {
          setHovered(true);
          document.body.style.cursor = "pointer";
        }
      }}
    >
      <mesh geometry={geometry}>
        <meshPhysicalMaterial
          color={color}
          metalness={preset.metalness}
          roughness={preset.roughness}
          clearcoat={preset.clearcoat || 0}
          clearcoatRoughness={preset.clearcoatRoughness || 0}
          envMapIntensity={0.5}
          normalMap={normalMap}
          normalScale={normalScale}
        />
      </mesh>

      {/* Hover highlight overlay */}
      {hovered && interactive && (
        <mesh position={[0, height / 2 + 0.01, 0]} rotation={[-Math.PI / 2, 0, 0]}>
          <planeGeometry args={[width * 0.95, KEYCAP_SIZE * 0.95]} />
          <meshBasicMaterial color="#ffffff" transparent opacity={0.08} depthWrite={false} />
        </mesh>
      )}

      {/* Legend overlay */}
      {texture && (
        <mesh position={[0, height / 2 + 0.005, 0]} rotation={[-Math.PI / 2, 0, 0]}>
          <planeGeometry args={[width * 0.85, KEYCAP_SIZE * 0.85]} />
          <meshBasicMaterial map={texture} transparent depthWrite={false} polygonOffset polygonOffsetFactor={-1} />
        </mesh>
      )}
    </group>
  );
}

// ─── Main Model ─────────────────────────────────────────────────────

interface KeyboardModelProps {
  config: KeyboardViewerConfig;
  interactive?: boolean;
  onKeyPress?: (legend: string) => void;
}

export function KeyboardModel({ config, interactive = false, onKeyPress }: KeyboardModelProps) {
  const groupRef = useRef<THREE.Group>(null);
  const [pressedKeys, setPressedKeys] = useState<Set<number>>(new Set());

  const layout = useMemo(() => generateLayout(config.size), [config.size]);

  // Resolve colorway
  const colorway = useMemo(() => {
    if (config.customColorway) return config.customColorway;
    if (config.colorway && COLORWAYS[config.colorway]) return COLORWAYS[config.colorway];
    return null;
  }, [config.colorway, config.customColorway]);

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

  const caseWidth = bounds.width + UNIT * 0.6;
  const caseDepth = bounds.depth + UNIT * 0.5;
  const caseHeight = 1.5;
  const plateThickness = 0.15;

  // Pre-compute per-row key indices for legend lookup
  const keyIndicesPerRow = useMemo(() => {
    const map = new Map<number, number>();
    const rowCounts = new Map<number, number>();
    layout.forEach((key, i) => {
      const count = rowCounts.get(key.y) || 0;
      map.set(i, count);
      rowCounts.set(key.y, count + 1);
    });
    return map;
  }, [layout]);

  const profileMultipliers = KEYCAP_PROFILE_MULTIPLIERS[config.keycapProfile || "cherry"] || KEYCAP_PROFILE_MULTIPLIERS.cherry;

  // RGB key position data
  const rgbKeyData = useMemo(() => {
    return layout.map((key, i) => ({
      x: key.x + UNIT * 0.2,
      z: key.y * UNIT + UNIT / 2 + UNIT * 0.15,
      width: key.w * UNIT - GAP,
      index: i,
    }));
  }, [layout]);

  const handleKeyPress = useCallback((index: number, legend: string) => {
    setPressedKeys((prev) => new Set(prev).add(index));
    onKeyPress?.(legend);
  }, [onKeyPress]);

  const handleKeyRelease = useCallback((index: number) => {
    setPressedKeys((prev) => {
      const next = new Set(prev);
      next.delete(index);
      return next;
    });
  }, []);

  // Determine legend color from colorway
  const legendColorFromColorway = colorway ? getLegendColor(colorway) : undefined;

  return (
    <group ref={groupRef} position={[-caseWidth / 2, 0, -caseDepth / 2]} rotation={[0.15, 0, 0]}>
      {/* ── Detailed Case (Phase 3) ── */}
      <group position={[caseWidth / 2, 0, caseDepth / 2]}>
        <CaseGeometry
          width={caseWidth}
          depth={caseDepth}
          height={caseHeight}
          color={config.caseColor}
          plateColor={config.plateColor}
          materialPreset={casePreset}
          normalMapType={casePreset.normalMapType}
          mountingStyle={config.mountingStyle || "gasket"}
          hasRGB={config.hasRGB}
          rgbColor={config.rgbColor}
        />
      </group>

      {/* ── Per-Key RGB LEDs (Phase 4) ── */}
      {config.hasRGB && (
        <group position={[0, 0, 0]}>
          <RGBLayer
            keys={rgbKeyData}
            plateY={plateThickness / 2}
            mode={config.rgbMode || "static"}
            color={config.rgbColor}
            secondaryColor={config.rgbSecondaryColor}
            speed={config.rgbSpeed ?? 1.0}
            brightness={config.rgbBrightness ?? 2.5}
            pressedKeys={pressedKeys}
            totalWidth={bounds.width}
          />
        </group>
      )}

      {/* ── Keycaps (Phase 2 sculpted + Phase 6 colorways + Phase 8 interactive) ── */}
      {layout.map((key, i) => {
        const keyWidth = key.w * UNIT - GAP;
        const baseRowHeight = ROW_HEIGHTS[key.row] || 0.75;
        const profileMult = profileMultipliers[key.row] || 1.0;
        const rowHeight = baseRowHeight * profileMult;
        const yPos = plateThickness / 2 + rowHeight / 2;
        const zPos = key.y * UNIT + UNIT / 2 + UNIT * 0.15;
        const keyInRow = keyIndicesPerRow.get(i) || 0;
        const legend = getLegendForKey(keyInRow, key.y, config.size);

        // Colorway-based color or fallback to simple accent logic
        let keycapColor: string;
        if (colorway) {
          keycapColor = getKeycapColor(colorway, legend, key.isModifier);
        } else {
          keycapColor = key.isModifier ? config.keycapAccentColor : config.keycapColor;
        }

        return (
          <Keycap
            key={i}
            index={i}
            position={[key.x + UNIT * 0.2, yPos, zPos]}
            width={keyWidth}
            height={rowHeight}
            color={keycapColor}
            material={config.keycapMaterial}
            legend={legend}
            showLegend={config.showLegends !== false}
            legendColor={legendColorFromColorway}
            profile={config.keycapProfile || "cherry"}
            row={key.row}
            widthU={key.w}
            interactive={interactive}
            onPress={handleKeyPress}
            onRelease={handleKeyRelease}
          />
        );
      })}
    </group>
  );
}
