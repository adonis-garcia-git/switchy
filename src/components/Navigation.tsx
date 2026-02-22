"use client";

import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { SignInButton, UserButton, useUser } from "@clerk/nextjs";
import { cn } from "@/lib/utils";
import { ThemeToggle } from "@/components/ThemeToggle";

const ACCESSORIES_ITEMS = [
  { href: "/glossary", label: "Glossary" },
  { href: "/group-buys", label: "Group Buys" },
  { href: "/accessories", label: "Accessories" },
];

export function Navigation() {
  const pathname = usePathname();
  const { isSignedIn } = useUser();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [accessoriesOpen, setAccessoriesOpen] = useState(false);
  const accessoriesRef = useRef<HTMLDivElement>(null);

  // Close accessories dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (accessoriesRef.current && !accessoriesRef.current.contains(event.target as Node)) {
        setAccessoriesOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const isNavActive = (href: string) =>
    pathname === href || (href !== "/" && pathname.startsWith(href));

  const isAccessoriesActive = ACCESSORIES_ITEMS.some((item) => isNavActive(item.href));

  return (
    <>
      {/* Top Navigation Bar */}
      <header className="fixed top-0 left-0 right-0 h-16 bg-black/95 backdrop-blur-xl border-b border-white/10 z-50">
        <div className="h-full max-w-[1440px] mx-auto px-4 sm:px-6 flex items-center justify-between">
          {/* Left: Logo + Nav Links */}
          <div className="flex items-center gap-8">
            <Link href="/" className="flex items-center shrink-0">
              <img src="/logo.png" alt="Switchy" className="h-40 w-auto" />
            </Link>

            {/* Desktop Nav Links */}
            <nav className="hidden lg:flex items-center gap-1.5 font-[family-name:var(--font-outfit)]">
              {/* Switches */}
              <Link
                href="/switches"
                className={cn(
                  "px-5 py-2.5 rounded-2xl text-sm font-medium transition-[background-color,color,transform] duration-150",
                  isNavActive("/switches")
                    ? "bg-accent-dim border border-accent/20 text-accent"
                    : "bg-white/5 text-white/60 hover:bg-white/10 hover:text-white active:scale-[0.97]"
                )}
              >
                Switches
              </Link>

              {/* Keyboards */}
              <Link
                href="/keyboards"
                className={cn(
                  "px-5 py-2.5 rounded-2xl text-sm font-medium transition-[background-color,color,transform] duration-150",
                  isNavActive("/keyboards")
                    ? "bg-accent-dim border border-accent/20 text-accent"
                    : "bg-white/5 text-white/60 hover:bg-white/10 hover:text-white active:scale-[0.97]"
                )}
              >
                Keyboards
              </Link>

              {/* Accessories Dropdown */}
              <div
                ref={accessoriesRef}
                className="relative"
                onMouseEnter={() => setAccessoriesOpen(true)}
                onMouseLeave={() => setAccessoriesOpen(false)}
              >
                <button
                  onClick={() => setAccessoriesOpen(!accessoriesOpen)}
                  className={cn(
                    "px-5 py-2.5 rounded-2xl text-sm font-medium transition-[background-color,color,transform] duration-150 flex items-center gap-1.5",
                    "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/50",
                    isAccessoriesActive
                      ? "bg-accent-dim border border-accent/20 text-accent"
                      : "bg-white/5 text-white/60 hover:bg-white/10 hover:text-white active:scale-[0.97]"
                  )}
                >
                  Accessories
                  <svg
                    className={cn(
                      "w-3.5 h-3.5 transition-transform duration-150",
                      accessoriesOpen && "rotate-180"
                    )}
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </button>

                {/* Dropdown Panel */}
                {accessoriesOpen && (
                  <div className="absolute top-full left-0 mt-2 w-56 rounded-2xl bg-neutral-900 border border-white/10 shadow-floating p-2">
                    {ACCESSORIES_ITEMS.map((item) => (
                      <Link
                        key={item.href}
                        href={item.href}
                        onClick={() => setAccessoriesOpen(false)}
                        className={cn(
                          "flex items-center px-4 py-2.5 rounded-xl text-sm font-medium transition-[background-color,color] duration-150",
                          "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/50",
                          isNavActive(item.href)
                            ? "text-accent bg-accent-dim"
                            : "text-white/60 hover:text-white hover:bg-white/10"
                        )}
                      >
                        {item.label}
                      </Link>
                    ))}
                  </div>
                )}
              </div>

              {/* Builder CTA */}
              <Link
                href="/builder"
                className={cn(
                  "px-5 py-2.5 rounded-2xl text-sm font-medium transition-[background-color,color,transform] duration-150",
                  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/50",
                  isNavActive("/builder")
                    ? "bg-accent text-bg-primary shadow-accent-sm scale-[0.97]"
                    : "bg-accent text-bg-primary shadow-accent-sm hover:bg-accent-hover active:scale-[0.97]"
                )}
              >
                Builder
              </Link>

              {/* My Builds (auth-gated) */}
              {isSignedIn && (
                <Link
                  href="/builds"
                  className={cn(
                    "px-5 py-2.5 rounded-2xl text-sm font-medium transition-[background-color,color,transform] duration-150",
                    "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/50",
                    isNavActive("/builds")
                      ? "bg-accent-dim border border-accent/20 text-accent"
                      : "bg-white/5 text-white/60 hover:bg-white/10 hover:text-white active:scale-[0.97]"
                  )}
                >
                  My Builds
                </Link>
              )}
            </nav>
          </div>

          {/* Right: Auth */}
          <div className="flex items-center gap-3">
            <ThemeToggle />

            {/* Mobile hamburger */}
            <button
              onClick={() => setMobileOpen(!mobileOpen)}
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
          <div className="relative bg-neutral-900 border-b border-white/10 shadow-floating">
            <nav className="max-w-[1440px] mx-auto px-4 py-3 space-y-0.5 font-[family-name:var(--font-outfit)]">
              {/* Switches */}
              <Link
                href="/switches"
                onClick={() => setMobileOpen(false)}
                className={cn(
                  "flex items-center px-5 py-2.5 rounded-2xl text-sm font-medium transition-[background-color,color] duration-150",
                  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/50",
                  isNavActive("/switches")
                    ? "text-accent bg-accent-dim border border-accent/20"
                    : "text-white/60 hover:text-white hover:bg-white/10"
                )}
              >
                Switches
              </Link>

              {/* Keyboards */}
              <Link
                href="/keyboards"
                onClick={() => setMobileOpen(false)}
                className={cn(
                  "flex items-center px-5 py-2.5 rounded-2xl text-sm font-medium transition-[background-color,color] duration-150",
                  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/50",
                  isNavActive("/keyboards")
                    ? "text-accent bg-accent-dim border border-accent/20"
                    : "text-white/60 hover:text-white hover:bg-white/10"
                )}
              >
                Keyboards
              </Link>

              {/* Accessories Section */}
              <div className="pt-3 pb-1">
                <p className="px-5 text-[10px] text-white/40 uppercase tracking-wider font-semibold">
                  Accessories
                </p>
              </div>
              {ACCESSORIES_ITEMS.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setMobileOpen(false)}
                  className={cn(
                    "flex items-center px-5 py-2.5 rounded-2xl text-sm font-medium transition-[background-color,color] duration-150 ml-2",
                    "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/50",
                    isNavActive(item.href)
                      ? "text-accent bg-accent-dim border border-accent/20"
                      : "text-white/60 hover:text-white hover:bg-white/10"
                  )}
                >
                  {item.label}
                </Link>
              ))}

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
