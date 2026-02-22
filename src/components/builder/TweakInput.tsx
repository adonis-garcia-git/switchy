"use client";

import { useState } from "react";
import { Button } from "@/components/ui/Button";

interface TweakInputProps {
  onSubmit: (text: string) => void;
  loading?: boolean;
}

export function TweakInput({ onSubmit, loading }: TweakInputProps) {
  const [value, setValue] = useState("");
  const [isOpen, setIsOpen] = useState(true);

  if (!isOpen) {
    return (
      <button
        onClick={() => setIsOpen(true)}
        className="flex items-center gap-2 px-4 py-2.5 rounded-xl border border-border-subtle bg-bg-surface text-sm text-text-secondary hover:text-accent hover:border-border-accent transition-[border-color,color] duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/40 active:scale-[0.97]"
      >
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
        </svg>
        Tweak this build
      </button>
    );
  }

  return (
    <div className="rounded-xl border border-border-accent bg-bg-surface p-4 space-y-3">
      <p className="text-sm text-text-secondary font-medium font-[family-name:var(--font-outfit)]">
        What would you like to change?
      </p>
      <input
        type="text"
        value={value}
        onChange={(e) => setValue(e.target.value)}
        placeholder="Make it cheaper, swap for wireless, more thocky..."
        className="w-full bg-bg-primary border border-border-default rounded-lg px-4 py-2.5 text-sm text-text-primary placeholder:text-text-muted/50 focus:border-accent/50 focus:outline-none transition-[border-color] duration-150"
        onKeyDown={(e) => {
          if (e.key === "Enter" && value.trim()) {
            onSubmit(value.trim());
            setValue("");
            setIsOpen(false);
          }
        }}
        autoFocus
      />
      <div className="flex items-center gap-2">
        <Button
          size="sm"
          disabled={!value.trim() || loading}
          loading={loading}
          onClick={() => {
            if (value.trim()) {
              onSubmit(value.trim());
              setValue("");
              setIsOpen(false);
            }
          }}
        >
          Regenerate
        </Button>
        <Button variant="ghost" size="sm" onClick={() => { setIsOpen(false); setValue(""); }}>
          Cancel
        </Button>
      </div>
    </div>
  );
}
