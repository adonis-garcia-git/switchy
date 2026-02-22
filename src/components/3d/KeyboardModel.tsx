"use client";

import { useMemo, useRef, useState, useCallback } from "react";
import * as THREE from "three";
import { useFrame } from "@react-three/fiber";
import type { KeyboardViewerConfig } from "@/lib/keyboard3d";
import { makeKeyId } from "@/lib/keyCustomization";
import type { PerKeyOverride, SelectionMode } from "@/lib/keyCustomization";
import { CASE_MATERIALS, KEYCAP_MATERIALS, KEYCAP_PROFILE_MULTIPLIERS } from "./materialPresets";
import { createSculptedKeycap } from "./keycapGeometry";
import { CaseGeometry } from "./CaseGeometry";
import { RGBLayer } from "./RGBController";
import { getNormalMap } from "./proceduralTextures";
import { COLORWAYS, getKeycapColor, getLegendColor } from "./colorways";
import { createArtisanGeometry, getArtisanMaterial } from "./artisanKeycaps";
import type { ArtisanStyle } from "./artisanKeycaps";

// Standard MX spacing: 19.05mm = 0.01905m, we work in cm-scale
const UNIT = 1.905;
const KEYCAP_SIZE = 1.7;
const KEYCAP_HEIGHT = 0.8;
const GAP = UNIT - KEYCAP_SIZE;

// Row profiles - slight height variation per row
const ROW_HEIGHTS = [0.9, 0.85, 0.8, 0.78, 0.75];

// ─── Legend Texture Cache ───────────────────────────────────────────

const legendTextureCache = new Map<string, THREE.CanvasTexture | null>();

function legendCacheKey(legend: string, keycapColor: string, legendColor?: string, widthU?: number): string {
  return `${legend}|${keycapColor}|${legendColor || "auto"}|${(widthU || 1).toFixed(2)}`;
}

// ─── Sub-legend Mappings (shifted character above base) ──────────────
const SUB_LEGENDS: Record<string, [string, string]> = {
  "`": ["~", "`"],
  "1": ["!", "1"], "2": ["@", "2"], "3": ["#", "3"], "4": ["$", "4"],
  "5": ["%", "5"], "6": ["^", "6"], "7": ["&", "7"], "8": ["*", "8"],
  "9": ["(", "9"], "0": [")", "0"],
  "-": ["_", "-"], "=": ["+", "="],
  "[": ["{", "["], "]": ["}", "]"], "\\": ["|", "\\"],
  ";": [":", ";"], "'": ["\"", "'"],
  ",": ["<", ","], ".": [">", "."], "/": ["?", "/"],
};

// ─── Modifier Symbol Font Sizes ──────────────────────────────────────
const MODIFIER_FONT_SIZES: Record<string, number> = {
  "\u21E7": 36, // ⇧ Shift
  "\u23CE": 34, // ⏎ Enter
  "\u21EA": 28, // ⇪ Caps Lock
  "\u232B": 30, // ⌫ Backspace
  "\u21E5": 28, // ⇥ Tab
  "\u2318": 30, // ⌘ Command
};

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

