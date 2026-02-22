"use client";

import { useState } from "react";
import Link from "next/link";
import { useAction } from "convex/react";
import { useUser } from "@/lib/auth";
import { api } from "../../../convex/_generated/api";
import { useSubscription } from "@/hooks/useSubscription";
import { Button } from "@/components/ui/Button";
import { cn } from "@/lib/utils";

const FEATURES = [
  { feature: "AI build recommendations", free: "3 / month", pro: "Unlimited" },
  { feature: "Switch database", free: "Full access", pro: "Full access" },
  { feature: "Keyboard kit explorer", free: "Full access", pro: "Full access" },
  { feature: "Community ratings", free: "View only", pro: "View + vote" },
  { feature: "Advanced AI filters", free: false, pro: true },
  { feature: "Build tweaks & iterations", free: false, pro: true },
  { feature: "Export builds as PDF", free: false, pro: true },
  { feature: "Priority AI generation", free: false, pro: true },
  { feature: "Early access to new features", free: false, pro: true },
  { feature: "Build-as-a-service quotes", free: true, pro: true },
];

const FAQ = [
  {
    q: "Can I cancel my subscription anytime?",
    a: "Yes, you can cancel at any time from your account settings. You'll keep Pro access until the end of your current billing period.",
  },
  {
    q: "What happens when my free builds run out?",
    a: "You'll see a prompt to upgrade to Pro. Your existing builds and access to the switch/keyboard database are never affected — only AI build generation is limited.",
  },
  {
    q: "Do free builds reset every month?",
    a: "Yes, your 3 free builds reset at the start of each calendar month.",
  },
  {
    q: "Is there a yearly plan?",
    a: "Not yet, but we're working on it! Annual pricing with a discount is coming soon.",
  },
  {
    q: "What payment methods do you accept?",
    a: "We accept all major credit and debit cards through Stripe, including Visa, Mastercard, and American Express.",
  },
];

