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
    setActive(true);
    onPress?.(index, legend || "");
  }, [interactive, onPress, onSelect, index, legend, keyId]);

  const handlePointerUp = useCallback(() => {
    if (!interactive || onSelect) return;
    targetOffset.current = 0;
    setActive(false);
    onRelease?.(index);
  }, [interactive, onRelease, index, onSelect]);

  const handlePointerEnter = useCallback(() => {
    if (paintMode && onPaint) {
      onPaint(keyId);
    }
    if (interactive || onSelect) {
      setHovered(true);
      document.body.style.cursor = "pointer";
      // Subtle random wobble tilt (0.5–1 degree)
      const wobbleDeg = (0.5 + Math.random() * 0.5) * (Math.PI / 180);
      wobbleTargetX.current = (Math.random() - 0.5) * 2 * wobbleDeg;
      wobbleTargetZ.current = (Math.random() - 0.5) * 2 * wobbleDeg;
    }
  }, [interactive, onSelect, paintMode, onPaint, keyId]);

  const handlePointerLeave = useCallback(() => {
    if (interactive) {
      targetOffset.current = 0;
    }
    if (interactive || onSelect) {
      setHovered(false);
      document.body.style.cursor = "auto";
      // Reset wobble
      wobbleTargetX.current = 0;
      wobbleTargetZ.current = 0;
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

      {/* Legend overlay */}
      {texture && (
        <mesh position={[0, height / 2 + 0.005, 0]} rotation={[-Math.PI / 2, 0, 0]}>
          <planeGeometry args={[width * 0.85, KEYCAP_SIZE * 0.85]} />
          <meshBasicMaterial map={texture} transparent depthWrite={false} polygonOffset polygonOffsetFactor={-1} />
        </mesh>
      )}

      {/* Sound ripple on key press */}
      {interactive && <SoundRipple active={active} prevActiveRef={prevActive} width={width} height={height} />}
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
          />
        );
      })}
    </group>
  );
}
