import type { CustomBuildSelections } from "./types";

export interface CompatibilityWarning {
  severity: "warning" | "info";
  message: string;
}

export function checkCompatibility(selections: CustomBuildSelections): CompatibilityWarning[] {
  const warnings: CompatibilityWarning[] = [];

  // Check switch pin compatibility
  if (selections.keyboard && selections.switches) {
    const kb = selections.keyboard;
    const sw = selections.switches;

    // 5-pin switches on 3-pin PCB need pin clipping
    if (sw.stemMaterial && !kb.hotSwap) {
      warnings.push({
        severity: "info",
        message: `${kb.name} requires soldering — make sure you have a soldering iron and solder.`,
      });
    }
  }

  // Hot-swap compatibility note
  if (selections.keyboard && selections.keyboard.hotSwap && selections.switches) {
    // All good — hot-swap supports most switches
  }

  // Stabilizer type vs PCB
  if (selections.keyboard && selections.stabilizer) {
    const mount = selections.keyboard.mountingStyle?.toLowerCase() || "";
    const stabName = selections.stabilizer.name.toLowerCase();

    if (stabName.includes("screw-in") && mount.includes("plate")) {
      warnings.push({
        severity: "warning",
        message: "Screw-in stabilizers may not be compatible with plate-mount keyboards. Consider plate-mount or clip-in stabilizers.",
      });
    }
  }

  // Keycap profile compatibility
  if (selections.keycaps.profile && selections.keyboard) {
    const profile = selections.keycaps.profile;
    const size = selections.keyboard.size;

    // SA/MT3 on low-profile boards
    if ((profile === "SA" || profile === "MT3") && size === "40%") {
      warnings.push({
        severity: "info",
        message: `${profile} keycaps are tall — they may feel unusual on a compact 40% board. Consider Cherry or DSA profile for smaller layouts.`,
      });
    }
  }

  // Wireless + heavy mods warning
  if (selections.keyboard?.wireless && selections.mods.length >= 3) {
    warnings.push({
      severity: "info",
      message: "Heavy modifications on a wireless board may affect battery life or Bluetooth connectivity. Test after each mod.",
    });
  }

  // Budget feedback
  const totalEstimate = estimateTotal(selections);
  if (totalEstimate > 500) {
    warnings.push({
      severity: "info",
      message: `Your build is estimated at $${Math.round(totalEstimate)}. Consider checking group buys for deals on premium components.`,
    });
  }

  return warnings;
}

function estimateTotal(selections: CustomBuildSelections): number {
  let total = 0;
  if (selections.keyboard) total += selections.keyboard.priceUsd;
  if (selections.switches) {
    const switchCount = getSwitchCountForSize(selections.keyboard?.size || "65%");
    total += selections.switches.pricePerSwitch * switchCount;
  }
  total += selections.keycaps.price;
  if (selections.stabilizer) total += selections.stabilizer.price;
  return total;
}

function getSwitchCountForSize(size: string): number {
  const sizeMap: Record<string, number> = {
    "40%": 47, "60%": 61, "65%": 68, "75%": 84,
    "TKL": 87, "80%": 87, "96%": 99, "1800": 99,
    "100%": 104, "Full-size": 104,
  };
  return sizeMap[size] || 70;
}
