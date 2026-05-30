"use client";

import { NODE_COLORS, SHAPE_DEFAULT_SIZES } from "@/types/canvas";

interface ShapeDragPreviewProps {
  shape: string;
  x: number;
  y: number;
}

function PreviewRectangle({ color }: { color: string }) {
  return (
    <div
      className="flex items-center justify-center rounded border"
      style={{
        width: SHAPE_DEFAULT_SIZES.rectangle.width,
        height: SHAPE_DEFAULT_SIZES.rectangle.height,
        backgroundColor: color,
        borderColor: "rgba(255,255,255,0.15)",
      }}
    />
  );
}

function PreviewDiamond({ color }: { color: string }) {
  const size = SHAPE_DEFAULT_SIZES.diamond.width;
  return (
    <div
      className="relative"
      style={{ width: size, height: size }}
    >
      <svg
        className="absolute inset-0 h-full w-full"
        viewBox="0 0 100 100"
        preserveAspectRatio="none"
      >
        <polygon
          points="50,2 98,50 50,98 2,50"
          fill={color}
          stroke="rgba(255,255,255,0.15)"
          strokeWidth="2"
          vectorEffect="non-scaling-stroke"
        />
      </svg>
    </div>
  );
}

function PreviewCircle({ color }: { color: string }) {
  const size = SHAPE_DEFAULT_SIZES.circle.width;
  return (
    <div
      className="rounded-full border"
      style={{
        width: size,
        height: size,
        backgroundColor: color,
        borderColor: "rgba(255,255,255,0.15)",
      }}
    />
  );
}

function PreviewPill({ color }: { color: string }) {
  return (
    <div
      className="flex items-center justify-center rounded-full border"
      style={{
        width: SHAPE_DEFAULT_SIZES.pill.width,
        height: SHAPE_DEFAULT_SIZES.pill.height,
        backgroundColor: color,
        borderColor: "rgba(255,255,255,0.15)",
      }}
    />
  );
}

function PreviewCylinder({ color }: { color: string }) {
  const { width, height } = SHAPE_DEFAULT_SIZES.cylinder;
  const capHeight = 16;
  const bodyHeight = height - capHeight * 2;
  const strokeColor = "rgba(255,255,255,0.15)";

  return (
    <div
      className="flex flex-col items-center"
      style={{ width, height }}
    >
      <svg
        className="w-full"
        style={{ height: capHeight }}
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
        className="w-full border-x"
        style={{
          height: bodyHeight,
          backgroundColor: color,
          borderColor: strokeColor,
        }}
      />
      <svg
        className="w-full"
        style={{ height: capHeight }}
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
    </div>
  );
}

function PreviewHexagon({ color }: { color: string }) {
  return (
    <div
      className="relative"
      style={{
        width: SHAPE_DEFAULT_SIZES.hexagon.width,
        height: SHAPE_DEFAULT_SIZES.hexagon.height,
      }}
    >
      <svg
        className="absolute inset-0 h-full w-full"
        viewBox="0 0 100 100"
        preserveAspectRatio="none"
      >
        <polygon
          points="50,2 97,25 97,75 50,98 3,75 3,25"
          fill={color}
          stroke="rgba(255,255,255,0.15)"
          strokeWidth="2"
          vectorEffect="non-scaling-stroke"
        />
      </svg>
    </div>
  );
}

export function ShapeDragPreview({ shape, x, y }: ShapeDragPreviewProps) {
  const color = NODE_COLORS[0].fill;

  const shapeElement = (() => {
    switch (shape) {
      case "diamond":
        return <PreviewDiamond color={color} />;
      case "circle":
        return <PreviewCircle color={color} />;
      case "pill":
        return <PreviewPill color={color} />;
      case "cylinder":
        return <PreviewCylinder color={color} />;
      case "hexagon":
        return <PreviewHexagon color={color} />;
      case "rectangle":
      default:
        return <PreviewRectangle color={color} />;
    }
  })();

  const size = SHAPE_DEFAULT_SIZES[shape as keyof typeof SHAPE_DEFAULT_SIZES];

  return (
    <div
      className="pointer-events-none fixed z-50 opacity-60"
      style={{
        left: x - size.width / 2,
        top: y - size.height / 2,
        width: size.width,
        height: size.height,
      }}
    >
      {shapeElement}
    </div>
  );
}