function createLegendTexture(
  legend: string,
  keycapColor: string,
  legendColorOverride?: string,
  widthU: number = 1,
): THREE.CanvasTexture | null {
  if (!legend || legend === " ") return null;

  // Check cache first — key includes widthU for aspect-correct textures
  const key = legendCacheKey(legend, keycapColor, legendColorOverride, widthU);
  const cached = legendTextureCache.get(key);
  if (cached !== undefined) return cached;

  // Non-square canvas for wide keys to prevent horizontal stretch
  const baseSize = 128;
  const canvasW = Math.round(baseSize * Math.max(widthU, 1));
  const canvasH = baseSize;
  const canvas = document.createElement("canvas");
  canvas.width = canvasW;
  canvas.height = canvasH;
  const ctx = canvas.getContext("2d");
  if (!ctx) return null;

  ctx.clearRect(0, 0, canvasW, canvasH);

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

  // Check for sub-legend (dual-character keys like `~/`, 1/!, etc.)
  const subLegend = SUB_LEGENDS[legend];
  if (subLegend && widthU <= 1.25) {
    // Dual-character rendering: secondary (shifted) at top, primary at bottom
    const [secondary, primary] = subLegend;
    const priSize = 38;
    const secSize = 30;

    ctx.textAlign = "center";
    ctx.textBaseline = "middle";

    // Secondary (shifted) character at ~30% height
    ctx.font = `500 ${secSize}px system-ui, -apple-system, sans-serif`;
    ctx.fillText(secondary, canvasW / 2, canvasH * 0.30);

    // Primary character at ~65% height
    ctx.font = `600 ${priSize}px system-ui, -apple-system, sans-serif`;
    ctx.fillText(primary, canvasW / 2, canvasH * 0.65);
  } else {
    // Single legend rendering
    const isModifierSymbol = MODIFIER_FONT_SIZES[legend] !== undefined;
    const isTextModifier = widthU >= 1.5 && legend.length >= 2 && !isModifierSymbol;

    let fontSize: number;
    if (isModifierSymbol) {
      fontSize = MODIFIER_FONT_SIZES[legend];
    } else if (isTextModifier) {
      // Text modifiers (Ctrl, Alt, Fn) render bottom-left aligned at smaller size
      fontSize = 18;
    } else {
      fontSize = legend.length === 1 ? 48 : legend.length <= 3 ? 32 : 22;
    }

    ctx.font = `600 ${fontSize}px system-ui, -apple-system, sans-serif`;

    if (isTextModifier) {
      // Bottom-left aligned for text modifiers on wide keys (like real keycaps)
      ctx.textAlign = "left";
      ctx.textBaseline = "bottom";
      ctx.fillText(legend, canvasW * 0.12, canvasH * 0.85);
    } else {
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.fillText(legend, canvasW / 2, canvasH / 2);
    }
  }

  const texture = new THREE.CanvasTexture(canvas);
  texture.needsUpdate = true;

  legendTextureCache.set(key, texture);
  return texture;
}

// ─── Key Definition ─────────────────────────────────────────────────

interface KeyDef {
  x: number;
  y: number;
  w: number;
  row: number;
  isModifier: boolean;
  keyId: string;
  legend: string;
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
    let keyInRow = 0;
    row.forEach(([w, isMod]) => {
      const legend = getLegendForKey(keyInRow, rowIdx, size);
      keys.push({
        x: xPos + (w * UNIT) / 2,
        y: rowIdx,
        w,
        row: Math.min(rowIdx, ROW_HEIGHTS.length - 1),
        isModifier: isMod,
        keyId: makeKeyId(rowIdx, keyInRow),
        legend,
      });
      keyInRow++;
      xPos += w * UNIT;
    });
  });

  return keys;
}

// ─── Selection Ring ─────────────────────────────────────────────────

function SelectionRing({ width, depth, height }: { width: number; depth: number; height: number }) {
  const ringRef = useRef<THREE.Mesh>(null);

  useFrame(({ clock }) => {
    if (!ringRef.current) return;
    const mat = ringRef.current.material as THREE.MeshBasicMaterial;
    // Breathing opacity animation
    mat.opacity = 0.25 + Math.sin(clock.getElapsedTime() * 3) * 0.12;
  });

  return (
    <mesh ref={ringRef} position={[0, height / 2 + 0.02, 0]} rotation={[-Math.PI / 2, 0, 0]}>
      <ringGeometry args={[Math.max(width, depth) * 0.48, Math.max(width, depth) * 0.54, 32]} />
      <meshBasicMaterial color="#E8590C" transparent opacity={0.3} depthWrite={false} side={THREE.DoubleSide} />
    </mesh>
  );
}

// ─── Stabilizer Wire (Cherry-style for wide keys) ──────────────────

