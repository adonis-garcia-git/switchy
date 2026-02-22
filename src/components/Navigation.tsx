"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { SignInButton, UserButton, useUser } from "@clerk/nextjs";
import { cn } from "@/lib/utils";
import { ThemeToggle } from "@/components/ThemeToggle";
import { MegaMenuTrigger, SWITCHES_COLUMNS, KEYBOARDS_COLUMNS, KEYCAPS_COLUMNS, ACCESSORIES_COLUMNS } from "@/components/MegaMenu";
import { useSubscription } from "@/hooks/useSubscription";
import { ProBadge } from "@/components/ProBadge";
import { UsageCounter } from "@/components/UsageCounter";

export function Navigation() {
  const pathname = usePathname();
  const { isSignedIn } = useUser();
  const { isPro, buildsUsed, buildsLimit, isLoading: subLoading } = useSubscription();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [switchesMobileExpanded, setSwitchesMobileExpanded] = useState(false);
  const [keyboardsMobileExpanded, setKeyboardsMobileExpanded] = useState(false);
  const [keycapsMobileExpanded, setKeycapsMobileExpanded] = useState(false);
  const [accessoriesMobileExpanded, setAccessoriesMobileExpanded] = useState(false);

  // Close mobile menu on route change
  useEffect(() => {
    setMobileOpen(false);
    setSwitchesMobileExpanded(false);
    setKeyboardsMobileExpanded(false);
    setKeycapsMobileExpanded(false);
    setAccessoriesMobileExpanded(false);
  }, [pathname]);

  const isNavActive = (href: string) =>
    pathname === href || (href !== "/" && pathname.startsWith(href));

  return (
    <>
      {/* Top Navigation Bar */}
      <header className="fixed top-0 left-0 right-0 h-16 bg-black/95 backdrop-blur-xl border-b border-white/10 z-50">
        <div className="h-full max-w-[1440px] mx-auto px-4 sm:px-6 flex items-center justify-between">
          {/* Left: Logo + Nav Links */}
          <div className="flex items-center gap-6">
            <Link href="/" className="flex items-center shrink-0">
              <img src="/logo.png" alt="Switchy" className="h-8 w-auto" />
            </Link>

            {/* Desktop Nav Links */}
            <nav className="hidden lg:flex items-center gap-1 font-[family-name:var(--font-outfit)]">
              {/* Switches — Mega Menu */}
              <MegaMenuTrigger
                label="Switches"
                href="/switches"
                columns={SWITCHES_COLUMNS}
                isActive={isNavActive("/switches")}
              />

              {/* Keyboards — Mega Menu */}
              <MegaMenuTrigger
                label="Keyboards"
                href="/keyboards"
                columns={KEYBOARDS_COLUMNS}
                isActive={isNavActive("/keyboards")}
              />

              {/* Keycaps — Mega Menu */}
              <MegaMenuTrigger
                label="Keycaps"
                href="/keycaps"
                columns={KEYCAPS_COLUMNS}
                isActive={isNavActive("/keycaps")}
              />

              {/* Accessories — Mega Menu */}
              <MegaMenuTrigger
                label="Accessories"
                href="/accessories"
                columns={ACCESSORIES_COLUMNS}
                isActive={isNavActive("/accessories")}
              />

              {/* Glossary — Standalone link */}
              <Link
                href="/glossary"
                className={cn(
                  "px-3.5 py-2 rounded-2xl text-sm font-medium transition-[background-color,color,transform] duration-150",
                  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/50",
                  isNavActive("/glossary")
                    ? "bg-accent-dim border border-accent/20 text-accent"
                    : "bg-white/5 text-white/60 hover:bg-white/10 hover:text-white active:scale-[0.97]"
                )}
              >
                Glossary
              </Link>

              {/* Group Buys — Standalone link */}
              <Link
                href="/group-buys"
                className={cn(
                  "px-3.5 py-2 rounded-2xl text-sm font-medium transition-[background-color,color,transform] duration-150",
                  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/50",
                  isNavActive("/group-buys")
                    ? "bg-accent-dim border border-accent/20 text-accent"
                    : "bg-white/5 text-white/60 hover:bg-white/10 hover:text-white active:scale-[0.97]"
                )}
              >
                Group Buys
              </Link>
            </nav>
          </div>

          {/* Right: Builder CTA + My Builds + Auth */}
          <div className="flex items-center gap-3">
            {/* Builder CTA — desktop only */}
            <Link
              href="/builder"
              className={cn(
                "hidden lg:inline-flex px-4 py-2 rounded-2xl text-sm font-medium transition-[background-color,color,transform] duration-150",
                "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/50",
                isNavActive("/builder")
                  ? "bg-accent text-bg-primary shadow-accent-sm scale-[0.97]"
                  : "bg-accent text-bg-primary shadow-accent-sm hover:bg-accent-hover active:scale-[0.97]"
              )}
            >
              Builder
            </Link>

            {/* My Builds — desktop only, auth-gated */}
            {isSignedIn && (
              <Link
                href="/builds"
                className={cn(
                  "hidden lg:inline-flex px-3.5 py-2 rounded-2xl text-sm font-medium transition-[background-color,color,transform] duration-150",
                  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/50",
                  isNavActive("/builds")
                    ? "bg-accent-dim border border-accent/20 text-accent"
                    : "bg-white/5 text-white/60 hover:bg-white/10 hover:text-white active:scale-[0.97]"
                )}
              >
                My Builds
              </Link>
            )}

            <ThemeToggle />

            {/* Subscription status */}
            {isSignedIn && !subLoading && (
              <div className="hidden sm:flex items-center gap-2">
                {isPro ? (
                  <ProBadge />
                ) : (
                  <>
                    <UsageCounter compact buildsUsed={buildsUsed} buildsLimit={buildsLimit} />
                    <Link
                      href="/pricing"
                      className="text-[10px] font-semibold text-accent hover:text-accent-hover transition-colors duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/40 rounded"
                    >
                      Upgrade
                    </Link>
                  </>
                )}
              </div>
            )}

            {/* Mobile hamburger */}
            <button
              onClick={() => setMobileOpen(!mobileOpen)}
              aria-label={mobileOpen ? "Close menu" : "Open menu"}
              className="lg:hidden p-2 text-white/60 hover:text-white rounded-md hover:bg-white/10 transition-[background-color,color] duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/50"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                {mobileOpen ? (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                ) : (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                )}
              </svg>
            </button>

            {isSignedIn ? (
              <UserButton
                appearance={{
                  elements: { avatarBox: "w-8 h-8" },
                }}
              />
            ) : (
              <SignInButton mode="modal">
                <button className="px-4 py-1.5 text-sm font-semibold rounded-md bg-accent text-bg-primary hover:bg-accent-hover active:scale-[0.97] transition-[background-color,transform] duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/50">
                  Sign In
                </button>
              </SignInButton>
            )}
          </div>
        </div>
      </header>

      {/* Mobile Dropdown */}
      {mobileOpen && (
        <div className="lg:hidden fixed inset-0 z-40 pt-16">
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setMobileOpen(false)} />
          <div className="relative bg-neutral-900 border-b border-white/10 shadow-floating max-h-[calc(100vh-4rem)] overflow-y-auto">
            <nav className="max-w-[1440px] mx-auto px-4 py-3 space-y-0.5 font-[family-name:var(--font-outfit)]">
              {/* Switches — Expandable */}
              <MobileExpandableSection
                label="Switches"
                href="/switches"
                columns={SWITCHES_COLUMNS}
                expanded={switchesMobileExpanded}
                onToggle={() => setSwitchesMobileExpanded(!switchesMobileExpanded)}
                isActive={isNavActive("/switches")}
                onClose={() => setMobileOpen(false)}
              />

              {/* Keyboards — Expandable */}
              <MobileExpandableSection
                label="Keyboards"
                href="/keyboards"
                columns={KEYBOARDS_COLUMNS}
                expanded={keyboardsMobileExpanded}
                onToggle={() => setKeyboardsMobileExpanded(!keyboardsMobileExpanded)}
                isActive={isNavActive("/keyboards")}
                onClose={() => setMobileOpen(false)}
              />

              {/* Keycaps — Expandable */}
              <MobileExpandableSection
                label="Keycaps"
                href="/keycaps"
                columns={KEYCAPS_COLUMNS}
                expanded={keycapsMobileExpanded}
                onToggle={() => setKeycapsMobileExpanded(!keycapsMobileExpanded)}
                isActive={isNavActive("/keycaps")}
                onClose={() => setMobileOpen(false)}
              />

              {/* Accessories — Expandable */}
              <MobileExpandableSection
                label="Accessories"
                href="/accessories"
                columns={ACCESSORIES_COLUMNS}
                expanded={accessoriesMobileExpanded}
                onToggle={() => setAccessoriesMobileExpanded(!accessoriesMobileExpanded)}
                isActive={isNavActive("/accessories")}
                onClose={() => setMobileOpen(false)}
              />

              {/* Standalone links */}
              <Link
                href="/glossary"
                onClick={() => setMobileOpen(false)}
                className={cn(
                  "flex items-center px-5 py-2.5 rounded-2xl text-sm font-medium transition-[background-color,color] duration-150",
                  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/50",
                  isNavActive("/glossary")
                    ? "text-accent bg-accent-dim border border-accent/20"
                    : "text-white/60 hover:text-white hover:bg-white/10"
                )}
              >
                Glossary
              </Link>

              <Link
                href="/group-buys"
                onClick={() => setMobileOpen(false)}
                className={cn(
                  "flex items-center px-5 py-2.5 rounded-2xl text-sm font-medium transition-[background-color,color] duration-150",
                  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/50",
                  isNavActive("/group-buys")
                    ? "text-accent bg-accent-dim border border-accent/20"
                    : "text-white/60 hover:text-white hover:bg-white/10"
                )}
              >
                Group Buys
              </Link>

              {/* Builder CTA */}
              <div className="pt-2">
                <Link
                  href="/builder"
                  onClick={() => setMobileOpen(false)}
                  className="flex items-center justify-center px-5 py-2.5 rounded-2xl text-sm font-medium bg-accent text-bg-primary shadow-accent-sm hover:bg-accent-hover active:scale-[0.97] transition-[background-color,transform] duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/50"
                >
                  Builder
                </Link>
              </div>

              {/* Pricing */}
              <Link
                href="/pricing"
                onClick={() => setMobileOpen(false)}
                className={cn(
                  "flex items-center px-5 py-2.5 rounded-2xl text-sm font-medium transition-[background-color,color] duration-150",
                  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/50",
                  isNavActive("/pricing")
                    ? "text-accent bg-accent-dim border border-accent/20"
                    : "text-white/60 hover:text-white hover:bg-white/10"
                )}
              >
                Pricing
                {isSignedIn && isPro && <span className="ml-2"><ProBadge /></span>}
              </Link>

              {/* Mobile subscription status */}
              {isSignedIn && !subLoading && !isPro && (
                <div className="px-5 py-2">
                  <UsageCounter buildsUsed={buildsUsed} buildsLimit={buildsLimit} />
                </div>
              )}

              {/* My Builds (auth-gated) */}
              {isSignedIn && (
                <Link
                  href="/builds"
                  onClick={() => setMobileOpen(false)}
                  className={cn(
                    "flex items-center px-5 py-2.5 rounded-2xl text-sm font-medium transition-[background-color,color] duration-150",
                    "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/50",
                    isNavActive("/builds")
                      ? "text-accent bg-accent-dim border border-accent/20"
                      : "text-white/60 hover:text-white hover:bg-white/10"
                  )}
                >
                  My Builds
                </Link>
              )}
            </nav>
          </div>
        </div>
      )}
    </>
  );
}

