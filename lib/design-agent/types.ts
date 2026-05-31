import { z } from "zod";

const positionSchema = z.object({
  x: z.number(),
  y: z.number(),
});

const addNodeActionSchema = z.object({
  type: z.literal("addNode"),
  id: z.string().min(1),
  label: z.string(),
  shape: z.enum([
    "rectangle",
    "diamond",
    "circle",
    "pill",
    "cylinder",
    "hexagon",
  ]),
  colorIndex: z.number().int().min(0).max(7),
  position: positionSchema,
  width: z.number().positive().optional(),
  height: z.number().positive().optional(),
});

const moveNodeActionSchema = z.object({
  type: z.literal("moveNode"),
  id: z.string().min(1),
  position: positionSchema,
});

const resizeNodeActionSchema = z.object({
  type: z.literal("resizeNode"),
  id: z.string().min(1),
  width: z.number().positive(),
  height: z.number().positive(),
});

const updateNodeDataActionSchema = z.object({
  type: z.literal("updateNodeData"),
  id: z.string().min(1),
  label: z.string().optional(),
  shape: z
    .enum(["rectangle", "diamond", "circle", "pill", "cylinder", "hexagon"])
    .optional(),
  colorIndex: z.number().int().min(0).max(7).optional(),
});

const deleteNodeActionSchema = z.object({
  type: z.literal("deleteNode"),
  id: z.string().min(1),
});

const addEdgeActionSchema = z.object({
  type: z.literal("addEdge"),
  id: z.string().min(1),
  source: z.string().min(1),
  target: z.string().min(1),
  label: z.string().optional(),
});

const deleteEdgeActionSchema = z.object({
  type: z.literal("deleteEdge"),
  id: z.string().min(1),
});

export const designActionSchema = z.discriminatedUnion("type", [
  addNodeActionSchema,
  moveNodeActionSchema,
  resizeNodeActionSchema,
  updateNodeDataActionSchema,
  deleteNodeActionSchema,
  addEdgeActionSchema,
  deleteEdgeActionSchema,
]);

export type DesignAction = z.infer<typeof designActionSchema>;

export const loosePlanSchema = z.object({
  actions: z
    .array(
      z
        .object({
          type: z.string(),
          id: z.string(),
          label: z.unknown().optional(),
          shape: z.unknown().optional(),
          colorIndex: z.unknown().optional(),
          position: z.unknown().optional(),
          width: z.unknown().optional(),
          height: z.unknown().optional(),
          source: z.unknown().optional(),
          target: z.unknown().optional(),
        })
        .passthrough(),
    )
    .default([]),
});
