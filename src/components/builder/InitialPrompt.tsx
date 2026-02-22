"use client";

import { useState, useRef, useEffect } from "react";
import { cn } from "@/lib/utils";

const SUGGESTION_CHIPS = [
  "Thocky 65% under $200",
  "Silent office keyboard",
  "Best gaming linear build",
  "Creamy sound, wireless, compact",
  "Budget endgame 75%",
  "Clacky TKL for programming",
];

interface InitialPromptProps {
  onSubmit: (prompt: string) => void;
  loading?: boolean;
}

export function InitialPrompt({ onSubmit, loading }: InitialPromptProps) {
  const [value, setValue] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);
  const [placeholderIndex, setPlaceholderIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setPlaceholderIndex((i) => (i + 1) % SUGGESTION_CHIPS.length);
    }, 3500);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  const handleSubmit = (text: string) => {
    if (text.trim() && !loading) {
      onSubmit(text.trim());
    }
  };

  return (
    <div className="flex flex-col items-center justify-center px-4 py-8 sm:py-12 w-full max-w-2xl">
      {/* Tagline — floating text with shadow for contrast over 3D scene */}
      <div className="text-center mb-8 sm:mb-10">
        <h1
          className="text-3xl sm:text-4xl lg:text-5xl font-bold text-white font-[family-name:var(--font-outfit)] tracking-tight leading-[1.1] mb-3"
          style={{ textShadow: "0 2px 30px rgba(0,0,0,0.8), 0 0 60px rgba(0,0,0,0.5)" }}
        >
          Build your dream<br />
          <span className="text-accent drop-shadow-[0_0_24px_rgba(232,89,12,0.4)]">keyboard</span>
        </h1>
        <p
          className="text-sm sm:text-base text-white/60 max-w-md mx-auto leading-relaxed"
          style={{ textShadow: "0 1px 20px rgba(0,0,0,0.9), 0 0 40px rgba(0,0,0,0.6)" }}
        >
          Describe what you want and our AI will recommend the perfect build with specific components and pricing.
        </p>
      </div>

      {/* Input — semi-transparent, no blur, keyboard shows through */}
      <div className="w-full max-w-xl mb-6">
        <div className="relative group">
          <input
            ref={inputRef}
            type="text"
            value={value}
            onChange={(e) => setValue(e.target.value)}
            placeholder={SUGGESTION_CHIPS[placeholderIndex]}
            onKeyDown={(e) => {
              if (e.key === "Enter") handleSubmit(value);
            }}
            disabled={loading}
            className={cn(
              "w-full px-6 py-4 sm:py-5 rounded-2xl text-base sm:text-lg",
              "bg-black/25 border border-white/[0.08]",
              "text-white placeholder:text-white/25",
              "focus:border-accent/40 focus:outline-none",
              "focus:shadow-[0_0_0_3px_rgba(232,89,12,0.1),0_4px_32px_rgba(0,0,0,0.3)]",
              "transition-[border-color,box-shadow] duration-200",
              "disabled:opacity-50 disabled:cursor-not-allowed",
              "pr-14"
            )}
          />
          <button
            onClick={() => handleSubmit(value)}
            disabled={!value.trim() || loading}
            className={cn(
              "absolute right-3 top-1/2 -translate-y-1/2",
              "w-10 h-10 rounded-xl flex items-center justify-center",
              "transition-[background-color,transform] duration-200",
              "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/40",
              "active:scale-[0.9]",
              value.trim()
                ? "bg-accent text-white hover:bg-accent-hover"
                : "bg-white/[0.06] text-white/30 cursor-not-allowed"
            )}
          >
            {loading ? (
              <div className="w-4 h-4 border-2 border-current/30 border-t-current rounded-full animate-spin" />
            ) : (
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
              </svg>
            )}
          </button>
        </div>
      </div>

      {/* Suggestion chips — minimal, transparent */}
      <div className="flex flex-wrap justify-center gap-2 max-w-xl">
        {SUGGESTION_CHIPS.map((chip) => (
          <button
            key={chip}
            onClick={() => handleSubmit(chip)}
            disabled={loading}
            className={cn(
              "px-4 py-2 rounded-full border text-sm",
              "border-white/[0.08] bg-black/20 text-white/50",
              "hover:text-accent hover:border-accent/30 hover:bg-black/30",
              "transition-[border-color,color,background-color] duration-150",
              "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/40",
              "active:scale-[0.97]",
              "disabled:opacity-50 disabled:cursor-not-allowed"
            )}
          >
            {chip}
          </button>
        ))}
      </div>
    </div>
  );
}
