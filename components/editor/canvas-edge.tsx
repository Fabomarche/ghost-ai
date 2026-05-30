"use client";

import { useState, useRef, useCallback, useEffect } from "react";
import {
  EdgeProps,
  getSmoothStepPath,
  EdgeLabelRenderer,
  BaseEdge,
} from "@xyflow/react";
import { useCanvasActions } from "@/components/editor/canvas-actions";

export function CanvasEdge({
  id,
  sourceX,
  sourceY,
  targetX,
  targetY,
  sourcePosition,
  targetPosition,
  selected,
  data,
  markerEnd,
}: EdgeProps) {
  const [hovered, setHovered] = useState(false);
  const [editing, setEditing] = useState(false);
  const edgeData = data as { label?: string } | undefined;
  const [draft, setDraft] = useState<string>(edgeData?.label ?? "");
  const inputRef = useRef<HTMLInputElement>(null);
  const { onEdgeDataChange } = useCanvasActions();

  const [edgePath, labelX, labelY] = getSmoothStepPath({
    sourceX,
    sourceY,
    targetX,
    targetY,
    sourcePosition,
    targetPosition,
    borderRadius: 8,
  });

  useEffect(() => {
    if (editing && inputRef.current) {
      inputRef.current.focus();
      inputRef.current.select();
    }
  }, [editing]);

  const finishEdit = useCallback(() => {
    setEditing(false);
    const trimmed = draft.trim();
    const currentLabel = edgeData?.label ?? "";
    if (trimmed !== currentLabel) {
      onEdgeDataChange(id, { label: trimmed });
    }
  }, [draft, edgeData?.label, id, onEdgeDataChange]);

  const handleDoubleClick = useCallback(
    (e: React.MouseEvent) => {
      e.stopPropagation();
      setDraft(edgeData?.label ?? "");
      setEditing(true);
    },
    [edgeData?.label],
  );

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === "Enter") {
        e.preventDefault();
        finishEdit();
      } else if (e.key === "Escape") {
        setEditing(false);
        setDraft(edgeData?.label ?? "");
      }
      e.stopPropagation();
    },
    [finishEdit, edgeData?.label],
  );

  const label = edgeData?.label ?? "";
  const isActive = selected || hovered;
  const strokeColor = isActive
    ? "var(--text-primary)"
    : "var(--text-muted)";
  const strokeWidth = isActive ? 2 : 1.5;

  return (
    <>
      <g
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
      >
        {/* Wide invisible hit area for easier hover/click */}
        <path
          d={edgePath}
          fill="none"
          stroke="transparent"
          strokeWidth={20}
          className="react-flow__edge-interaction"
        />
        <BaseEdge
          id={id}
          path={edgePath}
          markerEnd={markerEnd}
          style={{
            stroke: strokeColor,
            strokeWidth,
            strokeLinecap: "round",
            strokeLinejoin: "round",
            transition: "stroke 0.15s ease, stroke-width 0.15s ease",
          }}
        />
      </g>

      <EdgeLabelRenderer>
        {editing ? (
          <div
            style={{
              position: "absolute",
              transform: `translate(-50%, -50%) translate(${labelX}px,${labelY}px)`,
              pointerEvents: "all",
            }}
            className="nodrag nopan"
          >
            <input
              ref={inputRef}
              value={draft}
              onChange={(e) => setDraft(e.target.value)}
              onBlur={finishEdit}
              onKeyDown={handleKeyDown}
              onClick={(e) => e.stopPropagation()}
              onDoubleClick={(e) => e.stopPropagation()}
              className="min-w-[60px] max-w-[200px] rounded-full border border-white/20 bg-[var(--bg-elevated)] px-2.5 py-0.5 text-center text-xs font-medium text-[var(--text-primary)] outline-none nodrag nopan"
              style={{ width: Math.max(60, draft.length * 7 + 20) }}
            />
          </div>
        ) : label ? (
          <div
            style={{
              position: "absolute",
              transform: `translate(-50%, -50%) translate(${labelX}px,${labelY}px)`,
              pointerEvents: "all",
            }}
            className="cursor-pointer"
            onDoubleClick={handleDoubleClick}
          >
            <span className="rounded-full border border-white/10 bg-[var(--bg-elevated)] px-2.5 py-0.5 text-xs font-medium text-[var(--text-secondary)] select-none">
              {label}
            </span>
          </div>
        ) : isActive ? (
          <div
            style={{
              position: "absolute",
              transform: `translate(-50%, -50%) translate(${labelX}px,${labelY}px)`,
              pointerEvents: "all",
            }}
            className="cursor-pointer"
            onDoubleClick={handleDoubleClick}
          >
            <span className="rounded-full border border-white/5 bg-[var(--bg-elevated)]/50 px-2 py-0.5 text-[10px] text-[var(--text-faint)] select-none">
              Add label
            </span>
          </div>
        ) : null}
      </EdgeLabelRenderer>
    </>
  );
}
