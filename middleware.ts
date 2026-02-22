// TEMPORARY: Clerk middleware disabled for demo mode.
// Original: import { clerkMiddleware } from "@clerk/nextjs/server"; export default clerkMiddleware();

export default function middleware() {}

export const config = {
  matcher: [],
};
