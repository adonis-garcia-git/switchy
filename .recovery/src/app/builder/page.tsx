"use client";

import { useState, useCallback, useEffect, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { useAction, useMutation } from "convex/react";
import { useUser, SignInButton } from "@clerk/nextjs";
import { api } from "../../../convex/_generated/api";
import { InitialPrompt } from "@/components/builder/InitialPrompt";
import { QuestionFlow } from "@/components/builder/QuestionFlow";
import { GeneratingState } from "@/components/builder/GeneratingState";
import { BuildResult } from "@/components/builder/BuildResult";
import { CustomBuilder } from "@/components/builder/CustomBuilder";
import { KeyboardViewer3D } from "@/components/3d/KeyboardViewer3D";
import { Tabs } from "@/components/ui/Tabs";
import { DEFAULT_VIEWER_CONFIG, buildDataToViewerConfig } from "@/lib/keyboard3d";
import type { KeyboardViewerConfig } from "@/lib/keyboard3d";
import type { BuilderPhase, BuilderQuestion, BuilderAnswer, BuildData } from "@/lib/types";
import type { CustomizerInteractiveProps } from "@/components/builder/KeyboardCustomizer";
import { cn } from "@/lib/utils";
import { useSubscription } from "@/hooks/useSubscription";
import { PaywallModal } from "@/components/PaywallModal";
import { UsageCounter } from "@/components/UsageCounter";

type BuilderMode = "ai" | "custom";

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

  // Mode toggle
  const initialMode = searchParams.get("mode") === "custom" ? "custom" : "ai";
  const [mode, setMode] = useState<BuilderMode>(initialMode);

  // Phase state
  const [phase, setPhase] = useState<BuilderPhase>("landing");
  const [initialPrompt, setInitialPrompt] = useState("");

  // Question state
  const [questions, setQuestions] = useState<BuilderQuestion[]>([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState<BuilderAnswer[]>([]);

  // Build result state
  const [buildResult, setBuildResult] = useState<BuildData | null>(null);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  // Loading states
  const [loadingQuestions, setLoadingQuestions] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [tweaking, setTweaking] = useState(false);

  // Paywall state
  const [showPaywall, setShowPaywall] = useState(false);
  const { isPro, isAtLimit, buildsUsed, buildsLimit } = useSubscription();

  // 3D viewer config
  const [viewerConfig, setViewerConfig] = useState<KeyboardViewerConfig>({
    ...DEFAULT_VIEWER_CONFIG,
  });

  // Customizer interactive props (from KeyboardCustomizer when on customize step)
  const [customizerProps, setCustomizerProps] = useState<CustomizerInteractiveProps | null>(null);

  // Auto-rotate when not actively interacting
  const autoRotateViewer = mode === "ai"
    ? (phase === "landing" || phase === "questions" || phase === "generating")
    : !customizerProps;

  // Convex actions
  const generateQuestions = useAction(api.buildAdvisor.generateQuestions);
  const generateBuildFromAnswers = useAction(api.buildAdvisor.generateBuildFromAnswers);
  const generateBuild = useAction(api.builds.generateBuild);
  const saveBuild = useMutation(api.savedBuilds.save);

  // Sign-in prompt state for unauthenticated users
  const [showSignIn, setShowSignIn] = useState(false);

  // Phase 1: Handle initial prompt
  const handleInitialSubmit = useCallback(async (prompt: string) => {
    // Require auth before calling Convex actions
    if (!isSignedIn) {
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
        setBuildResult(build as unknown as BuildData);
        setPhase("result");
      } catch (buildErr: unknown) {
        if (buildErr instanceof Error && buildErr.message.includes("FREE_TIER_LIMIT_REACHED")) {
          setShowPaywall(true);
          setPhase("landing");
        } else {
          setPhase("landing");
        }
      }
      setGenerating(false);
    } finally {
      setLoadingQuestions(false);
    }
  }, [generateQuestions, generateBuild, isAtLimit, isSignedIn]);

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
        setBuildResult(result as unknown as BuildData);
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
            setBuildResult(build as unknown as BuildData);
            setPhase("result");
          } catch (fallbackErr: unknown) {
            if (fallbackErr instanceof Error && fallbackErr.message.includes("FREE_TIER_LIMIT_REACHED")) {
              setShowPaywall(true);
            }
            setPhase("landing");
          }
        }
      } finally {
        setGenerating(false);
      }
    }
  }, [answers, currentQuestionIndex, questions.length, generateBuildFromAnswers, generateBuild, initialPrompt]);

  // Handle viewer config updates from questions
  const handleViewerUpdate = useCallback((update: Partial<KeyboardViewerConfig>) => {
    setViewerConfig((prev) => ({ ...prev, ...update }));
  }, []);

  // Apply build result data to the 3D viewer when entering result phase
  useEffect(() => {
    if (phase === "result" && buildResult) {
      const aiConfig = buildDataToViewerConfig(buildResult);
      setViewerConfig((prev) => {
        // Preserve user's explicit color/material choices from questions phase
        // (anything that differs from the defaults was explicitly chosen)
        const merged = { ...aiConfig };
        if (prev.caseColor !== DEFAULT_VIEWER_CONFIG.caseColor) merged.caseColor = prev.caseColor;
        if (prev.keycapColor !== DEFAULT_VIEWER_CONFIG.keycapColor) merged.keycapColor = prev.keycapColor;
        if (prev.keycapAccentColor !== DEFAULT_VIEWER_CONFIG.keycapAccentColor) merged.keycapAccentColor = prev.keycapAccentColor;
        if (prev.keycapMaterial !== DEFAULT_VIEWER_CONFIG.keycapMaterial) merged.keycapMaterial = prev.keycapMaterial;
        return merged;
      });
    }
  }, [phase, buildResult]);

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
    } finally {
      setSaving(false);
    }
  }, [buildResult, isSignedIn, saveBuild, initialPrompt]);

  // Handle tweak
  const handleTweak = useCallback(async (tweakText: string) => {
    if (!buildResult) return;
    setTweaking(true);
    try {
      const result = await generateBuild({
        query: `${initialPrompt}. Modification: ${tweakText}`,
        previousBuild: JSON.stringify(buildResult),
      });
      setBuildResult(result as unknown as BuildData);
      setSaved(false);
    } catch (err: unknown) {
      if (err instanceof Error && err.message.includes("FREE_TIER_LIMIT_REACHED")) {
        setShowPaywall(true);
      } else {
        console.error("Failed to tweak build:", err);
      }
    } finally {
      setTweaking(false);
    }
  }, [buildResult, generateBuild, initialPrompt]);

  // Reset
  const handleReset = useCallback(() => {
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
        "relative z-10 h-full overflow-y-auto lg:w-[50%] lg:min-w-[480px]",
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
                if (v === "ai") handleReset();
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
            {phase === "generating" && <GeneratingState />}

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

      {/* Paywall modal */}
      <PaywallModal isOpen={showPaywall} onClose={() => setShowPaywall(false)} />

      {/* Sign-in modal for unauthenticated users */}
      {showSignIn && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
          <div className="bg-bg-surface border border-border rounded-2xl p-8 max-w-sm mx-4 text-center shadow-xl">
            <h3 className="text-lg font-semibold text-text-primary mb-2">Sign in to continue</h3>
            <p className="text-sm text-text-secondary mb-6">
              Create a free account to use the AI Build Advisor.
            </p>
            <div className="flex gap-3 justify-center">
              <button
                onClick={() => setShowSignIn(false)}
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
