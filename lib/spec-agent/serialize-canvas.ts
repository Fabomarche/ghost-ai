import type { CanvasEdge, CanvasNode } from "@/types/canvas";
import type { SpecTriggerRequest } from "@/lib/spec-agent/schemas";

export function serializeCanvasForSpec(
  nodes: CanvasNode[],
  edges: CanvasEdge[],
): Pick<SpecTriggerRequest, "nodes" | "edges"> {
  return {
    nodes: nodes.map((node) => ({
      id: node.id,
      type: "canvasNode" as const,
      position: { x: node.position.x, y: node.position.y },
      data: {
        label: node.data.label,
        color: node.data.color,
        textColor: node.data.textColor,
        shape: node.data.shape,
        width: node.data.width,
        height: node.data.height,
      },
    })),
    edges: edges.map((edge) => ({
      id: edge.id,
      source: edge.source,
      target: edge.target,
      type: "canvasEdge" as const,
      ...(edge.data?.label ? { data: { label: edge.data.label } } : {}),
    })),
  };
}