// ── Mobile Expandable Section ──

function MobileExpandableSection({
  label,
  href,
  columns,
  expanded,
  onToggle,
  isActive,
  onClose,
}: {
  label: string;
  href: string;
  columns: { heading: string; links: { label: string; href: string }[] }[];
  expanded: boolean;
  onToggle: () => void;
  isActive: boolean;
  onClose: () => void;
}) {
  return (
    <div>
      <button
        onClick={onToggle}
        className={cn(
          "flex items-center justify-between w-full px-5 py-2.5 rounded-2xl text-sm font-medium transition-[background-color,color] duration-150",
          "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/50",
          isActive
            ? "text-accent bg-accent-dim border border-accent/20"
            : "text-white/60 hover:text-white hover:bg-white/10"
        )}
      >
        {label}
        <svg
          className={cn(
            "w-3.5 h-3.5 transition-transform duration-150",
            expanded && "rotate-180"
          )}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>
      {expanded && (
        <div className="ml-3 mt-1 mb-2">
          <Link
            href={href}
            onClick={onClose}
            className="flex items-center px-5 py-2 rounded-xl text-sm font-medium text-accent hover:bg-white/5 transition-colors duration-150"
          >
            View all {label.toLowerCase()} &rarr;
          </Link>
          {columns.map((col) => (
            <div key={col.heading} className="mt-2">
              <p className="px-5 text-[10px] text-white/40 uppercase tracking-wider font-semibold mb-1">
                {col.heading}
              </p>
              {col.links.map((link) => (
                <Link
                  key={link.href + link.label}
                  href={link.href}
                  onClick={onClose}
                  className="flex items-center px-5 py-1.5 rounded-xl text-sm text-white/60 hover:text-white hover:bg-white/5 transition-colors duration-150"
                >
                  {link.label}
                </Link>
              ))}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
