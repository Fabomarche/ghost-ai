import { generateText } from "ai";
import { google, getGoogleAiModel } from "@/lib/google-ai";
import type { AiChatFeedMessage } from "@/types/tasks";
import type { GenerateSpecPayload } from "@/lib/spec-agent/schemas";
import {
  buildSpecGenerationSystemPrompt,
  buildSpecGenerationUserPrompt,
} from "@/lib/spec-agent/prompt";

export async function generateSpecContent(
  chatHistory: AiChatFeedMessage[],
  nodes: GenerateSpecPayload["nodes"],
  edges: GenerateSpecPayload["edges"],
): Promise<string> {
  const { text } = await generateText({
    model: google(getGoogleAiModel()),
    system: buildSpecGenerationSystemPrompt(),
    prompt: buildSpecGenerationUserPrompt(chatHistory, nodes, edges),
  });

  const content = text.trim();

  if (!content) {
    throw new Error("Spec generation returned empty content");
  }

  return content;
}
