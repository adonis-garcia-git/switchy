"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { buildSwitchUrl, buildKeyboardUrl, buildKeycapUrl, buildAccessoryUrl } from "@/lib/filterParams";

interface MegaMenuLink {
  label: string;
  href: string;
}

interface MegaMenuColumnData {
  heading: string;
  links: MegaMenuLink[];
}

export const SWITCHES_COLUMNS: MegaMenuColumnData[] = [
  {
    heading: "Type",
    links: [
      { label: "Linear", href: buildSwitchUrl({ type: "linear" }) },
      { label: "Tactile", href: buildSwitchUrl({ type: "tactile" }) },
      { label: "Clicky", href: buildSwitchUrl({ type: "clicky" }) },
    ],
  },
  {
    heading: "Sound",
    links: [
      { label: "Thocky", href: buildSwitchUrl({ soundCharacter: "thocky" }) },
      { label: "Clacky", href: buildSwitchUrl({ soundCharacter: "clacky" }) },
      { label: "Creamy", href: buildSwitchUrl({ soundCharacter: "creamy" }) },
      { label: "Poppy", href: buildSwitchUrl({ soundCharacter: "poppy" }) },
      { label: "Muted", href: buildSwitchUrl({ soundCharacter: "muted" }) },
      { label: "Crisp", href: buildSwitchUrl({ soundCharacter: "crisp" }) },
    ],
  },
  {
    heading: "Feel",
    links: [
      { label: "Low Pitch", href: buildSwitchUrl({ soundPitch: "low" }) },
      { label: "Mid Pitch", href: buildSwitchUrl({ soundPitch: "mid" }) },
      { label: "High Pitch", href: buildSwitchUrl({ soundPitch: "high" }) },
    ],
  },
  {
    heading: "Top Brands",
    links: [
      { label: "Cherry", href: buildSwitchUrl({ brand: "Cherry" }) },
      { label: "Gateron", href: buildSwitchUrl({ brand: "Gateron" }) },
      { label: "Kailh", href: buildSwitchUrl({ brand: "Kailh" }) },
      { label: "Akko", href: buildSwitchUrl({ brand: "Akko" }) },
      { label: "HMX", href: buildSwitchUrl({ brand: "HMX" }) },
      { label: "Durock", href: buildSwitchUrl({ brand: "Durock" }) },
    ],
  },
];

export const KEYBOARDS_COLUMNS: MegaMenuColumnData[] = [
  {
    heading: "Layout",
    links: [
      { label: "60%", href: buildKeyboardUrl({ size: "60%" }) },
      { label: "65%", href: buildKeyboardUrl({ size: "65%" }) },
      { label: "75%", href: buildKeyboardUrl({ size: "75%" }) },
      { label: "TKL", href: buildKeyboardUrl({ size: "TKL" }) },
      { label: "Full-size", href: buildKeyboardUrl({ size: "full-size" }) },
      { label: "96%", href: buildKeyboardUrl({ size: "96%" }) },
    ],
  },
  {
    heading: "Features",
    links: [
      { label: "Hot-Swap", href: buildKeyboardUrl({ hotSwapOnly: true }) },
      { label: "Wireless", href: buildKeyboardUrl({ wirelessOnly: true }) },
    ],
  },
  {
    heading: "Budget",
    links: [
      { label: "Under $100", href: buildKeyboardUrl({ maxPrice: 100 }) },
      { label: "$100 – $200", href: buildKeyboardUrl({ minPrice: 100, maxPrice: 200 }) },
      { label: "$200 – $350", href: buildKeyboardUrl({ minPrice: 200, maxPrice: 350 }) },
      { label: "$350+", href: buildKeyboardUrl({ minPrice: 350 }) },
    ],
  },
  {
    heading: "Top Brands",
    links: [
      { label: "Keychron", href: buildKeyboardUrl({ brand: "Keychron" }) },
      { label: "KBDfans", href: buildKeyboardUrl({ brand: "KBDfans" }) },
      { label: "Epomaker", href: buildKeyboardUrl({ brand: "Epomaker" }) },
      { label: "Mode", href: buildKeyboardUrl({ brand: "Mode" }) },
      { label: "Monsgeek", href: buildKeyboardUrl({ brand: "Monsgeek" }) },
      { label: "Akko", href: buildKeyboardUrl({ brand: "Akko" }) },
    ],
  },
];

export const KEYCAPS_COLUMNS: MegaMenuColumnData[] = [
  {
    heading: "Profile",
    links: [
      { label: "Cherry", href: buildKeycapUrl({ profile: "Cherry" }) },
      { label: "SA", href: buildKeycapUrl({ profile: "SA" }) },
      { label: "MT3", href: buildKeycapUrl({ profile: "MT3" }) },
      { label: "DSA", href: buildKeycapUrl({ profile: "DSA" }) },
      { label: "OEM", href: buildKeycapUrl({ profile: "OEM" }) },
      { label: "KAT", href: buildKeycapUrl({ profile: "KAT" }) },
    ],
  },
  {
    heading: "Material",
    links: [
      { label: "PBT Dye-Sub", href: buildKeycapUrl({ material: "PBT" }) },
      { label: "ABS Doubleshot", href: buildKeycapUrl({ material: "ABS" }) },
      { label: "POM", href: buildKeycapUrl({ material: "POM" }) },
    ],
  },
  {
    heading: "Budget",
    links: [
      { label: "Under $50", href: buildKeycapUrl({ maxPrice: 50 }) },
      { label: "$50 – $100", href: buildKeycapUrl({ minPrice: 50, maxPrice: 100 }) },
      { label: "$100 – $200", href: buildKeycapUrl({ minPrice: 100, maxPrice: 200 }) },
      { label: "$200+", href: buildKeycapUrl({ minPrice: 200 }) },
    ],
  },
  {
    heading: "Top Brands",
    links: [
      { label: "GMK", href: buildKeycapUrl({ brand: "GMK" }) },
      { label: "Drop", href: buildKeycapUrl({ brand: "Drop" }) },
      { label: "Akko", href: buildKeycapUrl({ brand: "Akko" }) },
      { label: "PBTfans", href: buildKeycapUrl({ brand: "PBTfans" }) },
      { label: "ePBT", href: buildKeycapUrl({ brand: "ePBT" }) },
      { label: "Osume", href: buildKeycapUrl({ brand: "Osume" }) },
    ],
  },
];

