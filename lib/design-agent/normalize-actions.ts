import { NODE_SHAPES, type NodeData } from "@/types/canvas";
import type { DesignAction } from "@/lib/design-agent/types";

type NodeShape = NodeData["shape"];

const ACTION_TYPES = [
  "addNode",
  "moveNode",
  "resizeNode",
  "updateNodeData",
  "deleteNode",
  "addEdge",
  "deleteEdge",
] as const;

type ActionType = (typeof ACTION_TYPES)[number];

function toNumber(value: unknown): number | null {
  if (typeof value === "number" && Number.isFinite(value)) return value;
  if (typeof value === "string" && value.trim()) {
    const parsed = Number(value);
    if (Number.isFinite(parsed)) return parsed;
  }
  return null;
}

function toString(value: unknown): string | null {
  if (typeof value === "string" && value.trim()) return value.trim();
  if (typeof value === "number" && Number.isFinite(value)) return String(value);
  return null;
}

function normalizeShape(value: unknown): NodeShape {
  if (typeof value === "string" && NODE_SHAPES.includes(value as NodeShape)) {
    return value as NodeShape;
  }
  return "rectangle";
}

function normalizeColorIndex(value: unknown): number {
  const parsed = toNumber(value);
  if (parsed === null) return 0;
  return Math.min(7, Math.max(0, Math.round(parsed)));
}

function normalizePosition(value: unknown): { x: number; y: number } | null {
  if (!value || typeof value !== "object") return null;

  const record = value as Record<string, unknown>;
  const x = toNumber(record.x);
  const y = toNumber(record.y);
  if (x === null || y === null) return null;

  return { x, y };
}

function normalizeActionType(value: unknown): ActionType | null {
  if (typeof value !== "string") return null;
  return ACTION_TYPES.includes(value as ActionType) ? (value as ActionType) : null;
}

function normalizeAction(raw: unknown): DesignAction | null {
  if (!raw || typeof raw !== "object") return null;

  const record = raw as Record<string, unknown>;
  const type = normalizeActionType(record.type);
  const id = toString(record.id);
  if (!type || !id) return null;

  switch (type) {
    case "addNode": {
      const position = normalizePosition(record.position);
      if (!position) return null;

      return {
        type,
        id,
        label: toString(record.label) ?? id,
        shape: normalizeShape(record.shape),
        colorIndex: normalizeColorIndex(record.colorIndex),
        position,
        width: toNumber(record.width) ?? undefined,
        height: toNumber(record.height) ?? undefined,
      };
    }
    case "moveNode": {
      const position = normalizePosition(record.position);
      if (!position) return null;

      return { type, id, position };
    }
    case "resizeNode": {
      const width = toNumber(record.width);
      const height = toNumber(record.height);
      if (width === null || height === null || width <= 0 || height <= 0) {
        return null;
      }

      return { type, id, width, height };
    }
    case "updateNodeData": {
      const action: Extract<DesignAction, { type: "updateNodeData" }> = {
        type,
        id,
      };

      const label = toString(record.label);
      if (label !== null) action.label = label;

      if (typeof record.shape === "string" && NODE_SHAPES.includes(record.shape as NodeShape)) {
        action.shape = record.shape as NodeShape;
      }

      if (record.colorIndex !== undefined) {
        action.colorIndex = normalizeColorIndex(record.colorIndex);
      }

      if (
        action.label === undefined &&
        action.shape === undefined &&
        action.colorIndex === undefined
      ) {
        return null;
      }

      return action;
    }
    case "deleteNode":
      return { type, id };
    case "addEdge": {
      const source = toString(record.source);
      const target = toString(record.target);
      if (!source || !target) return null;

      const label = toString(record.label);
      return {
        type,
        id,
        source,
        target,
        label: label ?? undefined,
      };
    }
    case "deleteEdge":
      return { type, id };
    default:
      return null;
  }
}

export function normalizeDesignActions(raw: unknown): DesignAction[] {
  if (!raw || typeof raw !== "object") return [];

  const actions = (raw as { actions?: unknown }).actions;
  if (!Array.isArray(actions)) return [];

  return actions
    .map((action) => normalizeAction(action))
    .filter((action): action is DesignAction => action !== null);
}

export function extractJsonObject(text: string): unknown {
  const trimmed = text.trim();
  const fenced = trimmed.match(/```(?:json)?\s*([\s\S]*?)```/i);
  const candidate = fenced?.[1]?.trim() ?? trimmed;

  try {
    return JSON.parse(candidate);
  } catch {
    const start = candidate.indexOf("{");
    const end = candidate.lastIndexOf("}");
    if (start === -1 || end === -1 || end <= start) {
      throw new Error("Model response did not contain valid JSON.");
    }

    return JSON.parse(candidate.slice(start, end + 1));
  }
}
