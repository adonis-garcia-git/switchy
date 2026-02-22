"use client";

import { useState } from "react";
import { useAction } from "convex/react";
import { api } from "../../convex/_generated/api";
import { Modal } from "@/components/ui/Modal";
import { Button } from "@/components/ui/Button";

interface PaywallModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const COMPARISON = [
  { feature: "AI Builds per month", free: "3", pro: "Unlimited" },
  { feature: "Switch database", free: "Basic", pro: "Full + filters" },
  { feature: "Community ratings", free: "View", pro: "View + vote" },
  { feature: "Export & share builds", free: "--", pro: "Yes" },
];

export function PaywallModal({ isOpen, onClose }: PaywallModalProps) {
  const [loading, setLoading] = useState(false);
  const createCheckout = useAction(api.stripe.createCheckoutSession);

  const handleUpgrade = async () => {
    setLoading(true);
    try {
      const { url } = await createCheckout({});
      window.location.href = url;
    } catch (err) {
      console.error("Failed to create checkout session:", err);
      setLoading(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="sm">
      <div className="text-center">
        {/* Crown icon */}
        <div className="mx-auto w-14 h-14 rounded-2xl bg-accent-dim flex items-center justify-center mb-4">
          <svg className="w-7 h-7 text-accent" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 18.75l3.75-6 4.5 4.5 3-6 4.5 6V5.25l-3.75 3.75L12 4.5 9.75 9 6 5.25v13.5z" />
          </svg>
        </div>

        <h3 className="text-lg font-bold text-text-primary font-[family-name:var(--font-outfit)] tracking-tight mb-2">
          You&apos;ve used all 3 free builds this month
        </h3>
        <p className="text-sm text-text-secondary mb-6">
          Upgrade to Pro for unlimited AI builds and advanced features.
        </p>

        {/* Feature comparison */}
        <div className="rounded-xl border border-border-subtle overflow-hidden mb-6">
          <div className="grid grid-cols-3 text-[10px] uppercase tracking-wider font-semibold text-text-muted bg-bg-elevated px-3 py-2">
            <span className="text-left">Feature</span>
            <span>Free</span>
            <span>Pro</span>
          </div>
          {COMPARISON.map((row) => (
            <div
              key={row.feature}
              className="grid grid-cols-3 text-xs px-3 py-2.5 border-t border-border-subtle"
            >
              <span className="text-left text-text-secondary">{row.feature}</span>
              <span className="text-text-muted">{row.free}</span>
              <span className="text-accent font-medium">{row.pro}</span>
            </div>
          ))}
        </div>

        <Button
          onClick={handleUpgrade}
          loading={loading}
          className="w-full mb-3"
        >
          Upgrade to Pro — $7.99/mo
        </Button>
        <button
          onClick={onClose}
          className="text-sm text-text-muted hover:text-text-secondary transition-colors duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/40 rounded px-2 py-1"
        >
          Maybe later
        </button>
      </div>
    </Modal>
  );
}
