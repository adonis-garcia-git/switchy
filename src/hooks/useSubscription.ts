"use client";

import { useQuery } from "convex/react";
import { api } from "../../convex/_generated/api";
import type { UserTier } from "@/lib/types";

const FREE_LIMIT = 3;

export function useSubscription() {
  const subscription = useQuery(api.subscriptions.getUserSubscription, {});
  const usage = useQuery(api.usage.getMonthlyUsage, {});

  const isLoading = subscription === undefined || usage === undefined;

  const tier: UserTier = usage?.tier ?? "free";
  const isPro = tier === "pro";

  const buildsUsed = usage?.count ?? 0;
  const buildsLimit = usage?.limit ?? FREE_LIMIT;
  const buildsRemaining = usage?.remaining ?? FREE_LIMIT;
  const isAtLimit = buildsRemaining <= 0 && !isPro;

  return {
    tier,
    isPro,
    subscription,
    buildsUsed,
    buildsLimit,
    buildsRemaining,
    isAtLimit,
    isLoading,
  };
}
