"use client";

import { useMemo } from "react";
import * as THREE from "three";

interface CableGeometryProps {
  caseWidth: number;
  caseDepth: number;
  caseHeight: number;
  cableColor?: string;
  usbPortZ: number;
}

/**
 * Coiled aviator USB cable — exits USB-C port on the back of the case,
 * droops slightly, enters a helix coil section (6 revolutions), then trails off.
 */
export function CableGeometry({
  caseWidth: _caseWidth,
  caseDepth,
  caseHeight,
  cableColor = "#2a2a2a",
  usbPortZ,
}: CableGeometryProps) {
  // Build the cable path: USB-C tip → short straight → droop → coil → trail off
  const { cablePath, coilStart, coilEnd } = useMemo(() => {
    const points: THREE.Vector3[] = [];

    // Start at USB-C port exit point
    const startZ = usbPortZ - 0.3;
    const startY = -caseHeight * 0.35;

    // Short straight exit from port
    points.push(new THREE.Vector3(0, startY, startZ));
    points.push(new THREE.Vector3(0, startY, startZ - 0.8));

    // Slight droop before coil
    points.push(new THREE.Vector3(0, startY - 0.3, startZ - 1.8));
    points.push(new THREE.Vector3(0, startY - 0.5, startZ - 2.8));

    // Coil section start marker
    const coilStartIdx = points.length;
    const coilCenterZ = startZ - 4.5;
    const coilRadius = 0.6;
    const coilRevolutions = 6;
    const coilPointsPerRev = 12;
    const coilPitch = 0.35;
    const totalCoilPoints = coilRevolutions * coilPointsPerRev;

    for (let i = 0; i <= totalCoilPoints; i++) {
      const t = i / totalCoilPoints;
      const angle = t * coilRevolutions * Math.PI * 2;
      const x = Math.cos(angle) * coilRadius;
      const y = startY - 0.5 + Math.sin(angle) * coilRadius * 0.3;
      const z = coilCenterZ - t * coilRevolutions * coilPitch;
      points.push(new THREE.Vector3(x, y, z));
    }

    const coilEndIdx = points.length;

    // Trail off after coil
    const lastCoilPt = points[points.length - 1];
    points.push(new THREE.Vector3(lastCoilPt.x * 0.5, lastCoilPt.y - 0.2, lastCoilPt.z - 0.8));
    points.push(new THREE.Vector3(0, lastCoilPt.y - 0.4, lastCoilPt.z - 1.8));
    points.push(new THREE.Vector3(0, lastCoilPt.y - 0.3, lastCoilPt.z - 2.5));

    const curve = new THREE.CatmullRomCurve3(points, false, "catmullrom", 0.3);

    return {
      cablePath: curve,
      coilStart: coilStartIdx,
      coilEnd: coilEndIdx,
    };
  }, [caseHeight, usbPortZ, caseDepth]);

  // Cable tube geometry
  const tubeGeometry = useMemo(() => {
    return new THREE.TubeGeometry(cablePath, 200, 0.12, 8, false);
  }, [cablePath]);

  // Aviator connector position — at the junction where coil starts
  const aviatorPos = useMemo(() => {
    const t = (coilStart - 1) / (coilStart + (coilEnd - coilStart) + 3);
    return cablePath.getPointAt(Math.max(0, Math.min(t, 1)));
  }, [cablePath, coilStart, coilEnd]);

  // USB-C tip position — at the port
  const usbTipPos = useMemo(() => {
    return cablePath.getPointAt(0);
  }, [cablePath]);

  return (
    <group>
      {/* Main cable tube */}
      <mesh geometry={tubeGeometry}>
        <meshPhysicalMaterial
          color={cableColor}
          roughness={0.85}
          metalness={0}
          envMapIntensity={0.1}
        />
      </mesh>

      {/* USB-C connector tip */}
      <group position={[usbTipPos.x, usbTipPos.y, usbTipPos.z]}>
        <mesh rotation={[Math.PI / 2, 0, 0]}>
          <cylinderGeometry args={[0.18, 0.18, 0.5, 8]} />
          <meshPhysicalMaterial
            color="#888888"
            metalness={0.9}
            roughness={0.2}
          />
        </mesh>
      </group>

      {/* Aviator connector */}
      <group position={[aviatorPos.x, aviatorPos.y, aviatorPos.z]}>
        {/* Main body */}
        <mesh rotation={[Math.PI / 2, 0, 0]}>
          <cylinderGeometry args={[0.32, 0.32, 0.7, 12]} />
          <meshPhysicalMaterial
            color="#333333"
            metalness={0.6}
            roughness={0.3}
          />
        </mesh>
        {/* Ring detail */}
        <mesh rotation={[Math.PI / 2, 0, 0]} position={[0, 0, 0]}>
          <torusGeometry args={[0.34, 0.04, 8, 16]} />
          <meshPhysicalMaterial
            color="#666666"
            metalness={0.85}
            roughness={0.2}
          />
        </mesh>
        {/* Locking collar */}
        <mesh rotation={[Math.PI / 2, 0, 0]} position={[0, 0.25, 0]}>
          <cylinderGeometry args={[0.36, 0.34, 0.2, 12]} />
          <meshPhysicalMaterial
            color="#444444"
            metalness={0.7}
            roughness={0.25}
          />
        </mesh>
      </group>
    </group>
  );
}

/**
 * Wireless power switch toggle — small physical toggle on right side of case
 */
export function WirelessSwitch({
  caseWidth,
  caseHeight,
  caseDepth,
}: {
  caseWidth: number;
  caseHeight: number;
  caseDepth: number;
}) {
  const x = caseWidth / 2 + 0.01;
  const y = -caseHeight * 0.3;
  const z = -caseDepth * 0.3;

  return (
    <group position={[x, y, z]}>
      {/* Switch housing */}
      <mesh rotation={[0, 0, Math.PI / 2]}>
        <boxGeometry args={[0.2, 0.5, 0.3]} />
        <meshPhysicalMaterial
          color="#1a1a1a"
          metalness={0.3}
          roughness={0.6}
        />
      </mesh>
      {/* Toggle nub */}
      <mesh position={[0.02, 0.08, 0]} rotation={[0, 0, Math.PI / 2]}>
        <cylinderGeometry args={[0.06, 0.06, 0.12, 8]} />
        <meshPhysicalMaterial
          color="#888888"
          metalness={0.8}
          roughness={0.2}
        />
      </mesh>
    </group>
  );
}

/**
 * Bluetooth LED indicator — tiny glowing blue dot
 */
export function BluetoothLED({
  caseWidth,
  caseHeight,
  caseDepth,
}: {
  caseWidth: number;
  caseHeight: number;
  caseDepth: number;
}) {
  const x = caseWidth / 2 + 0.01;
  const y = -caseHeight * 0.3;
  const z = -caseDepth * 0.3 + 0.5;

  return (
    <mesh position={[x, y, z]}>
      <sphereGeometry args={[0.04, 8, 8]} />
      <meshStandardMaterial
        emissive="#2196F3"
        emissiveIntensity={4.0}
        color="#000000"
        toneMapped={false}
      />
    </mesh>
  );
}
