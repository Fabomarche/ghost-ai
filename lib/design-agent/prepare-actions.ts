import type { CanvasEdge, CanvasNode } from "@/types/canvas";
import type { DesignAction } from "@/lib/design-agent/types";

const NODE_ACTION_TYPES = new Set([
  "addNode",
  "moveNode",
  "resizeNode",
  "updateNodeData",
  "deleteNode",
]);

const EDGE_ACTION_TYPES = new Set(["addEdge", "deleteEdge"]);

function inferShapeFromId(id: string): CanvasNode["data"]["shape"] {
  const normalized = id.toLowerCase();
  if (
    normalized.includes("db") ||
    normalized.includes("database") ||
    normalized.includes("store") ||
    normalized.includes("cache")
  ) {
    return "cylinder";
  }
  if (
    normalized.includes("gateway") ||
    normalized.includes("bus") ||
    normalized.includes("queue")
  ) {
    return "diamond";
  }
  if (normalized.includes("client") || normalized.includes("user")) {
    return "hexagon";
  }
  if (normalized.includes("api") || normalized.includes("endpoint")) {
    return "circle";
  }
  return "pill";
}

function formatNodeLabel(id: string): string {
  return id
    .split("-")
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
}

function createPlaceholderNode(id: string, index: number): DesignAction {
  return {
    type: "addNode",
    id,
    label: formatNodeLabel(id),
    shape: inferShapeFromId(id),
    colorIndex: index % 8,
    position: { x: index * 220, y: 120 + (index % 3) * 140 },
  };
}

function collectReferencedNodeIds(actions: DesignAction[]): Set<string> {
  const ids = new Set<string>();

  for (const action of actions) {
    if (action.type === "addNode") {
      ids.add(action.id);
    }
    if (action.type === "addEdge") {
      ids.add(action.source);
      ids.add(action.target);
    }
  }

  return ids;
}

export function prepareDesignActions(
  actions: DesignAction[],
  canvas: { nodes: CanvasNode[]; edges: CanvasEdge[] },
): DesignAction[] {
  const knownNodeIds = new Set(canvas.nodes.map((node) => node.id));
  const prepared: DesignAction[] = [];

  for (const action of actions) {
    if (action.type === "addNode") {
      prepared.push(action);
      knownNodeIds.add(action.id);
    }
  }

  const referencedIds = collectReferencedNodeIds(actions);
  let placeholderIndex = 0;

  for (const nodeId of referencedIds) {
    if (knownNodeIds.has(nodeId)) continue;
    prepared.push(createPlaceholderNode(nodeId, placeholderIndex));
    knownNodeIds.add(nodeId);
    placeholderIndex += 1;
  }

  for (const action of actions) {
    if (action.type === "addNode") continue;

    if (NODE_ACTION_TYPES.has(action.type)) {
      if ("id" in action && knownNodeIds.has(action.id)) {
        prepared.push(action);
      }
      continue;
    }

    if (action.type === "addEdge") {
      if (knownNodeIds.has(action.source) && knownNodeIds.has(action.target)) {
        prepared.push(action);
      }
      continue;
    }

    if (action.type === "deleteEdge") {
      prepared.push(action);
    }
  }

  return prepared;
}
