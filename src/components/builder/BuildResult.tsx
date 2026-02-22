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

  return (
    <div className="w-full max-w-4xl mx-auto space-y-6 backdrop-blur-md bg-bg-primary/50 rounded-3xl p-8 border border-border-subtle/30">
      {/* Build header */}
      <div className="mb-2">
        <h2 className="text-2xl sm:text-3xl font-bold text-text-primary font-[family-name:var(--font-outfit)] tracking-tight">
          {build.buildName}
        </h2>
        <p className="text-sm text-text-secondary mt-2 max-w-lg leading-relaxed">
          {build.summary}
        </p>
      </div>

      {/* Stats row */}
      <div className="flex items-center gap-3 flex-wrap">
        <div className="px-5 py-3 rounded-xl bg-bg-surface border border-accent/20">
          <span className="text-[10px] text-text-muted uppercase tracking-wider block mb-0.5">Total</span>
          <span className="text-2xl font-bold font-[family-name:var(--font-mono)] text-accent">
            {formatPriceWhole(build.estimatedTotal)}
          </span>
        </div>
        <div className="flex items-center gap-2">
          <svg className="w-4 h-4 text-text-muted" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M11.42 15.17l-5.69 3.29a.75.75 0 01-1.12-.67V4.44a.75.75 0 01.37-.64l5.26-3.04a.75.75 0 01.75 0l5.26 3.04a.75.75 0 01.37.64v13.35a.75.75 0 01-1.12.67l-5.69-3.29a.75.75 0 00-.75 0z" />
          </svg>
          <Badge variant={
            build.buildDifficulty === "beginner-friendly" ? "success" :
            build.buildDifficulty === "intermediate" ? "warning" : "default"
          } size="md">
            {build.buildDifficulty}
          </Badge>
        </div>
        {build.soundProfileExpected && (
          <div className="flex items-center gap-2">
            <svg className="w-4 h-4 text-text-muted" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 19V6l12-3v13M9 19c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zm12-3c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2z" />
            </svg>
            <div className="px-3 py-1.5 rounded-full bg-bg-elevated border border-border-subtle text-xs text-text-secondary">
              {build.soundProfileExpected}
            </div>
          </div>
        )}
      </div>

      {/* Cost breakdown */}
      <CostBreakdown components={build.components} total={build.estimatedTotal} />

      {/* Hero component — keyboard kit */}
      {build.components.keyboardKit && (
        <div className="w-full">
          <ComponentCard
            type="keyboardKit"
            name={build.components.keyboardKit.name}
            price={build.components.keyboardKit.price}
            reason={build.components.keyboardKit.reason}
            imageUrl={build.components.keyboardKit.imageUrl}
            productUrl={build.components.keyboardKit.productUrl}
            detailUrl={build.components.keyboardKit.detailUrl}
          />
        </div>
      )}

      {/* Other components */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
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

      {/* Build Summary divider */}
      {(build.recommendedMods?.length > 0 || build.notes) && (
        <div className="flex items-center gap-3 pt-2">
          <div className="h-px flex-1 bg-border-subtle/30" />
          <span className="text-[10px] uppercase tracking-wider text-text-muted font-medium">Build Summary</span>
          <div className="h-px flex-1 bg-border-subtle/30" />
        </div>
      )}

      {/* Recommended mods */}
      {build.recommendedMods && build.recommendedMods.length > 0 && (
        <div>
          <h3 className="text-xs text-text-muted uppercase tracking-wider font-medium font-[family-name:var(--font-outfit)] mb-3">
            Recommended Mods
          </h3>
          <div className="flex flex-wrap gap-2">
            {build.recommendedMods.map((mod, i) => (
              <div
                key={i}
                className={cn(
                  "flex items-center gap-2 px-3 py-2 rounded-lg border text-sm",
                  "bg-bg-surface border-border-subtle"
                )}
              >
                <span className="text-text-primary font-medium">{mod.mod}</span>
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
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Notes */}
      {build.notes && (
        <div className="p-4 rounded-xl bg-bg-elevated border border-border-subtle">
          <div className="flex items-start gap-3">
            <svg className="w-4 h-4 text-accent shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
            </svg>
            <div>
              <p className="text-xs text-text-muted uppercase tracking-wider font-medium mb-1 font-[family-name:var(--font-outfit)]">Notes</p>
              <p className="text-sm text-text-secondary leading-relaxed">{build.notes}</p>
            </div>
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
          <Button variant="ghost" onClick={() => {
            if (saved) { onReset(); } else { setShowResetConfirm(true); }
          }}>
            Start Over
          </Button>
        )}
      </div>

      {/* Refine your build */}
      {onTweak && (
        <div className="border-t border-border-subtle/30 pt-5">
          <p className="text-xs text-text-muted uppercase tracking-wider font-medium font-[family-name:var(--font-outfit)] mb-3">
            Refine Your Build
          </p>
          <div className="max-w-lg">
            <TweakInput onSubmit={onTweak} loading={tweaking} />
          </div>
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

      {/* Reset confirmation modal */}
      <Modal isOpen={showResetConfirm} onClose={() => setShowResetConfirm(false)} title="Start a new build?">
        <p className="text-sm text-text-secondary mb-6">
          Your current build will not be saved unless you save it first.
        </p>
        <div className="flex justify-end gap-3">
          <Button variant="ghost" onClick={() => setShowResetConfirm(false)}>Cancel</Button>
          <Button onClick={() => { setShowResetConfirm(false); onReset?.(); }}>Start Over</Button>
        </div>
      </Modal>
    </div>
  );
}
