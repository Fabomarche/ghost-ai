"use client";

import { type NodeProps, Handle, Position } from "@xyflow/react";
import { type CanvasNode } from "@/types/canvas";

interface ShapeProps {
  color: string;
  label: string;
  selected?: boolean;
}

function RectangleShape({ color, label, selected }: ShapeProps) {
  return (
    <div
      className="flex min-w-[120px] items-center justify-center rounded border px-4 py-3"
      style={{
        backgroundColor: color,
        borderColor: selected ? "rgba(255,255,255,0.3)" : "rgba(255,255,255,0.1)",
      }}
    >
      <Handle type="target" position={Position.Top} className="!bg-brand" />
      <span className="text-sm font-medium">{label}</span>
      <Handle type="source" position={Position.Bottom} className="!bg-brand" />
    </div>
  );
}

function DiamondShape({ color, label, selected }: ShapeProps) {
  return (
    <div className="relative flex min-h-[120px] min-w-[120px] items-center justify-center">
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
      <span className="relative z-10 text-sm font-medium">{label}</span>
      <Handle type="source" position={Position.Bottom} className="!bg-brand" />
    </div>
  );
}

function CircleShape({ color, label, selected }: ShapeProps) {
  return (
    <div
      className="flex min-h-[100px] min-w-[120px] items-center justify-center rounded-full border px-4 py-3"
      style={{
        backgroundColor: color,
        borderColor: selected ? "rgba(255,255,255,0.3)" : "rgba(255,255,255,0.1)",
      }}
    >
      <Handle type="target" position={Position.Top} className="!bg-brand" />
      <span className="text-sm font-medium">{label}</span>
      <Handle type="source" position={Position.Bottom} className="!bg-brand" />
    </div>
  );
}

function PillShape({ color, label, selected }: ShapeProps) {
  return (
    <div
      className="flex min-w-[120px] items-center justify-center rounded-full border px-4 py-3"
      style={{
        backgroundColor: color,
        borderColor: selected ? "rgba(255,255,255,0.3)" : "rgba(255,255,255,0.1)",
      }}
    >
      <Handle type="target" position={Position.Top} className="!bg-brand" />
      <span className="text-sm font-medium">{label}</span>
      <Handle type="source" position={Position.Bottom} className="!bg-brand" />
    </div>
  );
}

function CylinderShape({ color, label, selected }: ShapeProps) {
  const strokeColor = selected ? "rgba(255,255,255,0.3)" : "rgba(255,255,255,0.1)";

  return (
    <div className="relative flex min-w-[120px] flex-col items-center justify-center">
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
        className="flex w-full items-center justify-center border-x px-4 py-2"
        style={{
          backgroundColor: color,
          borderColor: strokeColor,
        }}
      >
        <span className="text-sm font-medium">{label}</span>
      </div>
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

function HexagonShape({ color, label, selected }: ShapeProps) {
  return (
    <div className="relative flex min-h-[100px] min-w-[140px] items-center justify-center">
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
      <span className="relative z-10 text-sm font-medium">{label}</span>
      <Handle type="source" position={Position.Bottom} className="!bg-brand" />
    </div>
  );
}

export function CanvasNodeRenderer({ data, selected }: NodeProps<CanvasNode>) {
  const { label, color, shape } = data;

  switch (shape) {
    case "diamond":
      return <DiamondShape color={color} label={label} selected={selected} />;
    case "circle":
      return <CircleShape color={color} label={label} selected={selected} />;
    case "pill":
      return <PillShape color={color} label={label} selected={selected} />;
    case "cylinder":
      return <CylinderShape color={color} label={label} selected={selected} />;
    case "hexagon":
      return <HexagonShape color={color} label={label} selected={selected} />;
    case "rectangle":
    default:
      return <RectangleShape color={color} label={label} selected={selected} />;
  }
}