function StabilizerWire({ width, plateY }: { width: number; plateY: number }) {
  // Cherry-style: wire connecting two insertion points, positioned below keycap
  const wireRadius = 0.025;
  const stemSpacing = width * 0.5; // distance between stems
  const wireY = plateY - 0.08;
  const wireDropY = wireY - 0.12;

  return (
    <group>
      {/* Horizontal bar */}
      <mesh position={[0, wireDropY, 0]} rotation={[0, 0, Math.PI / 2]}>
        <cylinderGeometry args={[wireRadius, wireRadius, stemSpacing, 6]} />
        <meshPhysicalMaterial color="#c0c0c0" metalness={0.9} roughness={0.2} />
      </mesh>
      {/* Left vertical stem */}
      <mesh position={[-stemSpacing / 2, (wireY + wireDropY) / 2, 0]}>
        <cylinderGeometry args={[wireRadius, wireRadius, wireY - wireDropY, 6]} />
        <meshPhysicalMaterial color="#c0c0c0" metalness={0.9} roughness={0.2} />
      </mesh>
      {/* Right vertical stem */}
      <mesh position={[stemSpacing / 2, (wireY + wireDropY) / 2, 0]}>
        <cylinderGeometry args={[wireRadius, wireRadius, wireY - wireDropY, 6]} />
        <meshPhysicalMaterial color="#c0c0c0" metalness={0.9} roughness={0.2} />
      </mesh>
    </group>
  );
}

// ─── Switch Stem (+ shaped cross at plate level) ────────────────────

function SwitchStem({ plateY, stemColor }: { plateY: number; stemColor: string }) {
  const armLength = 0.2;
  const armThick = 0.06;
  const armHeight = 0.12;
  const y = plateY + armHeight / 2 - 0.02;

  return (
    <group position={[0, y, 0]}>
      {/* Horizontal arm */}
      <mesh>
        <boxGeometry args={[armLength, armHeight, armThick]} />
        <meshPhysicalMaterial color={stemColor} roughness={0.5} metalness={0} />
      </mesh>
      {/* Vertical arm */}
      <mesh>
        <boxGeometry args={[armThick, armHeight, armLength]} />
        <meshPhysicalMaterial color={stemColor} roughness={0.5} metalness={0} />
      </mesh>
    </group>
  );
}

// ─── Key Press Ripple Effect ────────────────────────────────────────

