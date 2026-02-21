"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { SignInButton, UserButton, useUser } from "@clerk/nextjs";
import { cn } from "@/lib/utils";

const NAV_ITEMS = [
  { href: "/", label: "Home" },
  { href: "/advisor", label: "Build Advisor" },
  { href: "/switches", label: "Switches" },
  { href: "/group-buys", label: "Group Buys" },
  { href: "/builds", label: "My Builds" },
];

export function Navigation() {
  const pathname = usePathname();
  const { isSignedIn } = useUser();

  return (
    <nav className="border-b border-border-default bg-bg-surface/80 backdrop-blur-sm sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center gap-8">
            <Link href="/" className="flex items-center gap-2">
              <span className="text-xl font-bold text-accent">Switchy</span>
              <span className="text-xs text-text-muted font-mono hidden sm:inline">
                v0.1
              </span>
            </Link>
            <div className="hidden md:flex items-center gap-1">
              {NAV_ITEMS.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    "px-3 py-2 rounded-md text-sm font-medium transition-colors",
                    pathname === item.href
                      ? "text-accent bg-accent-dim"
                      : "text-text-secondary hover:text-text-primary hover:bg-bg-elevated"
                  )}
                >
                  {item.label}
                </Link>
              ))}
            </div>
          </div>
          <div className="flex items-center gap-4">
            {isSignedIn ? (
              <UserButton
                appearance={{
                  elements: {
                    avatarBox: "w-8 h-8",
                  },
                }}
              />
            ) : (
              <SignInButton mode="modal">
                <button className="px-4 py-2 text-sm font-medium rounded-md bg-accent text-bg-primary hover:bg-accent-hover transition-colors">
                  Sign In
                </button>
              </SignInButton>
            )}
          </div>
        </div>
        {/* Mobile nav */}
        <div className="md:hidden flex gap-1 pb-3 overflow-x-auto">
          {NAV_ITEMS.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "px-3 py-1.5 rounded-md text-xs font-medium whitespace-nowrap transition-colors",
                pathname === item.href
                  ? "text-accent bg-accent-dim"
                  : "text-text-secondary hover:text-text-primary"
              )}
            >
              {item.label}
            </Link>
          ))}
        </div>
      </div>
    </nav>
  );
}
