"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { SignInButton, UserButton, useUser } from "@clerk/nextjs";
import { cn } from "@/lib/utils";

const NAV_ITEMS = [
  { href: "/", label: "Home", icon: "🏠" },
  { href: "/advisor", label: "Build Advisor", icon: "🤖" },
  { href: "/wizard", label: "Build Wizard", icon: "🧙" },
  { href: "/switches", label: "Switches", icon: "🔘" },
  { href: "/keyboards", label: "Keyboards", icon: "⌨️" },
  { href: "/glossary", label: "Glossary", icon: "📖" },
  { href: "/group-buys", label: "Group Buys", icon: "📦" },
  { href: "/builds", label: "My Builds", icon: "💾" },
];

export function Navigation() {
  const pathname = usePathname();
  const { isSignedIn } = useUser();
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <>
      {/* Desktop Sidebar */}
      <aside className="hidden lg:flex flex-col fixed left-0 top-0 bottom-0 w-60 bg-bg-surface border-r border-border-default z-40">
        <div className="p-5 border-b border-border-default">
          <Link href="/" className="flex items-center gap-2">
            <span className="text-xl font-bold text-accent">Switchy</span>
            <span className="text-xs text-text-muted font-mono">v2</span>
          </Link>
        </div>

        <nav className="flex-1 p-3 space-y-1 overflow-y-auto">
          {NAV_ITEMS.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors",
                pathname === item.href
                  ? "text-accent bg-accent/10"
                  : "text-text-secondary hover:text-text-primary hover:bg-bg-elevated"
              )}
            >
              <span className="text-base">{item.icon}</span>
              {item.label}
            </Link>
          ))}
        </nav>

        <div className="p-4 border-t border-border-default">
          {isSignedIn ? (
            <div className="flex items-center gap-3">
              <UserButton
                appearance={{
                  elements: { avatarBox: "w-8 h-8" },
                }}
              />
              <span className="text-sm text-text-secondary">Account</span>
            </div>
          ) : (
            <SignInButton mode="modal">
              <button className="w-full px-4 py-2 text-sm font-medium rounded-lg bg-accent text-bg-primary hover:bg-accent-hover transition-colors">
                Sign In
              </button>
            </SignInButton>
          )}
        </div>
      </aside>

      {/* Mobile Top Bar */}
      <header className="lg:hidden fixed top-0 left-0 right-0 h-14 bg-bg-surface/95 backdrop-blur-sm border-b border-border-default z-50 flex items-center justify-between px-4">
        <button
          onClick={() => setMobileOpen(!mobileOpen)}
          className="p-2 text-text-secondary hover:text-text-primary"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            {mobileOpen ? (
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            ) : (
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            )}
          </svg>
        </button>

        <Link href="/" className="flex items-center gap-2">
          <span className="text-lg font-bold text-accent">Switchy</span>
        </Link>

        <div>
          {isSignedIn ? (
            <UserButton appearance={{ elements: { avatarBox: "w-8 h-8" } }} />
          ) : (
            <SignInButton mode="modal">
              <button className="px-3 py-1.5 text-sm font-medium rounded-lg bg-accent text-bg-primary hover:bg-accent-hover transition-colors">
                Sign In
              </button>
            </SignInButton>
          )}
        </div>
      </header>

      {/* Mobile Sidebar Overlay */}
      {mobileOpen && (
        <div className="lg:hidden fixed inset-0 z-40">
          <div className="fixed inset-0 bg-black/50" onClick={() => setMobileOpen(false)} />
          <div className="fixed left-0 top-0 bottom-0 w-64 bg-bg-surface border-r border-border-default p-4 pt-16">
            <nav className="space-y-1">
              {NAV_ITEMS.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setMobileOpen(false)}
                  className={cn(
                    "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors",
                    pathname === item.href
                      ? "text-accent bg-accent/10"
                      : "text-text-secondary hover:text-text-primary hover:bg-bg-elevated"
                  )}
                >
                  <span className="text-base">{item.icon}</span>
                  {item.label}
                </Link>
              ))}
            </nav>
          </div>
        </div>
      )}
    </>
  );
}
