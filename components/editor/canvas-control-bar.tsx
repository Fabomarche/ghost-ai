"use client";

import { useReactFlow } from "@xyflow/react";
import { useUndo, useRedo } from "@liveblocks/react";
import { ZoomIn, ZoomOut, Maximize2, Undo2, Redo2 } from "lucide-react";

export function CanvasControlBar() {
  const { zoomIn, zoomOut, fitView } = useReactFlow();
  const undo = useUndo();
  const redo = useRedo();

  const handleZoomIn = () => zoomIn({ duration: 200 });
  const handleZoomOut = () => zoomOut({ duration: 200 });
  const handleFitView = () => fitView({ duration: 200 });

  return (
    <div className="pointer-events-none absolute bottom-6 left-6 z-10">
      <div className="pointer-events-auto flex items-center gap-1 rounded-full border border-surface-border bg-surface/90 px-2 py-1.5 shadow-lg backdrop-blur-sm">
        <button
          onClick={handleZoomOut}
          className="flex h-7 w-7 items-center justify-center rounded-full text-copy-muted transition-colors hover:bg-accent-dim hover:text-copy-primary"
          title="Zoom out"
        >
          <ZoomOut className="h-4 w-4" />
        </button>
        <button
          onClick={handleFitView}
          className="flex h-7 w-7 items-center justify-center rounded-full text-copy-muted transition-colors hover:bg-accent-dim hover:text-copy-primary"
          title="Fit view"
        >
          <Maximize2 className="h-4 w-4" />
        </button>
        <button
          onClick={handleZoomIn}
          className="flex h-7 w-7 items-center justify-center rounded-full text-copy-muted transition-colors hover:bg-accent-dim hover:text-copy-primary"
          title="Zoom in"
        >
          <ZoomIn className="h-4 w-4" />
        </button>
        <div className="mx-1 h-5 w-px bg-surface-border" />
        <button
          onClick={undo}
          className="flex h-7 w-7 items-center justify-center rounded-full text-copy-muted transition-colors hover:bg-accent-dim hover:text-copy-primary"
          title="Undo"
        >
          <Undo2 className="h-4 w-4" />
        </button>
        <button
          onClick={redo}
          className="flex h-7 w-7 items-center justify-center rounded-full text-copy-muted transition-colors hover:bg-accent-dim hover:text-copy-primary"
          title="Redo"
        >
          <Redo2 className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}
