"use client";

import { useState } from "react";
import { cn, formatPriceWhole } from "@/lib/utils";
import { ComponentCard } from "./ComponentCard";
import { TweakInput } from "./TweakInput";
import { CostBreakdown } from "./CostBreakdown";
import { Badge } from "@/components/ui/Badge";
import { Modal } from "@/components/ui/Modal";
import { Tabs } from "@/components/ui/Tabs";
import { BuildQuoteModal } from "@/components/BuildQuoteModal";
import type { BuildData } from "@/lib/types";
import { BuilderUpsells } from "./BuilderUpsells";
import { ModCard } from "./ModCard";
import { Tooltip } from "@/components/ui/Tooltip";

interface BuildResultProps {
  build: BuildData;
  onSave?: () => void;
  onTweak?: (tweakText: string) => void;
  onReset?: () => void;
  saving?: boolean;
  saved?: boolean;
  tweaking?: boolean;
}

export function BuildResult({
  build,
  onSave,
  onTweak,
  onReset,
  saving,
  saved,
  tweaking,
}: BuildResultProps) {
  const [copied, setCopied] = useState(false);
  const [showQuoteModal, setShowQuoteModal] = useState(false);
  const [showResetConfirm, setShowResetConfirm] = useState(false);
  const [activeTab, setActiveTab] = useState("components");

  const handleCopy = async () => {
    const text = `${build.buildName}\n${build.summary}\n\nComponents:\n- Keyboard: ${build.components.keyboardKit?.name} ($${build.components.keyboardKit?.price})\n- Switches: ${build.components.switches?.name} (${build.components.switches?.quantity}x @ $${build.components.switches?.priceEach})\n- Keycaps: ${build.components.keycaps?.name} ($${build.components.keycaps?.price})\n- Stabilizers: ${build.components.stabilizers?.name} ($${build.components.stabilizers?.price})\n\nTotal: $${build.estimatedTotal}\nSound: ${build.soundProfileExpected}\nDifficulty: ${build.buildDifficulty}`;
    await navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleShare = async () => {
    if (navigator.share) {
      await navigator.share({
        title: build.buildName,
        text: `Check out this keyboard build: ${build.buildName} - ${build.summary}`,
      });
    } else {
      handleCopy();
    }
  };

  const handleResetClick = () => {
    if (saved) {
      onReset?.();
    } else {
      setShowResetConfirm(true);
    }
  };

  return (
    <>
      {/* ── Left panel: main content ── */}
      <div className="w-full max-w-2xl backdrop-blur-md bg-bg-primary/50 rounded-2xl p-5 sm:p-6 border border-border-subtle/30">
        {/* Build header — compact */}
        <div className="mb-3">
          <h2 className="text-xl sm:text-2xl font-bold text-text-primary font-[family-name:var(--font-outfit)] tracking-tight leading-tight">
            {build.buildName}
          </h2>
          <p className="text-xs text-text-secondary mt-1 leading-relaxed line-clamp-2">
            {build.summary}
          </p>
        </div>

        {/* Stats row */}
        <div className="flex items-center gap-3 flex-wrap mb-4">
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-accent-dim border border-accent/20">
            <span className="text-[10px] text-text-muted">Total</span>
            <span className="text-base font-bold font-[family-name:var(--font-mono)] text-accent">
              {formatPriceWhole(build.estimatedTotal)}
            </span>
          </div>
          <Badge variant={
            build.buildDifficulty === "beginner-friendly" ? "success" :
            build.buildDifficulty === "intermediate" ? "warning" : "default"
          } size="md">
            {build.buildDifficulty}
          </Badge>
          {build.soundProfileExpected && (
            <div className="px-2.5 py-1 rounded-full bg-bg-elevated border border-border-subtle text-[11px] text-text-secondary">
              {build.soundProfileExpected}
            </div>
          )}
        </div>

        {/* Tabs */}
        <div className="mb-4">
          <Tabs
            tabs={[
              { label: "Components", value: "components" },
              { label: "Details", value: "details" },
            ]}
            activeTab={activeTab}
            onChange={setActiveTab}
          />
        </div>

        {/* Tab: Components */}
        {activeTab === "components" && (
          <div className="space-y-4">
            <CostBreakdown components={build.components} total={build.estimatedTotal} />

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {build.components.keyboardKit && (
                <ComponentCard
                  compact
                  type="keyboardKit"
                  name={build.components.keyboardKit.name}
                  price={build.components.keyboardKit.price}
                  reason={build.components.keyboardKit.reason}
                  imageUrl={build.components.keyboardKit.imageUrl}
                  productUrl={build.components.keyboardKit.productUrl}
                  detailUrl={build.components.keyboardKit.detailUrl}
                />
              )}
              {build.components.switches && (
                <ComponentCard
                  compact
                  type="switches"
                  name={build.components.switches.name}
                  price={build.components.switches.quantity * build.components.switches.priceEach}
                  reason={build.components.switches.reason}
                  quantity={build.components.switches.quantity}
                  priceEach={build.components.switches.priceEach}
                  imageUrl={build.components.switches.imageUrl}
                  productUrl={build.components.switches.productUrl}
                  detailUrl={build.components.switches.detailUrl}
                />
              )}
              {build.components.keycaps && (
                <ComponentCard
                  compact
                  type="keycaps"
                  name={build.components.keycaps.name}
                  price={build.components.keycaps.price}
                  reason={build.components.keycaps.reason}
                  imageUrl={build.components.keycaps.imageUrl}
                  productUrl={build.components.keycaps.productUrl}
                  detailUrl={build.components.keycaps.detailUrl}
                />
              )}
              {build.components.stabilizers && (
                <ComponentCard
                  compact
                  type="stabilizers"
                  name={build.components.stabilizers.name}
                  price={build.components.stabilizers.price}
                  reason={build.components.stabilizers.reason}
                  imageUrl={build.components.stabilizers.imageUrl}
                  productUrl={build.components.stabilizers.productUrl}
                  detailUrl={build.components.stabilizers.detailUrl}
                />
              )}
            </div>
          </div>
        )}

        {/* Tab: Details */}
        {activeTab === "details" && (
          <div className="space-y-4">
            {/* Recommended mods */}
            {build.recommendedMods && build.recommendedMods.length > 0 && (
              <div>
                <h3 className="text-xs text-text-muted uppercase tracking-wider font-medium font-[family-name:var(--font-outfit)] mb-3">
                  Recommended Mods
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {build.recommendedMods.map((mod, i) => (
                    <ModCard
                      key={i}
                      mod={mod.mod}
                      cost={mod.cost}
                      effect={mod.effect}
                      difficulty={mod.difficulty}
                      showLink
                    />
                  ))}
                </div>
              </div>
            )}

            {/* Notes */}
            {build.notes && (
              <div className="p-3 rounded-xl bg-bg-elevated border border-border-subtle">
                <p className="text-xs text-text-muted uppercase tracking-wider font-medium mb-1.5 font-[family-name:var(--font-outfit)]">Notes</p>
                <p className="text-xs text-text-secondary leading-relaxed">{build.notes}</p>
              </div>
            )}

            {/* Have This Built CTA */}
            <div className="text-center pt-2">
              <button
                onClick={() => setShowQuoteModal(true)}
                className={cn(
                  "inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold",
                  "bg-bg-elevated border border-border-default text-text-secondary",
                  "hover:border-border-accent hover:text-accent",
                  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/40",
                  "active:scale-[0.97]",
                  "transition-[border-color,color,transform] duration-150"
                )}
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M11.42 15.17l-5.69 3.29a.75.75 0 01-1.12-.67V4.44a.75.75 0 01.37-.64l5.26-3.04a.75.75 0 01.75 0l5.26 3.04a.75.75 0 01.37.64v13.35a.75.75 0 01-1.12.67l-5.69-3.29a.75.75 0 00-.75 0z" />
                </svg>
                Have This Built For Me
              </button>
              <p className="text-[10px] text-text-muted mt-1.5">
                Get a quote from an expert builder
              </p>
            </div>

            {/* Upgrade picks (sponsored) */}
            <BuilderUpsells currentComponents={build.components} />
          </div>
        )}
      </div>

      {/* ── Top-right floating toolbar (desktop) ── */}
      <div className="fixed top-20 right-6 z-20 hidden lg:flex flex-col gap-2">
        {onSave && (
          <Tooltip content={saved ? "Saved" : "Save Build"} side="left">
            <button
              onClick={onSave}
              disabled={saving || saved}
              className={cn(
                "w-10 h-10 rounded-xl flex items-center justify-center",
                "backdrop-blur-md border transition-[border-color,background-color,transform] duration-150",
                "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/40",
                "active:scale-[0.93]",
                saved
                  ? "bg-accent/20 border-accent/30 text-accent"
                  : saving
                    ? "bg-bg-surface/80 border-border-subtle text-text-muted animate-pulse"
                    : "bg-bg-surface/80 border-border-subtle text-text-secondary hover:border-accent hover:text-accent hover:bg-accent/10"
              )}
            >
              {saved ? (
                <svg className="w-4.5 h-4.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                </svg>
              ) : (
                <svg className="w-4.5 h-4.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" />
                </svg>
              )}
            </button>
          </Tooltip>
        )}
        <Tooltip content="Share" side="left">
          <button
            onClick={handleShare}
            className={cn(
              "w-10 h-10 rounded-xl flex items-center justify-center",
              "backdrop-blur-md bg-bg-surface/80 border border-border-subtle text-text-secondary",
              "hover:border-accent hover:text-accent hover:bg-accent/10",
              "transition-[border-color,background-color,color,transform] duration-150",
              "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/40",
              "active:scale-[0.93]"
            )}
          >
            <svg className="w-4.5 h-4.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
            </svg>
          </button>
        </Tooltip>
        <Tooltip content={copied ? "Copied!" : "Copy"} side="left">
          <button
            onClick={handleCopy}
            className={cn(
              "w-10 h-10 rounded-xl flex items-center justify-center",
              "backdrop-blur-md border transition-[border-color,background-color,color,transform] duration-150",
              "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/40",
              "active:scale-[0.93]",
              copied
                ? "bg-accent/20 border-accent/30 text-accent"
                : "bg-bg-surface/80 border-border-subtle text-text-secondary hover:border-accent hover:text-accent hover:bg-accent/10"
            )}
          >
            {copied ? (
              <svg className="w-4.5 h-4.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
              </svg>
            ) : (
              <svg className="w-4.5 h-4.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
              </svg>
            )}
          </button>
        </Tooltip>
        {onReset && (
          <Tooltip content="Start Over" side="left">
            <button
              onClick={handleResetClick}
              className={cn(
                "w-10 h-10 rounded-xl flex items-center justify-center",
                "backdrop-blur-md bg-bg-surface/80 border border-border-subtle text-text-secondary",
                "hover:border-red-400/50 hover:text-red-400 hover:bg-red-400/10",
                "transition-[border-color,background-color,color,transform] duration-150",
                "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/40",
                "active:scale-[0.93]"
              )}
            >
              <svg className="w-4.5 h-4.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
            </button>
          </Tooltip>
        )}
      </div>

      {/* ── Bottom-right floating tweak bar (desktop) ── */}
      {onTweak && (
        <div className="fixed bottom-6 right-6 z-20 w-80 hidden lg:block">
          <div className="backdrop-blur-md bg-bg-surface/80 border border-border-subtle rounded-xl p-3 shadow-[0_8px_32px_rgba(0,0,0,0.3)]">
            <p className="text-[10px] text-text-muted uppercase tracking-wider font-medium font-[family-name:var(--font-outfit)] mb-2">
              Refine Your Build
            </p>
            <TweakInput onSubmit={onTweak} loading={tweaking} />
          </div>
        </div>
      )}

      {/* ── Mobile inline actions ── */}
      <div className="lg:hidden mt-4 space-y-3">
        <div className="flex items-center justify-center gap-2 flex-wrap">
          {onSave && (
            <button
              onClick={onSave}
              disabled={saving || saved}
              className={cn(
                "px-4 py-2 rounded-xl text-xs font-semibold flex items-center gap-1.5",
                "transition-[background-color,border-color,color] duration-150",
                "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/40",
                "active:scale-[0.97]",
                saved
                  ? "bg-accent/20 border border-accent/30 text-accent"
                  : "bg-accent text-bg-primary hover:bg-accent-hover"
              )}
            >
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d={saved ? "M5 13l4 4L19 7" : "M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z"} />
              </svg>
              {saved ? "Saved" : saving ? "Saving..." : "Save"}
            </button>
          )}
          <button
            onClick={handleShare}
            className="px-4 py-2 rounded-xl text-xs font-semibold flex items-center gap-1.5 bg-bg-elevated border border-border-subtle text-text-secondary hover:text-accent hover:border-border-accent transition-[border-color,color] duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/40 active:scale-[0.97]"
          >
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
            </svg>
            Share
          </button>
          <button
            onClick={handleCopy}
            className="px-4 py-2 rounded-xl text-xs font-semibold flex items-center gap-1.5 bg-bg-elevated border border-border-subtle text-text-secondary hover:text-accent hover:border-border-accent transition-[border-color,color] duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/40 active:scale-[0.97]"
          >
            {copied ? "Copied!" : "Copy"}
          </button>
          {onReset && (
            <button
              onClick={handleResetClick}
              className="px-4 py-2 rounded-xl text-xs font-semibold text-text-muted hover:text-red-400 transition-colors duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/40 active:scale-[0.97]"
            >
              Start Over
            </button>
          )}
        </div>
        {onTweak && (
          <div>
            <p className="text-[10px] text-text-muted uppercase tracking-wider font-medium font-[family-name:var(--font-outfit)] mb-2 text-center">
              Refine Your Build
            </p>
            <TweakInput onSubmit={onTweak} loading={tweaking} />
          </div>
        )}
      </div>

      {/* ── Modals ── */}
      <BuildQuoteModal
        isOpen={showQuoteModal}
        onClose={() => setShowQuoteModal(false)}
        buildSpec={build}
      />

      <Modal
        isOpen={showResetConfirm}
        onClose={() => setShowResetConfirm(false)}
        title="Start over?"
        size="sm"
      >
        <p className="text-sm text-text-secondary mb-6 leading-relaxed">
          Your current build hasn&apos;t been saved. Starting over will discard all recommendations.
        </p>
        <div className="flex items-center gap-3 justify-end">
          <button
            onClick={() => setShowResetConfirm(false)}
            className="px-4 py-2 text-sm rounded-lg text-text-secondary hover:text-text-primary transition-colors duration-150"
          >
            Keep Building
          </button>
          <button
            onClick={() => {
              setShowResetConfirm(false);
              onReset?.();
            }}
            className="px-4 py-2 text-sm rounded-lg font-semibold bg-red-500 text-white hover:bg-red-600 transition-[background-color] duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-400/40 active:scale-[0.97]"
          >
            Discard &amp; Start Over
          </button>
        </div>
      </Modal>
    </>
  );
}
