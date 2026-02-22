"use client";

import { useMemo } from "react";
import * as THREE from "three";
import { RoundedBox } from "@react-three/drei";
import type { MaterialPreset } from "./materialPresets";
import { CABLE_MATERIAL, AVIATOR_MATERIAL } from "./materialPresets";
import type { NormalMapType } from "./proceduralTextures";
import { getNormalMap, seededRandom } from "./proceduralTextures";
