"use client";

import { useState } from "react";
import { cn, formatPriceWhole } from "@/lib/utils";
import { ComponentCard } from "./ComponentCard";
import { TweakInput } from "./TweakInput";
import { CostBreakdown } from "./CostBreakdown";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Modal } from "@/components/ui/Modal";
import { BuildQuoteModal } from "@/components/BuildQuoteModal";
import type { BuildData } from "@/lib/types";
import { BuilderUpsells } from "./BuilderUpsells";

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
      // Already saved, safe to reset directly
      onReset?.();
    } else {
      setShowResetConfirm(true);
    }
  };

  return (
    <div className="w-full max-w-4xl mx-auto space-y-6 backdrop-blur-md bg-bg-primary/50 rounded-3xl p-8 border border-border-subtle/30">
      {/* Build header */}
      <div className="text-center mb-2">
        <h2 className="text-2xl sm:text-3xl font-bold text-text-primary font-[family-name:var(--font-outfit)] tracking-tight">
          {build.buildName}
        </h2>
        <p className="text-sm text-text-secondary mt-2 max-w-lg mx-auto leading-relaxed">
          {build.summary}
        </p>
      </div>

      {/* Stats row */}
      <div className="flex items-center justify-center gap-4 flex-wrap">
        <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-accent-dim border border-accent/20">
          <span className="text-xs text-text-muted">Total</span>
          <span className="text-lg font-bold font-[family-name:var(--font-mono)] text-accent">
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
          <div className="px-3 py-1.5 rounded-full bg-bg-elevated border border-border-subtle text-xs text-text-secondary">
            {build.soundProfileExpected}
          </div>
        )}
      </div>

      {/* Cost Breakdown */}
      <CostBreakdown components={build.components} total={build.estimatedTotal} />

      {/* Component grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {build.components.keyboardKit && (
          <ComponentCard
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

      {/* Recommended mods */}
      {build.recommendedMods && build.recommendedMods.length > 0 && (
        <div>
          <h3 className="text-xs text-text-muted uppercase tracking-wider font-medium font-[family-name:var(--font-outfit)] mb-3">
            Recommended Mods
          </h3>
          <div className="flex flex-wrap gap-2">
            {build.recommendedMods.map((mod, i) => (
              <a
                key={i}
                href={`https://www.amazon.com/s?k=${encodeURIComponent(mod.mod + " keyboard mod")}`}
                target="_blank"
                rel="noopener noreferrer"
                className={cn(
                  "flex items-center gap-2 px-3 py-2 rounded-lg border text-sm group/mod",
                  "bg-bg-surface border-border-subtle",
                  "hover:border-border-accent hover:bg-bg-elevated",
                  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/40",
                  "active:scale-[0.98]",
                  "transition-[border-color,background-color,transform] duration-150"
                )}
              >
                <span className="text-text-primary font-medium group-hover/mod:text-accent transition-colors duration-150">{mod.mod}</span>
                {mod.cost > 0 && (
                  <span className="text-[10px] font-mono text-accent">+${mod.cost}</span>
                )}
                <span className={cn(
                  "text-[10px] px-1.5 py-0.5 rounded font-medium",
                  mod.difficulty === "easy" ? "bg-emerald-500/10 text-emerald-400" :
                  mod.difficulty === "medium" ? "bg-amber-500/10 text-amber-400" :
                  "bg-red-500/10 text-red-400"
                )}>
                  {mod.difficulty}
                </span>
                <svg className="w-3 h-3 text-text-muted group-hover/mod:text-accent transition-colors duration-150 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                </svg>
              </a>
            ))}
          </div>
        </div>
      )}

      {/* Action bar */}
      <div className="flex items-center justify-center gap-3 flex-wrap pt-2">
        {onSave && (
          <Button
            onClick={onSave}
            disabled={saving || saved}
            loading={saving}
            variant={saved ? "secondary" : "primary"}
          >
            {saved ? (
              <>
                <svg className="w-4 h-4 mr-1.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                Saved
              </>
            ) : (
              <>
                <svg className="w-4 h-4 mr-1.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" />
                </svg>
                Save Build
              </>
            )}
          </Button>
        )}
        <Button variant="secondary" onClick={handleShare}>
          <svg className="w-4 h-4 mr-1.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
          </svg>
          Share
        </Button>
        <Button variant="ghost" onClick={handleCopy}>
          {copied ? "Copied!" : "Copy"}
        </Button>
        {onReset && (
          <Button variant="ghost" onClick={handleResetClick}>
            Start Over
          </Button>
        )}
      </div>

      {/* Tweak input — above sponsored content */}
      {onTweak && (
        <div className="max-w-lg mx-auto">
          <p className="text-xs text-text-muted uppercase tracking-wider font-medium font-[family-name:var(--font-outfit)] mb-3 text-center">
            Refine Your Build
          </p>
          <TweakInput onSubmit={onTweak} loading={tweaking} />
        </div>
      )}

      {/* Upgrade picks (sponsored) */}
      <BuilderUpsells currentComponents={build.components} />

      {/* Notes */}
      {build.notes && (
        <div className="p-4 rounded-xl bg-bg-elevated border border-border-subtle">
          <p className="text-xs text-text-muted uppercase tracking-wider font-medium mb-2 font-[family-name:var(--font-outfit)]">Notes</p>
          <p className="text-sm text-text-secondary leading-relaxed">{build.notes}</p>
        </div>
      )}

      {/* Have This Built section */}
      <div className="border-t border-border-subtle/30 pt-5">
        <div className="text-center">
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
          <p className="text-[10px] text-text-muted mt-2">
            Get a quote from an expert builder
          </p>
        </div>
      </div>

      {/* Build Quote Modal */}
      <BuildQuoteModal
        isOpen={showQuoteModal}
        onClose={() => setShowQuoteModal(false)}
        buildSpec={build}
      />

      {/* Start Over Confirmation Modal */}
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
          <Button variant="ghost" onClick={() => setShowResetConfirm(false)}>
            Keep Building
          </Button>
          <Button
            variant="primary"
            onClick={() => {
              setShowResetConfirm(false);
              onReset?.();
            }}
            className="!bg-red-500 hover:!bg-red-600"
          >
            Discard &amp; Start Over
          </Button>
        </div>
      </Modal>
    </div>
  );
}