function PressRipple({
  active,
  width,
  height,
  color,
}: {
  active: boolean;
  width: number;
  height: number;
  color: string;
}) {
  const ringRef = useRef<THREE.Mesh>(null);
  const scaleRef = useRef(0);
  const opacityRef = useRef(0);
  const wasActive = useRef(false);

  useFrame(() => {
    if (!ringRef.current) return;

    // Trigger on press start
    if (active && !wasActive.current) {
      scaleRef.current = 0.3;
      opacityRef.current = 0.6;
    }
    wasActive.current = active;

    // Animate: expand + fade
    if (opacityRef.current > 0.01) {
      scaleRef.current += 0.08;
      opacityRef.current *= 0.92;
    }

    ringRef.current.scale.set(scaleRef.current, scaleRef.current, 1);
    const mat = ringRef.current.material as THREE.MeshBasicMaterial;
    mat.opacity = opacityRef.current;
    ringRef.current.visible = opacityRef.current > 0.01;
  });

  return (
    <mesh
      ref={ringRef}
      position={[0, height / 2 + 0.03, 0]}
      rotation={[-Math.PI / 2, 0, 0]}
      visible={false}
    >
      <ringGeometry args={[Math.max(width, KEYCAP_SIZE) * 0.4, Math.max(width, KEYCAP_SIZE) * 0.48, 24]} />
      <meshBasicMaterial
        color={color}
        transparent
        opacity={0}
        depthWrite={false}
        side={THREE.DoubleSide}
      />
    </mesh>
  );
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
  keyId,
  selected,
  onSelect,
  onPaint,
  paintMode,
  artisan,
  isPressed,
  rippleColor,
  switchStemColor,
  plateY,
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
  keyId: string;
  selected?: boolean;
  onSelect?: (keyId: string) => void;
  onPaint?: (keyId: string) => void;
  paintMode?: boolean;
  artisan?: string;
  isPressed?: boolean;
  rippleColor?: string;
  switchStemColor?: string;
  plateY?: number;
}) {
  const preset = KEYCAP_MATERIALS[material] || KEYCAP_MATERIALS.pbt;
  const groupRef = useRef<THREE.Group>(null);
  const meshRef = useRef<THREE.Mesh>(null);
  const [hovered, setHovered] = useState(false);
  const pressOffset = useRef(0);
  const targetOffset = useRef(0);
  const flashIntensity = useRef(0);
  const prevColor = useRef(color);

  // Detect color change for flash effect
  if (prevColor.current !== color) {
    flashIntensity.current = 0.4;
    prevColor.current = color;
  }

  // Artisan geometry or sculpted
  const geometry = useMemo(() => {
    if (artisan) {
      return createArtisanGeometry(artisan as ArtisanStyle, KEYCAP_SIZE, height);
    }
    return createSculptedKeycap(profile, row, widthU, KEYCAP_SIZE, height);
  }, [profile, row, widthU, height, artisan]);

  // Artisan material
  const artisanMat = useMemo(() => {
    if (!artisan) return null;
    return getArtisanMaterial(artisan as ArtisanStyle, color);
  }, [artisan, color]);

  // Normal map for keycap material
  const normalMap = useMemo(
    () => (preset.normalMapType ? getNormalMap(preset.normalMapType) : null),
    [preset.normalMapType],
  );
  const normalScale = useMemo(
    () => new THREE.Vector2(preset.normalScale || 0, preset.normalScale || 0),
    [preset.normalScale],
  );

  // Legend texture (skip for artisans) — pass widthU for aspect-correct textures
  const texture = useMemo(() => {
    if (artisan) return null;
    if (!showLegend || !legend) return null;
    return createLegendTexture(legend, color, legendColor, widthU);
  }, [showLegend, legend, color, legendColor, artisan, widthU]);

  // Color lerp for smooth transitions
  const currentColor = useRef(new THREE.Color(color));
  const targetColor = useMemo(() => new THREE.Color(color), [color]);

  // Spring animation for key press + color lerp + flash decay
  useFrame(() => {
    if (!groupRef.current) return;

    // Smooth press animation
    pressOffset.current += (targetOffset.current - pressOffset.current) * 0.2;
    groupRef.current.position.y = position[1] + pressOffset.current;

    // Color lerp — snappier for customization
    currentColor.current.lerp(targetColor, 0.12);

    // Flash effect decay
    if (flashIntensity.current > 0.01 && meshRef.current) {
      flashIntensity.current *= 0.88; // 200ms-ish decay
      const mat = meshRef.current.material as THREE.MeshPhysicalMaterial;
      mat.emissiveIntensity = flashIntensity.current;
    }
  });

  const handlePointerDown = useCallback((e: THREE.Event) => {
    (e as { stopPropagation?: () => void }).stopPropagation?.();

    // Selection mode takes priority
    if (onSelect) {
      onSelect(keyId);
      return;
    }

    if (!interactive) return;
    targetOffset.current = -0.08;
    onPress?.(index, legend || "");
  }, [interactive, onPress, onSelect, index, legend, keyId]);

  const handlePointerUp = useCallback(() => {
    if (!interactive || onSelect) return;
    targetOffset.current = 0;
    onRelease?.(index);
  }, [interactive, onRelease, index, onSelect]);

  const handlePointerEnter = useCallback(() => {
    if (paintMode && onPaint) {
      onPaint(keyId);
    }
    if (interactive || onSelect) {
      setHovered(true);
      document.body.style.cursor = "pointer";
    }
  }, [interactive, onSelect, paintMode, onPaint, keyId]);

  const handlePointerLeave = useCallback(() => {
    if (interactive) {
      targetOffset.current = 0;
    }
    if (interactive || onSelect) {
      setHovered(false);
      document.body.style.cursor = "auto";
    }
  }, [interactive, onSelect]);

  // Material props — artisan or standard
  const matProps = artisanMat
    ? {
        color: artisanMat.color,
        metalness: artisanMat.metalness,
        roughness: artisanMat.roughness,
        clearcoat: artisanMat.clearcoat,
        clearcoatRoughness: artisanMat.clearcoatRoughness,
        emissive: artisanMat.emissive || "#000000",
        emissiveIntensity: artisanMat.emissiveIntensity || 0,
        envMapIntensity: 0.7,
      }
    : {
        color,
        metalness: preset.metalness,
        roughness: preset.roughness,
        clearcoat: preset.clearcoat || 0,
        clearcoatRoughness: preset.clearcoatRoughness || 0,
        envMapIntensity: 0.5,
        normalMap,
        normalScale,
        emissive: color,
        emissiveIntensity: 0,
      };

  return (
    <group
      ref={groupRef}
      position={position}
      onPointerDown={handlePointerDown}
      onPointerUp={handlePointerUp}
      onPointerLeave={handlePointerLeave}
      onPointerEnter={handlePointerEnter}
    >
      <mesh ref={meshRef} geometry={geometry}>
        <meshPhysicalMaterial {...matProps} />
      </mesh>

      {/* Selection ring */}
      {selected && <SelectionRing width={width} depth={KEYCAP_SIZE} height={height} />}

      {/* Hover highlight overlay */}
      {hovered && (interactive || onSelect) && (
        <mesh position={[0, height / 2 + 0.01, 0]} rotation={[-Math.PI / 2, 0, 0]}>
          <planeGeometry args={[width * 0.95, KEYCAP_SIZE * 0.95]} />
          <meshBasicMaterial color="#ffffff" transparent opacity={0.08} depthWrite={false} />
        </mesh>
      )}

      {/* Legend overlay — aspect-matched to canvas texture */}
      {texture && (
        <mesh position={[0, height / 2 + 0.005, 0]} rotation={[-Math.PI / 2, 0, 0]}>
          <planeGeometry args={[width * 0.88, KEYCAP_SIZE * 0.88]} />
          <meshBasicMaterial map={texture} transparent depthWrite={false} polygonOffset polygonOffsetFactor={-1} />
        </mesh>
      )}

      {/* Stabilizer wire for wide keys (2u+) */}
      {widthU >= 2 && plateY !== undefined && (
        <StabilizerWire width={width} plateY={plateY} />
      )}

      {/* Switch stem visible at plate level */}
      {switchStemColor && plateY !== undefined && (
        <SwitchStem plateY={plateY} stemColor={switchStemColor} />
      )}

      {/* Key press ripple effect */}
      {interactive && rippleColor && (
        <PressRipple
          active={!!isPressed}
          width={width}
          height={height}
          color={rippleColor}
        />
      )}
    </group>
  );
}

