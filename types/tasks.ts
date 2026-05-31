import { z } from "zod";

export const aiStatusFeedMessageSchema = z.object({
  text: z.string().optional(),
});

export type AiStatusFeedMessage = z.infer<typeof aiStatusFeedMessageSchema>;

export function parseAiStatusFeedMessage(data: unknown): AiStatusFeedMessage | null {
  const result = aiStatusFeedMessageSchema.safeParse(data);
  return result.success ? result.data : null;
}

export const aiChatFeedMessageSchema = z.object({
  sender: z.string().min(1),
  role: z.enum(["user", "assistant"]),
  content: z.string().min(1),
  timestamp: z.number(),
});

export type AiChatFeedMessage = z.infer<typeof aiChatFeedMessageSchema>;

export function parseAiChatFeedMessage(data: unknown): AiChatFeedMessage | null {
  const result = aiChatFeedMessageSchema.safeParse(data);
  return result.success ? result.data : null;
}
