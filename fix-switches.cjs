const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, 'src/data/switches.json');
const data = JSON.parse(fs.readFileSync(filePath, 'utf8'));

console.log(`Read ${data.length} switches from switches.json`);

// 1. Remove invalid switches
// - Geon Raw HE: Hall Effect switch (2-pin, not MX-compatible)
// - Lichicx Math Linear: Does not exist in any retailer database
// - Kelowna Lunar Spring: Kelowna is a spring manufacturer, not a switch maker
const removeList = [
  { brand: 'Geon', name: 'Raw HE' },
  { brand: 'Lichicx', name: 'Math Linear' },
  { brand: 'Kelowna', name: 'Lunar Spring' },
];

let filtered = data.filter(sw =>
  !removeList.some(r => r.brand === sw.brand && r.name === sw.name)
);

console.log(`Removed ${data.length - filtered.length} invalid switches. ${filtered.length} remaining.`);

// 2. Apply corrections (keyed by brand|name)
const corrections = {
  // === Cherry (8 switches) ===
  'Cherry|MX Red': { bottomOutForceG: 75, pricePerSwitch: 0.28 },
  'Cherry|MX Brown': { bottomOutForceG: 60 },
  'Cherry|MX Blue': { actuationForceG: 60 },
  'Cherry|MX Silent Red': { bottomOutForceG: 75, pricePerSwitch: 0.40 },
  'Cherry|MX Speed Silver': { bottomOutForceG: 75, pricePerSwitch: 0.32 },
  'Cherry|MX Hyperglide Red': { bottomOutForceG: 75, pricePerSwitch: 0.30 },
  'Cherry|MX2A Silent Red': { bottomOutForceG: 100, springType: 'Barrel', pricePerSwitch: 0.40 },

  // === Gateron (14 switches) ===
  'Gateron|Yellow': { bottomOutForceG: 60 },
  'Gateron|Oil King': { bottomOutForceG: 65, pricePerSwitch: 0.65 },
  'Gateron|Milky Yellow Pro': { pricePerSwitch: 0.23 },
  'Gateron|Pro 3.0 Red': { bottomOutForceG: 50, housingMaterial: 'PC + Nylon' },
  'Gateron|Pro 3.0 Brown': { actuationForceG: 55, bottomOutForceG: 63, housingMaterial: 'PC + Nylon' },
  'Gateron|G Pro 3.0 Silver': { bottomOutForceG: 50, housingMaterial: 'PC + Nylon' },
  'Gateron|Ink Black V2': { factoryLubed: true, pricePerSwitch: 0.72 },
  'Gateron|Ink Red V2': { factoryLubed: true, pricePerSwitch: 0.72 },
  'Gateron|CJ': { bottomOutForceG: 60, housingMaterial: 'Ink + POM', springType: 'Standard', pricePerSwitch: 0.60 },
  'Gateron|North Pole': { bottomOutForceG: 65, stemMaterial: 'Ink', pricePerSwitch: 0.68, longPole: false },
  'Gateron|Cap V2 Yellow': { bottomOutForceG: 60, housingMaterial: 'Nylon PA66', pricePerSwitch: 0.40 },
  'Gateron|Cap V2 Brown': { actuationForceG: 55, bottomOutForceG: 58, housingMaterial: 'Nylon PA66', pricePerSwitch: 0.40 },
  'Gateron|Box Ink V2 Black': { actuationMm: 1.2, totalTravelMm: 3.4, pricePerSwitch: 0.85 },
  'Gateron|Quinn': {
    type: 'tactile',
    actuationForceG: 59,
    bottomOutForceG: 67,
    totalTravelMm: 3.4,
    pricePerSwitch: 0.55,
    springType: 'Two-stage gold-plated',
    popularFor: ['clacky builds', 'refined Gateron tactile'],
  },

  // === Kailh (8 switches) ===
  'Kailh|Box Jade': { housingMaterial: 'PC + Nylon' },
  'Kailh|Box Navy': { actuationForceG: 75, bottomOutForceG: 90 },
  'Kailh|Box Red': { pricePerSwitch: 0.30 },
  'Kailh|Speed Silver': { bottomOutForceG: 70, pricePerSwitch: 0.25 },
  'Kailh|Speed Copper': { bottomOutForceG: 60, pricePerSwitch: 0.25 },
  'Kailh|Midnight Pro Silent': { actuationForceG: 40, pricePerSwitch: 0.50 },

  // === Akko (6 switches) ===
  'Akko|CS Lavender Purple': { actuationMm: 1.9, factoryLubed: false, bottomOutForceG: 55 },
  'Akko|CS Radiant Red': { actuationForceG: 53, bottomOutForceG: 62, actuationMm: 1.9, totalTravelMm: 3.5, pricePerSwitch: 0.22, factoryLubed: false },
  'Akko|CS Jelly Pink': { actuationMm: 1.9, totalTravelMm: 4.0, pricePerSwitch: 0.27, factoryLubed: false },
  'Akko|V3 Cream Yellow': { bottomOutForceG: 58, actuationMm: 1.9, totalTravelMm: 3.5, pricePerSwitch: 0.20, factoryLubed: false, longPole: true },
  'Akko|V3 Cream Blue': { actuationForceG: 38, totalTravelMm: 3.5, pricePerSwitch: 0.20, factoryLubed: false, longPole: true },
  'Akko|V3 Matcha Green': { totalTravelMm: 3.8, pricePerSwitch: 0.22, longPole: true },

  // === Durock (3 switches, Sunflower skipped - research confused with T1 variant) ===
  'Durock|POM Linear': { actuationForceG: 48, bottomOutForceG: 63, stemMaterial: 'P3 (UHMWPE blend)', springType: 'Gold-plated', factoryLubed: false },
  'Durock|T1': { actuationForceG: 55, housingMaterial: 'PC + Nylon', pricePerSwitch: 0.49 },
  'Durock|L7': { actuationForceG: 48, bottomOutForceG: 62, housingMaterial: 'PC + Nylon', pricePerSwitch: 0.54 },

  // === JWK (3 switches) ===
  'JWK|Black V2': { actuationForceG: 41, bottomOutForceG: 62, actuationMm: 1.8, totalTravelMm: 3.9, housingMaterial: 'PC + Nylon', pricePerSwitch: 0.55 },
  'JWK|Lavender': { actuationForceG: 50, bottomOutForceG: 65, pricePerSwitch: 0.65 },
  'JWK|Durock Daybreak': { actuationForceG: 52, bottomOutForceG: 67, totalTravelMm: 3.8, housingMaterial: 'PC + Nylon', pricePerSwitch: 0.54 },

  // === SP-Star (2 switches) ===
  'SP-Star|Meteor White': { actuationForceG: 40, bottomOutForceG: 57, housingMaterial: 'Nylon', springType: 'Gold-plated', pricePerSwitch: 0.51 },
  'SP-Star|Polaris Gray': { actuationForceG: 50, springType: 'Gold-plated', pricePerSwitch: 0.56 },

  // === Gazzew (2 switches) ===
  'Gazzew|Boba U4T': { actuationForceG: 50, totalTravelMm: 3.2, springType: 'Stainless steel', factoryLubed: true },
  'Gazzew|Boba U4': { actuationForceG: 50, springType: 'Stainless steel', factoryLubed: true },

  // === Zeal PC (2 switches) ===
  'Zeal PC|Zealios V2 62g': { housingMaterial: 'PC', factoryLubed: false },
  'Zeal PC|Zealios V2 67g': { housingMaterial: 'PC', factoryLubed: false },
};

let correctionCount = 0;
for (const sw of filtered) {
  const key = `${sw.brand}|${sw.name}`;
  if (corrections[key]) {
    Object.assign(sw, corrections[key]);
    correctionCount++;
  }
}

console.log(`Applied corrections to ${correctionCount} switches.`);

// 3. Clean up commonlyComparedTo references for removed switches
const removedNames = removeList.map(r => r.name);
let refsCleaned = 0;
for (const sw of filtered) {
  if (sw.commonlyComparedTo) {
    const before = sw.commonlyComparedTo.length;
    sw.commonlyComparedTo = sw.commonlyComparedTo.filter(name => {
      for (const r of removeList) {
        if (name === r.name || name === `${r.brand} ${r.name}`) {
          return false;
        }
      }
      return true;
    });
    refsCleaned += before - sw.commonlyComparedTo.length;
  }
}

if (refsCleaned > 0) {
  console.log(`Cleaned ${refsCleaned} stale commonlyComparedTo references.`);
}

// 4. Write output
fs.writeFileSync(filePath, JSON.stringify(filtered, null, 2) + '\n');
console.log(`Written updated switches.json with ${filtered.length} switches.`);
