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
    <div className={cn("flex gap-3 mb-4", role === "user" ? "justify-end" : "justify-start")}>
      {role === "assistant" && (
        <div className="w-8 h-8 rounded-full bg-accent/20 flex items-center justify-center text-accent text-sm shrink-0">
          AI
        </div>
      )}
      <div className={cn(
        "max-w-[80%] rounded-2xl px-4 py-3",
        role === "user"
          ? "bg-accent text-bg-primary rounded-br-md"
          : "bg-bg-elevated text-text-primary rounded-bl-md"
      )}>
        <p className="text-sm whitespace-pre-wrap">{content}</p>
        {hasBuild && onViewBuild && (
          <button
            onClick={onViewBuild}
            className={cn(
              "mt-2 text-xs font-medium underline",
              role === "user" ? "text-bg-primary/80" : "text-accent"
            )}
          >
            View full build →
          </button>
        )}
        {timestamp && (
          <p className={cn(
            "text-[10px] mt-1",
            role === "user" ? "text-bg-primary/60" : "text-text-muted"
          )}>
            {new Date(timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
          </p>
        )}
      </div>
      {role === "user" && (
        <div className="w-8 h-8 rounded-full bg-bg-elevated flex items-center justify-center text-text-muted text-sm shrink-0">
          You
        </div>
      )}
    </div>
  );
}
