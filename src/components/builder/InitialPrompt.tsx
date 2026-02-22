"use client";

import { useState, useRef, useEffect } from "react";
import { cn } from "@/lib/utils";
import { useTypewriter } from "@/hooks/useTypewriter";
import { POPULAR_BUILDS } from "@/data/popularBuilds";

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

  const { text: placeholderText } = useTypewriter({
    strings: SUGGESTION_CHIPS,
    typeSpeed: 40,
    pauseBetween: 2500,
    enabled: !value,
  });

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
            placeholder={placeholderText || "Describe your dream keyboard..."}
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

      {/* Suggestion chips — improved visibility */}
      <div className="flex flex-wrap justify-center gap-2 max-w-xl">
        {SUGGESTION_CHIPS.map((chip) => (
          <button
            key={chip}
            onClick={() => handleSubmit(chip)}
            disabled={loading}
            className={cn(
              "px-4 py-2 rounded-full border text-sm",
              "border-white/15 bg-black/40 text-white/70 backdrop-blur-sm",
              "hover:text-accent hover:border-accent/30 hover:bg-black/50",
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

      {/* Popular Templates */}
      <div className="w-full max-w-xl mt-10">
        <p
          className="text-xs text-white/40 uppercase tracking-wider font-medium text-center mb-4"
          style={{ textShadow: "0 1px 10px rgba(0,0,0,0.8)" }}
        >
          Popular Templates
        </p>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {POPULAR_BUILDS.map((build) => (
            <button
              key={build.id}
              onClick={() => handleSubmit(build.prompt)}
              disabled={loading}
              className={cn(
                "text-left p-4 rounded-xl border",
                "bg-black/30 border-white/[0.08] backdrop-blur-sm",
                "hover:border-accent/30 hover:bg-black/40",
                "transition-[border-color,background-color] duration-150",
                "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/40",
                "active:scale-[0.98]",
                "disabled:opacity-50 disabled:cursor-not-allowed"
              )}
            >
              <div className="flex items-start justify-between gap-2 mb-1.5">
                <h3 className="text-sm font-semibold text-white/90 font-[family-name:var(--font-outfit)]">
                  {build.name}
                </h3>
                <span className="text-xs font-bold font-[family-name:var(--font-mono)] text-accent shrink-0">
                  {build.price}
                </span>
              </div>
              <p className="text-xs text-white/50 mb-2 leading-relaxed">{build.tagline}</p>
              <div className="flex flex-wrap gap-1.5">
                {build.keyComponents.map((comp) => (
                  <span
                    key={comp}
                    className="px-2 py-0.5 rounded-full text-[10px] font-medium bg-white/[0.06] text-white/50 border border-white/[0.06]"
                  >
                    {comp}
                  </span>
                ))}
              </div>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
