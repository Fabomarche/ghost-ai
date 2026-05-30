"use client";

import { useMemo } from "react";
import { Download } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { CANVAS_TEMPLATES, type CanvasTemplate } from "@/components/editor/starter-templates";
import type { CanvasNode, CanvasEdge } from "@/types/canvas";

const PREVIEW_WIDTH = 320;
const PREVIEW_HEIGHT = 200;

function computeBounds(nodes: CanvasNode[]) {
  let minX = Infinity;
  let minY = Infinity;
  let maxX = -Infinity;
  let maxY = -Infinity;
  for (const n of nodes) {
    minX = Math.min(minX, n.position.x);
    minY = Math.min(minY, n.position.y);
    maxX = Math.max(maxX, n.position.x + (n.data.width ?? 200));
    maxY = Math.max(maxY, n.position.y + (n.data.height ?? 100));
  }
  return { minX, minY, maxX, maxY };
}

function nodeCenter(n: CanvasNode) {
  return {
    cx: n.position.x + (n.data.width ?? 200) / 2,
    cy: n.position.y + (n.data.height ?? 100) / 2,
  };
}

function DiagramPreview({ nodes, edges }: { nodes: CanvasNode[]; edges: CanvasEdge[] }) {
  const bounds = useMemo(() => computeBounds(nodes), [nodes]);
  const nodeMap = useMemo(() => {
    const m = new Map<string, CanvasNode>();
    for (const n of nodes) m.set(n.id, n);
    return m;
  }, [nodes]);

  const pad = 24;
  const contentW = bounds.maxX - bounds.minX;
  const contentH = bounds.maxY - bounds.minY;
  const scale = Math.min((PREVIEW_WIDTH - pad * 2) / contentW, (PREVIEW_HEIGHT - pad * 2) / contentH);
  const offsetX = (PREVIEW_WIDTH - contentW * scale) / 2 - bounds.minX * scale;
  const offsetY = (PREVIEW_HEIGHT - contentH * scale) / 2 - bounds.minY * scale;

  return (
    <svg
      width="100%"
      height={PREVIEW_HEIGHT}
      viewBox={`0 0 ${PREVIEW_WIDTH} ${PREVIEW_HEIGHT}`}
      className="rounded-xl"
      style={{ background: "#0c0c0e" }}
    >
      {edges.map((e) => {
        const src = nodeMap.get(e.source);
        const tgt = nodeMap.get(e.target);
        if (!src || !tgt) return null;
        const s = nodeCenter(src);
        const t = nodeCenter(tgt);
        return (
          <line
            key={e.id}
            x1={s.cx * scale + offsetX}
            y1={s.cy * scale + offsetY}
            x2={t.cx * scale + offsetX}
            y2={t.cy * scale + offsetY}
            stroke="rgba(255,255,255,0.12)"
            strokeWidth={1}
            markerEnd="url(#tpl-arrow)"
          />
        );
      })}
      {nodes.map((n) => {
        const x = n.position.x * scale + offsetX;
        const y = n.position.y * scale + offsetY;
        const w = (n.data.width ?? 200) * scale;
        const h = (n.data.height ?? 100) * scale;
        const r = Math.min(6, w / 4, h / 4);
        return (
          <rect
            key={n.id}
            x={x}
            y={y}
            width={w}
            height={h}
            rx={r}
            fill={n.data.color}
            stroke="rgba(255,255,255,0.1)"
            strokeWidth={0.5}
          />
        );
      })}
      <defs>
        <marker
          id="tpl-arrow"
          markerWidth={6}
          markerHeight={4}
          refX={6}
          refY={2}
          orient="auto"
        >
          <path d="M0,0 L6,2 L0,4" fill="rgba(255,255,255,0.12)" />
        </marker>
      </defs>
    </svg>
  );
}

interface StarterTemplatesModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onImport: (template: CanvasTemplate) => void;
}

export function StarterTemplatesModal({
  open,
  onOpenChange,
  onImport,
}: StarterTemplatesModalProps) {
  const handleImport = (template: CanvasTemplate) => {
    onImport(template);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-4xl">
        <DialogHeader>
          <DialogTitle>Import Template</DialogTitle>
          <DialogDescription>
            Choose a starter template to pre-populate your canvas. Any existing
            nodes will be replaced — use{" "}
            <kbd className="mx-0.5 inline-flex h-5 min-w-[20px] items-center justify-center rounded border border-surface-border bg-subtle px-1 text-[10px] font-mono text-copy-primary">
              ⌘Z
            </kbd>{" "}
            to undo.
          </DialogDescription>
        </DialogHeader>

        <div className="grid max-h-[65vh] grid-cols-3 gap-4 overflow-y-auto pr-1">
          {CANVAS_TEMPLATES.map((t) => (
            <div
              key={t.id}
              className="flex flex-col rounded-2xl border border-surface-border bg-surface overflow-hidden"
            >
              <DiagramPreview nodes={t.nodes} edges={t.edges} />
              <div className="flex flex-1 flex-col gap-2 p-5">
                <h3 className="text-sm font-semibold text-copy-primary">
                  {t.name}
                </h3>
                <p className="flex-1 text-xs leading-relaxed text-copy-muted">
                  {t.description}
                </p>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  className="w-full mt-2"
                  onClick={() => handleImport(t)}
                >
                  <Download className="h-3.5 w-3.5" />
                  Import
                </Button>
              </div>
            </div>
          ))}
        </div>
      </DialogContent>
    </Dialog>
  );
}
