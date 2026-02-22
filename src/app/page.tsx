"use client";

import Link from "next/link";
import Image from "next/image";
import { useQuery } from "convex/react";
import { api } from "../../convex/_generated/api";

export default function Home() {
  const switches = useQuery(api.switches.list, {});
  const keyboards = useQuery(api.keyboards.list, {});
  const keycaps = useQuery(api.keycaps.list, {});
  const accessories = useQuery(api.accessories.list, {});
  const groupBuyListings = useQuery(api.groupBuyListings.list, {});

  const switchCount = switches?.length ?? 0;
  const keyboardCount = keyboards?.length ?? 0;

  // Derived data
  const featuredSwitch = switches
    ? [...switches]
        .filter((s: any) => s.imageUrl && s.communityRating)
        .sort((a: any, b: any) => (b.communityRating ?? 0) - (a.communityRating ?? 0))[0]
    : null;

  const featuredKeyboard = keyboards?.find((k: any) => k.imageUrl) ?? null;

  const switchImage = switches?.find((s: any) => s.imageUrl);
  const keyboardImage = keyboards?.find((k: any) => k.imageUrl);
  const keycapImage = keycaps?.find((k: any) => k.imageUrl);
  const accessoryImage = accessories?.find((a: any) => a.imageUrl);

  const liveGroupBuys = groupBuyListings?.filter((g: any) => g.status === "live") ?? [];
  const firstGroupBuyImage = groupBuyListings?.find((g: any) => g.imageUrl);

  // Secondary keyboard images for feature cards and full-width section
  const secondKeyboard = keyboards
    ? keyboards.filter((k: any) => k.imageUrl && k !== featuredKeyboard)[0]
    : null;
  const thirdKeyboard = keyboards
    ? keyboards.filter(
        (k: any) => k.imageUrl && k !== featuredKeyboard && k !== secondKeyboard
      )[0]
    : null;

  const categories = [
    {
      title: "Switches",
      href: "/switches",
      count: switchCount,
      image: switchImage?.imageUrl,
    },
    {
      title: "Keyboard Kits",
      href: "/keyboards",
      count: keyboardCount,
      image: keyboardImage?.imageUrl,
    },
    {
      title: "Keycaps",
      href: "/keycaps",
      count: keycaps?.length ?? 0,
      image: keycapImage?.imageUrl,
    },
    {
      title: "Accessories",
      href: "/accessories",
      count: accessories?.length ?? 0,
      image: accessoryImage?.imageUrl,
    },
  ];

  return (
    <div className="min-h-screen">
      {/* ── Section 1: Full-Bleed Hero ── */}
      <section className="relative -mt-16 min-h-[100svh] flex flex-col justify-end overflow-hidden">
        {/* Background layers */}
        <div className="absolute inset-0 hero-keyboard-bg" />
        <div className="absolute inset-0 hero-overlay" />
        <div className="absolute inset-0 grain" />

        {/* Content — anchored to bottom-left */}
        <div className="relative z-10 max-w-7xl mx-auto w-full px-6 lg:px-8 pb-12 lg:pb-20">
          {/* Title */}
          <h1
            className="hero-animate-in font-[family-name:var(--font-display)] font-extrabold tracking-[-0.04em] leading-[0.9] select-none text-white"
            style={{ fontSize: "clamp(4rem, 12vw, 10rem)" }}
          >
            Switch<span className="text-accent">y</span>
          </h1>

          {/* Divider */}
          <div className="hero-animate-in -delay-1 relative w-full h-px bg-white/20 my-8 lg:my-10">
            <div className="absolute left-0 top-0 h-full w-24 bg-accent" />
          </div>

          {/* Text + CTAs */}
          <div className="hero-animate-in -delay-2 max-w-lg">
            <p className="text-lg sm:text-xl text-white/70 leading-[1.7] mb-8">
              Your AI-powered mechanical keyboard build advisor. Describe the
              sound and feel you want — get a complete, compatible build with
              real products and real prices.
            </p>
            <div className="flex flex-wrap gap-3 mb-10">
              <Link
                href="/wizard"
                className="inline-flex items-center px-6 py-3 rounded-lg bg-accent text-white font-semibold text-base hover:bg-accent-hover active:scale-[0.97] transition-[background-color,transform] duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/40 focus-visible:ring-offset-2 focus-visible:ring-offset-transparent shadow-accent-sm"
              >
                Start Building
              </Link>
              <Link
                href="/switches"
                className="inline-flex items-center px-6 py-3 rounded-lg bg-white/10 backdrop-blur-sm border border-white/20 text-white/80 font-semibold text-base hover:text-white hover:bg-white/15 hover:border-white/30 transition-[color,background-color,border-color] duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/40 active:scale-[0.97]"
              >
                Browse Switches
              </Link>
            </div>
          </div>

          {/* Stats row */}
          <div className="hero-animate-in -delay-3 flex items-center gap-4 text-xs text-white/40 font-mono tracking-wider uppercase">
            <span>{switchCount}+ Switches</span>
            <span className="text-white/20">/</span>
            <span>{keyboardCount}+ Keyboards</span>
            <span className="text-white/20">/</span>
            <span>AI Powered</span>
          </div>
        </div>
      </section>

      {/* ── Section 2: Featured Product Showcase ── */}
      {featuredSwitch && (
        <section className="bg-bg-surface border-t border-b border-border-subtle">
          <div className="max-w-7xl mx-auto px-6 lg:px-8 py-16 lg:py-24">
            <div className="flex items-center justify-between mb-10">
              <p className="text-xs font-semibold text-accent uppercase tracking-[0.2em] font-mono">
                Featured Product
              </p>
              <div className="flex-1 h-px bg-border-subtle ml-6" />
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-5 gap-8 lg:gap-12 items-center">
              {/* Image — 3/5 width */}
              <div className="lg:col-span-3 relative aspect-[4/3] rounded-xl overflow-hidden bg-bg-elevated">
                <img
                  src={featuredSwitch.imageUrl}
                  alt={featuredSwitch.name}
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-transparent" />
              </div>
              {/* Details — 2/5 width */}
              <div className="lg:col-span-2">
                <span className="inline-block px-3 py-1 rounded-full text-xs font-semibold uppercase tracking-wider bg-accent/10 text-accent border border-accent/20 mb-4">
                  {featuredSwitch.type}
                </span>
                <h3 className="text-3xl lg:text-4xl font-bold font-[family-name:var(--font-display)] tracking-tight mb-3">
                  {featuredSwitch.name}
                </h3>
                {featuredSwitch.brand && (
                  <p className="text-sm text-text-muted font-mono uppercase tracking-wider mb-4">
                    {featuredSwitch.brand}
                  </p>
                )}
                {featuredSwitch.pricePerSwitch != null && (
                  <p className="text-2xl font-semibold text-text-primary mb-4">
                    ${featuredSwitch.pricePerSwitch.toFixed(2)}{" "}
                    <span className="text-sm text-text-muted font-normal">per switch</span>
                  </p>
                )}
                {featuredSwitch.communityRating != null && (
                  <div className="flex items-center gap-2 mb-6">
                    <div className="flex">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <svg
                          key={star}
                          className={`w-4 h-4 ${
                            star <= Math.round(featuredSwitch.communityRating ?? 0)
                              ? "text-accent"
                              : "text-text-muted/30"
                          }`}
                          fill="currentColor"
                          viewBox="0 0 20 20"
                        >
                          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                        </svg>
                      ))}
                    </div>
                    <span className="text-sm text-text-secondary">
                      {featuredSwitch.communityRating.toFixed(1)}
                    </span>
                  </div>
                )}
                {"description" in featuredSwitch && typeof featuredSwitch.description === "string" && (
                  <p className="text-sm text-text-secondary leading-[1.7] mb-8 line-clamp-3">
                    {featuredSwitch.description}
                  </p>
                )}
                <Link
                  href={`/switches/${featuredSwitch._id}`}
                  className="inline-flex items-center gap-2 text-accent hover:text-accent-hover font-semibold text-sm transition-colors duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/40 rounded"
                >
                  View Details
                  <svg
                    className="w-4 h-4"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth={2}
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                  </svg>
                </Link>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* ── Section 3: Category Grid ── */}
      <section className="px-6 lg:px-8 py-16 lg:py-24">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center gap-6 mb-3">
            <p className="text-xs font-semibold text-accent uppercase tracking-[0.2em] font-mono shrink-0">
              The Collection
            </p>
            <div className="flex-1 h-px bg-border-subtle" />
          </div>
          <h2 className="text-4xl lg:text-5xl font-bold font-[family-name:var(--font-display)] tracking-tight mb-10">
            Explore Our Collection
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {categories.map((cat) => (
              <Link
                key={cat.title}
                href={cat.href}
                className="group relative aspect-square rounded-xl overflow-hidden border border-border-subtle text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/40"
              >
                {/* Background: real image or solid fallback */}
                {cat.image ? (
                  <>
                    <img
                      src={cat.image}
                      alt={cat.title}
                      className="absolute inset-0 w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent" />
                    <div className="absolute inset-0 bg-accent/5 mix-blend-multiply opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                  </>
                ) : (
                  <div className="absolute inset-0 bg-bg-elevated" />
                )}
                {/* Content at bottom */}
                <div className="absolute bottom-0 left-0 right-0 p-6 flex items-end justify-between">
                  <div>
                    <h3 className="text-xl font-semibold text-white font-[family-name:var(--font-display)] tracking-tight mb-1 group-hover:text-accent transition-colors duration-200">
                      {cat.title}
                    </h3>
                    <p className="text-[11px] text-white/50 font-mono uppercase tracking-wider">
                      {cat.count} products
                    </p>
                  </div>
                  <div className="w-8 h-8 rounded-full border border-white/20 flex items-center justify-center group-hover:border-accent/50 group-hover:bg-accent/10 transition-[border-color,background-color] duration-200">
                    <svg
                      className="w-4 h-4 text-white/50 group-hover:text-accent group-hover:translate-x-0.5 transition-[color,transform] duration-200"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                      strokeWidth={2}
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M9 5l7 7-7 7"
                      />
                    </svg>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* ── Section 4: Feature / Content Cards ── */}
      <section className="bg-bg-surface border-t border-border-subtle">
        <div className="max-w-7xl mx-auto px-6 lg:px-8 py-16 lg:py-24">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* Card 1: Group Buy Tracker */}
            <Link
              href="/group-buys"
              className="group block rounded-xl overflow-hidden border border-border-subtle bg-bg-primary hover:border-border-accent transition-[border-color] duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/40"
            >
              <div className="relative aspect-[16/9] bg-bg-elevated overflow-hidden">
                <img
                  src="/images/feature-group-buys.webp"
                  alt="Group Buy"
                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                  onError={(e) => {
                    const fallback = firstGroupBuyImage?.imageUrl || secondKeyboard?.imageUrl;
                    if (fallback) (e.target as HTMLImageElement).src = fallback;
                    else (e.target as HTMLImageElement).style.display = "none";
                  }}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent" />
              </div>
              <div className="p-5">
                <span className="inline-block text-[10px] font-bold text-accent uppercase tracking-[0.15em] font-mono mb-2">
                  {liveGroupBuys.length > 0
                    ? `${liveGroupBuys.length} Live Now`
                    : "Group Buys"}
                </span>
                <h3 className="text-lg font-semibold font-[family-name:var(--font-display)] tracking-tight text-text-primary mb-1 group-hover:text-accent transition-colors duration-200">
                  Group Buy Tracker
                </h3>
                <p className="text-sm text-text-secondary leading-[1.6]">
                  Track live and upcoming group buys. Never miss a drop on your next endgame board.
                </p>
              </div>
            </Link>

            {/* Card 2: Build Wizard */}
            <Link
              href="/wizard"
              className="group block rounded-xl overflow-hidden border border-border-subtle bg-bg-primary hover:border-border-accent transition-[border-color] duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/40"
            >
              <div className="relative aspect-[16/9] bg-bg-elevated overflow-hidden">
                <img
                  src="/images/feature-build-wizard.webp"
                  alt="Build Wizard"
                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                  onError={(e) => {
                    const fallback = secondKeyboard?.imageUrl;
                    if (fallback) (e.target as HTMLImageElement).src = fallback;
                    else (e.target as HTMLImageElement).style.display = "none";
                  }}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent" />
              </div>
              <div className="p-5">
                <span className="inline-block text-[10px] font-bold text-accent uppercase tracking-[0.15em] font-mono mb-2">
                  AI Guided
                </span>
                <h3 className="text-lg font-semibold font-[family-name:var(--font-display)] tracking-tight text-text-primary mb-1 group-hover:text-accent transition-colors duration-200">
                  Build Wizard
                </h3>
                <p className="text-sm text-text-secondary leading-[1.6]">
                  Answer a few questions about your preferences and get a complete, compatible build recommendation.
                </p>
              </div>
            </Link>

            {/* Card 3: Glossary */}
            <Link
              href="/glossary"
              className="group block rounded-xl overflow-hidden border border-border-subtle bg-bg-primary hover:border-border-accent transition-[border-color] duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/40"
            >
              <div className="relative aspect-[16/9] bg-bg-elevated overflow-hidden">
                <img
                  src="/images/feature-glossary.webp"
                  alt="Glossary"
                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                  onError={(e) => {
                    const fallback = keycapImage?.imageUrl;
                    if (fallback) (e.target as HTMLImageElement).src = fallback;
                    else (e.target as HTMLImageElement).style.display = "none";
                  }}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent" />
              </div>
              <div className="p-5">
                <span className="inline-block text-[10px] font-bold text-accent uppercase tracking-[0.15em] font-mono mb-2">
                  80+ Terms
                </span>
                <h3 className="text-lg font-semibold font-[family-name:var(--font-display)] tracking-tight text-text-primary mb-1 group-hover:text-accent transition-colors duration-200">
                  Keyboard Glossary
                </h3>
                <p className="text-sm text-text-secondary leading-[1.6]">
                  Learn every term in the hobby — from actuation force to zealios and everything in between.
                </p>
              </div>
            </Link>
          </div>
        </div>
      </section>

      {/* ── Section 5: Full-Width Image Section ── */}
      <section className="relative overflow-hidden">
        <img
          src="/images/feature-tips-mods.webp"
          alt="Keyboard maintenance"
          className="absolute inset-0 w-full h-full object-cover"
          onError={(e) => {
            const fallback = thirdKeyboard?.imageUrl;
            if (fallback) (e.target as HTMLImageElement).src = fallback;
            else (e.target as HTMLImageElement).style.display = "none";
          }}
        />
        <div className="absolute inset-0 bg-gradient-to-r from-bg-primary/95 via-bg-primary/70 to-transparent" />
        <div className="relative z-10 max-w-7xl mx-auto px-6 lg:px-8 py-20 lg:py-32">
          <div className="max-w-lg">
            <span className="inline-block text-[10px] font-bold text-accent uppercase tracking-[0.15em] font-mono mb-4">
              Tips & Mods
            </span>
            <h2 className="text-3xl lg:text-5xl font-bold font-[family-name:var(--font-display)] tracking-tight mb-4 text-text-primary">
              Keep Your Board in Top Shape
            </h2>
            <p className="text-base text-text-secondary leading-[1.7] mb-8">
              From lubing switches to band-aid modding stabilizers — learn the
              essential maintenance tips that keep your custom keyboard sounding
              and feeling its best.
            </p>
            <Link
              href="/glossary"
              className="inline-flex items-center gap-2 text-accent hover:text-accent-hover font-semibold text-sm transition-colors duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/40 rounded"
            >
              Explore Mods & Tips
              <svg
                className="w-4 h-4"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2}
              >
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
              </svg>
            </Link>
          </div>
        </div>
      </section>

      {/* ── Section 6: Bottom CTA Banner ── */}
      <section className="bg-bg-elevated relative overflow-hidden">
        <div className="grain" />
        <div className="absolute inset-0 bg-gradient-to-br from-accent/5 via-transparent to-transparent" />
        <div className="relative z-10 max-w-4xl mx-auto px-6 py-20 lg:py-28 text-center">
          <h2 className="text-4xl sm:text-5xl lg:text-6xl font-bold font-[family-name:var(--font-display)] tracking-tight mb-5">
            Build Your Perfect Board
          </h2>
          <p className="text-base text-text-secondary max-w-lg mx-auto mb-10 leading-[1.7]">
            Whether you&apos;re chasing the deepest thock or the fastest
            actuation, Switchy helps you build with confidence.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
            <Link
              href="/wizard"
              className="px-6 py-3 rounded-lg bg-accent text-bg-primary font-semibold text-base hover:bg-accent-hover active:scale-[0.97] transition-[background-color,transform] duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/40 focus-visible:ring-offset-2 focus-visible:ring-offset-bg-elevated shadow-accent-sm"
            >
              Start Building
            </Link>
            <Link
              href="/switches"
              className="px-6 py-3 rounded-lg bg-transparent border border-border-default text-text-secondary font-semibold text-base hover:text-text-primary hover:border-border-accent transition-[color,border-color] duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/40 active:scale-[0.97]"
            >
              Browse Switches
            </Link>
          </div>
        </div>
      </section>

      {/* ── Section 7: Footer ── */}
      <footer className="border-t border-border-subtle bg-bg-primary">
        <div className="max-w-7xl mx-auto px-6 lg:px-8 py-12 lg:py-16">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-8 lg:gap-12">
            {/* Brand */}
            <div className="col-span-2 sm:col-span-1">
              <div className="flex items-center gap-2.5 mb-4">
                <Image src="/logo.png" alt="Switchy" width={28} height={28} />
                <span className="text-lg font-bold font-[family-name:var(--font-display)] tracking-tight">
                  Switchy
                </span>
              </div>
              <p className="text-sm text-text-muted leading-[1.6]">
                AI-powered mechanical keyboard build advisor. Find your perfect
                sound and feel.
              </p>
            </div>

            {/* Explore */}
            <div>
              <h4 className="text-xs font-semibold text-text-muted uppercase tracking-[0.15em] font-mono mb-4">
                Explore
              </h4>
              <ul className="space-y-2.5">
                {[
                  { label: "Switches", href: "/switches" },
                  { label: "Keyboard Kits", href: "/keyboards" },
                  { label: "Keycaps", href: "/keycaps" },
                  { label: "Accessories", href: "/accessories" },
                ].map((link) => (
                  <li key={link.href}>
                    <Link
                      href={link.href}
                      className="text-sm text-text-secondary hover:text-accent transition-colors duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/40 rounded"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            {/* Tools */}
            <div>
              <h4 className="text-xs font-semibold text-text-muted uppercase tracking-[0.15em] font-mono mb-4">
                Tools
              </h4>
              <ul className="space-y-2.5">
                {[
                  { label: "AI Builder", href: "/advisor" },
                  { label: "3D Studio", href: "/studio" },
                  { label: "Group Buys", href: "/group-buys" },
                  { label: "Glossary", href: "/glossary" },
                ].map((link) => (
                  <li key={link.href}>
                    <Link
                      href={link.href}
                      className="text-sm text-text-secondary hover:text-accent transition-colors duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/40 rounded"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            {/* Resources */}
            <div>
              <h4 className="text-xs font-semibold text-text-muted uppercase tracking-[0.15em] font-mono mb-4">
                Resources
              </h4>
              <ul className="space-y-2.5">
                {[
                  { label: "Build Wizard", href: "/wizard" },
                  { label: "My Builds", href: "/builds" },
                ].map((link) => (
                  <li key={link.href}>
                    <Link
                      href={link.href}
                      className="text-sm text-text-secondary hover:text-accent transition-colors duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/40 rounded"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Copyright bar */}
          <div className="mt-12 pt-6 border-t border-border-subtle flex flex-col sm:flex-row items-center justify-between gap-3">
            <p className="text-xs text-text-muted">
              &copy; {new Date().getFullYear()} Switchy. All rights reserved.
            </p>
            <p className="text-xs text-text-muted">
              Powered by AI &middot; Built for the mech keyboard community
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
