"use client";

import { cn } from "@/lib/utils";

interface ChatMessageProps {
  role: "user" | "assistant";
  content: string;
  timestamp?: number;
  hasBuild?: boolean;
  onViewBuild?: () => void;
}

export function ChatMessage({ role, content, timestamp, hasBuild, onViewBuild }: ChatMessageProps) {
  return (
    <div className={cn("flex gap-3 mb-5", role === "user" ? "justify-end" : "justify-start")}>
      {role === "assistant" && (
        <div className="w-8 h-8 rounded-full bg-accent/20 border border-accent/30 flex items-center justify-center text-accent text-xs font-semibold shrink-0">
          S
        </div>
      )}
      <div className={cn(
        "max-w-[80%] px-4 py-3",
        role === "user"
          ? "bg-accent text-bg-primary rounded-2xl rounded-br-sm"
          : "bg-bg-elevated border-l-2 border-accent text-text-primary rounded-2xl rounded-bl-sm"
      )}>
        <p className="text-sm whitespace-pre-wrap leading-relaxed">{content}</p>
        {hasBuild && onViewBuild && (
          <button
            onClick={onViewBuild}
            className={cn(
              "mt-2 inline-flex items-center gap-1 text-xs font-semibold px-3 py-1.5 rounded-lg transition-colors",
              role === "user"
                ? "bg-bg-primary/15 text-bg-primary hover:bg-bg-primary/25"
                : "bg-accent/10 text-accent border border-accent/20 hover:bg-accent/20 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/40"
            )}
          >
            View full build
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </button>
        )}
        {timestamp && (
          <p className={cn(
            "text-[10px] mt-1.5 opacity-50",
            role === "user" ? "text-bg-primary" : "text-text-muted"
          )}>
            {new Date(timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
          </p>
        )}
      </div>
      {role === "user" && (
        <div className="w-8 h-8 rounded-full bg-bg-elevated border border-border-default flex items-center justify-center text-text-muted text-xs font-medium shrink-0">
          You
        </div>
      )}
    </div>
  );
}
