"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { SignInButton, UserButton, useUser } from "@clerk/nextjs";
import { cn } from "@/lib/utils";
import { ThemeToggle } from "@/components/ThemeToggle";
import { MegaMenuTrigger, SWITCHES_COLUMNS, KEYBOARDS_COLUMNS, KEYCAPS_COLUMNS, ACCESSORIES_COLUMNS } from "@/components/MegaMenu";
import { useSubscription } from "@/hooks/useSubscription";
import { ProBadge } from "@/components/ProBadge";
import { UsageCounter } from "@/components/UsageCounter";
import { Skeleton } from "@/components/ui/Skeleton";

// ── Shared style helpers ──

function navLinkClass(active: boolean) {
  return cn(
    "relative px-1 py-2 text-sm font-medium transition-colors duration-150",
    "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/50 focus-visible:rounded",
    active
      ? "text-text-primary"
      : "text-text-secondary hover:text-text-primary"
  );
}

function utilLinkClass(active: boolean) {
  return cn(
    "px-2 py-1.5 text-xs font-medium transition-colors duration-150 rounded",
    "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/50",
    active
      ? "text-accent"
      : "text-text-muted hover:text-text-secondary"
  );
}

function mobileLinkClass(active: boolean) {
  return cn(
    "flex items-center w-full px-4 py-3 rounded-lg text-sm font-medium transition-[background-color,color] duration-150",
    "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/50",
    active
      ? "text-accent bg-accent-dim"
      : "text-text-secondary hover:text-text-primary hover:bg-bg-tint"
  );
}

// ── Navigation ──

