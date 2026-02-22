"use client";

import { useState, useCallback, useEffect, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { useAction, useMutation } from "convex/react";
import { useUser, SignInButton } from "@/lib/auth";
import { api } from "../../../convex/_generated/api";
import { InitialPrompt } from "@/components/builder/InitialPrompt";
import { QuestionFlow } from "@/components/builder/QuestionFlow";
import { GeneratingState } from "@/components/builder/GeneratingState";
import { BuildResult } from "@/components/builder/BuildResult";
import { CustomBuilder } from "@/components/builder/CustomBuilder";
import { KeyboardViewer3D } from "@/components/3d/KeyboardViewer3D";
import { Tabs } from "@/components/ui/Tabs";
import { ToastContainer } from "@/components/ui/Toast";
import { useToast } from "@/hooks/useToast";
import { DEFAULT_VIEWER_CONFIG, buildDataToViewerConfig } from "@/lib/keyboard3d";
import type { KeyboardViewerConfig } from "@/lib/keyboard3d";
import type { BuilderPhase, BuilderQuestion, BuilderAnswer, BuildData } from "@/lib/types";
import type { CustomizerInteractiveProps } from "@/components/builder/KeyboardCustomizer";
import { cn } from "@/lib/utils";
import { decodeStudioConfig } from "@/lib/studioShare";
import { useSubscription } from "@/hooks/useSubscription";
import { PaywallModal } from "@/components/PaywallModal";
import { UsageCounter } from "@/components/UsageCounter";

type BuilderMode = "ai" | "custom";

const BUILDER_SESSION_KEY = "switchy:builder-session";

interface BuilderSession {
  phase: BuilderPhase;
  buildResult: BuildData;
  initialPrompt: string;
  viewerConfig: KeyboardViewerConfig;
}

function getStoredSession(): BuilderSession | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = sessionStorage.getItem(BUILDER_SESSION_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as BuilderSession;
    // Only restore completed builds
    if (parsed.phase === "result" && parsed.buildResult) return parsed;
    return null;
  } catch {
    return null;
  }
}

export default function BuilderPage() {
  return (
    <Suspense fallback={<div className="min-h-[calc(100vh-4rem)]" />}>
      <BuilderPageInner />
    </Suspense>
  );
}

