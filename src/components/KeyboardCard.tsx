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
    <Link href={`/keyboards/${keyboard._id}`} className="block">
      <div className="rounded-xl border border-border-subtle bg-bg-surface p-5 hover:border-accent/30 transition-all group">
        <div className="flex items-start justify-between mb-3">
          <div>
            <p className="text-xs text-text-muted">{keyboard.brand}</p>
            <h3 className="font-semibold text-text-primary group-hover:text-accent transition-colors">
              {keyboard.name}
            </h3>
          </div>
          <Badge variant="info" size="sm">{keyboard.size}</Badge>
        </div>

        <div className="flex items-center gap-2 mb-3 flex-wrap">
          <span className="text-xs text-text-secondary">{keyboard.mountingStyle} mount</span>
          <span className="text-xs text-text-muted">·</span>
          <span className="text-xs text-text-secondary">{keyboard.plateMaterial} plate</span>
          <span className="text-xs text-text-muted">·</span>
          <span className="text-xs text-text-secondary">{keyboard.caseMaterial} case</span>
        </div>

        <div className="flex items-center gap-1.5 mb-3">
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

        <div className="flex items-center justify-between">
          <span className="text-lg font-bold font-mono text-accent">
            {formatPriceWhole(keyboard.priceUsd)}
          </span>
          <span className={cn(
            "text-xs font-medium",
            keyboard.inStock ? "text-emerald-400" : "text-text-muted"
          )}>
            {keyboard.inStock ? "In Stock" : "Out of Stock"}
          </span>
        </div>

        {keyboard.notes && (
          <p className="text-xs text-text-muted mt-2 line-clamp-2">{keyboard.notes}</p>
        )}
      </div>
    </Link>
  );
}
