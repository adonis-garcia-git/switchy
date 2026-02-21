"use client";

import Link from "next/link";
import { cn, formatPriceWhole } from "@/lib/utils";
import { Badge } from "@/components/ui/Badge";

interface KeyboardData {
  _id: string;
  brand: string;
  name: string;
  size: string;
  mountingStyle: string;
  plateMaterial: string;
  caseMaterial: string;
  hotSwap: boolean;
  wireless: boolean;
  rgb: boolean;
  priceUsd: number;
  inStock: boolean;
  notes: string;
}

export function KeyboardCard({ keyboard }: { keyboard: KeyboardData }) {
  return (
    <Link href={`/keyboards/${keyboard._id}`} className="block group">
      <div className="rounded-xl border border-border-subtle bg-bg-surface p-5 shadow-surface hover:border-border-accent hover:glow-accent transition-[border-color,box-shadow] duration-200">
        <div className="flex items-start justify-between mb-3">
          <div className="min-w-0">
            <p className="text-[11px] uppercase tracking-wider text-text-muted mb-0.5">
              {keyboard.brand}
            </p>
            <h3 className="font-semibold text-text-primary group-hover:text-accent transition-colors duration-150 truncate font-[family-name:var(--font-outfit)]">
              {keyboard.name}
            </h3>
          </div>
          <Badge variant="info" size="sm" className="ml-3 shrink-0">
            {keyboard.size}
          </Badge>
        </div>

        <div className="flex items-center gap-1.5 text-xs text-text-secondary mb-3">
          <span>{keyboard.mountingStyle}</span>
          <span className="text-text-muted/40">|</span>
          <span>{keyboard.plateMaterial}</span>
          <span className="text-text-muted/40">|</span>
          <span>{keyboard.caseMaterial}</span>
        </div>

        <div className="flex items-center gap-1.5 mb-4">
          <Badge variant={keyboard.hotSwap ? "success" : "default"} size="sm">
            {keyboard.hotSwap ? "Hot-swap" : "Soldered"}
          </Badge>
          {keyboard.wireless && (
            <Badge variant="info" size="sm">Wireless</Badge>
          )}
          {keyboard.rgb && (
            <Badge variant="default" size="sm">RGB</Badge>
          )}
        </div>

        <div className="flex items-end justify-between pt-3 border-t border-border-subtle">
          <span className="text-lg font-bold font-[family-name:var(--font-mono)] text-accent">
            {formatPriceWhole(keyboard.priceUsd)}
          </span>
          <span className={cn(
            "text-xs font-medium px-2 py-0.5 rounded-full",
            keyboard.inStock
              ? "text-emerald-400 bg-emerald-500/10"
              : "text-text-muted bg-bg-elevated"
          )}>
            {keyboard.inStock ? "In Stock" : "Out of Stock"}
          </span>
        </div>

        {keyboard.notes && (
          <p className="text-xs text-text-muted mt-3 line-clamp-2 leading-relaxed">
            {keyboard.notes}
          </p>
        )}
      </div>
    </Link>
  );
}
