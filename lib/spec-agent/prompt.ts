import { NODE_SHAPES } from "@/types/canvas";
import type { AiChatFeedMessage } from "@/types/tasks";
import type {
  canvasEdgeSchema,
  canvasNodeSchema,
} from "@/lib/spec-agent/schemas";
import type { z } from "zod";

type SpecCanvasNode = z.infer<typeof canvasNodeSchema>;
type SpecCanvasEdge = z.infer<typeof canvasEdgeSchema>;

export function buildSpecGenerationSystemPrompt(): string {
  const shapes = NODE_SHAPES.join(", ");

  return `You are Ghost AI, a technical writer that converts system design diagrams into Markdown technical specifications.

Write a complete, well-structured Markdown document based on the provided canvas graph and conversation history.

Requirements:
- Output plain Markdown only. Do not wrap the response in code fences.
- Use clear headings (##, ###) and bullet lists where appropriate.
- Describe every component represented by a canvas node, including its role and responsibilities.
- Explain connections and data/control flow using the canvas edges.
- Incorporate relevant architectural decisions and context from the chat history.
- Use node shapes as semantic hints: pill = service/process, cylinder = database/storage, diamond = gateway/event/decision, hexagon = external system, circle = endpoint, rectangle = generic component.
- Allowed node shapes in the diagram: ${shapes}
- Include sections such as Overview, Components, Data Flow, Integration Points, and Assumptions when applicable.
- Be specific and technical. Avoid filler or meta commentary about being an AI.`;
}

function summarizeCanvas(nodes: SpecCanvasNode[], edges: SpecCanvasEdge[]) {
  return {
    nodes: nodes.map((node) => ({
      id: node.id,
      label: node.data.label,
      shape: node.data.shape,
      position: node.position,
      width: node.data.width,
      height: node.data.height,
    })),
    edges: edges.map((edge) => ({
      id: edge.id,
      source: edge.source,
      target: edge.target,
      label: edge.data?.label,
    })),
  };
}

function formatChatHistory(chatHistory: AiChatFeedMessage[]): string {
  if (chatHistory.length === 0) {
    return "No chat history provided.";
  }

  return chatHistory
    .map(
      (message) =>
        `[${message.role}] ${message.sender} (${new Date(message.timestamp).toISOString()}): ${message.content}`,
    )
    .join("\n");
}

export function buildSpecGenerationUserPrompt(
  chatHistory: AiChatFeedMessage[],
  nodes: SpecCanvasNode[],
  edges: SpecCanvasEdge[],
): string {
  const canvasSummary = summarizeCanvas(nodes, edges);

  return `Conversation history:
${formatChatHistory(chatHistory)}

Canvas graph:
${JSON.stringify(canvasSummary, null, 2)}

Generate the Markdown technical specification for this system design.`;
}
