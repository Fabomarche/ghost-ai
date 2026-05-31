import { z } from "zod";
import { generateObject, generateText, NoObjectGeneratedError } from "ai";
import { google, getGoogleAiModel } from "@/lib/google-ai";
import type { CanvasEdge, CanvasNode } from "@/types/canvas";
import {
  buildDesignAgentSystemPrompt,
  buildDesignAgentUserPrompt,
} from "@/lib/design-agent/prompt";
import {
  extractJsonObject,
  normalizeDesignActions,
} from "@/lib/design-agent/normalize-actions";
import { loosePlanSchema, type DesignAction } from "@/lib/design-agent/types";

export type { DesignAction } from "@/lib/design-agent/types";
export { designActionSchema } from "@/lib/design-agent/types";

async function generateDesignPlanWithText(
  prompt: string,
  canvas: { nodes: CanvasNode[]; edges: CanvasEdge[] },
): Promise<DesignAction[]> {
  const { text } = await generateText({
    model: google(getGoogleAiModel()),
    system: `${buildDesignAgentSystemPrompt()}

Return only valid JSON. Do not include markdown or explanations.`,
    prompt: buildDesignAgentUserPrompt(prompt, canvas),
  });

  const parsed = extractJsonObject(text);
  return normalizeDesignActions(parsed);
}

export async function generateDesignActions(
  prompt: string,
  canvas: { nodes: CanvasNode[]; edges: CanvasEdge[] },
): Promise<DesignAction[]> {
  try {
    const { object } = await generateObject({
      model: google(getGoogleAiModel()),
      schema: loosePlanSchema,
      system: buildDesignAgentSystemPrompt(),
      prompt: buildDesignAgentUserPrompt(prompt, canvas),
    });

    const actions = normalizeDesignActions(object);
    if (actions.length > 0) return actions;
  } catch (error) {
    if (!NoObjectGeneratedError.isInstance(error)) {
      throw error;
    }
  }

  return generateDesignPlanWithText(prompt, canvas);
}
