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
    <div className="h-[calc(100vh-3.5rem)] lg:h-screen flex">
      {/* Chat Panel */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Header */}
        <div className="border-b border-border-default p-4 flex items-center justify-between shrink-0">
          <div>
            <h1 className="text-lg font-semibold text-text-primary">Build Advisor</h1>
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
              New Chat
            </Button>
          </div>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-4">
          {messages.length === 0 && !loading && (
            <div className="flex flex-col items-center justify-center h-full text-center">
              <p className="text-3xl mb-4">⌨️</p>
              <h2 className="text-xl font-semibold text-text-primary mb-2">
                What are you looking for?
              </h2>
              <p className="text-sm text-text-muted max-w-md mb-6">
                Describe your ideal keyboard — the sound, feel, size, or budget — and I&apos;ll recommend a complete build.
              </p>
              <div className="flex flex-wrap justify-center gap-2">
                {["Thocky 65% under $200", "Silent office keyboard", "Best gaming linear build"].map((suggestion) => (
                  <button
                    key={suggestion}
                    onClick={() => handleSend(suggestion)}
                    className="px-3 py-1.5 rounded-full border border-border-subtle text-sm text-text-secondary hover:text-accent hover:border-accent/30 transition-colors"
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
              <div className="w-8 h-8 rounded-full bg-accent/20 flex items-center justify-center text-accent text-sm shrink-0">
                AI
              </div>
              <div className="bg-bg-elevated rounded-2xl rounded-bl-md px-4 py-3">
                <p className="text-sm text-text-secondary animate-pulse">{loadingMessage}</p>
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
        <div className="border-t border-border-default p-4 shrink-0">
          <form onSubmit={handleSubmit} className="flex gap-2">
            <textarea
              ref={inputRef}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder={messages.length === 0 ? PLACEHOLDER_QUERIES[placeholderIndex] : "Ask a follow-up question or request changes..."}
              rows={1}
              className="flex-1 bg-bg-elevated border border-border-default rounded-xl px-4 py-3 text-sm text-text-primary placeholder:text-text-muted/50 resize-none focus:border-accent/50 transition-colors"
            />
            <Button type="submit" disabled={loading || !input.trim()}>
              Send
            </Button>
          </form>
        </div>
      </div>

      {/* Build Preview Panel */}
      {showBuildPanel && build && (
        <div className="hidden lg:block w-[420px] border-l border-border-default overflow-y-auto shrink-0">
          <div className="p-4">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-sm font-semibold text-text-muted uppercase tracking-wider">Current Build</h2>
              <button
                onClick={() => setShowBuildPanel(false)}
                className="text-text-muted hover:text-text-primary"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <BuildCard
              build={build as never}
              onSave={isSignedIn && !saved ? handleSave : undefined}
              onTweak={(tweakType) => handleSend(tweakType)}
              saving={saving}
            />
            {saved && (
              <p className="text-sm text-green-400 text-center mt-3">Build saved!</p>
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
      <div className="h-screen flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-accent/30 border-t-accent rounded-full animate-spin" />
      </div>
    }>
      <AdvisorContent />
    </Suspense>
  );
}
