"use client";

import { useState, useCallback, useEffect, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { useAction, useMutation } from "convex/react";
import { useUser } from "@clerk/nextjs";
import { api } from "../../../convex/_generated/api";
import { InitialPrompt } from "@/components/builder/InitialPrompt";
import { QuestionFlow } from "@/components/builder/QuestionFlow";
import { GeneratingState } from "@/components/builder/GeneratingState";
import { BuildResult } from "@/components/builder/BuildResult";
import { KeyboardViewer3D } from "@/components/3d/KeyboardViewer3D";
import { DEFAULT_VIEWER_CONFIG } from "@/lib/keyboard3d";
import type { KeyboardViewerConfig } from "@/lib/keyboard3d";
import type { BuilderPhase, BuilderQuestion, BuilderAnswer, BuildData } from "@/lib/types";
import { cn } from "@/lib/utils";

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

  // 3D viewer config
  const [viewerConfig, setViewerConfig] = useState<KeyboardViewerConfig>({
    ...DEFAULT_VIEWER_CONFIG,
  });

  // Convex actions
  const generateQuestions = useAction(api.buildAdvisor.generateQuestions);
  const generateBuildFromAnswers = useAction(api.buildAdvisor.generateBuildFromAnswers);
  const generateBuild = useAction(api.builds.generateBuild);
  const saveBuild = useMutation(api.savedBuilds.save);

  // Phase 1: Handle initial prompt
  const handleInitialSubmit = useCallback(async (prompt: string) => {
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
      } catch {
        setPhase("landing");
      }
      setGenerating(false);
    } finally {
      setLoadingQuestions(false);
    }
  }, [generateQuestions, generateBuild]);

  // Auto-submit from ?q= query param (e.g. from homepage)
  const [autoSubmitted, setAutoSubmitted] = useState(false);
  useEffect(() => {
    const q = searchParams.get("q");
    if (q && !autoSubmitted && phase === "landing") {
      setAutoSubmitted(true);
      handleInitialSubmit(q);
    }
  }, [searchParams, autoSubmitted, phase, handleInitialSubmit]);

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
      } catch (err) {
        console.error("Failed to generate build:", err);
        // Fallback to simple query
        try {
          const build = await generateBuild({ query: initialPrompt });
          setBuildResult(build as unknown as BuildData);
          setPhase("result");
        } catch {
          setPhase("landing");
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
    } catch (err) {
      console.error("Failed to tweak build:", err);
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

  return (
    <div className="relative min-h-[calc(100vh-4rem)]">
      {/* Background: 3D viewer fills entire area */}
      <div className="absolute inset-0 z-0">
        <KeyboardViewer3D config={viewerConfig} height="100%" autoRotate className="rounded-none border-0 bg-transparent" />
        {/* Readability gradient — opacity varies by phase */}
        <div className={cn(
          "absolute inset-0 bg-gradient-to-b from-bg-primary/40 via-bg-primary/60 to-bg-primary/80",
          phase === "landing" && "from-bg-primary/20 via-bg-primary/40 to-bg-primary/70",
          phase === "result" && "from-bg-primary/50 via-bg-primary/70 to-bg-primary/90"
        )} />
      </div>
      {/* Content overlay */}
      <div className="relative z-10 flex flex-col items-center justify-center min-h-[calc(100vh-4rem)] px-4 sm:px-6 pb-12">
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
      </div>
    </div>
  );
}