export const ACCESSORIES_COLUMNS: MegaMenuColumnData[] = [
  {
    heading: "Essentials",
    links: [
      { label: "Stabilizers", href: buildAccessoryUrl({ subcategory: "stabilizer" }) },
      { label: "Springs", href: buildAccessoryUrl({ subcategory: "spring" }) },
      { label: "Lubricants", href: buildAccessoryUrl({ subcategory: "lube" }) },
      { label: "Switch Films", href: buildAccessoryUrl({ subcategory: "film" }) },
    ],
  },
  {
    heading: "Foam & Mods",
    links: [
      { label: "Foam & Dampening", href: buildAccessoryUrl({ subcategory: "foam" }) },
      { label: "Cables", href: buildAccessoryUrl({ subcategory: "cable" }) },
      { label: "Desk Mats", href: buildAccessoryUrl({ subcategory: "deskmat" }) },
    ],
  },
  {
    heading: "Tools",
    links: [
      { label: "Switch Openers", href: "/accessories?subcategory=tool" },
      { label: "Keycap Pullers", href: "/accessories?subcategory=tool" },
      { label: "Lube Stations", href: "/accessories?subcategory=tool" },
      { label: "All Tools", href: buildAccessoryUrl({ subcategory: "tool" }) },
    ],
  },
  {
    heading: "Comfort",
    links: [
      { label: "Wrist Rests", href: buildAccessoryUrl({ subcategory: "wrist-rest" }) },
      { label: "Covers & Cases", href: buildAccessoryUrl({ subcategory: "cover" }) },
    ],
  },
];

interface MegaMenuTriggerProps {
  label: string;
  href: string;
  columns: MegaMenuColumnData[];
  isActive: boolean;
}

export function MegaMenuTrigger({ label, href, columns, isActive }: MegaMenuTriggerProps) {
  const [open, setOpen] = useState(false);
  const closeTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const openTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const pathname = usePathname();

  // Close on route change
  useEffect(() => {
    setOpen(false);
  }, [pathname]);

  // Cleanup timers
  useEffect(() => {
    return () => {
      if (closeTimer.current) clearTimeout(closeTimer.current);
      if (openTimer.current) clearTimeout(openTimer.current);
    };
  }, []);

  const handleEnter = useCallback(() => {
    if (closeTimer.current) {
      clearTimeout(closeTimer.current);
      closeTimer.current = null;
    }
    openTimer.current = setTimeout(() => setOpen(true), 150);
  }, []);

  const handleLeave = useCallback(() => {
    if (openTimer.current) {
      clearTimeout(openTimer.current);
      openTimer.current = null;
    }
    closeTimer.current = setTimeout(() => setOpen(false), 150);
  }, []);

  return (
    <div onMouseEnter={handleEnter} onMouseLeave={handleLeave}>
      <Link
        href={href}
        className={cn(
          "px-5 py-2.5 rounded-2xl text-sm font-medium transition-[background-color,color,transform] duration-150 flex items-center gap-1.5",
          "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/50",
          isActive
            ? "bg-accent-dim border border-accent/20 text-accent"
            : "bg-bg-tint text-text-secondary hover:bg-bg-tint-strong hover:text-text-primary active:scale-[0.97]"
        )}
      >
        {label}
        <svg
          className={cn(
            "w-3.5 h-3.5 transition-transform duration-150",
            open && "rotate-180"
          )}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </Link>

      {/* Mega menu panel — full width, anchored below nav */}
      {open && (
        <div
          className="fixed left-0 right-0 top-16 z-40 hidden lg:block"
          style={{ animation: "mega-menu-in 150ms ease-out" }}
        >
          <div className="bg-bg-surface border-b border-border-subtle shadow-elevated">
            <div className="max-w-[1440px] mx-auto px-6 py-8">
              <div className="grid grid-cols-4 gap-8">
                {columns.map((col) => (
                  <MegaMenuColumn key={col.heading} heading={col.heading} links={col.links} />
                ))}
              </div>
              <div className="mt-6 pt-4 border-t border-border-subtle">
                <Link
                  href={href}
                  className="text-sm text-accent hover:text-accent-hover transition-colors duration-150 font-medium focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/40 rounded"
                >
                  View all {label.toLowerCase()} &rarr;
                </Link>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function MegaMenuColumn({ heading, links }: { heading: string; links: MegaMenuLink[] }) {
  return (
    <div>
      <p className="text-[11px] font-semibold uppercase tracking-wider text-text-muted mb-3 font-[family-name:var(--font-outfit)]">
        {heading}
      </p>
      <div className="space-y-0.5">
        {links.map((link) => (
          <Link
            key={link.href}
            href={link.href}
            className="block py-1.5 text-sm text-text-secondary hover:text-text-primary transition-colors duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/40 rounded px-1 -mx-1"
          >
            {link.label}
          </Link>
        ))}
      </div>
    </div>
  );
}
