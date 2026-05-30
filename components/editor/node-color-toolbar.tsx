"use client";

import { useReactFlow } from "@xyflow/react";
import { NODE_COLORS } from "@/types/canvas";
import { useCanvasActions } from "@/components/editor/canvas-actions";

interface NodeColorToolbarProps {
  selectedNodeIds: string[];
}

export function NodeColorToolbar({ selectedNodeIds }: NodeColorToolbarProps) {
  const { getNodes, getViewport } = useReactFlow();
  const { onNodeDataChange } = useCanvasActions();

  if (selectedNodeIds.length === 0) return null;

  const nodes = getNodes();
  const selectedNodes = nodes.filter((n) => selectedNodeIds.includes(n.id));
  if (selectedNodes.length === 0) return null;

  const viewport = getViewport();

  let minX = Infinity;
  let maxX = -Infinity;
  let minY = Infinity;
  let avgY = 0;

  for (const node of selectedNodes) {
    const w = Number(node.measured?.width ?? node.data.width ?? 200);
    const h = Number(node.measured?.height ?? node.data.height ?? 100);
    const left = node.position.x;
    const right = node.position.x + w;
    const top = node.position.y;
    const bottom = node.position.y + h;

    if (left < minX) minX = left;
    if (right > maxX) maxX = right;
    minY = Math.min(minY, top);
    avgY += (top + bottom) / 2;
  }

  avgY /= selectedNodes.length;

  const screenX = (minX + (maxX - minX) / 2) * viewport.zoom + viewport.x;
  const screenTop = minY * viewport.zoom + viewport.y;

  const currentColor = selectedNodes[0]?.data.color ?? NODE_COLORS[0].fill;
  const activeIndex = NODE_COLORS.findIndex((c) => c.fill === currentColor);

  function handleSelect(colorPair: (typeof NODE_COLORS)[number]) {
    for (const id of selectedNodeIds) {
      onNodeDataChange(id, { color: colorPair.fill, textColor: colorPair.text });
    }
  }

  return (
    <div
      className="nodrag nopan absolute z-50 flex items-center gap-1 rounded-xl border border-white/10 bg-[var(--bg-elevated)] px-2 py-1.5 shadow-lg"
      style={{
        left: screenX,
        top: screenTop - 44,
        transform: "translateX(-50%)",
      }}
      onPointerDown={(e) => e.stopPropagation()}
    >
      {NODE_COLORS.map((c, i) => (
        <button
          key={c.fill}
          onClick={(e) => {
            e.stopPropagation();
            handleSelect(c);
          }}
          onPointerDown={(e) => e.stopPropagation()}
          className="relative h-6 w-6 rounded-full border-2 transition-all"
          style={{
            backgroundColor: c.fill,
            borderColor: i === activeIndex ? c.text : "rgba(255,255,255,0.15)",
            boxShadow: i === activeIndex ? `0 0 0 2px ${c.text}40` : undefined,
          }}
          onMouseEnter={(e) => {
            if (i !== activeIndex) {
              (e.currentTarget as HTMLElement).style.boxShadow = `0 0 6px ${c.text}60`;
              (e.currentTarget as HTMLElement).style.borderColor = `${c.text}80`;
            }
          }}
          onMouseLeave={(e) => {
            if (i !== activeIndex) {
              (e.currentTarget as HTMLElement).style.boxShadow = "";
              (e.currentTarget as HTMLElement).style.borderColor = "rgba(255,255,255,0.15)";
            }
          }}
        >
          <span
            className="absolute inset-0 flex items-center justify-center text-[8px] font-bold"
            style={{ color: c.text }}
          >
            A
          </span>
        </button>
      ))}
    </div>
  );
}
