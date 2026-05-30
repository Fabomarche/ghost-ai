"use client";

import { type NodeProps, Handle, Position } from "@xyflow/react";
import { type CanvasNode, MIN_NODE_SIZES, SHAPE_DEFAULT_SIZES } from "@/types/canvas";
import { useRef, useState, useEffect, useCallback } from "react";
import { useCanvasActions } from "@/components/editor/canvas-actions";

interface ShapeProps {
  color: string;
  selected?: boolean;
}

function RectangleShape({ color, selected }: ShapeProps) {
  return (
    <div
      className="flex h-full w-full items-center justify-center rounded border"
      style={{
        backgroundColor: color,
        borderColor: selected ? "rgba(255,255,255,0.3)" : "rgba(255,255,255,0.1)",
      }}
    >
      <Handle type="target" position={Position.Top} className="!bg-brand" />
      <Handle type="source" position={Position.Bottom} className="!bg-brand" />
    </div>
  );
}

function DiamondShape({ color, selected }: ShapeProps) {
  return (
    <div className="relative h-full w-full">
      <Handle type="target" position={Position.Top} className="!bg-brand" />
      <svg
        className="absolute inset-0 h-full w-full"
        viewBox="0 0 100 100"
        preserveAspectRatio="none"
      >
        <polygon
          points="50,2 98,50 50,98 2,50"
          fill={color}
          stroke={selected ? "rgba(255,255,255,0.3)" : "rgba(255,255,255,0.1)"}
          strokeWidth="2"
          vectorEffect="non-scaling-stroke"
        />
      </svg>
      <Handle type="source" position={Position.Bottom} className="!bg-brand" />
    </div>
  );
}

function CircleShape({ color, selected }: ShapeProps) {
  return (
    <div
      className="flex h-full w-full items-center justify-center rounded-full border"
      style={{
        backgroundColor: color,
        borderColor: selected ? "rgba(255,255,255,0.3)" : "rgba(255,255,255,0.1)",
      }}
    >
      <Handle type="target" position={Position.Top} className="!bg-brand" />
      <Handle type="source" position={Position.Bottom} className="!bg-brand" />
    </div>
  );
}

function PillShape({ color, selected }: ShapeProps) {
  return (
    <div
      className="flex h-full w-full items-center justify-center rounded-full border"
      style={{
        backgroundColor: color,
        borderColor: selected ? "rgba(255,255,255,0.3)" : "rgba(255,255,255,0.1)",
      }}
    >
      <Handle type="target" position={Position.Top} className="!bg-brand" />
      <Handle type="source" position={Position.Bottom} className="!bg-brand" />
    </div>
  );
}

function CylinderShape({ color, selected }: ShapeProps) {
  const strokeColor = selected ? "rgba(255,255,255,0.3)" : "rgba(255,255,255,0.1)";

  return (
    <div className="relative flex h-full w-full flex-col">
      <Handle type="target" position={Position.Top} className="!bg-brand" />
      <svg
        className="h-5 w-full"
        viewBox="0 0 120 20"
        preserveAspectRatio="none"
      >
        <ellipse
          cx="60"
          cy="10"
          rx="58"
          ry="9"
          fill={color}
          stroke={strokeColor}
          strokeWidth="2"
          vectorEffect="non-scaling-stroke"
        />
      </svg>
      <div
        className="flex flex-1 items-center justify-center border-x"
        style={{
          backgroundColor: color,
          borderColor: strokeColor,
        }}
      />
      <svg
        className="h-5 w-full"
        viewBox="0 0 120 20"
        preserveAspectRatio="none"
      >
        <ellipse
          cx="60"
          cy="10"
          rx="58"
          ry="9"
          fill={color}
          stroke={strokeColor}
          strokeWidth="2"
          vectorEffect="non-scaling-stroke"
        />
      </svg>
      <Handle type="source" position={Position.Bottom} className="!bg-brand" />
    </div>
  );
}

