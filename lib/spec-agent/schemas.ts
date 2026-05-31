import { z } from "zod";
import { aiChatFeedMessageSchema } from "@/types/tasks";
import { NODE_SHAPES } from "@/types/canvas";

const positionSchema = z.object({
  x: z.number(),
  y: z.number(),
});

const nodeDataSchema = z.object({
  label: z.string(),
  color: z.string(),
  textColor: z.string(),
  shape: z.enum(NODE_SHAPES),
  width: z.number(),
  height: z.number(),
});

export const canvasNodeSchema = z.object({
  id: z.string().min(1),
  type: z.literal("canvasNode").optional(),
  position: positionSchema,
  data: nodeDataSchema,
});

export const canvasEdgeSchema = z.object({
  id: z.string().min(1),
  source: z.string().min(1),
  target: z.string().min(1),
  type: z.literal("canvasEdge").optional(),
  data: z
    .object({
      label: z.string().optional(),
    })
    .optional(),
});

export const specTriggerRequestSchema = z.object({
  roomId: z.string().trim().min(1),
  chatHistory: z.array(aiChatFeedMessageSchema),
  nodes: z.array(canvasNodeSchema),
  edges: z.array(canvasEdgeSchema),
});

export const generateSpecPayloadSchema = specTriggerRequestSchema.extend({
  projectId: z.string().trim().min(1),
});

export type SpecTriggerRequest = z.infer<typeof specTriggerRequestSchema>;
export type GenerateSpecPayload = z.infer<typeof generateSpecPayloadSchema>;
