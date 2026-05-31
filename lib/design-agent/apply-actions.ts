import type { MutableFlow } from "@liveblocks/react-flow/node";
import {
  MIN_NODE_SIZES,
  NODE_COLORS,
  SHAPE_DEFAULT_SIZES,
  type CanvasEdge,
  type CanvasNode,
  type NodeData,
} from "@/types/canvas";
import type { DesignAction } from "@/lib/design-agent/types";
import {
  flowPositionToCursor,
  mutateCanvasFlow,
  setAiPresence,
} from "@/lib/liveblocks-collaborative-flow";

function clampSize(
  shape: NodeData["shape"],
  width: number,
  height: number,
): { width: number; height: number } {
  const mins = MIN_NODE_SIZES[shape];
  return {
    width: Math.max(width, mins.width),
    height: Math.max(height, mins.height),
  };
}

function colorFromIndex(colorIndex: number): { color: string; textColor: string } {
  const palette = NODE_COLORS[colorIndex] ?? NODE_COLORS[0];
  return { color: palette.fill, textColor: palette.text };
}

function applyActionToFlow(flow: MutableFlow<CanvasNode, CanvasEdge>, action: DesignAction): void {
  switch (action.type) {
    case "addNode": {
      const defaults = SHAPE_DEFAULT_SIZES[action.shape];
      const width = action.width ?? defaults.width;
      const height = action.height ?? defaults.height;
      const size = clampSize(action.shape, width, height);
      const colors = colorFromIndex(action.colorIndex);

      flow.addNode({
        id: action.id,
        type: "canvasNode",
        position: action.position,
        data: {
          label: action.label,
          shape: action.shape,
          color: colors.color,
          textColor: colors.textColor,
          width: size.width,
          height: size.height,
        },
      });
      break;
    }
    case "moveNode": {
      flow.updateNode(action.id, { position: action.position });
      break;
    }
    case "resizeNode": {
      const node = flow.getNode(action.id);
      if (!node) break;
      const shape = node.data.shape;
      const size = clampSize(shape, action.width, action.height);
      flow.updateNodeData(action.id, {
        width: size.width,
        height: size.height,
      });
      break;
    }
    case "updateNodeData": {
      const node = flow.getNode(action.id);
      if (!node) break;

      const nextData: Partial<NodeData> = {};
      if (action.label !== undefined) nextData.label = action.label;
      if (action.shape !== undefined) nextData.shape = action.shape;
      if (action.colorIndex !== undefined) {
        const colors = colorFromIndex(action.colorIndex);
        nextData.color = colors.color;
        nextData.textColor = colors.textColor;
      }

      flow.updateNodeData(action.id, nextData);
      break;
    }
    case "deleteNode": {
      flow.removeNode(action.id);
      break;
    }
    case "addEdge": {
      flow.addEdge({
        id: action.id,
        source: action.source,
        target: action.target,
        type: "canvasEdge",
        data: action.label ? { label: action.label } : undefined,
      });
      break;
    }
    case "deleteEdge": {
      flow.removeEdge(action.id);
      break;
    }
  }
}

function getActionCursorTarget(
  flow: MutableFlow<CanvasNode, CanvasEdge>,
  action: DesignAction,
): { x: number; y: number } | null {
  switch (action.type) {
    case "addNode":
      return flowPositionToCursor(action.position, {
        width: action.width ?? SHAPE_DEFAULT_SIZES[action.shape].width,
        height: action.height ?? SHAPE_DEFAULT_SIZES[action.shape].height,
      });
    case "moveNode":
    case "resizeNode":
    case "updateNodeData":
    case "deleteNode": {
      const node = flow.getNode(action.id);
      if (!node) return null;
      return flowPositionToCursor(node.position, {
        width: node.data.width,
        height: node.data.height,
      });
    }
    case "addEdge":
    case "deleteEdge": {
      const edge = flow.getEdge(action.id);
      if (!edge) return null;
      const source = flow.getNode(edge.source);
      if (!source) return null;
      return flowPositionToCursor(source.position, {
        width: source.data.width,
        height: source.data.height,
      });
    }
    default:
      return null;
  }
}

export async function applyDesignActions(
  roomId: string,
  actions: DesignAction[],
): Promise<void> {
  for (const action of actions) {
    await mutateCanvasFlow(async (flow) => {
      applyActionToFlow(flow, action);

      const cursor = getActionCursorTarget(flow, action);
      if (cursor) {
        await setAiPresence(roomId, { cursor, thinking: true });
      }
    }, roomId);
  }
}

export async function readCanvasState(
  roomId: string,
): Promise<{ nodes: CanvasNode[]; edges: CanvasEdge[] }> {
  let snapshot = { nodes: [] as CanvasNode[], edges: [] as CanvasEdge[] };

  await mutateCanvasFlow((flow) => {
    snapshot = {
      nodes: [...flow.nodes],
      edges: [...flow.edges],
    };
  }, roomId);

  return snapshot;
}
