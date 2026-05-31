import { z } from "zod";

export const aiStatusFeedMessageSchema = z.object({
  text: z.string().optional(),
});

export type AiStatusFeedMessage = z.infer<typeof aiStatusFeedMessageSchema>;

export function parseAiStatusFeedMessage(data: unknown): AiStatusFeedMessage | null {
  const result = aiStatusFeedMessageSchema.safeParse(data);
  return result.success ? result.data : null;
}
