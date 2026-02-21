"use client";

import { Suspense, useState, useEffect, useCallback, useRef } from "react";
import { useSearchParams } from "next/navigation";
import { useAction, useMutation, useQuery } from "convex/react";
import { useUser } from "@clerk/nextjs";
import { api } from "../../../convex/_generated/api";
import { Id } from "../../../convex/_generated/dataModel";
import { BuildCard } from "@/components/BuildCard";
import { ChatMessage } from "@/components/ChatMessage";
import { Button } from "@/components/ui/Button";
import { LOADING_MESSAGES, PLACEHOLDER_QUERIES } from "@/lib/constants";
import { getRandomItem } from "@/lib/utils";
import { KeyboardViewer3D } from "@/components/3d/KeyboardViewer3D";
import { buildDataToViewerConfig } from "@/lib/keyboard3d";
import type { BuildData } from "@/lib/types";

interface Message {
  role: "user" | "assistant";
  content: string;
  timestamp: number;
  hasBuild?: boolean;
}

function AdvisorContent() {
  const searchParams = useSearchParams();
  const initialQuery = searchParams.get("q") || "";
  const { isSignedIn } = useUser();

  const [input, setInput] = useState("");
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(false);
  const [loadingMessage, setLoadingMessage] = useState("");
  const [build, setBuild] = useState<Record<string, unknown> | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [conversationId, setConversationId] = useState<Id<"conversations"> | null>(null);
  const [showBuildPanel, setShowBuildPanel] = useState(false);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const hasAutoSubmitted = useRef(false);

  const generateBuild = useAction(api.builds.generateBuild);
  const generateConversational = useAction(api.builds.generateBuildConversational);
  const saveBuild = useMutation(api.savedBuilds.save);
  const createConversation = useMutation(api.conversations.create);
  const addMessage = useMutation(api.conversations.addMessage);
  const conversationsList = useQuery(api.conversations.listByUser, isSignedIn ? {} : "skip");

  // Scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading]);

  const handleSend = useCallback(async (messageText: string) => {
    if (!messageText.trim() || loading) return;

    setLoading(true);
    setError(null);
    setLoadingMessage(getRandomItem(LOADING_MESSAGES));

    const messageInterval = setInterval(() => {
      setLoadingMessage(getRandomItem(LOADING_MESSAGES));
    }, 2500);

    // Add user message to UI
    const userMsg: Message = { role: "user", content: messageText.trim(), timestamp: Date.now() };
    setMessages(prev => [...prev, userMsg]);
    setInput("");

    try {
      let convId = conversationId;

      // Create conversation if needed
      if (!convId && isSignedIn) {
        convId = await createConversation();
        setConversationId(convId);
      }

      let result;
      if (convId) {
        // Store user message in Convex
        await addMessage({ conversationId: convId, role: "user", content: messageText.trim() });

        // Use conversational API
        result = await generateConversational({
          conversationId: convId,
          message: messageText.trim(),
        });
      } else {
        // Fallback to single-shot for non-authenticated users
        const previousBuild = build ? JSON.stringify(build) : undefined;
        const singleResult = await generateBuild({ query: messageText.trim(), previousBuild });
        result = { type: "build", data: singleResult, rawText: JSON.stringify(singleResult) };
      }

      // Process response
      if (result.type === "build" && result.data) {
        setBuild(result.data);
        setShowBuildPanel(true);
        const assistantMsg: Message = {
          role: "assistant",
          content: `I've put together a build recommendation: **${result.data.buildName}** - ${result.data.summary}. Check the build panel for full details!`,
          timestamp: Date.now(),
          hasBuild: true,
        };
        setMessages(prev => [...prev, assistantMsg]);
        if (convId) {
          await addMessage({ conversationId: convId, role: "assistant", content: assistantMsg.content });
        }
      } else {
        const assistantMsg: Message = {
          role: "assistant",
          content: result.rawText,
          timestamp: Date.now(),
        };
        setMessages(prev => [...prev, assistantMsg]);
        if (convId) {
          await addMessage({ conversationId: convId, role: "assistant", content: result.rawText });
        }
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to get response");
      // Remove the user message on error
      setMessages(prev => prev.slice(0, -1));
    } finally {
      setLoading(false);
      clearInterval(messageInterval);
    }
  }, [conversationId, loading, isSignedIn, build, generateBuild, generateConversational, createConversation, addMessage]);

  // Auto-submit from URL query param
  useEffect(() => {
    if (initialQuery && !hasAutoSubmitted.current && messages.length === 0) {
      hasAutoSubmitted.current = true;
      handleSend(initialQuery);
    }
  }, [initialQuery, handleSend, messages.length]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    handleSend(input);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend(input);
    }
  };

  const handleSave = async () => {
    if (!build || !isSignedIn) return;
    setSaving(true);
    try {
      await saveBuild({
        query: messages.find(m => m.role === "user")?.content || "",
        buildName: (build.buildName as string) || "Untitled Build",
        summary: (build.summary as string) || "",
        components: build.components || {},
        recommendedMods: build.recommendedMods || [],
        estimatedTotal: (build.estimatedTotal as number) || 0,
        soundProfileExpected: (build.soundProfileExpected as string) || "",
        buildDifficulty: (build.buildDifficulty as string) || "intermediate",
        notes: (build.notes as string) || "",
        conversationId: conversationId || undefined,
      });
      setSaved(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to save");
    } finally {
      setSaving(false);
    }
  };

  const handleNewConversation = () => {
    setMessages([]);
    setBuild(null);
    setConversationId(null);
    setSaved(false);
    setError(null);
    setShowBuildPanel(false);
    inputRef.current?.focus();
  };

  const [placeholderIndex, setPlaceholderIndex] = useState(0);
  useEffect(() => {
    const interval = setInterval(() => {
      setPlaceholderIndex((i) => (i + 1) % PLACEHOLDER_QUERIES.length);
    }, 4000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="h-[calc(100vh-4rem)] flex">
      {/* Chat Panel */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Header */}
        <div className="border-b border-border-default bg-bg-surface/80 backdrop-blur-sm p-4 flex items-center justify-between shrink-0">
          <div>
            <h1 className="text-lg font-semibold text-text-primary font-[family-name:var(--font-outfit)] tracking-tight">Build Advisor</h1>
            <p className="text-xs text-text-muted">AI-powered keyboard recommendations</p>
          </div>
          <div className="flex items-center gap-2">
            {build && (
              <Button
                variant="secondary"
                size="sm"
                onClick={() => setShowBuildPanel(!showBuildPanel)}
              >
                {showBuildPanel ? "Hide Build" : "Show Build"}
              </Button>
            )}
            <Button variant="ghost" size="sm" onClick={handleNewConversation}>
              <svg className="w-4 h-4 mr-1.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              New Chat
            </Button>
          </div>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-4 bg-bg-primary">
          {messages.length === 0 && !loading && (
            <div className="flex flex-col items-center justify-center h-full text-center px-4">
              <div className="w-14 h-14 rounded-2xl bg-accent/10 border border-accent/20 flex items-center justify-center mb-5">
                <svg className="w-7 h-7 text-accent" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                </svg>
              </div>
              <h2 className="text-xl font-semibold text-text-primary mb-2 font-[family-name:var(--font-outfit)] tracking-tight">
                What are you looking for?
              </h2>
              <p className="text-sm text-text-muted max-w-md mb-8 leading-relaxed">
                Describe your ideal keyboard — the sound, feel, size, or budget — and I&apos;ll recommend a complete build.
              </p>
              <div className="flex flex-wrap justify-center gap-2">
                {["Thocky 65% under $200", "Silent office keyboard", "Best gaming linear build"].map((suggestion) => (
                  <button
                    key={suggestion}
                    onClick={() => handleSend(suggestion)}
                    className="px-4 py-2 rounded-full border border-border-subtle bg-bg-surface text-sm text-text-secondary hover:text-accent hover:border-border-accent transition-[border-color,color] duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/40 active:scale-[0.97]"
                  >
                    {suggestion}
                  </button>
                ))}
              </div>
            </div>
          )}

          {messages.map((msg, i) => (
            <ChatMessage
              key={i}
              role={msg.role}
              content={msg.content}
              timestamp={msg.timestamp}
              hasBuild={msg.hasBuild}
              onViewBuild={msg.hasBuild ? () => setShowBuildPanel(true) : undefined}
            />
          ))}

          {loading && (
            <div className="flex gap-3 mb-4">
              <div className="w-8 h-8 rounded-full bg-accent/20 border border-accent/30 flex items-center justify-center text-accent text-xs font-semibold shrink-0">
                S
              </div>
              <div className="bg-bg-elevated border-l-2 border-accent rounded-2xl rounded-bl-sm px-4 py-3">
                <div className="flex items-center gap-2">
                  <div className="flex gap-1">
                    <div className="w-1.5 h-1.5 rounded-full bg-accent animate-pulse" />
                    <div className="w-1.5 h-1.5 rounded-full bg-accent animate-pulse [animation-delay:0.15s]" />
                    <div className="w-1.5 h-1.5 rounded-full bg-accent animate-pulse [animation-delay:0.3s]" />
                  </div>
                  <p className="text-sm text-text-secondary">{loadingMessage}</p>
                </div>
              </div>
            </div>
          )}

          {error && (
            <div className="rounded-lg border border-red-500/30 bg-red-500/10 p-3 mb-4">
              <p className="text-sm text-red-400">{error}</p>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Input */}
        <div className="border-t border-border-default bg-bg-surface p-4 shrink-0">
          <form onSubmit={handleSubmit} className="flex gap-2">
            <textarea
              ref={inputRef}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder={messages.length === 0 ? PLACEHOLDER_QUERIES[placeholderIndex] : "Ask a follow-up question or request changes..."}
              rows={1}
              className="flex-1 bg-bg-primary border border-border-default rounded-xl px-4 py-3 text-sm text-text-primary placeholder:text-text-muted/50 resize-none focus:border-accent/50 focus:shadow-[0_0_0_3px_rgba(232,89,12,0.08)] transition-[border-color,box-shadow] duration-150 focus:outline-none"
            />
            <Button type="submit" disabled={loading || !input.trim()}>
              <svg className="w-4 h-4 mr-1.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
              </svg>
              Send
            </Button>
          </form>
        </div>
      </div>

      {/* Build Preview Panel */}
      {showBuildPanel && build && (
        <div className="hidden lg:block w-[420px] border-l border-border-default overflow-y-auto shrink-0 bg-bg-surface">
          <div className="p-4">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xs font-semibold text-text-muted uppercase tracking-wider font-[family-name:var(--font-outfit)]">Current Build</h2>
              <button
                onClick={() => setShowBuildPanel(false)}
                className="text-text-muted hover:text-text-primary hover:bg-bg-elevated rounded-md p-1.5 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/40"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <div className="mb-4">
              <KeyboardViewer3D
                config={buildDataToViewerConfig(build as unknown as BuildData)}
                height="220px"
                autoRotate
              />
            </div>
            <BuildCard
              build={build as never}
              onSave={isSignedIn && !saved ? handleSave : undefined}
              onTweak={(tweakType) => handleSend(tweakType)}
              saving={saving}
            />
            {saved && (
              <div className="mt-3 px-3 py-2 rounded-lg bg-accent/10 border border-accent/20 text-center">
                <p className="text-sm text-accent font-medium">Build saved!</p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

export default function AdvisorPage() {
  return (
    <Suspense fallback={
      <div className="h-[calc(100vh-4rem)] flex items-center justify-center bg-bg-primary">
        <div className="w-8 h-8 border-2 border-accent/30 border-t-accent rounded-full animate-spin" />
      </div>
    }>
      <AdvisorContent />
    </Suspense>
  );
}
