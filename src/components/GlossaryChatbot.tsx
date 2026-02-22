"use client";

import {
  useState,
  useRef,
  useEffect,
  useCallback,
  forwardRef,
  useImperativeHandle,
} from "react";
import { useAction } from "convex/react";
import { useUser } from "@clerk/nextjs";
import { api } from "../../convex/_generated/api";
import { cn } from "@/lib/utils";

interface ChatMsg {
  role: "user" | "assistant";
  content: string;
}

export interface GlossaryChatbotHandle {
  askQuestion: (q: string) => void;
}

const QUICK_QUESTIONS = [
  "What is gasket mount?",
  "Linear vs tactile?",
  "What does thocky mean?",
];

export const GlossaryChatbot = forwardRef<GlossaryChatbotHandle>(
  function GlossaryChatbot(_, ref) {
    const { user, isLoaded } = useUser();
    const askGlossary = useAction(api.glossaryChat.askGlossary);

    const [messages, setMessages] = useState<ChatMsg[]>([]);
    const [input, setInput] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const scrollRef = useRef<HTMLDivElement>(null);
    const inputRef = useRef<HTMLInputElement>(null);
    const lastSubmitRef = useRef(0);

    const isSignedIn = isLoaded && !!user;

    // Auto-scroll on new messages
    useEffect(() => {
      if (scrollRef.current) {
        scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
      }
    }, [messages, isLoading]);

    const handleSubmit = useCallback(
      async (question: string) => {
        if (!question.trim() || isLoading) return;

        // 1s debounce
        const now = Date.now();
        if (now - lastSubmitRef.current < 1000) return;
        lastSubmitRef.current = now;

        setError(null);
        const userMsg: ChatMsg = { role: "user", content: question.trim() };
        setMessages((prev) => [...prev, userMsg]);
        setInput("");
        setIsLoading(true);

        try {
          const history = messages.slice(-12);
          const response = await askGlossary({
            question: question.trim(),
            history,
          });
          setMessages((prev) => [
            ...prev,
            { role: "assistant", content: response },
          ]);
        } catch (e) {
          const msg =
            e instanceof Error ? e.message : "Something went wrong.";
          setError(msg);
        } finally {
          setIsLoading(false);
        }
      },
      [askGlossary, isLoading, messages]
    );

    // Expose imperative API for cross-component communication
    useImperativeHandle(ref, () => ({
      askQuestion: (q: string) => {
        if (isSignedIn) {
          // Focus the input area and submit the question
          setTimeout(() => {
            handleSubmit(q);
            inputRef.current?.focus();
          }, 100);
        }
      },
    }));

    const handleKeyDown = (e: React.KeyboardEvent) => {
      if (e.key === "Enter" && !e.shiftKey) {
        e.preventDefault();
        handleSubmit(input);
      }
    };

    return (
      <div className="rounded-xl border border-border-subtle bg-bg-surface flex flex-col h-full min-h-[280px] overflow-hidden">
        {/* Header */}
        <div className="px-4 py-3 border-b border-border-subtle/50 shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 rounded-full bg-accent/15 border border-accent/25 flex items-center justify-center shrink-0">
              <svg
                className="w-3.5 h-3.5 text-accent"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M8.625 12a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0H8.25m4.125 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0H12m4.125 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0h-.375M21 12c0 4.556-4.03 8.25-9 8.25a9.764 9.764 0 01-2.555-.337A5.972 5.972 0 015.41 20.97a5.969 5.969 0 01-.474-.065 4.48 4.48 0 00.978-2.025c.09-.457-.133-.901-.467-1.226C3.93 16.178 3 14.189 3 12c0-4.556 4.03-8.25 9-8.25s9 3.694 9 8.25z"
                />
              </svg>
            </div>
            <div>
              <p className="text-sm font-semibold text-text-primary font-[family-name:var(--font-outfit)] leading-tight">
                Ask Switchy
              </p>
              <p className="text-[10px] text-text-muted leading-tight">
                Glossary assistant
              </p>
            </div>
          </div>
        </div>

        {/* Messages / Quick questions */}
        <div className="flex-1 flex flex-col min-h-0">
          {messages.length === 0 && !isLoading ? (
            <div className="flex flex-col items-center justify-center flex-1 gap-3 py-4 px-3">
              <p className="text-xs text-text-muted text-center leading-snug">
                Ask me about any keyboard term
              </p>
              <div className="flex flex-col gap-1.5 w-full">
                {QUICK_QUESTIONS.map((q) => (
                  <button
                    key={q}
                    onClick={() => {
                      if (isSignedIn) handleSubmit(q);
                    }}
                    disabled={!isSignedIn}
                    className={cn(
                      "text-xs text-left px-3 py-2 rounded-lg border transition-[background-color,border-color] duration-150",
                      "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/40",
                      isSignedIn
                        ? "bg-bg-elevated/60 border-border-subtle text-text-secondary hover:text-accent hover:border-accent/25 hover:bg-accent-dim/40 active:scale-[0.98]"
                        : "bg-bg-elevated/30 border-border-subtle/50 text-text-muted cursor-not-allowed"
                    )}
                  >
                    {q}
                  </button>
                ))}
              </div>
            </div>
          ) : (
            <div
              ref={scrollRef}
              className="flex-1 overflow-y-auto px-3 py-3 space-y-2.5 min-h-0"
            >
              {messages.map((msg, i) => (
                <div
                  key={i}
                  className={cn(
                    "flex",
                    msg.role === "user" ? "justify-end" : "justify-start"
                  )}
                >
                  <div
                    className={cn(
                      "max-w-[88%] px-3 py-2 text-xs leading-relaxed",
                      msg.role === "user"
                        ? "bg-accent text-bg-primary rounded-xl rounded-br-sm"
                        : "bg-bg-elevated border-l-2 border-accent/50 text-text-primary rounded-xl rounded-bl-sm"
                    )}
                  >
                    {msg.content}
                  </div>
                </div>
              ))}
              {isLoading && (
                <div className="flex justify-start">
                  <div className="bg-bg-elevated border-l-2 border-accent/50 rounded-xl rounded-bl-sm px-3 py-2 flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-accent/60 animate-pulse" />
                    <span
                      className="w-1.5 h-1.5 rounded-full bg-accent/60 animate-pulse"
                      style={{ animationDelay: "150ms" }}
                    />
                    <span
                      className="w-1.5 h-1.5 rounded-full bg-accent/60 animate-pulse"
                      style={{ animationDelay: "300ms" }}
                    />
                  </div>
                </div>
              )}
              {error && (
                <div className="flex justify-start">
                  <div className="bg-red-500/10 border border-red-500/20 text-red-400 rounded-xl px-3 py-2 text-xs">
                    {error}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Input */}
        <div className="px-3 pb-3 pt-2 border-t border-border-subtle/50 shrink-0">
          {!isSignedIn ? (
            <p className="text-[11px] text-text-muted text-center py-2">
              Sign in to ask questions
            </p>
          ) : (
            <div className="flex gap-1.5">
              <input
                ref={inputRef}
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Ask a question..."
                disabled={isLoading}
                className={cn(
                  "flex-1 min-w-0 bg-bg-elevated border border-border-subtle rounded-lg px-3 py-2 text-xs text-text-primary placeholder:text-text-muted/60",
                  "transition-[border-color,box-shadow] duration-150",
                  "focus:outline-none focus:border-accent/40 focus:shadow-[0_0_0_2px_rgba(232,89,12,0.08)]",
                  "disabled:opacity-50"
                )}
              />
              <button
                onClick={() => handleSubmit(input)}
                disabled={!input.trim() || isLoading}
                className={cn(
                  "shrink-0 w-8 h-8 rounded-lg flex items-center justify-center",
                  "transition-[background-color,opacity,transform] duration-150",
                  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/40",
                  input.trim() && !isLoading
                    ? "bg-accent text-bg-primary hover:bg-accent-hover active:scale-[0.92]"
                    : "bg-bg-elevated text-text-muted cursor-not-allowed"
                )}
              >
                <svg
                  className="w-3.5 h-3.5"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={2.5}
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M6 12L3.269 3.126A59.768 59.768 0 0121.485 12 59.77 59.77 0 013.27 20.876L5.999 12zm0 0h7.5"
                  />
                </svg>
              </button>
            </div>
          )}
        </div>
      </div>
    );
  }
);
