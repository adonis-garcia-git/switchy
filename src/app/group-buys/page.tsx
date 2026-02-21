"use client";

import { useState } from "react";
import { useQuery, useMutation } from "convex/react";
import { useUser, SignInButton } from "@clerk/nextjs";
import { api } from "../../../convex/_generated/api";
import { Id } from "../../../convex/_generated/dataModel";
import { GroupBuyEntry } from "@/components/GroupBuyEntry";
import { formatPriceWhole } from "@/lib/utils";

type GroupBuyStatus = "ordered" | "in_production" | "shipped" | "delivered";
type ProductType = "keyboard" | "switches" | "keycaps" | "accessories";

export default function GroupBuysPage() {
  const { isSignedIn } = useUser();
  const groupBuys = useQuery(api.groupBuys.listByUser, {});
  const createGroupBuy = useMutation(api.groupBuys.create);
  const updateGroupBuy = useMutation(api.groupBuys.update);
  const removeGroupBuy = useMutation(api.groupBuys.remove);

  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    productName: "",
    vendor: "",
    orderDate: "",
    estimatedShipDate: "",
    cost: "",
    status: "ordered" as GroupBuyStatus,
    productType: "keyboard" as ProductType,
    notes: "",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await createGroupBuy({
      ...formData,
      cost: parseFloat(formData.cost) || 0,
    });
    setFormData({
      productName: "",
      vendor: "",
      orderDate: "",
      estimatedShipDate: "",
      cost: "",
      status: "ordered",
      productType: "keyboard",
      notes: "",
    });
    setShowForm(false);
  };

  const handleUpdateStatus = async (
    id: Id<"groupBuys">,
    status: GroupBuyStatus
  ) => {
    await updateGroupBuy({ id, status });
  };

  const handleDelete = async (id: Id<"groupBuys">) => {
    await removeGroupBuy({ id });
  };

  const activeEntries =
    groupBuys?.filter((g: any) => g.status !== "delivered") ?? [];
  const deliveredEntries =
    groupBuys?.filter((g: any) => g.status === "delivered") ?? [];
  const totalPending = activeEntries.reduce((sum: number, g: any) => sum + g.cost, 0);

  if (!isSignedIn) {
    return (
      <div className="min-h-screen">
                <div className="max-w-3xl mx-auto px-4 py-16 text-center">
          <h1 className="text-2xl font-bold mb-4">Group Buy Tracker</h1>
          <p className="text-text-muted mb-6">
            Sign in to track your pending group buys and orders.
          </p>
          <SignInButton mode="modal">
            <button className="px-6 py-2.5 rounded-lg bg-accent text-bg-primary font-semibold hover:bg-accent-hover transition-colors">
              Sign In
            </button>
          </SignInButton>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
            <main className="max-w-3xl mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold">Group Buy Tracker</h1>
            {activeEntries.length > 0 && (
              <p className="text-sm text-text-muted mt-1">
                {activeEntries.length} active ·{" "}
                <span className="font-mono text-accent">
                  {formatPriceWhole(totalPending)}
                </span>{" "}
                pending
              </p>
            )}
          </div>
          <button
            onClick={() => setShowForm(!showForm)}
            className="px-4 py-2 rounded-lg bg-accent text-bg-primary text-sm font-semibold hover:bg-accent-hover transition-colors"
          >
            {showForm ? "Cancel" : "+ Add Entry"}
          </button>
        </div>

        {/* Add Form */}
        {showForm && (
          <form
            onSubmit={handleSubmit}
            className="rounded-xl border border-border-default bg-bg-surface p-5 mb-6 space-y-4"
          >
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs text-text-muted uppercase tracking-wider mb-1">
                  Product Name
                </label>
                <input
                  required
                  value={formData.productName}
                  onChange={(e) =>
                    setFormData({ ...formData, productName: e.target.value })
                  }
                  className="w-full bg-bg-elevated border border-border-subtle rounded-lg px-3 py-2 text-sm text-text-primary"
                  placeholder="Keychron Q1 Pro"
                />
              </div>
              <div>
                <label className="block text-xs text-text-muted uppercase tracking-wider mb-1">
                  Vendor
                </label>
                <input
                  required
                  value={formData.vendor}
                  onChange={(e) =>
                    setFormData({ ...formData, vendor: e.target.value })
                  }
                  className="w-full bg-bg-elevated border border-border-subtle rounded-lg px-3 py-2 text-sm text-text-primary"
                  placeholder="Keychron.com"
                />
              </div>
              <div>
                <label className="block text-xs text-text-muted uppercase tracking-wider mb-1">
                  Order Date
                </label>
                <input
                  type="date"
                  required
                  value={formData.orderDate}
                  onChange={(e) =>
                    setFormData({ ...formData, orderDate: e.target.value })
                  }
                  className="w-full bg-bg-elevated border border-border-subtle rounded-lg px-3 py-2 text-sm text-text-primary"
                />
              </div>
              <div>
                <label className="block text-xs text-text-muted uppercase tracking-wider mb-1">
                  Est. Ship Date
                </label>
                <input
                  type="date"
                  required
                  value={formData.estimatedShipDate}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      estimatedShipDate: e.target.value,
                    })
                  }
                  className="w-full bg-bg-elevated border border-border-subtle rounded-lg px-3 py-2 text-sm text-text-primary"
                />
              </div>
              <div>
                <label className="block text-xs text-text-muted uppercase tracking-wider mb-1">
                  Cost ($)
                </label>
                <input
                  type="number"
                  step="0.01"
                  required
                  value={formData.cost}
                  onChange={(e) =>
                    setFormData({ ...formData, cost: e.target.value })
                  }
                  className="w-full bg-bg-elevated border border-border-subtle rounded-lg px-3 py-2 text-sm text-text-primary"
                  placeholder="199.00"
                />
              </div>
              <div>
                <label className="block text-xs text-text-muted uppercase tracking-wider mb-1">
                  Product Type
                </label>
                <select
                  value={formData.productType}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      productType: e.target.value as ProductType,
                    })
                  }
                  className="w-full bg-bg-elevated border border-border-subtle rounded-lg px-3 py-2 text-sm text-text-primary"
                >
                  <option value="keyboard">Keyboard</option>
                  <option value="switches">Switches</option>
                  <option value="keycaps">Keycaps</option>
                  <option value="accessories">Accessories</option>
                </select>
              </div>
            </div>
            <div>
              <label className="block text-xs text-text-muted uppercase tracking-wider mb-1">
                Notes
              </label>
              <textarea
                value={formData.notes}
                onChange={(e) =>
                  setFormData({ ...formData, notes: e.target.value })
                }
                rows={2}
                className="w-full bg-bg-elevated border border-border-subtle rounded-lg px-3 py-2 text-sm text-text-primary resize-none"
                placeholder="Optional notes..."
              />
            </div>
            <button
              type="submit"
              className="px-5 py-2 rounded-lg bg-accent text-bg-primary font-semibold text-sm hover:bg-accent-hover transition-colors"
            >
              Add Group Buy
            </button>
          </form>
        )}

        {/* Active entries */}
        {activeEntries.length > 0 && (
          <div className="space-y-3 mb-8">
            {activeEntries.map((entry: any) => (
              <GroupBuyEntry
                key={entry._id}
                entry={entry as never}
                onUpdateStatus={handleUpdateStatus}
                onDelete={handleDelete}
              />
            ))}
          </div>
        )}

        {/* Delivered */}
        {deliveredEntries.length > 0 && (
          <div>
            <h2 className="text-sm font-semibold text-text-muted uppercase tracking-wider mb-3">
              Delivered
            </h2>
            <div className="space-y-3 opacity-60">
              {deliveredEntries.map((entry: any) => (
                <GroupBuyEntry
                  key={entry._id}
                  entry={entry as never}
                  onUpdateStatus={handleUpdateStatus}
                  onDelete={handleDelete}
                />
              ))}
            </div>
          </div>
        )}

        {groupBuys && groupBuys.length === 0 && !showForm && (
          <div className="text-center py-16 text-text-muted">
            <p className="mb-2">No group buys tracked yet.</p>
            <p className="text-sm">
              Click &ldquo;+ Add Entry&rdquo; to start tracking.
            </p>
          </div>
        )}
      </main>
    </div>
  );
}
