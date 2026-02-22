/**
 * TEMPORARY AUTH BYPASS FOR DEMO MODE
 * Replaces @clerk/nextjs imports so the app works without Clerk authentication.
 * To restore auth, revert all imports back to "@clerk/nextjs".
 */
"use client";

import React from "react";

const GUEST_USER = {
  id: "guest_demo_user",
  firstName: "Guest",
  lastName: "User",
  fullName: "Guest User",
  primaryEmailAddress: { emailAddress: "guest@switchy.demo" },
  imageUrl: "",
};

export function useUser() {
  return {
    isSignedIn: true,
    isLoaded: true,
    user: GUEST_USER,
  };
}

export function useAuth() {
  return {
    isSignedIn: true,
    isLoaded: true,
    userId: "guest_demo_user",
    getToken: async () => null,
  };
}

/** Renders children directly — no sign-in gate. */
export function SignInButton({ children }: { children?: React.ReactNode; mode?: string }) {
  return <>{children}</>;
}

/** Simple avatar stand-in for the Clerk UserButton. */
function UserButtonRoot(_props: any) {
  return (
    <div className="w-8 h-8 rounded-full bg-accent/20 border border-accent/30 flex items-center justify-center text-xs font-bold text-accent select-none">
      G
    </div>
  );
}

/* Sub-components that Navigation uses (UserButton.MenuItems / UserButton.Link) */
UserButtonRoot.MenuItems = function MenuItems({ children }: { children?: React.ReactNode }) {
  return null;
};
UserButtonRoot.Link = function UserLink(_props: any) {
  return null;
};

export const UserButton = UserButtonRoot;

export function SignedIn({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}

export function SignedOut(_props: { children?: React.ReactNode }) {
  return null;
}

export function ClerkProvider({ children }: { children: React.ReactNode; [key: string]: any }) {
  return <>{children}</>;
}
