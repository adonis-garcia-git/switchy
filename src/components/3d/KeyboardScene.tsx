"use client";

import { Suspense } from "react";
import { Canvas } from "@react-three/fiber";
import { OrbitControls, ContactShadows, Environment } from "@react-three/drei";
import { KeyboardModel } from "./KeyboardModel";
import type { KeyboardViewerConfig } from "@/lib/keyboard3d";

interface KeyboardSceneProps {
  config: KeyboardViewerConfig;
  autoRotate?: boolean;
}

export function KeyboardScene({ config, autoRotate = false }: KeyboardSceneProps) {
  return (
    <Canvas
      dpr={[1, 1.5]}
      frameloop="demand"
      camera={{ position: [0, 8, 14], fov: 30 }}
      gl={{ antialias: true, alpha: true }}
      style={{ background: "transparent" }}
    >
      {/* Studio lighting — warm key, cool fill, rim back */}
      <ambientLight intensity={0.3} />
      <directionalLight
        position={[8, 12, 5]}
        intensity={1.2}
        color="#fff5e6"
        castShadow
        shadow-mapSize={1024}
      />
      <directionalLight
        position={[-6, 8, -3]}
        intensity={0.4}
        color="#e0e8ff"
      />
      <directionalLight
        position={[0, 2, -10]}
        intensity={0.3}
        color="#ffd4a0"
      />

      <Suspense fallback={null}>
        <KeyboardModel config={config} />
        <Environment preset="studio" environmentIntensity={0.4} />
      </Suspense>

      <ContactShadows
        position={[0, -1.2, 0]}
        opacity={0.35}
        scale={30}
        blur={2}
        far={4}
        color="#000000"
      />

      <OrbitControls
        autoRotate={autoRotate}
        autoRotateSpeed={0.8}
        enablePan={false}
        minPolarAngle={Math.PI * 0.15}
        maxPolarAngle={Math.PI * 0.48}
        minDistance={8}
        maxDistance={25}
        enableDamping
        dampingFactor={0.05}
      />
    </Canvas>
  );
}
