"use client";

import { useState, useEffect, useCallback } from "react";
import { useMutation, useAction } from "convex/react";
import { api } from "../../convex/_generated/api";
import { Id } from "../../convex/_generated/dataModel";
import { Modal } from "@/components/ui/Modal";
import { Button } from "@/components/ui/Button";
import { BuildCard } from "@/components/BuildCard";
import { KeyboardViewer3D } from "@/components/3d/KeyboardViewer3D";
import { buildDataToViewerConfig } from "@/lib/keyboard3d";
import type { BuildData } from "@/lib/types";

interface BuildDetailModalProps {
  build: any;
  isOpen: boolean;
  onClose: () => void;
}

export function BuildDetailModal({
  build,
  isOpen,
  onClose,
}: BuildDetailModalProps) {
  const [show3D, setShow3D] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [copied, setCopied] = useState(false);

  const removeBuild = useMutation(api.savedBuilds.remove);
  const togglePublic = useMutation(api.savedBuilds.togglePublic);
  const generateImage = useAction(api.imageGeneration.generateBuildImage);

  // Reset state when modal closes
  useEffect(() => {
    if (!isOpen) {
      setShow3D(false);
      setConfirmDelete(false);
      setCopied(false);
    }
  }, [isOpen]);

  // Auto-reset confirm delete after 3s
  useEffect(() => {
    if (!confirmDelete) return;
    const t = setTimeout(() => setConfirmDelete(false), 3000);
    return () => clearTimeout(t);
  }, [confirmDelete]);

  const handleShare = useCallback(async () => {
    if (build.isPublic && build.shareSlug) {
      const url = `${window.location.origin}/builds/shared/${build.shareSlug}`;
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } else {
      await togglePublic({ id: build._id as Id<"builds"> });
    }
  }, [build, togglePublic]);

  const handleVisualize = useCallback(async () => {
    setGenerating(true);
    try {
      await generateImage({ buildId: build._id as Id<"builds"> });
    } catch (e) {
      console.error("Image generation failed:", e);
    } finally {
      setGenerating(false);
    }
  }, [build._id, generateImage]);

  const handleDelete = useCallback(async () => {
    if (!confirmDelete) {
      setConfirmDelete(true);
      return;
    }
    await removeBuild({ id: build._id as Id<"builds"> });
    onClose();
  }, [confirmDelete, build._id, removeBuild, onClose]);

  const handleCopyMarkdown = useCallback(() => {
    const lines: string[] = [];
    lines.push(`# ${build.buildName}`);
    lines.push("", build.summary, "", "## Components", "");
    const c = build.components;
    if (c?.keyboardKit) lines.push(`- **Keyboard Kit:** ${c.keyboardKit.name} — $${Math.round(c.keyboardKit.price)}`);
    if (c?.switches) lines.push(`- **Switches:** ${c.switches.name} — $${Math.round(c.switches.quantity * c.switches.priceEach)}`);
    if (c?.keycaps) lines.push(`- **Keycaps:** ${c.keycaps.name} — $${Math.round(c.keycaps.price)}`);
    if (c?.stabilizers) lines.push(`- **Stabilizers:** ${c.stabilizers.name} — $${Math.round(c.stabilizers.price)}`);
    lines.push("", `**Total:** $${Math.round(build.estimatedTotal)}`, `**Difficulty:** ${build.buildDifficulty}`);
    if (build.notes) lines.push("", `> ${build.notes}`);
    navigator.clipboard.writeText(lines.join("\n"));
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }, [build]);

  if (!build) return null;

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={build.buildName} size="lg">
      <div className="space-y-4 -mt-2">
        {/* Optional 3D viewer */}
        {show3D && (
          <div className="rounded-xl overflow-hidden border border-border-subtle">
            <KeyboardViewer3D
              config={buildDataToViewerConfig(build as unknown as BuildData)}
              height="300px"
              autoRotate
            />
          </div>
        )}

        {/* Full build card detail */}
        <BuildCard build={build} showActions={false} imageUrl={build.imageUrl} />

        {/* Action footer */}
        <div className="flex flex-wrap gap-2 pt-2 border-t border-border-subtle">
          <Button
            variant="secondary"
            size="sm"
            onClick={handleShare}
          >
            {copied ? "Copied!" : build.isPublic ? "Copy Link" : "Share"}
          </Button>

          <Button
            variant="secondary"
            size="sm"
            onClick={() => setShow3D((v) => !v)}
          >
            {show3D ? "Hide 3D" : "3D View"}
          </Button>

          {!build.imageUrl && (
            <Button
              variant="secondary"
              size="sm"
              onClick={handleVisualize}
              loading={generating}
            >
              {generating ? "Generating..." : "Visualize"}
            </Button>
          )}

          <Button
            variant="secondary"
            size="sm"
            onClick={handleCopyMarkdown}
          >
            Copy as Markdown
          </Button>

          <Button
            variant="danger"
            size="sm"
            onClick={handleDelete}
          >
            {confirmDelete ? "Confirm?" : "Delete Build"}
          </Button>
        </div>
      </div>
    </Modal>
  );
}
