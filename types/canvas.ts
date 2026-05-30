import type { Node, Edge } from "@xyflow/react";

export interface NodeData extends Record<string, unknown> {
  label: string;
  color: string;
  shape: (typeof NODE_SHAPES)[number];
}

export interface EdgeData extends Record<string, unknown> {
  label?: string;
}

export type CanvasNode = Node<NodeData, "canvasNode">;
export type CanvasEdge = Edge<EdgeData, "canvasEdge">;

export const NODE_COLORS = [
  { fill: "#1F1F1F", text: "#EDEDED" },
  { fill: "#10233D", text: "#52A8FF" },
  { fill: "#2E1938", text: "#BF7AF0" },
  { fill: "#331B00", text: "#FF990A" },
  { fill: "#3C1618", text: "#FF6166" },
  { fill: "#3A1726", text: "#F75F8F" },
  { fill: "#0F2E18", text: "#62C073" },
  { fill: "#062822", text: "#0AC7B4" },
] as const;

export const NODE_SHAPES = [
  "rectangle",
  "diamond",
  "circle",
  "pill",
  "cylinder",
  "hexagon",
] as const;

export const SHAPE_DEFAULT_SIZES: Record<
  (typeof NODE_SHAPES)[number],
  { width: number; height: number }
> = {
  rectangle: { width: 200, height: 100 },
  diamond: { width: 180, height: 180 },
  circle: { width: 150, height: 150 },
  pill: { width: 180, height: 90 },
  cylinder: { width: 150, height: 180 },
  hexagon: { width: 160, height: 140 },
};
