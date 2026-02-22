/**
 * TEMPORARY GUEST AUTH BYPASS FOR DEMO MODE
 * Provides a fallback userId when no Clerk JWT is present (i.e. no auth provider).
 * To restore, revert Convex functions to their original auth check patterns.
 */

const GUEST_USER_ID = "guest_demo_user";

/**
 * Returns the authenticated userId, or falls back to GUEST_USER_ID for demo mode.
 * Use this in place of the standard auth-check-and-throw pattern.
 */
export async function getGuestUserId(
  ctx: { auth: { getUserIdentity: () => Promise<{ subject: string } | null> } }
): Promise<string> {
  const identity = await ctx.auth.getUserIdentity();
  return identity?.subject ?? GUEST_USER_ID;
}
