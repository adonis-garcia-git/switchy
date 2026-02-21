"use client";

import { useState } from "react";
import { useQuery, useMutation } from "convex/react";
import { useUser, SignInButton } from "@clerk/nextjs";
import { api } from "../../../convex/_generated/api";
import { Id } from "../../../convex/_generated/dataModel";
import { GroupBuyEntry } from "@/components/GroupBuyEntry";
import { Button } from "@/components/ui/Button";
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
          <h1 className="text-2xl font-bold font-[family-name:var(--font-outfit)] tracking-tight mb-4">
            Group Buy Tracker
          </h1>
          <p className="text-text-secondary mb-6 leading-relaxed">
            Sign in to track your pending group buys and orders.
          </p>
          <SignInButton mode="modal">
            <Button>Sign In</Button>
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
            <h1 className="text-2xl font-bold font-[family-name:var(--font-outfit)] tracking-tight">
              Group Buy Tracker
            </h1>
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
          <Button
            variant={showForm ? "secondary" : "primary"}
            size="sm"
            onClick={() => setShowForm(!showForm)}
          >
            {showForm ? "Cancel" : "+ Add Entry"}
          </Button>
        </div>

        {/* Add Form */}
        {showForm && (
          <form
            onSubmit={handleSubmit}
            className="rounded-xl border border-border-default bg-bg-surface p-5 mb-6 space-y-4 shadow-surface"
          >
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs text-text-muted uppercase tracking-wider font-semibold mb-1.5">
                  Product Name
                </label>
                <input
                  required
                  value={formData.productName}
                  onChange={(e) =>
                    setFormData({ ...formData, productName: e.target.value })
                  }
                  className="w-full bg-bg-elevated border border-border-default rounded-lg px-3 py-2.5 text-sm text-text-primary placeholder:text-text-muted/60 focus:border-border-accent transition-[border-color,box-shadow] duration-150"
                  placeholder="Keychron Q1 Pro"
                />
              </div>
              <div>
                <label className="block text-xs text-text-muted uppercase tracking-wider font-semibold mb-1.5">
                  Vendor
                </label>
                <input
                  required
                  value={formData.vendor}
                  onChange={(e) =>
                    setFormData({ ...formData, vendor: e.target.value })
                  }
                  className="w-full bg-bg-elevated border border-border-default rounded-lg px-3 py-2.5 text-sm text-text-primary placeholder:text-text-muted/60 focus:border-border-accent transition-[border-color,box-shadow] duration-150"
                  placeholder="Keychron.com"
                />
              </div>
              <div>
                <label className="block text-xs text-text-muted uppercase tracking-wider font-semibold mb-1.5">
                  Order Date
                </label>
                <input
                  type="date"
                  required
                  value={formData.orderDate}
                  onChange={(e) =>
                    setFormData({ ...formData, orderDate: e.target.value })
                  }
                  className="w-full bg-bg-elevated border border-border-default rounded-lg px-3 py-2.5 text-sm text-text-primary focus:border-border-accent transition-[border-color,box-shadow] duration-150"
                />
              </div>
              <div>
                <label className="block text-xs text-text-muted uppercase tracking-wider font-semibold mb-1.5">
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
                  className="w-full bg-bg-elevated border border-border-default rounded-lg px-3 py-2.5 text-sm text-text-primary focus:border-border-accent transition-[border-color,box-shadow] duration-150"
                />
              </div>
              <div>
                <label className="block text-xs text-text-muted uppercase tracking-wider font-semibold mb-1.5">
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
                  className="w-full bg-bg-elevated border border-border-default rounded-lg px-3 py-2.5 text-sm text-text-primary placeholder:text-text-muted/60 focus:border-border-accent transition-[border-color,box-shadow] duration-150"
                  placeholder="199.00"
                />
              </div>
              <div>
                <label className="block text-xs text-text-muted uppercase tracking-wider font-semibold mb-1.5">
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
                  className="w-full bg-bg-elevated border border-border-default rounded-lg px-3 py-2.5 text-sm text-text-primary focus:border-border-accent transition-[border-color,box-shadow] duration-150"
                >
                  <option value="keyboard">Keyboard</option>
                  <option value="switches">Switches</option>
                  <option value="keycaps">Keycaps</option>
                  <option value="accessories">Accessories</option>
                </select>
              </div>
            </div>
            <div>
              <label className="block text-xs text-text-muted uppercase tracking-wider font-semibold mb-1.5">
                Notes
              </label>
              <textarea
                value={formData.notes}
                onChange={(e) =>
                  setFormData({ ...formData, notes: e.target.value })
                }
                rows={2}
                className="w-full bg-bg-elevated border border-border-default rounded-lg px-3 py-2.5 text-sm text-text-primary resize-none placeholder:text-text-muted/60 focus:border-border-accent transition-[border-color,box-shadow] duration-150"
                placeholder="Optional notes..."
              />
            </div>
            <Button type="submit" size="sm">
              Add Group Buy
            </Button>
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
            <h2 className="text-xs font-semibold text-text-muted uppercase tracking-wider mb-3 font-[family-name:var(--font-outfit)]">
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
