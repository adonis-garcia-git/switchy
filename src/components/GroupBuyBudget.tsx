"use client";

import { useState } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "../../convex/_generated/api";
import { cn, formatPriceWhole } from "@/lib/utils";

export function GroupBuyBudget({ totalSpent }: { totalSpent: number }) {
  const budget = useQuery(api.groupBuyBudgets.get, {});
  const setBudget = useMutation(api.groupBuyBudgets.set);
  const removeBudget = useMutation(api.groupBuyBudgets.remove);

  const [editing, setEditing] = useState(false);
  const [editType, setEditType] = useState<"monthly" | "total">("total");
  const [editAmount, setEditAmount] = useState("");

  const handleSave = async () => {
    const amount = parseFloat(editAmount);
    if (!amount || amount <= 0) return;
    await setBudget({ budgetType: editType, amount });
    setEditing(false);
  };

  const handleEdit = () => {
    if (budget) {
      setEditType(budget.budgetType);
      setEditAmount(String(budget.amount));
    }
    setEditing(true);
  };

  const handleRemove = async () => {
    await removeBudget({});
  };

  // No budget set — show CTA
  if (!budget && !editing) {
    return (
      <div className="rounded-xl border border-dashed border-border-subtle bg-bg-surface/50 p-4 mb-6 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-bg-elevated border border-border-subtle flex items-center justify-center">
            <svg className="w-4 h-4 text-text-muted" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 18.75a60.07 60.07 0 0115.797 2.101c.727.198 1.453-.342 1.453-1.096V18.75M3.75 4.5v.75A.75.75 0 013 6h-.75m0 0v-.375c0-.621.504-1.125 1.125-1.125H20.25M2.25 6v9m18-10.5v.75c0 .414.336.75.75.75h.75m-1.5-1.5h.375c.621 0 1.125.504 1.125 1.125v9.75c0 .621-.504 1.125-1.125 1.125h-.375m1.5-1.5H21a.75.75 0 00-.75.75v.75m0 0H3.75m0 0h-.375a1.125 1.125 0 01-1.125-1.125V15m1.5 1.5v-.75A.75.75 0 003 15h-.75M15 10.5a3 3 0 11-6 0 3 3 0 016 0zm3 0h.008v.008H18V10.5zm-12 0h.008v.008H6V10.5z" />
            </svg>
          </div>
          <div>
            <p className="text-sm text-text-secondary font-medium">Set a spending budget</p>
            <p className="text-xs text-text-muted">Track your group buy spending against a limit</p>
          </div>
        </div>
        <button
          onClick={() => setEditing(true)}
          className="text-xs font-semibold text-accent hover:text-accent-hover px-3 py-1.5 rounded-lg border border-accent/20 hover:border-accent/40 bg-accent-dim transition-colors duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/40"
        >
          Set Budget
        </button>
      </div>
    );
  }

  // Editing mode
  if (editing) {
    return (
      <div className="rounded-xl border border-border-accent bg-bg-surface p-4 mb-6">
        <div className="flex items-center gap-3 flex-wrap">
          <select
            value={editType}
            onChange={(e) => setEditType(e.target.value as "monthly" | "total")}
            className="text-xs bg-bg-elevated border border-border-default rounded-lg px-2.5 py-2 text-text-secondary focus:border-border-accent transition-[border-color] duration-150"
          >
            <option value="total">Total Budget</option>
            <option value="monthly">Monthly Budget</option>
          </select>
          <div className="relative">
            <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-xs text-text-muted">$</span>
            <input
              type="number"
              step="1"
              min="1"
              value={editAmount}
              onChange={(e) => setEditAmount(e.target.value)}
              placeholder="1000"
              className="w-28 bg-bg-elevated border border-border-default rounded-lg pl-6 pr-2.5 py-2 text-sm text-text-primary focus:border-border-accent transition-[border-color] duration-150"
              autoFocus
            />
          </div>
          <button
            onClick={handleSave}
            className="px-3 py-2 text-xs font-semibold rounded-lg bg-accent text-bg-primary hover:bg-accent-hover active:scale-[0.97] transition-[background-color,transform] duration-150"
          >
            Save
          </button>
          <button
            onClick={() => setEditing(false)}
            className="px-3 py-2 text-xs font-semibold rounded-lg text-text-secondary hover:text-text-primary hover:bg-bg-elevated transition-colors duration-150"
          >
            Cancel
          </button>
        </div>
      </div>
    );
  }

  // Budget display with progress bar
  const pct = budget ? Math.min(100, (totalSpent / budget.amount) * 100) : 0;
  const barColor = pct > 80 ? "bg-red-400" : pct > 50 ? "bg-amber-400" : "bg-emerald-400";
  const overBudget = totalSpent > (budget?.amount ?? Infinity);

  return (
    <div className={cn(
      "rounded-xl border bg-bg-surface p-4 mb-6",
      overBudget ? "border-red-500/30" : "border-border-subtle"
    )}>
      <div className="flex items-center justify-between mb-2.5">
        <div className="flex items-center gap-2">
          <h3 className="text-xs font-semibold text-text-muted uppercase tracking-wider">
            {budget?.budgetType === "monthly" ? "Monthly" : "Total"} Budget
          </h3>
          {overBudget && (
            <span className="text-[10px] font-semibold text-red-400 bg-red-500/10 border border-red-500/20 rounded px-1.5 py-0.5">
              Over Budget
            </span>
          )}
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={handleEdit}
            className="text-[10px] text-text-muted hover:text-text-secondary transition-colors duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/40 rounded px-1"
          >
            Edit
          </button>
          <button
            onClick={handleRemove}
            className="text-[10px] text-text-muted hover:text-red-400 transition-colors duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-500/40 rounded px-1"
          >
            Remove
          </button>
        </div>
      </div>

      {/* Progress bar */}
      <div className="w-full h-2.5 bg-bg-elevated rounded-full overflow-hidden mb-2">
        <div
          className={cn("h-full rounded-full transition-[width] duration-500", barColor)}
          style={{ width: `${Math.min(100, pct)}%` }}
        />
      </div>

      <div className="flex items-center justify-between text-xs">
        <span className={cn("font-mono font-semibold", overBudget ? "text-red-400" : "text-text-primary")}>
          {formatPriceWhole(totalSpent)}
        </span>
        <span className="text-text-muted font-mono">
          / {formatPriceWhole(budget?.amount ?? 0)}
        </span>
      </div>
    </div>
  );
}
