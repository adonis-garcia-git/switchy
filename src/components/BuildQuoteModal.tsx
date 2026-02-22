"use client";

import { useState } from "react";
import { useMutation } from "convex/react";
import { api } from "../../convex/_generated/api";
import { Modal } from "@/components/ui/Modal";
import { Button } from "@/components/ui/Button";
import { formatPriceWhole } from "@/lib/utils";
import type { BuildData } from "@/lib/types";

interface BuildQuoteModalProps {
  isOpen: boolean;
  onClose: () => void;
  buildSpec: BuildData;
}

const BUDGET_OPTIONS = [
  { label: "$200 – $350", value: "200-350" },
  { label: "$350 – $500", value: "350-500" },
  { label: "$500 – $750", value: "500-750" },
  { label: "$750+", value: "750+" },
];

export function BuildQuoteModal({ isOpen, onClose, buildSpec }: BuildQuoteModalProps) {
  const submitRequest = useMutation(api.buildRequests.submit);
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    name: "",
    email: "",
    budget: "",
    notes: "",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await submitRequest({
        contactName: form.name,
        contactEmail: form.email,
        budget: form.budget,
        notes: form.notes || undefined,
        buildSpec: {
          buildName: buildSpec.buildName,
          summary: buildSpec.summary,
          estimatedTotal: buildSpec.estimatedTotal,
          components: buildSpec.components,
        },
      });
      setSubmitted(true);
    } catch (err) {
      console.error("Failed to submit build request:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setSubmitted(false);
    setForm({ name: "", email: "", budget: "", notes: "" });
    onClose();
  };

  if (submitted) {
    return (
      <Modal isOpen={isOpen} onClose={handleClose} title="Request Submitted">
        <div className="text-center py-4">
          <div className="mx-auto w-12 h-12 rounded-full bg-emerald-500/10 flex items-center justify-center mb-4">
            <svg className="w-6 h-6 text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h3 className="text-lg font-semibold text-text-primary font-[family-name:var(--font-outfit)] mb-2">
            We&apos;ll be in touch!
          </h3>
          <p className="text-sm text-text-secondary mb-6">
            Your build quote request has been submitted. We&apos;ll reach out to {form.email} within 48 hours.
          </p>
          <Button variant="secondary" onClick={handleClose}>
            Close
          </Button>
        </div>
      </Modal>
    );
  }

  return (
    <Modal isOpen={isOpen} onClose={handleClose} title="Have This Built For Me">
      {/* Build summary (read-only) */}
      <div className="rounded-xl bg-bg-elevated border border-border-subtle p-4 mb-5">
        <h4 className="text-sm font-semibold text-text-primary font-[family-name:var(--font-outfit)] mb-1">
          {buildSpec.buildName}
        </h4>
        <p className="text-xs text-text-secondary mb-2">{buildSpec.summary}</p>
        <div className="flex items-center gap-3 text-xs text-text-muted">
          <span className="font-[family-name:var(--font-mono)] text-accent font-medium">
            {formatPriceWhole(buildSpec.estimatedTotal)}
          </span>
          <span>{buildSpec.buildDifficulty}</span>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-xs text-text-muted uppercase tracking-wider font-semibold mb-1.5">
            Name
          </label>
          <input
            required
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
            className="w-full bg-bg-elevated border border-border-default rounded-lg px-3 py-2.5 text-sm text-text-primary placeholder:text-text-muted/60 focus:border-border-accent transition-[border-color,box-shadow] duration-150"
            placeholder="Your name"
          />
        </div>
        <div>
          <label className="block text-xs text-text-muted uppercase tracking-wider font-semibold mb-1.5">
            Email
          </label>
          <input
            required
            type="email"
            value={form.email}
            onChange={(e) => setForm({ ...form, email: e.target.value })}
            className="w-full bg-bg-elevated border border-border-default rounded-lg px-3 py-2.5 text-sm text-text-primary placeholder:text-text-muted/60 focus:border-border-accent transition-[border-color,box-shadow] duration-150"
            placeholder="you@example.com"
          />
        </div>
        <div>
          <label className="block text-xs text-text-muted uppercase tracking-wider font-semibold mb-1.5">
            Budget
          </label>
          <select
            required
            value={form.budget}
            onChange={(e) => setForm({ ...form, budget: e.target.value })}
            className="w-full bg-bg-elevated border border-border-default rounded-lg px-3 py-2.5 text-sm text-text-primary focus:border-border-accent transition-[border-color,box-shadow] duration-150"
          >
            <option value="" disabled>
              Select your budget range
            </option>
            {BUDGET_OPTIONS.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-xs text-text-muted uppercase tracking-wider font-semibold mb-1.5">
            Notes (optional)
          </label>
          <textarea
            value={form.notes}
            onChange={(e) => setForm({ ...form, notes: e.target.value })}
            rows={3}
            className="w-full bg-bg-elevated border border-border-default rounded-lg px-3 py-2.5 text-sm text-text-primary resize-none placeholder:text-text-muted/60 focus:border-border-accent transition-[border-color,box-shadow] duration-150"
            placeholder="Any special requests or preferences..."
          />
        </div>
        <div className="flex items-center gap-3 pt-1">
          <Button type="submit" loading={loading}>
            Submit Request
          </Button>
          <Button variant="ghost" type="button" onClick={handleClose}>
            Cancel
          </Button>
        </div>
      </form>
    </Modal>
  );
}