function HexagonShape({ color, selected }: ShapeProps) {
  return (
    <div className="relative h-full w-full">
      <Handle type="target" position={Position.Top} className="!bg-brand" />
      <svg
        className="absolute inset-0 h-full w-full"
        viewBox="0 0 100 100"
        preserveAspectRatio="none"
      >
        <polygon
          points="50,2 97,25 97,75 50,98 3,75 3,25"
          fill={color}
          stroke={selected ? "rgba(255,255,255,0.3)" : "rgba(255,255,255,0.1)"}
          strokeWidth="2"
          vectorEffect="non-scaling-stroke"
        />
      </svg>
      <Handle type="source" position={Position.Bottom} className="!bg-brand" />
    </div>
  );
}

const HANDLE_STYLE = "absolute w-2 h-2 rounded-sm border border-white/20 bg-surface z-50 pointer-events-auto nodrag nopan";

type HandleDir = "n" | "s" | "e" | "w" | "nw" | "ne" | "sw" | "se";

interface ResizeState {
  nodeId: string;
  handle: HandleDir;
  startX: number;
  startY: number;
  startW: number;
  startH: number;
}

export function CanvasNodeRenderer({ id, data, selected }: NodeProps<CanvasNode>) {
  const { label, color, textColor, shape } = data;
  const defaults = SHAPE_DEFAULT_SIZES[data.shape] ?? SHAPE_DEFAULT_SIZES.rectangle;
  const width = data.width ?? defaults.width;
  const height = data.height ?? defaults.height;
  const { onNodeDataChange } = useCanvasActions();

  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(label);
  const taRef = useRef<HTMLTextAreaElement>(null);
  const resizeRef = useRef<ResizeState | null>(null);
  const [localDims, setLocalDims] = useState<{ w: number; h: number } | null>(null);

  useEffect(() => {
    if (editing && taRef.current) {
      taRef.current.focus();
      taRef.current.select();
    }
  }, [editing]);

  useEffect(() => {
    if (editing && taRef.current) {
      const ta = taRef.current;
      ta.style.height = "auto";
      const newH = Math.min(Math.max(ta.scrollHeight, 28), 120);
      ta.style.height = `${newH}px`;
    }
  }, [draft, editing]);

  const finishEdit = useCallback(() => {
    setEditing(false);
    const trimmed = draft.trim();
    if (trimmed !== label) {
      onNodeDataChange(id, { label: trimmed });
    }
  }, [draft, label, id, onNodeDataChange]);

  function handleDoubleClick(e: React.MouseEvent) {
    e.stopPropagation();
    setDraft(label);
    setEditing(true);
  }

  function handleKeyDown(e: React.KeyboardEvent) {
    if (e.key === "Escape") {
      e.stopPropagation();
      setEditing(false);
      setDraft(label);
    }
    e.stopPropagation();
  }

  const handleResizeStart = useCallback(
    (handle: HandleDir) => (e: React.MouseEvent) => {
      e.stopPropagation();
      e.preventDefault();
      const dimsRef = { w: width, h: height };
      resizeRef.current = {
        nodeId: id,
        handle,
        startX: e.clientX,
        startY: e.clientY,
        startW: width,
        startH: height,
      };

      const mins = MIN_NODE_SIZES[shape] ?? MIN_NODE_SIZES.rectangle;

      function onMouseMove(ev: MouseEvent) {
        const s = resizeRef.current;
        if (!s) return;

        const dx = ev.clientX - s.startX;
        const dy = ev.clientY - s.startY;

        let newW = s.startW;
        let newH = s.startH;

        if (s.handle.includes("e")) newW = s.startW + dx;
        if (s.handle.includes("w")) newW = s.startW - dx;
        if (s.handle.includes("s")) newH = s.startH + dy;
        if (s.handle.includes("n")) newH = s.startH - dy;

        newW = Math.max(newW, mins.width);
        newH = Math.max(newH, mins.height);

        dimsRef.w = newW;
        dimsRef.h = newH;
        setLocalDims({ w: newW, h: newH });
      }

      function onMouseUp() {
        if (resizeRef.current) {
          onNodeDataChange(id, { width: dimsRef.w, height: dimsRef.h });
        }
        resizeRef.current = null;
        setLocalDims(null);
        document.removeEventListener("mousemove", onMouseMove);
        document.removeEventListener("mouseup", onMouseUp);
      }

      document.addEventListener("mousemove", onMouseMove);
      document.addEventListener("mouseup", onMouseUp);
    },
    [id, width, height, shape, onNodeDataChange],
  );

  const displayW = localDims?.w ?? width;
  const displayH = localDims?.h ?? height;

  const shapeContent = (() => {
    switch (shape) {
      case "diamond":
        return <DiamondShape color={color} selected={selected} />;
      case "circle":
        return <CircleShape color={color} selected={selected} />;
      case "pill":
        return <PillShape color={color} selected={selected} />;
      case "cylinder":
        return <CylinderShape color={color} selected={selected} />;
      case "hexagon":
        return <HexagonShape color={color} selected={selected} />;
      case "rectangle":
      default:
        return <RectangleShape color={color} selected={selected} />;
    }
  })();

  return (
    <div
      className="relative"
      style={{ width: displayW, height: displayH, minWidth: 60, minHeight: 40 }}
      onDoubleClick={handleDoubleClick}
    >
      {shapeContent}

      {editing ? (
        <textarea
          ref={taRef}
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          onBlur={finishEdit}
          onKeyDown={handleKeyDown}
          onClick={(e) => e.stopPropagation()}
          onDoubleClick={(e) => e.stopPropagation()}
          rows={1}
          className="pointer-events-auto absolute left-1/2 top-1/2 z-50 resize-none overflow-hidden rounded border border-white/30 bg-transparent px-2 py-1 text-center text-sm font-medium outline-none"
          style={{
            transform: "translate(-50%, -50%)",
            minHeight: 28,
            maxHeight: 120,
            width: "calc(100% - 24px)",
            color: textColor,
          }}
        />
      ) : (
        <div className="absolute inset-0 flex items-center justify-center" onDoubleClick={handleDoubleClick}>
          <span className="pointer-events-none text-sm font-medium" style={{ color: textColor }}>
            {label || (
              <span className="text-[var(--text-faint)] select-none">
                {shape === "circle" ? "Event" : shape === "cylinder" ? "Store" : "Label"}
              </span>
            )}
          </span>
        </div>
      )}

      {selected && (
        <>
          <div
            className={`${HANDLE_STYLE} -top-1 left-1/2 -translate-x-1/2 cursor-n-resize`}
            onMouseDown={handleResizeStart("n")}
            onPointerDown={(e) => e.stopPropagation()}
          />
          <div
            className={`${HANDLE_STYLE} -bottom-1 left-1/2 -translate-x-1/2 cursor-s-resize`}
            onMouseDown={handleResizeStart("s")}
            onPointerDown={(e) => e.stopPropagation()}
          />
          <div
            className={`${HANDLE_STYLE} top-1/2 -left-1 -translate-y-1/2 cursor-w-resize`}
            onMouseDown={handleResizeStart("w")}
            onPointerDown={(e) => e.stopPropagation()}
          />
          <div
            className={`${HANDLE_STYLE} top-1/2 -right-1 -translate-y-1/2 cursor-e-resize`}
            onMouseDown={handleResizeStart("e")}
            onPointerDown={(e) => e.stopPropagation()}
          />
          <div
            className={`${HANDLE_STYLE} -top-1 -left-1 cursor-nw-resize`}
            onMouseDown={handleResizeStart("nw")}
            onPointerDown={(e) => e.stopPropagation()}
          />
          <div
            className={`${HANDLE_STYLE} -top-1 -right-1 cursor-ne-resize`}
            onMouseDown={handleResizeStart("ne")}
            onPointerDown={(e) => e.stopPropagation()}
          />
          <div
            className={`${HANDLE_STYLE} -bottom-1 -left-1 cursor-sw-resize`}
            onMouseDown={handleResizeStart("sw")}
            onPointerDown={(e) => e.stopPropagation()}
          />
          <div
            className={`${HANDLE_STYLE} -bottom-1 -right-1 cursor-se-resize`}
            onMouseDown={handleResizeStart("se")}
            onPointerDown={(e) => e.stopPropagation()}
          />
        </>
      )}
    </div>
  );
}
