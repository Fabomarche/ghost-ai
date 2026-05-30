"use client";

import { type DragEvent } from "react";
import { NODE_SHAPES, SHAPE_DEFAULT_SIZES } from "@/types/canvas";

function ShapeIcon({ shape }: { shape: string }) {
  switch (shape) {
    case "rectangle":
      return <div className="h-4 w-6 rounded-sm border-2 border-current" />;
    case "diamond":
      return (
        <svg viewBox="0 0 20 20" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth={1.5}>
          <polygon points="10,2 18,10 10,18 2,10" />
        </svg>
      );
    case "circle":
      return <div className="h-5 w-5 rounded-full border-2 border-current" />;
    case "pill":
      return <div className="h-4 w-6 rounded-full border-2 border-current" />;
    case "cylinder":
      return (
        <svg viewBox="0 0 20 22" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth={1.5}>
          <ellipse cx="10" cy="5" rx="6" ry="2" />
          <line x1="4" y1="5" x2="4" y2="17" />
          <line x1="16" y1="5" x2="16" y2="17" />
          <ellipse cx="10" cy="17" rx="6" ry="2" />
        </svg>
      );
    case "hexagon":
      return (
        <svg viewBox="0 0 20 20" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth={1.5}>
          <polygon points="10,1 18,5.5 18,14.5 10,19 2,14.5 2,5.5" />
        </svg>
      );
    default:
      return <div className="h-4 w-6 rounded-sm border-2 border-current" />;
  }
}

interface ShapePanelProps {
  onDragStart?: (shape: string) => void;
}

export function ShapePanel({ onDragStart }: ShapePanelProps) {
  const handleDragStart = (e: DragEvent<HTMLButtonElement>, shape: string) => {
    const size = SHAPE_DEFAULT_SIZES[shape as keyof typeof SHAPE_DEFAULT_SIZES];
    const payload = JSON.stringify({ shape, ...size });
    e.dataTransfer.setData("application/x-ghost-shape", payload);
    e.dataTransfer.effectAllowed = "move";
    onDragStart?.(shape);
  };

  return (
    <div className="pointer-events-none absolute bottom-6 left-1/2 z-10 -translate-x-1/2">
      <div className="pointer-events-auto flex items-center gap-1.5 rounded-full border border-surface-border bg-surface/90 px-3 py-2 shadow-lg backdrop-blur-sm">
        {NODE_SHAPES.map((shape) => (
          <button
            key={shape}
            draggable
            onDragStart={(e) => handleDragStart(e, shape)}
            className="flex h-8 w-8 items-center justify-center rounded-full text-copy-muted transition-colors hover:bg-accent-dim hover:text-copy-primary"
            title={shape.charAt(0).toUpperCase() + shape.slice(1)}
          >
            <ShapeIcon shape={shape} />
          </button>
        ))}
      </div>
    </div>
  );
}