// ─── Main Model ─────────────────────────────────────────────────────

export interface KeyboardModelProps {
  config: KeyboardViewerConfig;
  interactive?: boolean;
  onKeyPress?: (legend: string) => void;
  selectionMode?: SelectionMode;
  selectedKeys?: Set<string>;
  onKeySelect?: (keyId: string) => void;
  onKeyPaint?: (keyId: string) => void;
}

export function KeyboardModel({
  config,
  interactive = false,
  onKeyPress,
  selectionMode,
  selectedKeys,
  onKeySelect,
  onKeyPaint,
}: KeyboardModelProps) {
  const groupRef = useRef<THREE.Group>(null);
  const [pressedKeys, setPressedKeys] = useState<Set<number>>(new Set());

  // ─── Idle Floating Animation ──────────────────────
  const lastInteraction = useRef(Date.now());
  const idleFloat = useRef({ y: 0, tilt: 0 });

  // Track user interaction
  const markInteraction = useCallback(() => {
    lastInteraction.current = Date.now();
  }, []);

  useFrame(({ clock }) => {
    if (!groupRef.current) return;

    const timeSinceInteraction = (Date.now() - lastInteraction.current) / 1000;
    const isIdle = timeSinceInteraction > 2;
    const t = clock.getElapsedTime();

    if (isIdle) {
      // Gentle breathing: 0.03 unit amplitude at 0.8 Hz
      const targetY = Math.sin(t * 0.8 * Math.PI * 2) * 0.03;
      const targetTilt = Math.sin(t * 0.8 * Math.PI * 2 + 0.5) * 0.001;
      idleFloat.current.y += (targetY - idleFloat.current.y) * 0.03;
      idleFloat.current.tilt += (targetTilt - idleFloat.current.tilt) * 0.03;
    } else {
      // Lerp back to rest
      idleFloat.current.y *= 0.9;
      idleFloat.current.tilt *= 0.9;
    }

    groupRef.current.position.y = idleFloat.current.y;
    groupRef.current.rotation.x = 0.15 + idleFloat.current.tilt;
  });

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

  const isCustomizing = !!selectionMode;
  const paintMode = config.paintMode || false;

  // Resolve switch stem color
  const switchStemColor = config.switchStemColor || "#c0392b";

  // Ripple color — accent or RGB color
  const rippleColor = config.rgbColor || config.keycapAccentColor;

  return (
    <group
      ref={groupRef}
      position={[-caseWidth / 2, 0, -caseDepth / 2]}
      rotation={[0.15, 0, 0]}
      onPointerDown={markInteraction}
      onPointerMove={markInteraction}
    >
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
          caseFinish={config.caseFinish}
          connectionType={config.connectionType}
          cableColor={config.cableColor}
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

      {/* ── Keycaps (sculpted + colorways + interactive + customization) ── */}
      {layout.map((key, i) => {
        const keyWidth = key.w * UNIT - GAP;
        const baseRowHeight = ROW_HEIGHTS[key.row] || 0.75;
        const profileMult = profileMultipliers[key.row] || 1.0;
        const rowHeight = baseRowHeight * profileMult;
        const yPos = plateThickness / 2 + rowHeight / 2;
        const zPos = key.y * UNIT + UNIT / 2 + UNIT * 0.15;

        // Per-key override lookup
        const override: PerKeyOverride | undefined = config.perKeyOverrides?.[key.keyId];

        // Resolve keycap color: override > colorway > accent logic
        let keycapColor: string;
        if (override?.color) {
          keycapColor = override.color;
        } else if (colorway) {
          keycapColor = getKeycapColor(colorway, key.legend, key.isModifier);
        } else {
          keycapColor = key.isModifier ? config.keycapAccentColor : config.keycapColor;
        }

        // Resolve legend text and color
        const legendText = override?.legendText ?? key.legend;
        const legendColor = override?.legendColor ?? legendColorFromColorway;

        // Resolve profile per key
        const keyProfile = (override?.profile || config.keycapProfile || "cherry") as KeyboardViewerConfig["keycapProfile"];

        // Selection state
        const isSelected = selectedKeys?.has(key.keyId) || false;

        return (
          <Keycap
            key={key.keyId}
            index={i}
            keyId={key.keyId}
            position={[key.x + UNIT * 0.2, yPos, zPos]}
            width={keyWidth}
            height={rowHeight}
            color={keycapColor}
            material={config.keycapMaterial}
            legend={legendText}
            showLegend={config.showLegends !== false}
            legendColor={legendColor}
            profile={keyProfile}
            row={key.row}
            widthU={key.w}
            interactive={interactive || isCustomizing}
            onPress={isCustomizing ? undefined : handleKeyPress}
            onRelease={isCustomizing ? undefined : handleKeyRelease}
            selected={isSelected}
            onSelect={isCustomizing ? onKeySelect : undefined}
            onPaint={isCustomizing && paintMode ? onKeyPaint : undefined}
            paintMode={isCustomizing && paintMode}
            artisan={override?.artisan}
            isPressed={pressedKeys.has(i)}
            rippleColor={rippleColor}
            switchStemColor={switchStemColor}
            plateY={plateThickness / 2}
          />
        );
      })}
    </group>
  );
}