export function Navigation() {
  const pathname = usePathname();
  const { isSignedIn, isLoaded: authLoaded } = useUser();
  const { isPro, buildsUsed, buildsLimit, isLoading: subLoading } = useSubscription();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [expandedSection, setExpandedSection] = useState<string | null>(null);
  const mobileMenuRef = useRef<HTMLDivElement>(null);

  // Close mobile menu on route change
  useEffect(() => {
    setMobileOpen(false);
    setExpandedSection(null);
  }, [pathname]);

  // Escape key closes mobile menu
  useEffect(() => {
    if (!mobileOpen) return;
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setMobileOpen(false);
      }
    };
    document.addEventListener("keydown", handleKey);
    return () => document.removeEventListener("keydown", handleKey);
  }, [mobileOpen]);

  // Lock body scroll when mobile menu is open
  useEffect(() => {
    if (mobileOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => { document.body.style.overflow = ""; };
  }, [mobileOpen]);

  const isNavActive = (href: string) =>
    pathname === href || (href !== "/" && pathname.startsWith(href));

  const toggleSection = (section: string) => {
    setExpandedSection((prev) => (prev === section ? null : section));
  };

  return (
    <>
      {/* ── Top Navigation Bar ── */}
      <header className="fixed top-0 left-0 right-0 h-16 bg-bg-surface/80 backdrop-blur-md border-b border-border-subtle z-50">
        <div className="h-full max-w-screen-2xl mx-auto px-4 sm:px-6 flex items-center">

          {/* ── Left Zone: Logo ── */}
          <Link href="/" className="flex items-center shrink-0 group mr-3">
            <img
              src="/logo.png"
              alt="Switchy"
              className="h-16 w-16 object-contain drop-shadow-[0_2px_6px_rgba(243,146,28,0.35)] transition-transform duration-200 group-hover:scale-105 group-active:scale-95"
            />
          </Link>

          {/* ── Center Zone: Product Categories ── */}
          <nav className="hidden lg:flex items-center gap-6 font-[family-name:var(--font-outfit)] flex-1">
            <MegaMenuTrigger
              label="Switches"
              href="/switches"
              columns={SWITCHES_COLUMNS}
              isActive={isNavActive("/switches")}
            />
            <MegaMenuTrigger
              label="Keyboards"
              href="/keyboards"
              columns={KEYBOARDS_COLUMNS}
              isActive={isNavActive("/keyboards")}
            />
            <MegaMenuTrigger
              label="Keycaps"
              href="/keycaps"
              columns={KEYCAPS_COLUMNS}
              isActive={isNavActive("/keycaps")}
            />
            <MegaMenuTrigger
              label="Accessories"
              href="/accessories"
              columns={ACCESSORIES_COLUMNS}
              isActive={isNavActive("/accessories")}
            />
          </nav>

          {/* ── Right Zone: Utilities + Divider + CTA + Theme + Auth ── */}
          <div className="hidden lg:flex items-center gap-1 font-[family-name:var(--font-outfit)]">
            {/* Utility links — smaller, muted */}
            <Link href="/search" className={utilLinkClass(isNavActive("/search"))}>
              Search
            </Link>
            <Link href="/glossary" className={utilLinkClass(isNavActive("/glossary"))}>
              Glossary
            </Link>
            <Link href="/group-buys" className={utilLinkClass(isNavActive("/group-buys"))}>
              Group Buys
            </Link>
            <Link href="/studio" className={utilLinkClass(isNavActive("/studio"))}>
              Studio
            </Link>
            {isSignedIn && (
              <Link href="/builds" className={utilLinkClass(isNavActive("/builds"))}>
                My Builds
              </Link>
            )}
            {isSignedIn && (
              <Link href="/account" className={utilLinkClass(isNavActive("/account"))}>
                Account
              </Link>
            )}

            {/* Vertical divider */}
            <div className="w-px h-5 bg-border-default mx-2" />

            {/* Builder CTA — the only filled element */}
            <Link
              href="/builder"
              className={cn(
                "inline-flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-semibold transition-[background-color,color,transform,box-shadow] duration-150",
                "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/50",
                isNavActive("/builder")
                  ? "bg-accent text-bg-primary shadow-accent-sm ring-2 ring-accent/30 scale-[0.97]"
                  : "bg-accent text-bg-primary shadow-accent-sm hover:bg-accent-hover active:scale-[0.97]"
              )}
            >
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
              </svg>
              Build
            </Link>

            {/* Subscription status */}
            {isSignedIn && !subLoading && (
              <Link href="/account" className="flex items-center gap-2 ml-1 hover:opacity-80 transition-opacity duration-150">
                {isPro ? (
                  <ProBadge />
                ) : (
                  <UsageCounter compact buildsUsed={buildsUsed} buildsLimit={buildsLimit} />
                )}
              </Link>
            )}

            <div className="ml-1">
              <ThemeToggle />
            </div>

            {/* Auth button / avatar */}
            <div className="ml-1">
              {!authLoaded ? (
                <Skeleton variant="circle" className="w-8 h-8" />
              ) : isSignedIn ? (
                <UserButton
                  appearance={{
                    elements: { avatarBox: "w-8 h-8" },
                  }}
                >
                  <UserButton.MenuItems>
                    <UserButton.Link
                      label="Account"
                      labelIcon={<svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M9.594 3.94c.09-.542.56-.94 1.11-.94h2.593c.55 0 1.02.398 1.11.94l.213 1.281c.063.374.313.686.645.87.074.04.147.083.22.127.325.196.72.257 1.075.124l1.217-.456a1.125 1.125 0 011.37.49l1.296 2.247a1.125 1.125 0 01-.26 1.431l-1.003.827c-.293.241-.438.613-.43.992a7.723 7.723 0 010 .255c-.008.378.137.75.43.991l1.004.827c.424.35.534.955.26 1.43l-1.298 2.247a1.125 1.125 0 01-1.369.491l-1.217-.456c-.355-.133-.75-.072-1.076.124a6.47 6.47 0 01-.22.128c-.331.183-.581.495-.644.869l-.213 1.281c-.09.543-.56.94-1.11.94h-2.594c-.55 0-1.019-.398-1.11-.94l-.213-1.281c-.062-.374-.312-.686-.644-.87a6.52 6.52 0 01-.22-.127c-.325-.196-.72-.257-1.076-.124l-1.217.456a1.125 1.125 0 01-1.369-.49l-1.297-2.247a1.125 1.125 0 01.26-1.431l1.004-.827c.292-.24.437-.613.43-.991a6.932 6.932 0 010-.255c.007-.38-.138-.751-.43-.992l-1.004-.827a1.125 1.125 0 01-.26-1.43l1.297-2.247a1.125 1.125 0 011.37-.491l1.216.456c.356.133.751.072 1.076-.124.072-.044.146-.086.22-.128.332-.183.582-.495.644-.869l.214-1.28z" /><path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /></svg>}
                      href="/account"
                    />
                  </UserButton.MenuItems>
                </UserButton>
              ) : (
                <SignInButton mode="modal">
                  <button className="px-3.5 py-1.5 text-sm font-medium rounded-lg bg-bg-elevated border border-border-default text-text-secondary hover:text-text-primary hover:border-border-strong active:scale-[0.97] transition-[background-color,color,border-color,transform] duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/50">
                    Sign In
                  </button>
                </SignInButton>
              )}
            </div>
          </div>

          {/* ── Mobile: Right controls ── */}
          <div className="flex lg:hidden items-center gap-2 ml-auto">
            <ThemeToggle />

            {!authLoaded ? (
              <Skeleton variant="circle" className="w-8 h-8" />
            ) : isSignedIn ? (
              <UserButton
                appearance={{
                  elements: { avatarBox: "w-8 h-8" },
                }}
              >
                <UserButton.MenuItems>
                  <UserButton.Link
                    label="Account"
                    labelIcon={<svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M9.594 3.94c.09-.542.56-.94 1.11-.94h2.593c.55 0 1.02.398 1.11.94l.213 1.281c.063.374.313.686.645.87.074.04.147.083.22.127.325.196.72.257 1.075.124l1.217-.456a1.125 1.125 0 011.37.49l1.296 2.247a1.125 1.125 0 01-.26 1.431l-1.003.827c-.293.241-.438.613-.43.992a7.723 7.723 0 010 .255c-.008.378.137.75.43.991l1.004.827c.424.35.534.955.26 1.43l-1.298 2.247a1.125 1.125 0 01-1.369.491l-1.217-.456c-.355-.133-.75-.072-1.076.124a6.47 6.47 0 01-.22.128c-.331.183-.581.495-.644.869l-.213 1.281c-.09.543-.56.94-1.11.94h-2.594c-.55 0-1.019-.398-1.11-.94l-.213-1.281c-.062-.374-.312-.686-.644-.87a6.52 6.52 0 01-.22-.127c-.325-.196-.72-.257-1.076-.124l-1.217.456a1.125 1.125 0 01-1.369-.49l-1.297-2.247a1.125 1.125 0 01.26-1.431l1.004-.827c.292-.24.437-.613.43-.991a6.932 6.932 0 010-.255c.007-.38-.138-.751-.43-.992l-1.004-.827a1.125 1.125 0 01-.26-1.43l1.297-2.247a1.125 1.125 0 011.37-.491l1.216.456c.356.133.751.072 1.076-.124.072-.044.146-.086.22-.128.332-.183.582-.495.644-.869l.214-1.28z" /><path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /></svg>}
                    href="/account"
                  />
                </UserButton.MenuItems>
              </UserButton>
            ) : (
              <SignInButton mode="modal">
                <button className="px-3 py-1.5 text-xs font-medium rounded-lg bg-bg-elevated border border-border-default text-text-secondary hover:text-text-primary active:scale-[0.97] transition-[background-color,color,border-color,transform] duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/50">
                  Sign In
                </button>
              </SignInButton>
            )}

            {/* Animated hamburger */}
            <button
              onClick={() => setMobileOpen(!mobileOpen)}
              aria-label={mobileOpen ? "Close menu" : "Open menu"}
              aria-expanded={mobileOpen}
              className="p-2 text-text-secondary hover:text-text-primary rounded-lg hover:bg-bg-tint transition-[background-color,color] duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/50"
            >
              <div className="w-5 h-4 relative flex flex-col justify-between">
                <span
                  className={cn(
                    "block h-0.5 w-5 bg-current rounded-full transition-transform duration-200 origin-center",
                    mobileOpen && "translate-y-[7px] rotate-45"
                  )}
                />
                <span
                  className={cn(
                    "block h-0.5 w-5 bg-current rounded-full transition-opacity duration-200",
                    mobileOpen && "opacity-0"
                  )}
                />
                <span
                  className={cn(
                    "block h-0.5 w-5 bg-current rounded-full transition-transform duration-200 origin-center",
                    mobileOpen && "-translate-y-[7px] -rotate-45"
                  )}
                />
              </div>
            </button>
          </div>
        </div>
      </header>

      {/* ── Mobile Menu (always rendered, animated) ── */}
      <div
        className={cn(
          "lg:hidden fixed inset-0 z-40 pt-16",
          "transition-[visibility,opacity] duration-200",
          mobileOpen
            ? "visible opacity-100"
            : "invisible opacity-0"
        )}
      >
        {/* Backdrop */}
        <div
          className={cn(
            "absolute inset-0 bg-black/50 backdrop-blur-sm transition-opacity duration-200",
            mobileOpen ? "opacity-100" : "opacity-0"
          )}
          onClick={() => setMobileOpen(false)}
        />

        {/* Panel */}
        <div
          ref={mobileMenuRef}
          className={cn(
            "relative bg-bg-surface border-b border-border-subtle shadow-floating max-h-[calc(100vh-4rem)] overflow-y-auto",
            "transition-[opacity,transform] duration-200",
            mobileOpen
              ? "opacity-100 translate-y-0"
              : "opacity-0 -translate-y-2"
          )}
        >
          <nav className="max-w-screen-2xl mx-auto px-4 py-4 font-[family-name:var(--font-outfit)]">

            {/* ── Product Categories ── */}
            <div className="space-y-1">
              <MobileExpandableSection
                label="Switches"
                href="/switches"
                columns={SWITCHES_COLUMNS}
                expanded={expandedSection === "switches"}
                onToggle={() => toggleSection("switches")}
                isActive={isNavActive("/switches")}
                onClose={() => setMobileOpen(false)}
              />
              <MobileExpandableSection
                label="Keyboards"
                href="/keyboards"
                columns={KEYBOARDS_COLUMNS}
                expanded={expandedSection === "keyboards"}
                onToggle={() => toggleSection("keyboards")}
                isActive={isNavActive("/keyboards")}
                onClose={() => setMobileOpen(false)}
              />
              <MobileExpandableSection
                label="Keycaps"
                href="/keycaps"
                columns={KEYCAPS_COLUMNS}
                expanded={expandedSection === "keycaps"}
                onToggle={() => toggleSection("keycaps")}
                isActive={isNavActive("/keycaps")}
                onClose={() => setMobileOpen(false)}
              />
              <MobileExpandableSection
                label="Accessories"
                href="/accessories"
                columns={ACCESSORIES_COLUMNS}
                expanded={expandedSection === "accessories"}
                onToggle={() => toggleSection("accessories")}
                isActive={isNavActive("/accessories")}
                onClose={() => setMobileOpen(false)}
              />
            </div>

            {/* Divider */}
            <div className="h-px bg-border-subtle my-3" />

            {/* ── Tools & Resources ── */}
            <p className="px-4 text-[10px] font-semibold uppercase tracking-wider text-text-muted mb-2">
              Tools & Resources
            </p>
            <div className="space-y-0.5">
              <Link href="/search" onClick={() => setMobileOpen(false)} className={mobileLinkClass(isNavActive("/search"))}>
                Search
              </Link>
              <Link href="/glossary" onClick={() => setMobileOpen(false)} className={mobileLinkClass(isNavActive("/glossary"))}>
                Glossary
              </Link>
              <Link href="/group-buys" onClick={() => setMobileOpen(false)} className={mobileLinkClass(isNavActive("/group-buys"))}>
                Group Buys
              </Link>
              <Link href="/studio" onClick={() => setMobileOpen(false)} className={mobileLinkClass(isNavActive("/studio"))}>
                Studio
              </Link>
              {isSignedIn && (
                <Link href="/builds" onClick={() => setMobileOpen(false)} className={mobileLinkClass(isNavActive("/builds"))}>
                  My Builds
                </Link>
              )}
              {isSignedIn && (
                <Link href="/account" onClick={() => setMobileOpen(false)} className={mobileLinkClass(isNavActive("/account"))}>
                  Account
                </Link>
              )}
              <Link href="/pricing" onClick={() => setMobileOpen(false)} className={mobileLinkClass(isNavActive("/pricing"))}>
                Pricing
                {isSignedIn && isPro && <span className="ml-2"><ProBadge /></span>}
              </Link>
            </div>

            {/* Mobile subscription status */}
            {isSignedIn && !subLoading && !isPro && (
              <div className="px-4 py-2 mt-1">
                <UsageCounter buildsUsed={buildsUsed} buildsLimit={buildsLimit} />
              </div>
            )}

            {/* ── Full-width CTA ── */}
            <div className="mt-4">
              <Link
                href="/builder"
                onClick={() => setMobileOpen(false)}
                className="flex items-center justify-center gap-2 w-full px-4 py-3 rounded-lg text-sm font-semibold bg-accent text-bg-primary shadow-accent-sm hover:bg-accent-hover active:scale-[0.98] transition-[background-color,transform] duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/50"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
                </svg>
                Start a Build
              </Link>
            </div>
          </nav>
        </div>
      </div>
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
  const contentRef = useRef<HTMLDivElement>(null);
  const [contentHeight, setContentHeight] = useState(0);

  useEffect(() => {
    if (contentRef.current) {
      setContentHeight(contentRef.current.scrollHeight);
    }
  }, [expanded, columns]);

  return (
    <div>
      <button
        onClick={onToggle}
        aria-expanded={expanded}
        className={cn(
          "flex items-center justify-between w-full px-4 py-3 rounded-lg text-sm font-medium transition-[background-color,color] duration-150",
          "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/50",
          isActive
            ? "text-accent bg-accent-dim"
            : "text-text-secondary hover:text-text-primary hover:bg-bg-tint"
        )}
      >
        {label}
        <svg
          className={cn(
            "w-3.5 h-3.5 transition-transform duration-200",
            expanded && "rotate-180"
          )}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {/* Animated content area */}
      <div
        className="overflow-hidden transition-[max-height,opacity] duration-200"
        style={{
          maxHeight: expanded ? `${contentHeight}px` : "0px",
          opacity: expanded ? 1 : 0,
        }}
      >
        <div ref={contentRef} className="ml-3 mt-1 mb-2">
          <Link
            href={href}
            onClick={onClose}
            className="flex items-center px-4 py-2 rounded-lg text-sm font-medium text-accent hover:bg-bg-tint transition-colors duration-150"
          >
            View all {label.toLowerCase()} &rarr;
          </Link>
          {columns.map((col) => (
            <div key={col.heading} className="mt-2">
              <p className="px-4 text-[10px] text-text-muted uppercase tracking-wider font-semibold mb-1">
                {col.heading}
              </p>
              {col.links.map((link) => (
                <Link
                  key={link.href + link.label}
                  href={link.href}
                  onClick={onClose}
                  className="flex items-center px-4 py-1.5 rounded-lg text-sm text-text-secondary hover:text-text-primary hover:bg-bg-tint transition-colors duration-150"
                >
                  {link.label}
                </Link>
              ))}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
