"use client";

import { useState, Suspense } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useUser, SignInButton } from "@/lib/auth";
import { useAction } from "convex/react";
import { api } from "../../../convex/_generated/api";
import { useSubscription } from "@/hooks/useSubscription";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { Card } from "@/components/ui/Card";
import { Skeleton } from "@/components/ui/Skeleton";
import { cn } from "@/lib/utils";

// ── Success Banner (reads ?upgraded=true) ──

function SuccessBanner() {
  const searchParams = useSearchParams();
  const [dismissed, setDismissed] = useState(false);
  const showBanner = searchParams.get("upgraded") === "true" && !dismissed;

  if (!showBanner) return null;

  return (
    <div className="rounded-xl border border-emerald-500/25 bg-emerald-500/8 p-4 flex items-center gap-3 animate-in fade-in slide-in-from-top-2 duration-300">
      <div className="w-9 h-9 rounded-lg bg-emerald-500/15 border border-emerald-500/20 flex items-center justify-center shrink-0">
        <svg className="w-5 h-5 text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-semibold text-emerald-400 font-[family-name:var(--font-outfit)]">
          Welcome to Pro!
        </p>
        <p className="text-xs text-emerald-400/70 mt-0.5">
          Your subscription is active. Enjoy unlimited builds and premium features.
        </p>
      </div>
      <button
        onClick={() => setDismissed(true)}
        className="p-1.5 rounded-lg text-emerald-400/60 hover:text-emerald-400 hover:bg-emerald-500/10 transition-colors duration-150 shrink-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500/40"
        aria-label="Dismiss"
      >
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
        </svg>
      </button>
    </div>
  );
}

// ── Helpers ──

function formatDate(epochMs: number): string {
  return new Date(epochMs).toLocaleDateString("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
  });
}

function getFirstOfNextMonth(): string {
  const now = new Date();
  const next = new Date(now.getFullYear(), now.getMonth() + 1, 1);
  return next.toLocaleDateString("en-US", { month: "long", day: "numeric" });
}

function getCurrentMonthName(): string {
  return new Date().toLocaleDateString("en-US", { month: "long" });
}

// ── Plan Status helpers ──

type PlanStatus = "free" | "active" | "canceling" | "past_due";

function getPlanStatus(isPro: boolean, subscription: any): PlanStatus {
  if (!isPro || !subscription) return "free";
  if (subscription.status === "past_due") return "past_due";
  if (subscription.cancelAtPeriodEnd) return "canceling";
  return "active";
}

function getStatusBadge(status: PlanStatus) {
  switch (status) {
    case "active":
      return <Badge variant="success" size="sm">Active</Badge>;
    case "canceling":
      return <Badge variant="warning" size="sm">Canceling</Badge>;
    case "past_due":
      return <Badge variant="warning" size="sm">Past Due</Badge>;
    default:
      return <Badge variant="default" size="sm">Free</Badge>;
  }
}

// ── Section Icon wrapper ──

function SectionIcon({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <div className={cn("w-10 h-10 rounded-xl flex items-center justify-center shrink-0", className)}>
      {children}
    </div>
  );
}

// ── Account Content ──