function BuilderPageInner() {
  const { isSignedIn } = useUser();
  const searchParams = useSearchParams();

  // Toast notifications
  const { toasts, showToast, dismissToast } = useToast();

  // Restore previous build session (survives navigation to product detail pages)
  const [restoredSession] = useState(getStoredSession);

  // Mode toggle
  const initialMode = searchParams.get("mode") === "custom" ? "custom" : "ai";
  const [mode, setMode] = useState<BuilderMode>(initialMode);

  // Phase state
  const [phase, setPhase] = useState<BuilderPhase>(restoredSession?.phase ?? "landing");
  const [initialPrompt, setInitialPrompt] = useState(restoredSession?.initialPrompt ?? "");

  // Question state
  const [questions, setQuestions] = useState<BuilderQuestion[]>([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState<BuilderAnswer[]>([]);

  // Build result state
  const [buildResult, setBuildResult] = useState<BuildData | null>(restoredSession?.buildResult ?? null);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  // Loading states
  const [loadingQuestions, setLoadingQuestions] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [tweaking, setTweaking] = useState(false);

  // Paywall state
  const [showPaywall, setShowPaywall] = useState(false);
  const { isPro, isAtLimit, buildsUsed, buildsLimit } = useSubscription();

  // 3D viewer config — seed from restored session, ?studio= param, or defaults
  const [viewerConfig, setViewerConfig] = useState<KeyboardViewerConfig>(() => {
    if (restoredSession?.viewerConfig) return restoredSession.viewerConfig;
    const studioParam = searchParams.get("studio");
    if (studioParam) {
      const decoded = decodeStudioConfig(studioParam);
      return { ...DEFAULT_VIEWER_CONFIG, ...decoded };
    }
    return { ...DEFAULT_VIEWER_CONFIG };
  });

  // Persist build result to sessionStorage for back-button restoration
  useEffect(() => {
    if (phase === "result" && buildResult) {
      try {
        sessionStorage.setItem(BUILDER_SESSION_KEY, JSON.stringify({
          phase,
          buildResult,
          initialPrompt,
          viewerConfig,
        } satisfies BuilderSession));
      } catch { /* quota exceeded — non-critical */ }
    }
  }, [phase, buildResult, initialPrompt, viewerConfig]);

  // Customizer interactive props (from KeyboardCustomizer when on customize step)
  const [customizerProps, setCustomizerProps] = useState<CustomizerInteractiveProps | null>(null);

  // Auto-rotate when not actively interacting
  const autoRotateViewer = mode === "ai"
    ? (phase === "landing" || phase === "generating")
    : !customizerProps;

  // Phase-based camera presets for AI mode
  useEffect(() => {
    if (mode !== "ai") return;
    switch (phase) {
      case "landing":
        setViewerConfig(prev => ({ ...prev, cameraPreset: "default", environment: "studio" }));
        break;
      case "questions":
        setViewerConfig(prev => ({ ...prev, cameraPreset: "default" }));
        break;
      case "generating":
        setViewerConfig(prev => ({ ...prev, cameraPreset: "closeup" }));
        break;
      case "result":
        // Handled by buildDataToViewerConfig below
        break;
    }
  }, [phase, mode]);

  // Convex actions
  const generateQuestions = useAction(api.buildAdvisor.generateQuestions);
  const generateBuildFromAnswers = useAction(api.buildAdvisor.generateBuildFromAnswers);
  const generateBuild = useAction(api.builds.generateBuild);
  const saveBuild = useMutation(api.savedBuilds.save);

  // Sign-in prompt state for unauthenticated users
  const [showSignIn, setShowSignIn] = useState(false);
  const [pendingPrompt, setPendingPrompt] = useState<string | null>(null);

  // Auto-close sign-in modal and resume flow after authentication
  useEffect(() => {
    if (isSignedIn && showSignIn) {
      setShowSignIn(false);
    }
  }, [isSignedIn, showSignIn]);

  // After sign-in completes, auto-submit the pending prompt
  useEffect(() => {
    if (isSignedIn && pendingPrompt) {
      const prompt = pendingPrompt;
      setPendingPrompt(null);
      // Small delay to let Clerk/Convex auth propagate
      const timer = setTimeout(() => {
        handleInitialSubmit(prompt);
      }, 500);
      return () => clearTimeout(timer);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isSignedIn, pendingPrompt]);

  // Phase 1: Handle initial prompt
  const handleInitialSubmit = useCallback(async (prompt: string) => {
    // Require auth before calling Convex actions
    if (!isSignedIn) {
      setPendingPrompt(prompt);
      setShowSignIn(true);
      return;
    }

    // Check paywall before generating
    if (isAtLimit) {
      setShowPaywall(true);
      return;
    }

    setInitialPrompt(prompt);
    setLoadingQuestions(true);
    setPhase("questions");

    try {
      const result = await generateQuestions({ initialPrompt: prompt });
      setQuestions(result as BuilderQuestion[]);
      setCurrentQuestionIndex(0);
    } catch (err) {
      console.error("Failed to generate questions:", err);
      // Fallback: skip to generating phase directly
      setPhase("generating");
      setGenerating(true);
      try {
        const build = await generateBuild({ query: prompt });
        const buildData = build as unknown as BuildData;
        setBuildResult(buildData);
        setViewerConfig({ ...buildDataToViewerConfig(buildData), cameraPreset: "hero" });
        setPhase("result");
      } catch (buildErr: unknown) {
        if (buildErr instanceof Error && buildErr.message.includes("FREE_TIER_LIMIT_REACHED")) {
          setShowPaywall(true);
          setPhase("landing");
        } else {
          showToast({ message: "Failed to generate build. Please try again.", variant: "error" });
          setPhase("landing");
        }
      }
      setGenerating(false);
    } finally {
      setLoadingQuestions(false);
    }
  }, [generateQuestions, generateBuild, isAtLimit, isSignedIn, showToast]);

  // Auto-submit from ?q= query param (e.g. from homepage)
  const [autoSubmitted, setAutoSubmitted] = useState(false);
  useEffect(() => {
    const q = searchParams.get("q");
    if (q && !autoSubmitted && phase === "landing" && mode === "ai") {
      setAutoSubmitted(true);
      handleInitialSubmit(q);
    }
  }, [searchParams, autoSubmitted, phase, handleInitialSubmit, mode]);

  // Phase 2: Handle question answer
  const handleAnswer = useCallback(async (questionId: string, value: string | string[] | number) => {
    const newAnswer: BuilderAnswer = { questionId, value };
    const newAnswers = [...answers, newAnswer];
    setAnswers(newAnswers);

    if (currentQuestionIndex < questions.length - 1) {
      // Next question
      setCurrentQuestionIndex((prev) => prev + 1);
    } else {
      // All questions answered -> generate build
      setPhase("generating");
      setGenerating(true);

      try {
        const result = await generateBuildFromAnswers({
          initialPrompt,
          answers: newAnswers.map((a) => ({
            questionId: a.questionId,
            value: a.value,
          })),
        });
        const resultData = result as unknown as BuildData;
        setBuildResult(resultData);
        setViewerConfig({ ...buildDataToViewerConfig(resultData), cameraPreset: "hero" });
        setPhase("result");
      } catch (err: unknown) {
        if (err instanceof Error && err.message.includes("FREE_TIER_LIMIT_REACHED")) {
          setShowPaywall(true);
          setPhase("landing");
        } else {
          console.error("Failed to generate build:", err);
          // Fallback to simple query
          try {
            const build = await generateBuild({ query: initialPrompt });
            const fallbackData = build as unknown as BuildData;
            setBuildResult(fallbackData);
            setViewerConfig({ ...buildDataToViewerConfig(fallbackData), cameraPreset: "hero" });
            setPhase("result");
          } catch (fallbackErr: unknown) {
            if (fallbackErr instanceof Error && fallbackErr.message.includes("FREE_TIER_LIMIT_REACHED")) {
              setShowPaywall(true);
            } else {
              showToast({ message: "Failed to generate build. Please try again.", variant: "error" });
            }
            setPhase("landing");
          }
        }
      } finally {
        setGenerating(false);
      }
    }
  }, [answers, currentQuestionIndex, questions.length, generateBuildFromAnswers, generateBuild, initialPrompt, showToast]);

  // Handle viewer config updates from questions
  const handleViewerUpdate = useCallback((update: Partial<KeyboardViewerConfig>) => {
    setViewerConfig((prev) => ({ ...prev, ...update }));
  }, []);

  // Back button in question flow
  const handleBack = useCallback(() => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex((prev) => prev - 1);
      setAnswers((prev) => prev.slice(0, -1));
    }
  }, [currentQuestionIndex]);

  // Jump to a previous question
  const handleJumpToQuestion = useCallback((questionIndex: number) => {
    setCurrentQuestionIndex(questionIndex);
    setAnswers((prev) => prev.slice(0, questionIndex));
  }, []);

  // Abort generating
  const handleAbort = useCallback(() => {
    setPhase("landing");
    setGenerating(false);
    showToast({ message: "Build generation cancelled.", variant: "info" });
  }, [showToast]);

  // Phase 4: Handle save
  const handleSave = useCallback(async () => {
    if (!buildResult || !isSignedIn) return;
    setSaving(true);
    try {
      await saveBuild({
        query: initialPrompt,
        buildName: buildResult.buildName,
        summary: buildResult.summary,
        components: buildResult.components,
        recommendedMods: buildResult.recommendedMods,
        estimatedTotal: buildResult.estimatedTotal,
        soundProfileExpected: buildResult.soundProfileExpected,
        buildDifficulty: buildResult.buildDifficulty,
        notes: buildResult.notes,
      });
      setSaved(true);
    } catch (err) {
      console.error("Failed to save build:", err);
      showToast({ message: "Failed to save build. Please try again.", variant: "error" });
    } finally {
      setSaving(false);
    }
  }, [buildResult, isSignedIn, saveBuild, initialPrompt, showToast]);

  // Handle tweak
  const handleTweak = useCallback(async (tweakText: string) => {
    if (!buildResult) return;
    setTweaking(true);
    try {
      const result = await generateBuild({
        query: `${initialPrompt}. Modification: ${tweakText}`,
        previousBuild: JSON.stringify(buildResult),
      });
      const tweakedData = result as unknown as BuildData;
      setBuildResult(tweakedData);
      setViewerConfig({ ...buildDataToViewerConfig(tweakedData), cameraPreset: "hero" });
      setSaved(false);
    } catch (err: unknown) {
      if (err instanceof Error && err.message.includes("FREE_TIER_LIMIT_REACHED")) {
        setShowPaywall(true);
      } else {
        console.error("Failed to tweak build:", err);
        showToast({ message: "Failed to tweak build. Please try again.", variant: "error" });
      }
    } finally {
      setTweaking(false);
    }
  }, [buildResult, generateBuild, initialPrompt, showToast]);

  // Reset
  const handleReset = useCallback(() => {
    try { sessionStorage.removeItem(BUILDER_SESSION_KEY); } catch { /* noop */ }
    setPhase("landing");
    setInitialPrompt("");
    setQuestions([]);
    setCurrentQuestionIndex(0);
    setAnswers([]);
    setBuildResult(null);
    setSaved(false);
    setViewerConfig({ ...DEFAULT_VIEWER_CONFIG });
  }, []);

  // Show mode tabs only when AI mode is at landing, or always in custom mode
  const showModeTabs = mode === "custom" || phase === "landing";

  // Compute the viewer config for the right panel
  // If customizer has interactive props, use its merged config; otherwise use base viewerConfig
  const rightPanelConfig = customizerProps?.config ?? viewerConfig;

  return (
    <div className="relative h-[calc(100vh-4rem)] overflow-hidden">
      {/* ── Mobile: compact 3D viewer at top ── */}
      <div className="lg:hidden shrink-0">
        <KeyboardViewer3D
          config={rightPanelConfig}
          height="280px"
          autoRotate={autoRotateViewer}
          className="rounded-none border-0"
          {...(customizerProps ? {
            interactive: true,
            selectionMode: customizerProps.selectionMode,
            selectedKeys: customizerProps.selectedKeys,
            onKeySelect: customizerProps.onKeySelect,
            onKeyPaint: customizerProps.onKeyPaint,
          } : {})}
        />
      </div>

      {/* ── Desktop: 3D viewer as seamless full-page background ── */}
      <div className="hidden lg:block absolute inset-0">
        <KeyboardViewer3D
          config={rightPanelConfig}
          height="100%"
          autoRotate={autoRotateViewer}
          className="rounded-none border-0"
          customizeMode={!!customizerProps}
          {...(customizerProps ? {
            interactive: true,
            selectionMode: customizerProps.selectionMode,
            selectedKeys: customizerProps.selectedKeys,
            onKeySelect: customizerProps.onKeySelect,
            onKeyPaint: customizerProps.onKeyPaint,
          } : {})}
        />
      </div>

      {/* ── Desktop: soft radial vignette behind text zone (no hard edges) ── */}
      <div
        className="hidden lg:block absolute inset-0 pointer-events-none"
        style={{
          background: `radial-gradient(ellipse 55% 70% at 25% 50%, rgba(0,0,0,0.6) 0%, rgba(0,0,0,0.25) 50%, transparent 100%)`,
        }}
      />

      {/* ── Content panel (floats above the 3D scene) ── */}
      <div className={cn(
        "relative z-10 h-full [scrollbar-width:none] [&::-webkit-scrollbar]:hidden lg:w-[50%] lg:min-w-[480px]",
        mode === "ai" && phase === "result"
          ? "overflow-y-auto lg:overflow-hidden"
          : "overflow-y-auto",
        mode === "ai" && (phase === "landing" || phase === "generating" || (phase === "questions" && questions.length === 0))
          ? "flex flex-col items-center justify-center px-4 sm:px-6 lg:px-10 pb-12"
          : "px-4 sm:px-6 lg:px-10 pt-6 pb-12"
      )}>
        {/* Mode tabs */}
        {showModeTabs && (
          <div className={cn(
            "flex justify-center",
            mode === "ai" && "mb-8",
            mode === "custom" && "mb-6"
          )}>
            <Tabs
              tabs={[
                { label: "AI Advisor", value: "ai" },
                { label: "Custom Build", value: "custom" },
              ]}
              activeTab={mode}
              onChange={(v) => {
                setMode(v as BuilderMode);
                setCustomizerProps(null);
              }}
              className="bg-black/20 border-white/[0.08]"
            />
          </div>
        )}

        {/* AI Advisor mode */}
        {mode === "ai" && (
          <>
            {/* Usage counter for free users */}
            {phase === "landing" && !isPro && isSignedIn && (
              <div className="mb-4">
                <UsageCounter buildsUsed={buildsUsed} buildsLimit={buildsLimit} />
              </div>
            )}

            {/* Phase 1: Landing */}
            {phase === "landing" && (
              <InitialPrompt onSubmit={handleInitialSubmit} loading={loadingQuestions} />
            )}

            {/* Phase 2: Questions */}
            {phase === "questions" && questions.length > 0 && (
              <QuestionFlow
                questions={questions}
                currentIndex={currentQuestionIndex}
                answers={answers}
                onAnswer={handleAnswer}
                onViewerUpdate={handleViewerUpdate}
                onBack={handleBack}
                onJumpToQuestion={handleJumpToQuestion}
              />
            )}

            {/* Loading questions state */}
            {phase === "questions" && questions.length === 0 && loadingQuestions && (
              <div className="flex flex-col items-center justify-center py-16">
                <div className="w-10 h-10 border-2 border-accent/30 border-t-accent rounded-full animate-spin mb-4" />
                <p className="text-sm text-text-secondary">Crafting your questions...</p>
              </div>
            )}

            {/* Phase 3: Generating */}
            {phase === "generating" && <GeneratingState onAbort={handleAbort} onViewerUpdate={handleViewerUpdate} />}

            {/* Phase 4: Build Result */}
            {phase === "result" && buildResult && (
              <BuildResult
                build={buildResult}
                onSave={isSignedIn ? handleSave : undefined}
                onTweak={handleTweak}
                onReset={handleReset}
                saving={saving}
                saved={saved}
                tweaking={tweaking}
              />
            )}
          </>
        )}

        {/* Custom Build mode */}
        {mode === "custom" && (
          <CustomBuilder
            onViewerUpdate={handleViewerUpdate}
            viewerConfig={viewerConfig}
            onCustomizerPropsChange={setCustomizerProps}
          />
        )}
      </div>

      {/* Toast notifications */}
      <ToastContainer toasts={toasts} onDismiss={dismissToast} />

      {/* Paywall modal */}
      <PaywallModal isOpen={showPaywall} onClose={() => setShowPaywall(false)} />

      {/* Sign-in modal for unauthenticated users */}
      {showSignIn && !isSignedIn && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
          <div className="bg-bg-surface border border-border rounded-2xl p-8 max-w-sm mx-4 text-center shadow-xl">
            <h3 className="text-lg font-semibold text-text-primary mb-2">Sign in to continue</h3>
            <p className="text-sm text-text-secondary mb-6">
              Create a free account to use the AI Build Advisor.
            </p>
            <div className="flex gap-3 justify-center">
              <button
                onClick={() => { setShowSignIn(false); setPendingPrompt(null); }}
                className="px-4 py-2 text-sm rounded-lg border border-border text-text-secondary hover:bg-bg-elevated transition-colors"
              >
                Cancel
              </button>
              <SignInButton mode="modal">
                <button className="px-4 py-2 text-sm rounded-lg bg-accent text-white hover:opacity-90 transition-opacity">
                  Sign in
                </button>
              </SignInButton>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
