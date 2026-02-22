"use client";

// TEMPORARY: Clerk removed for demo mode. Using plain ConvexProvider.
// To restore: revert to ConvexProviderWithClerk + ClerkProvider.

import { ReactNode } from "react";
import { ConvexReactClient, ConvexProvider } from "convex/react";

const convex = new ConvexReactClient(process.env.NEXT_PUBLIC_CONVEX_URL!);

export function ConvexClientProvider({ children }: { children: ReactNode }) {
  return (
    <ConvexProvider client={convex}>
      {children}
    </ConvexProvider>
  );
}