function AccountContent() {
  const { isSignedIn, user } = useUser();
  const { isPro, subscription, buildsUsed, buildsLimit, buildsRemaining, isLoading } = useSubscription();
  const createCheckout = useAction(api.stripe.createCheckoutSession);
  const createPortal = useAction(api.stripe.createBillingPortalSession);

  const [loadingCheckout, setLoadingCheckout] = useState(false);
  const [loadingPortal, setLoadingPortal] = useState<string | null>(null);

  const handleUpgrade = async () => {
    setLoadingCheckout(true);
    try {
      const { url } = await createCheckout({});
      window.location.href = url;
    } catch (err) {
      console.error("Failed to create checkout:", err);
      setLoadingCheckout(false);
    }
  };

  const handlePortal = async (context: string) => {
    setLoadingPortal(context);
    try {
      const { url } = await createPortal({});
      window.location.href = url;
    } catch (err) {
      console.error("Failed to open billing portal:", err);
      setLoadingPortal(null);
    }
  };

  // ── Auth gate ──
  if (!isSignedIn) {
    return (
      <div className="max-w-lg mx-auto py-16 text-center">
        <Card className="p-8">
          <div className="w-14 h-14 rounded-2xl bg-accent/10 border border-accent/20 flex items-center justify-center mx-auto mb-5">
            <svg className="w-7 h-7 text-accent" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z" />
            </svg>
          </div>
          <h1 className="text-2xl font-bold text-text-primary font-[family-name:var(--font-outfit)] tracking-tight mb-3">
            Account
          </h1>
          <p className="text-sm text-text-muted mb-6 leading-relaxed">
            Sign in to view your plan, usage, and manage billing.
          </p>
          <SignInButton mode="modal">
            <Button>Sign In</Button>
          </SignInButton>
        </Card>
      </div>
    );
  }

  // ── Loading state ──
  if (isLoading) {
    return (
      <div className="space-y-6">
        <Skeleton variant="card" className="h-48 rounded-xl" />
        <Skeleton variant="card" className="h-36 rounded-xl" />
        <Skeleton variant="card" className="h-48 rounded-xl" />
      </div>
    );
  }

  const planStatus = getPlanStatus(isPro, subscription);
  const usagePercent = isPro ? 0 : buildsLimit > 0 ? Math.min(100, (buildsUsed / buildsLimit) * 100) : 0;

  return (
    <div className="space-y-6">
      {/* ── Success banner ── */}
      <Suspense fallback={null}>
        <SuccessBanner />
      </Suspense>

      {/* ── Section A: Plan Overview ── */}
      <Card className="p-6">
        <div className="flex items-start justify-between gap-4 mb-5">
          <div className="flex items-center gap-3">
            <SectionIcon className="bg-accent/10 border border-accent/20">
              <svg className="w-5 h-5 text-accent" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09zM18.259 8.715L18 9.75l-.259-1.035a3.375 3.375 0 00-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 002.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 002.455 2.456L21.75 6l-1.036.259a3.375 3.375 0 00-2.455 2.456z" />
              </svg>
            </SectionIcon>
            <div>
              <div className="flex items-center gap-2.5">
                <h2 className="text-lg font-bold text-text-primary font-[family-name:var(--font-outfit)] tracking-tight">
                  {isPro ? "Pro" : "Free"} Plan
                </h2>
                {getStatusBadge(planStatus)}
              </div>
              {user && (
                <p className="text-xs text-text-muted mt-0.5">{user.primaryEmailAddress?.emailAddress}</p>
              )}
            </div>
          </div>

          {isPro && (
            <span className="text-2xl font-bold text-text-primary font-[family-name:var(--font-mono)] tracking-tight">
              $7.99<span className="text-sm font-normal text-text-muted">/mo</span>
            </span>
          )}
        </div>

        {/* Renewal / expiration info */}
        {isPro && subscription && (
          <div className={cn(
            "rounded-lg px-4 py-3 text-sm mb-5",
            planStatus === "past_due"
              ? "bg-red-500/8 border border-red-500/20 text-red-400"
              : planStatus === "canceling"
                ? "bg-warning/8 border border-warning/20 text-warning"
                : "bg-bg-elevated border border-border-subtle text-text-secondary"
          )}>
            {planStatus === "past_due" ? (
              <div className="flex items-center gap-2">
                <svg className="w-4 h-4 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" />
                </svg>
                Payment failed — please update your payment method to keep your Pro access.
              </div>
            ) : planStatus === "canceling" ? (
              <div className="flex items-center gap-2">
                <svg className="w-4 h-4 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                Your plan expires on {formatDate(subscription.currentPeriodEnd)}. You&apos;ll switch to Free after that.
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <svg className="w-4 h-4 shrink-0 text-text-muted" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0l3.181 3.183a8.25 8.25 0 0013.803-3.7M4.031 9.865a8.25 8.25 0 0113.803-3.7l3.181 3.182M2.985 19.644l3.181-3.183" />
                </svg>
                Renews on {formatDate(subscription.currentPeriodEnd)}
              </div>
            )}
          </div>
        )}

        {/* CTAs based on plan status */}
        {planStatus === "free" && (
          <Button onClick={handleUpgrade} loading={loadingCheckout} className="w-full sm:w-auto">
            <svg className="w-4 h-4 mr-1.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09z" />
            </svg>
            Upgrade to Pro
          </Button>
        )}
        {planStatus === "canceling" && (
          <Button onClick={() => handlePortal("resubscribe")} loading={loadingPortal === "resubscribe"}>
            Resubscribe
          </Button>
        )}
        {planStatus === "past_due" && (
          <Button variant="danger" onClick={() => handlePortal("payment")} loading={loadingPortal === "payment"}>
            Update Payment Method
          </Button>
        )}
      </Card>

      {/* ── Section B: Usage Stats ── */}
      <Card className="p-6">
        <div className="flex items-center gap-3 mb-5">
          <SectionIcon className="bg-bg-elevated border border-border-subtle">
            <svg className="w-5 h-5 text-text-secondary" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M3 13.125C3 12.504 3.504 12 4.125 12h2.25c.621 0 1.125.504 1.125 1.125v6.75C7.5 20.496 6.996 21 6.375 21h-2.25A1.125 1.125 0 013 19.875v-6.75zM9.75 8.625c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v11.25c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V8.625zM16.5 4.125c0-.621.504-1.125 1.125-1.125h2.25C20.496 3 21 3.504 21 4.125v15.75c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V4.125z" />
            </svg>
          </SectionIcon>
          <div>
            <h2 className="text-lg font-bold text-text-primary font-[family-name:var(--font-outfit)] tracking-tight">
              {getCurrentMonthName()} Usage
            </h2>
            <p className="text-xs text-text-muted mt-0.5">AI build generations</p>
          </div>
        </div>

        <div className="space-y-4">
          {/* Main stat */}
          <div>
            {isPro ? (
              <div className="flex items-baseline gap-2">
                <span className="text-3xl font-bold text-text-primary font-[family-name:var(--font-mono)] tracking-tight">
                  {buildsUsed}
                </span>
                <span className="text-sm text-text-muted">builds used</span>
                <span className="ml-auto inline-flex items-center px-2.5 py-1 rounded-lg bg-accent/10 border border-accent/20 text-xs font-semibold text-accent">
                  Unlimited
                </span>
              </div>
            ) : (
              <div>
                <div className="flex items-baseline gap-2 mb-3">
                  <span className="text-3xl font-bold text-text-primary font-[family-name:var(--font-mono)] tracking-tight">
                    {buildsUsed}
                  </span>
                  <span className="text-sm text-text-muted">/ {buildsLimit} builds</span>
                  <span className="ml-auto text-xs text-text-muted font-[family-name:var(--font-mono)]">
                    {buildsRemaining} remaining
                  </span>
                </div>
                {/* Progress bar */}
                <div className="h-2 rounded-full bg-bg-elevated border border-border-subtle overflow-hidden">
                  <div
                    className={cn(
                      "h-full rounded-full transition-[width] duration-500",
                      usagePercent >= 100
                        ? "bg-red-500"
                        : usagePercent >= 67
                          ? "bg-warning"
                          : "bg-accent"
                    )}
                    style={{ width: `${usagePercent}%` }}
                  />
                </div>
              </div>
            )}
          </div>

          {/* Reset date */}
          <p className="text-xs text-text-muted">
            Resets {getFirstOfNextMonth()}
          </p>
        </div>
      </Card>

      {/* ── Section C: Billing & Payments (Pro only) ── */}
      {isPro && (
        <Card className="p-6">
          <div className="flex items-center gap-3 mb-5">
            <SectionIcon className="bg-bg-elevated border border-border-subtle">
              <svg className="w-5 h-5 text-text-secondary" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 8.25h19.5M2.25 9h19.5m-16.5 5.25h6m-6 2.25h3m-3.75 3h15a2.25 2.25 0 002.25-2.25V6.75A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25v10.5A2.25 2.25 0 004.5 19.5z" />
              </svg>
            </SectionIcon>
            <h2 className="text-lg font-bold text-text-primary font-[family-name:var(--font-outfit)] tracking-tight">
              Billing & Payments
            </h2>
          </div>

          <div className="divide-y divide-border-subtle">
            {/* Payment Method */}
            <div className="flex items-center gap-4 py-4 first:pt-0">
              <div className="w-9 h-9 rounded-lg bg-bg-elevated border border-border-subtle flex items-center justify-center shrink-0">
                <svg className="w-4.5 h-4.5 text-text-muted" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 8.25h19.5M2.25 9h19.5m-16.5 5.25h6m-6 2.25h3m-3.75 3h15a2.25 2.25 0 002.25-2.25V6.75A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25v10.5A2.25 2.25 0 004.5 19.5z" />
                </svg>
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-text-primary">Payment Method</p>
                <p className="text-xs text-text-muted mt-0.5">Update your card or payment details</p>
              </div>
              <Button
                variant="secondary"
                size="sm"
                onClick={() => handlePortal("payment")}
                loading={loadingPortal === "payment"}
              >
                Manage
              </Button>
            </div>

            {/* Invoices */}
            <div className="flex items-center gap-4 py-4">
              <div className="w-9 h-9 rounded-lg bg-bg-elevated border border-border-subtle flex items-center justify-center shrink-0">
                <svg className="w-4.5 h-4.5 text-text-muted" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />
                </svg>
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-text-primary">Invoices</p>
                <p className="text-xs text-text-muted mt-0.5">View and download past invoices</p>
              </div>
              <Button
                variant="secondary"
                size="sm"
                onClick={() => handlePortal("invoices")}
                loading={loadingPortal === "invoices"}
              >
                View Invoices
              </Button>
            </div>

            {/* Cancel or Resubscribe */}
            <div className="flex items-center gap-4 py-4 last:pb-0">
              <div className="w-9 h-9 rounded-lg bg-bg-elevated border border-border-subtle flex items-center justify-center shrink-0">
                {planStatus === "canceling" ? (
                  <svg className="w-4.5 h-4.5 text-text-muted" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0l3.181 3.183a8.25 8.25 0 0013.803-3.7M4.031 9.865a8.25 8.25 0 0113.803-3.7l3.181 3.182M2.985 19.644l3.181-3.183" />
                  </svg>
                ) : (
                  <svg className="w-4.5 h-4.5 text-text-muted" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                )}
              </div>
              <div className="flex-1 min-w-0">
                {planStatus === "canceling" ? (
                  <>
                    <p className="text-sm font-medium text-text-primary">Resubscribe</p>
                    <p className="text-xs text-text-muted mt-0.5">Resume your Pro subscription</p>
                  </>
                ) : (
                  <>
                    <p className="text-sm font-medium text-text-primary">Cancel Subscription</p>
                    <p className="text-xs text-text-muted mt-0.5">You&apos;ll keep access until your billing period ends</p>
                  </>
                )}
              </div>
              {planStatus === "canceling" ? (
                <Button
                  size="sm"
                  onClick={() => handlePortal("resubscribe")}
                  loading={loadingPortal === "resubscribe"}
                >
                  Resubscribe
                </Button>
              ) : (
                <Button
                  variant="danger"
                  size="sm"
                  onClick={() => handlePortal("cancel")}
                  loading={loadingPortal === "cancel"}
                >
                  Cancel Plan
                </Button>
              )}
            </div>
          </div>
        </Card>
      )}

      {/* ── Upgrade CTA for free users ── */}
      {!isPro && (
        <div className="rounded-xl bg-bg-elevated border border-border-subtle p-6 sm:p-8 text-center grain relative overflow-hidden">
          <div className="relative z-10">
            <h3 className="text-xl font-bold text-text-primary font-[family-name:var(--font-outfit)] tracking-tight">
              Unlock unlimited builds
            </h3>
            <p className="text-sm text-text-secondary mt-2 max-w-md mx-auto leading-relaxed">
              Upgrade to Pro for unlimited AI build recommendations, advanced filters, PDF exports, and more.
            </p>
            <div className="mt-5 flex items-center justify-center gap-3">
              <Button onClick={handleUpgrade} loading={loadingCheckout}>
                Upgrade to Pro — $7.99/mo
              </Button>
              <Link href="/pricing">
                <Button variant="ghost" size="sm">Compare plans</Button>
              </Link>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ── Page ──

export default function AccountPage() {
  return (
    <div className="p-6 lg:p-8">
      <div className="max-w-2xl mx-auto">
        <h1 className="text-2xl font-bold text-text-primary font-[family-name:var(--font-outfit)] tracking-tight mb-6">
          Account
        </h1>
        <Suspense fallback={
          <div className="space-y-6">
            <Skeleton variant="card" className="h-48 rounded-xl" />
            <Skeleton variant="card" className="h-36 rounded-xl" />
          </div>
        }>
          <AccountContent />
        </Suspense>
      </div>
    </div>
  );
}
