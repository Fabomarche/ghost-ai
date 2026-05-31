import {
  MIN_NODE_SIZES,
  NODE_COLORS,
  NODE_SHAPES,
  SHAPE_DEFAULT_SIZES,
} from "@/types/canvas";

export function buildDesignAgentSystemPrompt(): string {
  const shapes = NODE_SHAPES.join(", ");
  const colors = NODE_COLORS.map(
    (color, index) =>
      `${index}: fill ${color.fill}, text ${color.text}`,
  ).join("\n");

  const defaultSizes = NODE_SHAPES.map(
    (shape) =>
      `${shape}: ${SHAPE_DEFAULT_SIZES[shape].width}x${SHAPE_DEFAULT_SIZES[shape].height}`,
  ).join("\n");

  const minSizes = NODE_SHAPES.map(
    (shape) =>
      `${shape}: ${MIN_NODE_SIZES[shape].width}x${MIN_NODE_SIZES[shape].height}`,
  ).join("\n");

  return `You are Ghost AI, a system design assistant that edits a collaborative React Flow canvas.

Return a JSON object with an "actions" array. Each action must use one of these types:
- addNode: create a node (id, label, shape, colorIndex, position, optional width/height)
- moveNode: move an existing node (id, position)
- resizeNode: resize an existing node (id, width, height)
- updateNodeData: update node data fields (id, label/shape/colorIndex optional)
- deleteNode: remove a node (id)
- addEdge: connect nodes (id, source, target, optional label)
- deleteEdge: remove an edge (id)

Allowed shapes: ${shapes}
Shape defaults (width x height):
${defaultSizes}
Minimum sizes (never go below):
${minSizes}

Color palette (use colorIndex 0-7):
${colors}

Layout rules:
- Keep at least 120px horizontal and 100px vertical spacing between nodes
- Prefer top-to-bottom or left-to-right flow for readability
- Use pill for services/processes, cylinder for databases, diamond for gateways/events/buses, hexagon for external systems/clients, circle for endpoints, rectangle for generic components
- Reuse existing node IDs when modifying the current canvas
- Generate unique kebab-case IDs for new nodes (example: api-gateway, users-db)
- When adding edges, use ids like e-source-target
- Only output actions needed to fulfill the user request
- Do not delete unrelated nodes unless the user asks to replace the diagram`;
}

export function buildDesignAgentUserPrompt(
  prompt: string,
  canvas: { nodes: unknown[]; edges: unknown[] },
): string {
  const summary = {
    nodes: canvas.nodes.map((node) => {
      const item = node as {
        id?: string;
        position?: { x: number; y: number };
        data?: {
          label?: string;
          shape?: string;
          width?: number;
          height?: number;
        };
      };

      return {
        id: item.id,
        label: item.data?.label ?? "",
        shape: item.data?.shape ?? "rectangle",
        position: item.position ?? { x: 0, y: 0 },
        width: item.data?.width,
        height: item.data?.height,
      };
    }),
    edges: canvas.edges.map((edge) => {
      const item = edge as {
        id?: string;
        source?: string;
        target?: string;
        data?: { label?: string };
      };

      return {
        id: item.id,
        source: item.source,
        target: item.target,
        label: item.data?.label,
      };
    }),
  };

  return `User request:
${prompt}

Current canvas summary:
${JSON.stringify(summary, null, 2)}`;
}