export default function PricingPage() {
  const { isSignedIn } = useUser();
  const { isPro, isLoading } = useSubscription();
  const [loadingCheckout, setLoadingCheckout] = useState(false);
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  const createCheckout = useAction(api.stripe.createCheckoutSession);

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

  return (
    <div className="min-h-screen">
      {/* Hero */}
      <section className="relative overflow-hidden">
        <div className="hero-gradient absolute inset-0" />
        <div className="relative max-w-4xl mx-auto px-4 sm:px-6 pt-16 pb-12 text-center">
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-text-primary font-[family-name:var(--font-outfit)] tracking-tight">
            Simple, Transparent Pricing
          </h1>
          <p className="text-base sm:text-lg text-text-secondary mt-4 max-w-xl mx-auto leading-relaxed">
            Start building for free. Upgrade when you need unlimited AI-powered build recommendations.
          </p>
        </div>
      </section>

      {/* Plan cards */}
      <section className="max-w-4xl mx-auto px-4 sm:px-6 -mt-2">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          {/* Free plan */}
          <div className="rounded-2xl border border-border-subtle bg-bg-surface p-6 shadow-surface">
            <div className="mb-6">
              <h3 className="text-sm font-semibold text-text-muted uppercase tracking-wider font-[family-name:var(--font-outfit)]">
                Free
              </h3>
              <div className="flex items-baseline gap-1 mt-2">
                <span className="text-4xl font-bold text-text-primary font-[family-name:var(--font-mono)]">$0</span>
                <span className="text-sm text-text-muted">/month</span>
              </div>
              <p className="text-sm text-text-secondary mt-2">
                Perfect for exploring the hobby and getting started.
              </p>
            </div>

            <ul className="space-y-3 mb-6">
              {["3 AI builds per month", "Full switch & keyboard database", "Community ratings", "Build-as-a-service quotes"].map((item) => (
                <li key={item} className="flex items-start gap-2.5 text-sm text-text-secondary">
                  <svg className="w-4 h-4 mt-0.5 text-text-muted shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  {item}
                </li>
              ))}
            </ul>

            <Button variant="secondary" className="w-full" disabled>
              Current Plan
            </Button>
          </div>

          {/* Pro plan */}
          <div className="rounded-2xl border border-accent/30 bg-bg-surface p-6 glow-pro relative">
            <div className="absolute -top-3 left-6">
              <span className="inline-flex items-center px-3 py-1 rounded-full bg-accent text-bg-primary text-[10px] font-bold uppercase tracking-wider font-[family-name:var(--font-outfit)]">
                Most Popular
              </span>
            </div>

            <div className="mb-6 mt-2">
              <h3 className="text-sm font-semibold text-accent uppercase tracking-wider font-[family-name:var(--font-outfit)]">
                Pro
              </h3>
              <div className="flex items-baseline gap-1 mt-2">
                <span className="text-4xl font-bold text-text-primary font-[family-name:var(--font-mono)]">$7.99</span>
                <span className="text-sm text-text-muted">/month</span>
              </div>
              <p className="text-sm text-text-secondary mt-2">
                For enthusiasts who want unlimited builds and premium features.
              </p>
            </div>

            <ul className="space-y-3 mb-6">
              {[
                "Unlimited AI builds",
                "Priority AI generation",
                "Advanced filters & sorting",
                "Build tweaks & iterations",
                "Export builds as PDF",
                "Early access to new features",
              ].map((item) => (
                <li key={item} className="flex items-start gap-2.5 text-sm text-text-secondary">
                  <svg className="w-4 h-4 mt-0.5 text-accent shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  {item}
                </li>
              ))}
            </ul>

            {!isLoading && isPro ? (
              <Link href="/account">
                <Button variant="secondary" className="w-full">
                  Manage Subscription
                </Button>
              </Link>
            ) : (
              <Button
                className="w-full"
                onClick={handleUpgrade}
                loading={loadingCheckout}
                disabled={!isSignedIn}
              >
                {isSignedIn ? "Upgrade to Pro" : "Sign in to upgrade"}
              </Button>
            )}
          </div>
        </div>
      </section>

      {/* Feature comparison table */}
      <section className="max-w-4xl mx-auto px-4 sm:px-6 mt-16">
        <h2 className="text-xl font-bold text-text-primary font-[family-name:var(--font-outfit)] tracking-tight text-center mb-8">
          Compare Plans
        </h2>
        <div className="rounded-2xl border border-border-subtle overflow-hidden">
          <div className="grid grid-cols-3 text-xs font-semibold uppercase tracking-wider text-text-muted bg-bg-elevated px-6 py-3">
            <span>Feature</span>
            <span className="text-center">Free</span>
            <span className="text-center">Pro</span>
          </div>
          {FEATURES.map((row, i) => (
            <div
              key={row.feature}
              className={cn(
                "grid grid-cols-3 px-6 py-3 text-sm border-t border-border-subtle",
                i % 2 === 1 && "bg-bg-elevated/50"
              )}
            >
              <span className="text-text-secondary">{row.feature}</span>
              <span className="text-center">
                {typeof row.free === "boolean" ? (
                  row.free ? (
                    <svg className="w-4 h-4 mx-auto text-text-muted" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                  ) : (
                    <span className="text-text-muted/40">&mdash;</span>
                  )
                ) : (
                  <span className="text-text-muted">{row.free}</span>
                )}
              </span>
              <span className="text-center">
                {typeof row.pro === "boolean" ? (
                  row.pro ? (
                    <svg className="w-4 h-4 mx-auto text-accent" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                  ) : (
                    <span className="text-text-muted/40">&mdash;</span>
                  )
                ) : (
                  <span className="text-accent font-medium">{row.pro}</span>
                )}
              </span>
            </div>
          ))}
        </div>
      </section>

      {/* FAQ */}
      <section className="max-w-2xl mx-auto px-4 sm:px-6 mt-16">
        <h2 className="text-xl font-bold text-text-primary font-[family-name:var(--font-outfit)] tracking-tight text-center mb-8">
          Frequently Asked Questions
        </h2>
        <div className="space-y-2">
          {FAQ.map((item, i) => (
            <div
              key={i}
              className="rounded-xl border border-border-subtle overflow-hidden"
            >
              <button
                onClick={() => setOpenFaq(openFaq === i ? null : i)}
                className={cn(
                  "flex items-center justify-between w-full px-5 py-4 text-left text-sm font-medium text-text-primary",
                  "hover:bg-bg-elevated/50 transition-colors duration-150",
                  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/40 focus-visible:ring-inset"
                )}
              >
                {item.q}
                <svg
                  className={cn(
                    "w-4 h-4 text-text-muted shrink-0 ml-4 transition-transform duration-200",
                    openFaq === i && "rotate-180"
                  )}
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </button>
              {openFaq === i && (
                <div className="px-5 pb-4 text-sm text-text-secondary leading-relaxed">
                  {item.a}
                </div>
              )}
            </div>
          ))}
        </div>
      </section>

      {/* Bottom CTA */}
      <section className="max-w-4xl mx-auto px-4 sm:px-6 mt-16 mb-16">
        <div className="rounded-2xl bg-bg-elevated border border-border-subtle p-8 sm:p-12 text-center grain relative overflow-hidden">
          <div className="relative z-10">
            <h2 className="text-2xl sm:text-3xl font-bold text-text-primary font-[family-name:var(--font-outfit)] tracking-tight">
              Ready to build your endgame?
            </h2>
            <p className="text-text-secondary mt-3 max-w-md mx-auto leading-relaxed">
              Join thousands of keyboard enthusiasts using Switchy to find their perfect build.
            </p>
            <div className="mt-6">
              {!isLoading && isPro ? (
                <Link href="/account">
                  <Button variant="secondary">
                    Manage Subscription
                  </Button>
                </Link>
              ) : (
                <Button onClick={isSignedIn ? handleUpgrade : undefined} loading={loadingCheckout}>
                  {isSignedIn ? "Get Started with Pro" : "Sign in to get started"}
                </Button>
              )}
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
